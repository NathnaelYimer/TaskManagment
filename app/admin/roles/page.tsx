"use client"

import { useState, useEffect } from "react"
import { useAuthStore, useUIStore } from "@/lib/store"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Shield, User, AlertTriangle } from "lucide-react"
import { useTranslation } from "@/lib/i18n"

interface UserWithRole {
  id: string
  email: string
  name?: string
  role: "admin" | "user"
  created_at: string
}

export default function RoleManagementPage() {
  const [users, setUsers] = useState<UserWithRole[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [roleCounts, setRoleCounts] = useState({ admin: 0, user: 0 })
  const { user, role } = useAuthStore()
  const { language } = useUIStore()
  const router = useRouter()
  const t = useTranslation(language)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    if (role !== "admin") {
      router.push("/dashboard")
      return
    }

    fetchUsers()
  }, [user, role, router])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const [usersResponse, countsResponse] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/role-counts")
      ])

      if (!usersResponse.ok || !countsResponse.ok) {
        throw new Error("Failed to fetch data")
      }

      const usersData = await usersResponse.json()
      const countsData = await countsResponse.json()

      setUsers(usersData.users || [])
      setRoleCounts(countsData)
    } catch (err) {
      setError("Failed to load user data")
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: "admin" | "user") => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) {
        throw new Error("Failed to update role")
      }

      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ))

      // Update counts
      setRoleCounts(prev => ({
        admin: newRole === "admin" ? prev.admin + 1 : prev.admin - 1,
        user: newRole === "user" ? prev.user + 1 : prev.user - 1
      }))
    } catch (err) {
      setError("Failed to update user role")
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    return role === "admin" ? "default" : "secondary"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
          <p className="text-muted-foreground">
            Manage user roles and permissions across the platform
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roleCounts.admin}</div>
              <p className="text-xs text-muted-foreground">
                Users with admin privileges
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roleCounts.user}</div>
              <p className="text-xs text-muted-foreground">
                Regular platform users
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Roles</CardTitle>
            <CardDescription>
              All registered users and their current roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.name || "Unknown"}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={user.role === "admin"}
                          onCheckedChange={(checked) => 
                            updateUserRole(user.id, checked ? "admin" : "user")
                          }
                          disabled={user.id === "current-user-id"} // Prevent self-demotion
                        />
                        <span className="text-sm text-muted-foreground">
                          {user.role === "admin" ? "Admin" : "User"}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
