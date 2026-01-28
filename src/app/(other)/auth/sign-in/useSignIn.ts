import { yupResolver } from '@hookform/resolvers/yup'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import * as yup from 'yup'

import { supabase } from '@/integrations/supabase/client'
import { useAuthContext } from '@/context/useAuthContext'
import { useNotificationContext } from '@/context/useNotificationContext'
import type { UserType } from '@/types/auth'

const useSignIn = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const { saveSession } = useAuthContext()
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

  const login = handleSubmit(async (values: LoginFormFields) => {
    setLoading(true)
    try {
      // Authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
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

      if (!data.user || !data.session) {
        showNotification({ 
          message: 'Sign in failed. Please try again.', 
          variant: 'danger' 
        })
        return
      }

      // Fetch app_user data to build UserType
      const { data: appUser, error: userError } = await supabase
        .from('app_user')
        .select('id, email, full_name, is_active')
        .eq('auth_id', data.user.id)
        .single()

      if (userError || !appUser) {
        showNotification({ 
          message: 'User profile not found. Contact administrator.', 
          variant: 'danger' 
        })
        await supabase.auth.signOut()
        return
      }

      if (!appUser.is_active) {
        showNotification({ 
          message: 'Your account has been deactivated.', 
          variant: 'danger' 
        })
        await supabase.auth.signOut()
        return
      }

      // Fetch user roles
      const { data: userRoles } = await supabase
        .from('user_role')
        .select('role_code')
        .eq('user_id', appUser.id)

      const roles = userRoles?.map(r => r.role_code) ?? []
      const primaryRole = roles[0] ?? 'user'

      // Parse name for Darkone compat
      const nameParts = appUser.full_name.split(' ')
      const firstName = nameParts[0] ?? ''
      const lastName = nameParts.slice(1).join(' ') ?? ''

      // Build user session object
      const userSession: UserType = {
        id: appUser.id,
        auth_id: data.user.id,
        email: appUser.email,
        full_name: appUser.full_name,
        username: appUser.email.split('@')[0],
        firstName,
        lastName,
        role: primaryRole,
        roles,
        token: data.session.access_token,
      }

      saveSession(userSession)
      showNotification({ 
        message: 'Successfully logged in. Redirecting....', 
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
