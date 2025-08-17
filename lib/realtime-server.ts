import type { RealtimeEvent } from "./realtime"

export async function broadcastEventServer(event: Omit<RealtimeEvent, "timestamp">) {
  try {
    // For server-side broadcasts, we need to create a proper request with auth
    // Since this is called from API routes that are already authenticated, we can skip auth check
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/realtime/broadcast`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        // Add a special header to indicate this is a server-side broadcast
        "X-Server-Broadcast": "true"
      },
      body: JSON.stringify({
        ...event,
        timestamp: new Date().toISOString(),
      }),
    })
    
    if (!response.ok) {
      console.error("[v0] Broadcast failed:", response.status, response.statusText)
      // Log the response body for debugging
      try {
        const errorBody = await response.text()
        console.error("[v0] Broadcast error body:", errorBody)
      } catch (e) {
        console.error("[v0] Could not read error body")
      }
    } else {
      console.log("[v0] Broadcast successful:", response.status)
    }
  } catch (error) {
    console.error("[v0] Failed to broadcast event:", error)
  }
} 