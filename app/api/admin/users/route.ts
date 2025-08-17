import { NextRequest, NextResponse } from "next/server"
import { verifyAuth, requireAdmin } from "@/lib/api-auth"
import { sql } from "@/lib/database"

// GET /api/admin/users - List all users (admin only)
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
      query += ` AND (u.email ILIKE $${paramIndex} OR u.name ILIKE $${paramIndex})`
      params.push(`%${search}%`)
      paramIndex++
    }

    if (role) {
      query += ` AND ur.role = $${paramIndex}`
      params.push(role)
      paramIndex++
    }

    query += ` ORDER BY u.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)

    const users = await sql(query, params)

    // Get total count
    let countQuery = `
      SELECT COUNT(*) FROM users_sync u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      WHERE u.deleted_at IS NULL
    `
    const countParams: any[] = []
    let countParamIndex = 1

    if (search) {
      countQuery += ` AND (u.email ILIKE $${countParamIndex} OR u.name ILIKE $${countParamIndex})`
      countParams.push(`%${search}%`)
      countParamIndex++
    }

    if (role) {
      countQuery += ` AND ur.role = $${countParamIndex}`
      countParams.push(role)
    }

    const countResult = await sql(countQuery, countParams)
    const total = Number.parseInt(countResult[0].count)

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

// POST /api/admin/users - Create new user (admin only)
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

    // Check if user already exists
    const existingUser = await sql.query(
      `SELECT id FROM users_sync WHERE email = $1 AND deleted_at IS NULL`,
      [email]
    )

    if ((existingUser as any[]).length > 0) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Create new user
    const newUser = await sql.query(
      `INSERT INTO users_sync (id, email, name, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *`,
      [userId, email, name]
    )

    const userData = (newUser as any[])[0]

    // Create user role
    await sql`
      INSERT INTO user_roles (user_id, role)
      VALUES (${email}, ${role || "user"})
    `

    const newUser = users[0]
    return NextResponse.json(
      {
        user: {
          ...newUser,
          role: role || "user",
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
