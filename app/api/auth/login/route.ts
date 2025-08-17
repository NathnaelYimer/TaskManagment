import { type NextRequest, NextResponse } from "next/server"
import { authenticateUser, getUserRole } from "@/lib/auth"
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }
    const authResult = await authenticateUser(email, password)
    if (!authResult) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }
    const { user, role } = authResult
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      role: role,
      token: user.id,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
