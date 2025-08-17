import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/api-auth"
import { sql } from "@/lib/database"
export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  try {
    const user = await sql.query(
      `SELECT id, email, name, created_at, updated_at FROM users_sync WHERE id = $1 AND deleted_at IS NULL`,
      [auth.user?.id]
    )
    if ((user as any[]).length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    const userData = (user as any[])[0]
    return NextResponse.json({ user: userData })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}
export async function PUT(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  try {
    const body = await request.json()
    const { name } = body
    const updatedUser = await sql.query(
      `UPDATE users_sync SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [name, auth.user?.id]
    )
    const userData = (updatedUser as any[])[0]
    return NextResponse.json({ user: userData })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
