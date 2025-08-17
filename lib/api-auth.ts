import type { NextRequest } from "next/server"
import { getUserById, getUserRole } from "./auth"
export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
    name?: string
    role: "admin" | "user"
  }
}
export async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "Missing or invalid authorization header", status: 401 }
  }
  const token = authHeader.substring(7)
  try {
    const user = await getUserById(token)
    if (!user) {
      return { error: "User not found", status: 401 }
    }
    const userRole = await getUserRole(user.id)
    if (!userRole) {
      return { error: "User role not found", status: 401 }
    }
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: userRole.role,
      },
    }
  } catch (error) {
    console.error("Authentication error:", error)
    return { error: "Authentication failed", status: 500 }
  }
}
export async function verifyAuth(request: NextRequest) {
  const authResult = await authenticateRequest(request)
  if (authResult.error) {
    return { success: false, error: authResult.error, status: authResult.status }
  }
  return { success: true, user: authResult.user }
}
export function requireAdmin(userRole: string) {
  if (userRole !== "admin") {
    return { error: "Admin access required", status: 403 }
  }
  return null
}
