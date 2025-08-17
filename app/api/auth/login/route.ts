import { type NextRequest, NextResponse } from "next/server"
import { authenticateUser, getUserRole } from "@/lib/auth"

// POST /api/auth/login - Authenticate user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Use the authenticateUser function which handles both admin and demo users
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
      role: role, // Return role as separate object
      token: user.id, // In production, this would be a JWT
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
