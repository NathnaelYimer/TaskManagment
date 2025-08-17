"use client"
import { Wifi, WifiOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useRealtime } from "@/lib/realtime"
export function ConnectionStatus() {
  const { isConnected } = useRealtime()
  return (
    <Badge variant={isConnected ? "default" : "destructive"} className="gap-1">
      {isConnected ? (
        <>
          <Wifi className="h-3 w-3" />
          Live
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          Offline
        </>
      )}
    </Badge>
  )
}
