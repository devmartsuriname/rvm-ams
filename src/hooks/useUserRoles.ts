import { useAuthContext } from '@/context/useAuthContext'

/**
 * Role permission helpers — UI hints only.
 * RLS remains the source of truth for access control.
 */
export function useUserRoles() {
  const { user } = useAuthContext()
  const roles = user?.roles ?? []

  const hasRole = (role: string) => roles.includes(role)
  const hasAnyRole = (required: string[]) => required.some(r => roles.includes(r))

  return {
    roles,
    userId: user?.id,

    // Dossier permissions
    canCreateDossier: hasRole('admin_intake'),
    canEditDossier: hasAnyRole(['secretary_rvm', 'admin_dossier']),
    canTransitionDossier: hasAnyRole(['secretary_rvm', 'admin_dossier']),

    // Meeting permissions
    canCreateMeeting: hasAnyRole(['secretary_rvm', 'admin_agenda']),
    canEditMeeting: hasAnyRole(['secretary_rvm', 'admin_agenda']),
    canTransitionMeeting: hasAnyRole(['secretary_rvm', 'admin_agenda']),

    // Task permissions
    canCreateTask: hasAnyRole(['secretary_rvm', 'deputy_secretary']),
    canEditTask: hasAnyRole(['secretary_rvm', 'deputy_secretary']),
    canTransitionTask: hasAnyRole(['secretary_rvm', 'deputy_secretary']),

    // Super admin
    isSuperAdmin: hasRole('super_admin'),

    // Helpers
    hasRole,
    hasAnyRole,
  }
}
