import { getDatabase } from "./database"
import type { User } from "./types"

const ADMIN_EMAIL = "nathnaelyimer@gmail.com"
const ADMIN_PASSWORD = "Nati@20409545"

// Simple UUID generation for this context
function generateId(): string {
  return 'user_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Helper function to extract rows from query results
function getRows(result: any): any[] {
  if (Array.isArray(result)) {
    return result
  }
  if (result && Array.isArray(result.rows)) {
    return result.rows
  }
  return []
}

export async function authenticateUser(email: string, password: string): Promise<{ user: User; role: string } | null> {
  try {
    const sql = getDatabase()

    // Check if this is the admin user
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Get admin user from users_sync table
      const result = await sql`
        SELECT id, email, name, created_at, updated_at 
        FROM users_sync 
        WHERE email = ${email} AND deleted_at IS NULL
      `
      
      const users = getRows(result)
      if (users.length > 0) {
        return { user: users[0] as User, role: "admin" }
      }
      
      // If admin doesn't exist, create it
      const userId = generateId()
      const newUserResult = await sql`
        INSERT INTO users_sync (id, email, name, created_at, updated_at, raw_json)
        VALUES (${userId}, ${email}, ${"Nathan Yimer"}, NOW(), NOW(), ${JSON.stringify({ role: "admin" })})
        RETURNING id, email, name, created_at, updated_at
      `
      
      const newUsers = getRows(newUserResult)
      return { user: newUsers[0] as User, role: "admin" }
    }

    // For demo purposes, allow any other email with password "password123"
    if (password === "password123") {
      const result = await sql`
        SELECT id, email, name, created_at, updated_at 
        FROM users_sync 
        WHERE email = ${email} AND deleted_at IS NULL
      `
      
      const users = getRows(result)
      if (users.length > 0) {
        return { user: users[0] as User, role: "user" }
      }
      
      // Don't auto-create users in login - they should register first
      return null
    }

    return null
  } catch (error) {
    console.error("Error authenticating user:", error)
    return null
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const sql = getDatabase()
    const result = await sql`
      SELECT id, email, name, created_at, updated_at 
      FROM users_sync 
      WHERE id = ${id} AND deleted_at IS NULL
    `
    const users = getRows(result)
    return users[0] as User || null
  } catch (error) {
    console.error("Error fetching user:", error)
    return null
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const sql = getDatabase()
    const result = await sql`
      SELECT id, email, name, created_at, updated_at 
      FROM users_sync 
      WHERE email = ${email} AND deleted_at IS NULL
    `
    const users = getRows(result)
    return users[0] as User || null
  } catch (error) {
    console.error("Error fetching user by email:", error)
    return null
  }
}

export async function getUserRole(userId: string): Promise<string> {
  try {
    const sql = getDatabase()
    const result = await sql`
      SELECT raw_json 
      FROM users_sync 
      WHERE id = ${userId} AND deleted_at IS NULL
    `
    const users = getRows(result)
    
    if (users[0]?.raw_json?.role) {
      return users[0].raw_json.role
    }

    return "user"
  } catch (error) {
    console.error("Error fetching user role:", error)
    return "user"
  }
}

export async function isAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId)
  return role === "admin"
}

export async function createUser(email: string, name?: string, role: string = "user"): Promise<User | null> {
  try {
    const sql = getDatabase()
    
    // Check if email already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      console.error("User with this email already exists")
      return null
    }

    const userId = generateId()
    const result = await sql`
      INSERT INTO users_sync (id, email, name, created_at, updated_at, raw_json)
      VALUES (${userId}, ${email}, ${name || email.split("@")[0]}, NOW(), NOW(), ${JSON.stringify({ role })})
      RETURNING id, email, name, created_at, updated_at
    `
    
    const users = getRows(result)
    return users[0] as User || null
  } catch (error) {
    console.error("Error creating user:", error)
    return null
  }
}
