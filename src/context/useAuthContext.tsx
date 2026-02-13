import type { UserType } from '@/types/auth'
import { supabase } from '@/integrations/supabase/client'
import { createContext, useContext, useState, useEffect, useCallback, useRef, type RefObject } from 'react'
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
  
  // Ref to track current isLoading state (fixes stale closure in safety timeout)
  const isLoadingRef = useRef(isLoading)
  
  // Keep isLoadingRef in sync with isLoading state
  useEffect(() => {
    isLoadingRef.current = isLoading
  }, [isLoading])

  /**
   * Handle session changes from Supabase auth
   * Idempotent — safe to call multiple times for the same session.
   */
  const handleAuthChange = useCallback(async (session: Session | null) => {
    // No guard — processing the same session twice is idempotent;
    // dropping SIGNED_IN events causes redirect failure (see RP-P2E).
    try {
      if (session?.user && session.access_token) {
        const appUser = await mapSupabaseUserToAppUser(session.user, session.access_token)
        if (appUser) {
          setUser(appUser)
          setIsAuthenticated(true)
          console.info('[Auth] User authenticated successfully:', appUser.email)
        } else {
          // Auth user exists but no app_user mapping
          setUser(undefined)
          setIsAuthenticated(false)
          console.warn('[Auth] User mapping failed - staying unauthenticated')
        }
      } else {
        setUser(undefined)
        setIsAuthenticated(false)
        console.info('[Auth] No active session detected')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    // Set up auth state listener — INITIAL_SESSION fires immediately,
    // covering the initial session check (no separate getSession() needed).
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.info('[Auth] State change:', event)
        await handleAuthChange(session)
      }
    )

    // Safety timeout: ensure isLoading is set to false after 10 seconds
    // Uses ref to avoid stale closure capturing outdated isLoading value
    const safetyTimeout = setTimeout(() => {
      if (isLoadingRef.current) {
        console.warn('[Auth] Safety timeout triggered - forcing loading complete')
        setIsLoading(false)
      }
    }, 10000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(safetyTimeout)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleAuthChange]) // Remove isLoading to prevent re-initialization loops

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
