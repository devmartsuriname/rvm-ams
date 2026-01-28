import { yupResolver } from '@hookform/resolvers/yup'
import { useState, useEffect, useCallback } from 'react'
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

  const redirectUser = useCallback(() => {
    const redirectLink = searchParams.get('redirectTo')
    if (redirectLink) navigate(redirectLink)
    else navigate('/')
  }, [searchParams, navigate])

  /**
   * Reactive navigation: Wait for auth context to confirm authentication
   * before navigating. This fixes the race condition where immediate
   * navigation happened before onAuthStateChange updated isAuthenticated.
   */
  useEffect(() => {
    if (loginSuccess && isAuthenticated) {
      console.info('[SignIn] Auth confirmed, redirecting...')
      redirectUser()
    }
  }, [loginSuccess, isAuthenticated, redirectUser])

  /**
   * Simplified login handler - only calls signInWithPassword
   * Auth context's onAuthStateChange handles session mapping
   * Navigation is now reactive via useEffect above
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

      // Success - signal login success, wait for auth context
      showNotification({ 
        message: 'Successfully logged in. Redirecting...', 
        variant: 'success' 
      })
      setLoginSuccess(true) // Don't navigate here - useEffect will handle it

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
