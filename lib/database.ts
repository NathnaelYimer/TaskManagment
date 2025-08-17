import { neon } from "@neondatabase/serverless"

let _sql: ReturnType<typeof neon> | null = null

function getSQL() {
  if (!_sql) {
    console.log("[v0] Database connection attempt - window type:", typeof window)
    console.log("[v0] Is server side?", typeof window === "undefined")

    if (typeof window !== "undefined") {
      console.log("[v0] Blocking client-side database access")
      throw new Error("Database operations can only be performed on the server side")
    }

    if (!process.env.DATABASE_URL) {
      console.error("DATABASE_URL environment variable is not set")
      throw new Error("DATABASE_URL is not set. Please check your Neon integration in Project Settings.")
    }

    console.log("[v0] Creating database connection on server side")
    _sql = neon(process.env.DATABASE_URL)
  }

  return _sql
}

// Create a proper sql export that supports both tagged templates and query method
const sqlClient = getSQL()

// Create the sql function with both capabilities
const sql = (strings: TemplateStringsArray, ...values: any[]) => {
  return sqlClient(strings, ...values)
}

// Add the query method
sql.query = (query: string, params?: any[]) => {
  return sqlClient.query(query, params)
}

// Add the unsafe method for dynamic SQL
sql.unsafe = (rawSQL: string) => {
  return sqlClient.unsafe(rawSQL)
}

// Add all other methods from the client
Object.setPrototypeOf(sql, sqlClient)

export { sql }
export const getDatabase = getSQL

// Re-export types for backward compatibility
export type { Task, TaskComment, UserRole, User } from "./types"
