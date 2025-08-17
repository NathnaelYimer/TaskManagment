"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { UserManagementTable } from "@/components/users/user-management-table"
import { useAuthStore } from "@/lib/store"
export default function AdminUsersPage() {
  const router = useRouter()
  const { isAuthenticated, userRole } = useAuthStore()
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    if (userRole?.role !== "admin") {
      router.push("/dashboard")
      return
    }
  }, [isAuthenticated, userRole, router])
  if (!isAuthenticated || userRole?.role !== "admin") {
    return <div className="flex justify-center p-8">Loading...</div>
  }
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Manage system users and their permissions</p>
      </div>
      <UserManagementTable />
    </div>
  )
}
