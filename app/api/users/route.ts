import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/api-auth"
import { sql } from "@/lib/database"

// GET /api/users - List users (for task assignment)
export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const users = await sql.query(`
      SELECT u.id, u.email, u.name, ur.role
      FROM users_sync u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      WHERE u.deleted_at IS NULL
      ORDER BY u.name, u.email
    `)

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
