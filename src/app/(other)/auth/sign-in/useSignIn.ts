import { yupResolver } from '@hookform/resolvers/yup'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import * as yup from 'yup'

import { supabase } from '@/integrations/supabase/client'
import { useNotificationContext } from '@/context/useNotificationContext'
import { useAuthContext } from '@/context/useAuthContext'

const useSignIn = () => {
  const [loading, setLoading] = useState(false)
  const [loginSuccess, setLoginSuccess] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { showNotification } = useNotificationContext()
  const { isAuthenticated } = useAuthContext()

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

  const redirectUser = () => {
    const redirectLink = searchParams.get('redirectTo')
    // Security: Validate redirectTo is internal path only (no open redirect)
    if (redirectLink && redirectLink.startsWith('/') && !redirectLink.includes('://')) {
      console.info('[SignIn] Redirecting to:', redirectLink)
      navigate(redirectLink)
    } else {
      console.info('[SignIn] Redirecting to default: /dashboards')
      navigate('/dashboards')
    }
  }

  /**
   * Effect that waits for BOTH login success AND auth context confirmation
   * before redirecting. This fixes the race condition where redirect happened
   * before isAuthenticated was updated.
   */
  useEffect(() => {
    if (loginSuccess && isAuthenticated) {
      console.info('[SignIn] Auth context confirmed, redirecting now')
      redirectUser()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginSuccess, isAuthenticated])

  /**
   * Auto-redirect users who are already authenticated
   * Prevents showing sign-in page unnecessarily when user navigates here while logged in
   */
  useEffect(() => {
    if (isAuthenticated && !loginSuccess) {
      console.info('[SignIn] Already authenticated, redirecting...')
      redirectUser()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  /**
   * Simplified login handler - only calls signInWithPassword
   * Auth context's onAuthStateChange handles session mapping
   * Redirect is deferred to useEffect to avoid race condition
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
        return
      }

      // Success - set flag and let useEffect handle redirect after auth context updates
      console.info('[SignIn] Supabase auth succeeded, waiting for auth context...')
      setLoginSuccess(true)
      showNotification({ 
        message: 'Successfully logged in. Redirecting...', 
        variant: 'success' 
      })
      // DO NOT call redirectUser() here - let useEffect handle it

    } catch (e: unknown) {
      console.error('[SignIn] Error:', e)
      showNotification({ 
        message: 'An unexpected error occurred. Please try again.', 
        variant: 'danger' 
      })
    } finally {
      setLoading(false)
    }
  })

  return { loading, login, control }
}

export default useSignIn
