"use client"
import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { useUIStore } from "@/lib/store"
import { useTranslation } from "@/lib/i18n"
import { LanguageSelector } from "@/components/ui/language-selector"
import { ConnectionStatus } from "@/components/realtime/connection-status"
import { Sidebar } from "./sidebar"
interface HeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
}
export function Header({ title, description, action }: HeaderProps) {
  const { setSidebarOpen, language } = useUIStore()
  const t = useTranslation(language)
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
        {}
        <div className="lg:hidden">
          <Sidebar />
        </div>
        {}
        <div className="flex-1">
          <h1 className="text-lg font-semibold">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {}
        <div className="hidden md:flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t.searchTasks} className="pl-10 w-64" />
          </div>
        </div>
        {}
        <div className="flex items-center gap-2">
          <ConnectionStatus />
          <LanguageSelector />
          {action}
          <NotificationBell />
        </div>
      </div>
    </header>
  )
}
