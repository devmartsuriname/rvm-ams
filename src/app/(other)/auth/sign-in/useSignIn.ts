import { yupResolver } from '@hookform/resolvers/yup'
import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import * as yup from 'yup'

import { supabase } from '@/integrations/supabase/client'
import { useNotificationContext } from '@/context/useNotificationContext'
import { useAuthContext } from '@/context/useAuthContext'

const useSignIn = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { showNotification } = useNotificationContext()
  const { isAuthenticated } = useAuthContext()
  
  // Track if we're waiting for auth to complete after login
  const pendingRedirectRef = useRef(false)

  const loginFormSchema = yup.object({
    email: yup.string().email('Please enter a valid email').required('Please enter your email'),
    password: yup.string().required('Please enter your password'),
  })

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  type LoginFormFields = yup.InferType<typeof loginFormSchema>

  const getRedirectPath = () => {
    const redirectLink = searchParams.get('redirectTo')
    return redirectLink || '/dashboards'
  }

  /**
   * Handle redirect AFTER auth state confirms authentication
   * This prevents the race condition where we redirect before isAuthenticated is true
   */
  useEffect(() => {
    if (pendingRedirectRef.current && isAuthenticated) {
      console.info('[SignIn] Auth confirmed, redirecting to:', getRedirectPath())
      pendingRedirectRef.current = false
      navigate(getRedirectPath(), { replace: true })
    }
  }, [isAuthenticated, navigate, searchParams])

  /**
   * Simplified login handler - only calls signInWithPassword
   * Auth context's onAuthStateChange handles session mapping
   * Redirect happens via useEffect when isAuthenticated becomes true
   */
  const login = handleSubmit(async (values: LoginFormFields) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (error) {
        showNotification({ 
          message: error.message || 'Invalid credentials', 
          variant: 'danger' 
        })
        setLoading(false)
        return
      }

      // Mark that we're waiting for auth to confirm
      // The useEffect will handle redirect when isAuthenticated becomes true
      console.info('[SignIn] Supabase auth succeeded, waiting for auth context...')
      pendingRedirectRef.current = true
      
      showNotification({ 
        message: 'Successfully logged in. Redirecting...', 
        variant: 'success' 
      })
      
      // Keep loading state until redirect completes
      // Loading will be reset if auth fails or on unmount

    } catch (e: unknown) {
      console.error('[SignIn] Error:', e)
      showNotification({ 
        message: 'An unexpected error occurred. Please try again.', 
        variant: 'danger' 
      })
      setLoading(false)
    }
  })

  return { loading, login, control }
}

export default useSignIn
