import type { NextRequest } from "next/server"
import { verifyAuth } from "@/lib/api-auth"
const connections = new Map<string, ReadableStreamDefaultController>()
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  if (!userId) {
    return new Response("Missing userId", { status: 400 })
  }
  console.log("[v0] Realtime connection attempt for userId:", userId)
  const stream = new ReadableStream({
    start(controller) {
      connections.set(userId, controller)
      console.log("[v0] Realtime connection established for:", userId)
      controller.enqueue(
        `data: ${JSON.stringify({
          type: "connected",
          timestamp: new Date().toISOString(),
        })}\n\n`,
      )
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(
            `data: ${JSON.stringify({
              type: "heartbeat",
              timestamp: new Date().toISOString(),
            })}\n\n`,
          )
        } catch (error) {
          clearInterval(heartbeat)
          connections.delete(userId)
        }
      }, 30000)
      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat)
        connections.delete(userId)
        try {
          controller.close()
        } catch (error) {
        }
      })
    },
  })
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    },
  })
}
export { connections }
