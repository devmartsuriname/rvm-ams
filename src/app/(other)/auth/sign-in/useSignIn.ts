import { yupResolver } from '@hookform/resolvers/yup'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import * as yup from 'yup'

import { supabase } from '@/integrations/supabase/client'
import { useNotificationContext } from '@/context/useNotificationContext'

const useSignIn = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { showNotification } = useNotificationContext()

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
    if (redirectLink) navigate(redirectLink)
    else navigate('/')
  }

  /**
   * Simplified login handler - only calls signInWithPassword
   * Auth context's onAuthStateChange handles session mapping
   * This removes the race condition caused by duplicate DB queries
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

      // Success - auth context will handle session via onAuthStateChange
      showNotification({ 
        message: 'Successfully logged in. Redirecting...', 
        variant: 'success' 
      })
      redirectUser()

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
