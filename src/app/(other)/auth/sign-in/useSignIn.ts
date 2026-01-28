import { yupResolver } from '@hookform/resolvers/yup'
import { useState, useEffect, useCallback, useRef } from 'react'
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
  const hasRedirectedRef = useRef(false)

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

  const redirectUser = useCallback(() => {
    if (hasRedirectedRef.current) return
    hasRedirectedRef.current = true
    
    const redirectLink = searchParams.get('redirectTo')
    if (redirectLink) navigate(redirectLink)
    else navigate('/dashboards')
  }, [searchParams, navigate])

  /**
   * Redirect if already authenticated (e.g., page refresh while logged in)
   */
  useEffect(() => {
    if (isAuthenticated && !loginSuccess) {
      redirectUser()
    }
  }, [isAuthenticated, loginSuccess, redirectUser])

  /**
   * Wait for BOTH loginSuccess AND isAuthenticated before navigating.
   * This ensures AuthContext has finished its async DB queries.
   */
  useEffect(() => {
    if (loginSuccess && isAuthenticated) {
      console.info('[SignIn] Auth context confirmed, redirecting...')
      redirectUser()
    }
  }, [loginSuccess, isAuthenticated, redirectUser])

  /**
   * Login handler - calls signInWithPassword
   * Navigation happens reactively via the useEffect watching isAuthenticated
   */
  const login = handleSubmit(async (values: LoginFormFields) => {
    setLoading(true)
    hasRedirectedRef.current = false
    
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

      // Success - signal login success, useEffect will handle redirect when AuthContext is ready
      showNotification({ 
        message: 'Successfully logged in. Redirecting...', 
        variant: 'success' 
      })
      setLoginSuccess(true)

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
