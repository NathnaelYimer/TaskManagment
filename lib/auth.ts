import { getDatabase } from "./database"
import type { User } from "./types"

const ADMIN_EMAIL = "nathnaelyimer@gmail.com"
const ADMIN_PASSWORD = "Nati@20409545"

function generateId(): string {
  return 'user_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

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
    
    // Check for admin login
    if (email === ADMIN_EMAIL) {
      if (password === ADMIN_PASSWORD) {
        // Check if admin exists in database
        const adminResult = await sql`
          SELECT id, email, name, created_at, updated_at 
          FROM users_sync 
          WHERE email = ${ADMIN_EMAIL} AND deleted_at IS NULL
        `
        const adminUsers = getRows(adminResult)
        
        if (adminUsers.length > 0) {
          return { user: adminUsers[0] as User, role: 'admin' }
        } else {
          // Create admin user if doesn't exist
          const userId = generateId()
          const adminUser = await sql`
            INSERT INTO users_sync (id, email, name, created_at, updated_at, raw_json)
            VALUES (
              ${userId}, 
              ${ADMIN_EMAIL}, 
              'Admin User', 
              NOW(), 
              NOW(), 
              ${JSON.stringify({ role: 'admin' })}
            )
            RETURNING id, email, name, created_at, updated_at
          `
          const newAdmin = getRows(adminUser)[0]
          return { user: newAdmin as User, role: 'admin' }
        }
      }
      return null // Wrong admin password
    }
    
    // For non-admin users, check if they exist
    const result = await sql`
      SELECT id, email, name, created_at, updated_at, raw_json 
      FROM users_sync 
      WHERE email = ${email} AND deleted_at IS NULL
    `
    const users = getRows(result)
    
    if (users.length > 0) {
      // User exists, return with user role (password doesn't matter for non-admin)
      return { user: users[0], role: 'user' }
    } else {
      // Create new user
      const userId = generateId()
      const name = email.split('@')[0]
      
      const newUserResult = await sql`
        INSERT INTO users_sync (id, email, name, created_at, updated_at, raw_json)
        VALUES (
          ${userId}, 
          ${email}, 
          ${name}, 
          NOW(), 
          NOW(), 
          ${JSON.stringify({ role: 'user' })}
        )
        RETURNING id, email, name, created_at, updated_at
      `
      
      const newUsers = getRows(newUserResult)
      return { user: newUsers[0] as User, role: 'user' }
    }
  } catch (error) {
    console.error('Authentication error:', error)
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
