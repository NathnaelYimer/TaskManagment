"use client"

import { useEffect, useRef } from "react"
import { useTaskStore, useAuthStore } from "./store"
import { toast } from "@/hooks/use-toast"
import { useTranslation } from "./i18n"

export interface RealtimeEvent {
  type: "task_created" | "task_updated" | "task_deleted" | "task_assigned" | "comment_added"
  data: any
  userId?: string
  timestamp: string
}

export function useRealtime() {
  const eventSourceRef = useRef<EventSource | null>(null)
  const { user } = useAuthStore()
  const { addTask, updateTask, deleteTask } = useTaskStore()
  const t = useTranslation("en") // Default to English for notifications

  useEffect(() => {
    // Only connect if user exists and has a valid ID
    if (!user || !user.id) return

    console.log("[v0] Connecting to realtime with user ID:", user.id, "User object:", user)
    
    const eventSource = new EventSource(`/api/realtime?userId=${user.id}`)
    eventSourceRef.current = eventSource

    eventSource.onmessage = (event) => {
      try {
        const realtimeEvent: RealtimeEvent = JSON.parse(event.data)
        handleRealtimeEvent(realtimeEvent)
      } catch (error) {
        console.error("[v0] Failed to parse realtime event:", error)
      }
    }

    eventSource.onerror = (error) => {
      console.error("[v0] EventSource error:", error)
      // Only attempt to reconnect if the connection was actually closed
      if (eventSource.readyState === EventSource.CLOSED) {
        setTimeout(() => {
          if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
            console.log("[v0] Attempting to reconnect to realtime...")
            eventSourceRef.current = new EventSource(`/api/realtime?userId=${user.id}`)
          }
        }, 5000)
      }
    }

    eventSource.onopen = () => {
      console.log("[v0] Realtime connection established")
    }

    return () => {
      if (eventSource.readyState !== EventSource.CLOSED) {
        eventSource.close()
      }
    }
  }, [user?.id]) // Only re-run when user.id changes

  const handleRealtimeEvent = (event: RealtimeEvent) => {
    switch (event.type) {
      case "task_created":
        addTask(event.data)
        if (event.userId !== user?.id) {
          toast({
            title: t.taskCreated,
            description: `New task: ${event.data.title}`,
          })
        }
        break

      case "task_updated":
        updateTask(event.data.id, event.data)
        if (event.userId !== user?.id && event.data.assigned_to === user?.id) {
          toast({
            title: t.taskUpdated,
            description: `Task "${event.data.title}" has been updated`,
          })
        }
        break

      case "task_deleted":
        deleteTask(event.data.id)
        if (event.userId !== user?.id) {
          toast({
            title: t.taskDeleted,
            description: `Task "${event.data.title}" has been deleted`,
            variant: "destructive",
          })
        }
        break

      case "task_assigned":
        updateTask(event.data.id, event.data)
        if (event.data.assigned_to === user?.id && event.userId !== user?.id) {
          toast({
            title: t.taskAssigned,
            description: `You have been assigned to: ${event.data.title}`,
          })
        }
        break

      case "comment_added":
        if (event.userId !== user?.id && event.data.task.assigned_to === user?.id) {
          toast({
            title: t.newComment,
            description: `New comment on: ${event.data.task.title}`,
          })
        }
        break
    }
  }

  return {
    isConnected: eventSourceRef.current?.readyState === EventSource.OPEN,
  }
}

export async function broadcastEvent(event: Omit<RealtimeEvent, "timestamp">) {
  try {
    await fetch("/api/realtime/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...event,
        timestamp: new Date().toISOString(),
      }),
    })
  } catch (error) {
    console.error("[v0] Failed to broadcast event:", error)
  }
}
