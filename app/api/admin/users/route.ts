import { NextRequest, NextResponse } from "next/server"
import { verifyAuth, requireAdmin } from "@/lib/api-auth"
import { sql } from "@/lib/database"
export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  const adminCheck = requireAdmin(auth.user?.role || "")
  if (adminCheck) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })
  }
  const { searchParams } = new URL(request.url)
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = Number.parseInt(searchParams.get("limit") || "10")
  const search = searchParams.get("search")
  const role = searchParams.get("role")
  const offset = (page - 1) * limit
  try {
    let query = `
      SELECT u.id, u.email, u.name, u.created_at, u.updated_at,
             ur.role, ur.created_at as role_assigned_at
      FROM users_sync u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      WHERE u.deleted_at IS NULL
    `
    const params: any[] = []
    let paramIndex = 1
    if (search) {
      query += ` AND (u.email ILIKE '%${search}%' OR u.name ILIKE '%${search}%')`
      paramIndex++
    }
    if (role) {
      query += ` AND ur.role = '${role}'`
      paramIndex++
    }
    query += ` ORDER BY u.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)
    const users = await sql.unsafe(query)
    let countQuery = `
      SELECT COUNT(*) FROM users_sync u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      WHERE u.deleted_at IS NULL
    `
    const countParams: any[] = []
    let countParamIndex = 1
    if (search) {
      countQuery += ` AND (u.email ILIKE '%${search}%' OR u.name ILIKE '%${search}%')`
      countParamIndex++
    }
    if (role) {
      countQuery += ` AND ur.role = '${role}'`
    }
    const countResult = await sql.unsafe(countQuery) as unknown as { count: string }[]
    const total = Number.parseInt(countResult[0]?.count || '0')
    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  const adminCheck = requireAdmin(auth.user?.role || "")
  if (adminCheck) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })
  }
  try {
    const body = await request.json()
    const { email, name, role } = body
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }
    const existingUser = await sql.unsafe(
      `SELECT id FROM users_sync WHERE email = '${email}' AND deleted_at IS NULL`
    ) as unknown as { id: string }[]
    if (existingUser.length > 0) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }
    const newUser = await sql.unsafe(
      `INSERT INTO users_sync (email, name, created_at, updated_at) VALUES ('${email}', '${name}', NOW(), NOW()) RETURNING *`
    ) as unknown as Array<{id: string; email: string; name: string | null; created_at: Date; updated_at: Date}>
    
    const userData = newUser[0];
    
    await sql.unsafe(
      `INSERT INTO user_roles (user_id, role) VALUES ('${userData.id}', '${role || 'user'}'`
    )
    return NextResponse.json(
      {
        user: {
          ...userData,
          role: role || 'user',
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
