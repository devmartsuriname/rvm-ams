import type { UserType } from '@/types/auth'
import { supabase } from '@/integrations/supabase/client'
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ChildrenType } from '../types/component-props'
import type { Session, User } from '@supabase/supabase-js'

export type AuthContextType = {
  user: UserType | undefined
  isAuthenticated: boolean
  isLoading: boolean
  saveSession: (session: UserType) => void
  removeSession: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

/**
 * Maps a Supabase auth user to the application UserType
 * Fetches app_user and user_role data from the database
 */
async function mapSupabaseUserToAppUser(
  authUser: User,
  accessToken: string
): Promise<UserType | null> {
  try {
    // Fetch app_user by auth_id
    const { data: appUser, error: userError } = await supabase
      .from('app_user')
      .select('id, email, full_name, is_active')
      .eq('auth_id', authUser.id)
      .single()

    if (userError || !appUser) {
      console.error('[Auth] No app_user found for auth_id:', authUser.id)
      return null
    }

    if (!appUser.is_active) {
      console.warn('[Auth] User account is inactive:', appUser.email)
      return null
    }

    // Fetch user roles
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_role')
      .select('role_code')
      .eq('user_id', appUser.id)

    if (rolesError) {
      console.error('[Auth] Error fetching roles:', rolesError)
    }

    const roles = userRoles?.map(r => r.role_code) ?? []
    const primaryRole = roles[0] ?? 'user'

    // Parse name for Darkone compat
    const nameParts = appUser.full_name.split(' ')
    const firstName = nameParts[0] ?? ''
    const lastName = nameParts.slice(1).join(' ') ?? ''

    return {
      id: appUser.id,
      auth_id: authUser.id,
      email: appUser.email,
      full_name: appUser.full_name,
      username: appUser.email.split('@')[0],
      firstName,
      lastName,
      role: primaryRole,
      roles,
      token: accessToken,
    }
  } catch (error) {
    console.error('[Auth] Error mapping user:', error)
    return null
  }
}

export function AuthProvider({ children }: ChildrenType) {
  const navigate = useNavigate()
  const [user, setUser] = useState<UserType | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  // Prevent concurrent auth processing (race condition fix)
  const isProcessingRef = useRef(false)
  const hasInitializedRef = useRef(false)

  /**
   * Handle session changes from Supabase auth
   * Uses a processing flag to prevent race conditions
   */
  const handleAuthChange = useCallback(async (session: Session | null) => {
    // Prevent concurrent processing
    if (isProcessingRef.current) {
      console.info('[Auth] Skipping duplicate auth processing')
      return
    }
    
    isProcessingRef.current = true
    
    try {
      if (session?.user && session.access_token) {
        const appUser = await mapSupabaseUserToAppUser(session.user, session.access_token)
        if (appUser) {
          setUser(appUser)
          setIsAuthenticated(true)
        } else {
          // Auth user exists but no app_user mapping
          setUser(undefined)
          setIsAuthenticated(false)
        }
      } else {
        setUser(undefined)
        setIsAuthenticated(false)
      }
    } finally {
      isProcessingRef.current = false
      setIsLoading(false)
    }
  }, [])

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    // Prevent double initialization in StrictMode
    if (hasInitializedRef.current) return
    hasInitializedRef.current = true

    // Set up auth state listener BEFORE checking initial session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.info('[Auth] State change:', event)
        await handleAuthChange(session)
      }
    )

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      // Only process if not already handled by onAuthStateChange
      if (!isProcessingRef.current) {
        handleAuthChange(session)
      }
    })

    // Safety timeout: ensure isLoading is set to false after 10 seconds
    const safetyTimeout = setTimeout(() => {
      if (isLoading) {
        console.warn('[Auth] Safety timeout triggered - forcing loading complete')
        setIsLoading(false)
      }
    }, 10000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(safetyTimeout)
    }
  }, [handleAuthChange, isLoading])

  /**
   * Save session (called after successful sign-in)
   * Used for compatibility with existing Darkone patterns
   */
  const saveSession = useCallback((userData: UserType) => {
    setUser(userData)
    setIsAuthenticated(true)
  }, [])

  /**
   * Remove session and sign out
   */
  const removeSession = useCallback(async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('[Auth] Sign out error:', error)
    }
    setUser(undefined)
    setIsAuthenticated(false)
    navigate('/auth/sign-in')
  }, [navigate])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        saveSession,
        removeSession,
      }}>
      {children}
    </AuthContext.Provider>
  )
}
