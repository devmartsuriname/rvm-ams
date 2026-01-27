import type { UserType } from '@/types/auth'
import { deleteCookie, getCookie, hasCookie, setCookie } from 'cookies-next'
import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ChildrenType } from '../types/component-props'

export type AuthContextType = {
  user: UserType | undefined
  isAuthenticated: boolean
  saveSession: (session: UserType | any) => void
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

const authSessionKey = '_DARKONE_AUTH_KEY_'
const localStorageKey = '_DARKONE_AUTH_FALLBACK_'

// Check if cookies are accessible (may fail in iframe/editor environments)
const isCookieAccessible = (): boolean => {
  try {
    const testKey = '__cookie_test__'
    document.cookie = `${testKey}=1; path=/`
    const result = document.cookie.indexOf(testKey) !== -1
    document.cookie = `${testKey}=1; expires=Thu, 01-Jan-1970 00:00:01 GMT; path=/`
    return result
  } catch {
    return false
  }
}

const useCookies = isCookieAccessible()

export function AuthProvider({ children }: ChildrenType) {
  const navigate = useNavigate()

  const getSession = (): AuthContextType['user'] => {
    // Try cookies first (primary)
    if (useCookies) {
      const fetchedCookie = getCookie(authSessionKey)?.toString()
      if (fetchedCookie) {
        try {
          return JSON.parse(fetchedCookie)
        } catch {
          return undefined
        }
      }
    }
    
    // Fallback to localStorage (for iframe/editor environments)
    try {
      const stored = localStorage.getItem(localStorageKey)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch {
      return undefined
    }
    
    return undefined
  }

  const checkIsAuthenticated = (): boolean => {
    // Try cookies first (primary)
    if (useCookies && hasCookie(authSessionKey)) {
      return true
    }
    
    // Fallback to localStorage
    try {
      return localStorage.getItem(localStorageKey) !== null
    } catch {
      return false
    }
  }

  const [user, setUser] = useState<UserType | undefined>(getSession())
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(checkIsAuthenticated())

  // Sync auth state on mount and when user changes
  useEffect(() => {
    setIsAuthenticated(checkIsAuthenticated())
  }, [user])

  const saveSession = (user: UserType) => {
    const userJson = JSON.stringify(user)
    
    // Save to cookies (primary)
    if (useCookies) {
      setCookie(authSessionKey, userJson)
    }
    
    // Always save to localStorage as fallback
    try {
      localStorage.setItem(localStorageKey, userJson)
    } catch {
      // localStorage may be unavailable
    }
    
    setUser(user)
    setIsAuthenticated(true)
  }

  const removeSession = () => {
    // Remove from cookies
    if (useCookies) {
      deleteCookie(authSessionKey)
    }
    
    // Remove from localStorage
    try {
      localStorage.removeItem(localStorageKey)
    } catch {
      // localStorage may be unavailable
    }
    
    setUser(undefined)
    setIsAuthenticated(false)
    navigate('/auth/sign-in')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        saveSession,
        removeSession,
      }}>
      {children}
    </AuthContext.Provider>
  )
}
