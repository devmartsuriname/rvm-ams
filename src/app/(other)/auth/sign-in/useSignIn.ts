import { yupResolver } from '@hookform/resolvers/yup'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import * as yup from 'yup'

import { supabase } from '@/integrations/supabase/client'
import { useNotificationContext } from '@/context/useNotificationContext'

const useSignIn = () => {
  const [loading, setLoading] = useState(false)
  const [loginSuccess, setLoginSuccess] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { showNotification } = useNotificationContext()
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
    else navigate('/')
  }, [searchParams, navigate])

  /**
   * Listen for auth state changes to detect when login is complete.
   * This avoids depending on useAuthContext which may have timing issues.
   */
  useEffect(() => {
    if (!loginSuccess) return

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        console.info('[SignIn] Auth state confirmed SIGNED_IN, redirecting...')
        redirectUser()
      }
    })

    // Also check current session in case event already fired
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        console.info('[SignIn] Session exists, redirecting...')
        redirectUser()
      }
    })

    return () => subscription.unsubscribe()
  }, [loginSuccess, redirectUser])

  /**
   * Login handler - calls signInWithPassword
   * Navigation happens reactively via the auth state listener above
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

      // Success - signal login success, auth listener will handle redirect
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
