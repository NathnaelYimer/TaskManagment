"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { UserProfile } from "@/components/users/user-profile"
import { useAuthStore } from "@/lib/store"

export default function ProfilePage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return <div className="flex justify-center p-8">Loading...</div>
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account information and preferences</p>
      </div>
      <UserProfile />
    </div>
  )
}
