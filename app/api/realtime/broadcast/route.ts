import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/api-auth"
import { connections } from "../route"
import type { RealtimeEvent } from "@/lib/realtime"

export async function POST(request: NextRequest) {
  // Check if this is a server-side broadcast
  const isServerBroadcast = request.headers.get("X-Server-Broadcast") === "true"
  
  let authResult
  if (isServerBroadcast) {
    // Server-side broadcasts are trusted (called from authenticated API routes)
    authResult = { success: true, user: { id: "system", email: "system@localhost", role: "admin" } }
  } else {
    // Client-side broadcasts need authentication
    authResult = await verifyAuth(request)
  }
  
  if (!authResult.success) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const event: RealtimeEvent = await request.json()

    const message = `data: ${JSON.stringify(event)}\n\n`

    for (const [userId, controller] of connections.entries()) {
      try {
        controller.enqueue(message)
      } catch (error) {
        // Remove dead connections
        connections.delete(userId)
      }
    }

    return NextResponse.json({ success: true, sent: connections.size })
  } catch (error) {
    console.error("[v0] Broadcast error:", error)
    return NextResponse.json({ error: "Failed to broadcast" }, { status: 500 })
  }
}
