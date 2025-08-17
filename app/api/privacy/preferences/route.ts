import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'
import { cookies } from 'next/headers'

interface User {
  id: string
  email: string
  name: string
}

interface PrivacySettings {
  profile_visibility: boolean
  show_activity_status: boolean
  allow_email_lookup: boolean
  allow_username_search: boolean
}

// Helper function to get user from session
async function getUserFromSession(): Promise<User | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('auth-session')
  
  if (!sessionCookie) {
    return null
  }

  try {
    const userId = sessionCookie.value
    const sql = getDatabase()
    
    const result = await sql`
      SELECT id, email, name 
      FROM users_sync 
      WHERE id = ${userId} AND deleted_at IS NULL
    `
    
    const users = Array.isArray(result) ? result as User[] : []
    return users[0] || null
  } catch (error) {
    console.error('Error getting user from session:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromSession()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sql = getDatabase()
    
    try {
      const preferences = await sql`
        SELECT profile_visibility, show_activity_status, allow_email_lookup, allow_username_search
        FROM user_privacy_settings
        WHERE user_id = ${user.id}
      `
      
      const preferencesArray = Array.isArray(preferences) ? preferences as PrivacySettings[] : []
      
      if (preferencesArray.length === 0) {
        return NextResponse.json({
          profileVisibility: true,
          showActivityStatus: true,
          allowEmailLookup: false,
          allowUsernameSearch: true,
        })
      }

      const pref = preferencesArray[0]
      return NextResponse.json({
        profileVisibility: pref.profile_visibility,
        showActivityStatus: pref.show_activity_status,
        allowEmailLookup: pref.allow_email_lookup,
        allowUsernameSearch: pref.allow_username_search,
      })
    } catch (error) {
      // Table might not exist yet, return defaults
      return NextResponse.json({
        profileVisibility: true,
        showActivityStatus: true,
        allowEmailLookup: false,
        allowUsernameSearch: true,
      })
    }
  } catch (error) {
    console.error('Error fetching privacy preferences:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromSession()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      profileVisibility,
      showActivityStatus,
      allowEmailLookup,
      allowUsernameSearch,
    } = body

    const sql = getDatabase()
    
    await sql`
      INSERT INTO user_privacy_settings (
        user_id, profile_visibility, show_activity_status, allow_email_lookup, allow_username_search
      ) VALUES (${user.id}, ${profileVisibility ?? true}, ${showActivityStatus ?? true}, ${allowEmailLookup ?? false}, ${allowUsernameSearch ?? true})
      ON CONFLICT (user_id) DO UPDATE SET
        profile_visibility = EXCLUDED.profile_visibility,
        show_activity_status = EXCLUDED.show_activity_status,
        allow_email_lookup = EXCLUDED.allow_email_lookup,
        allow_username_search = EXCLUDED.allow_username_search,
        updated_at = CURRENT_TIMESTAMP
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating privacy preferences:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
