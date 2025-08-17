import { NextRequest, NextResponse } from "next/server"
import { verifyAuth, requireAdmin } from "@/lib/api-auth"
import { sql } from "@/lib/database"

// PUT /api/admin/users/[id] - Update user (admin only)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const adminCheck = requireAdmin(auth.user?.role || "")
  if (adminCheck) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })
  }

  try {
    const userId = params.id
    const body = await request.json()
    const { name, role } = body

    // Check if user exists
    const existingUsers = await sql`
      SELECT * FROM users_sync WHERE id = ${userId} AND deleted_at IS NULL
    `

    if (existingUsers.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const existingUser = existingUsers[0]

    // Update user
    const users = await sql`
      UPDATE users_sync 
      SET 
        name = ${name !== undefined ? name : existingUser.name},
        updated_at = NOW()
      WHERE id = ${userId}
      RETURNING id, email, name, created_at, updated_at
    `

    // Update user role if provided
    if (role !== undefined) {
      await sql`
        UPDATE user_roles 
        SET role = ${role}
        WHERE user_id = ${userId}
      `
    }

    return NextResponse.json({
      user: {
        ...users[0],
        role: role !== undefined ? role : "user",
      },
    })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

// DELETE /api/admin/users/[id] - Delete user (admin only)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const adminCheck = requireAdmin(auth.user?.role || "")
  if (adminCheck) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })
  }

  try {
    const userId = params.id

    // Prevent admin from deleting themselves
    if (userId === auth.user?.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    // Soft delete user
    await sql`
      UPDATE users_sync 
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = ${userId}
    `

    // Reassign their tasks to the admin
    await sql`
      UPDATE tasks 
      SET assigned_to = ${auth.user?.id}, updated_at = NOW()
      WHERE assigned_to = ${userId}
    `

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
