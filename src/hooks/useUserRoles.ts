import { useAuthContext } from '@/context/useAuthContext'

/**
 * Role permission helpers — UI hints only.
 * RLS remains the source of truth for access control.
 */
export function useUserRoles() {
  const { user } = useAuthContext()
  const roles = user?.roles ?? []
  const isSuperAdmin = user?.is_super_admin ?? false

  const hasRole = (role: string) => roles.includes(role)
  const hasAnyRole = (required: string[]) => required.some(r => roles.includes(r))

  return {
    roles,
    userId: user?.id,

    // Dossier permissions
    canCreateDossier: isSuperAdmin || hasRole('admin_intake'),
    canEditDossier: isSuperAdmin || hasAnyRole(['secretary_rvm', 'admin_dossier']),
    canTransitionDossier: isSuperAdmin || hasAnyRole(['secretary_rvm', 'admin_dossier']),

    // Meeting permissions
    canCreateMeeting: isSuperAdmin || hasAnyRole(['secretary_rvm', 'admin_agenda']),
    canEditMeeting: isSuperAdmin || hasAnyRole(['secretary_rvm', 'admin_agenda']),
    canTransitionMeeting: isSuperAdmin || hasAnyRole(['secretary_rvm', 'admin_agenda']),

    // Task permissions
    canCreateTask: isSuperAdmin || hasAnyRole(['secretary_rvm', 'deputy_secretary']),
    canEditTask: isSuperAdmin || hasAnyRole(['secretary_rvm', 'deputy_secretary']),
    canTransitionTask: isSuperAdmin || hasAnyRole(['secretary_rvm', 'deputy_secretary']),

    // Decision permissions
    canCreateDecision: isSuperAdmin || hasAnyRole(['secretary_rvm', 'admin_reporting']),
    canEditDecision: isSuperAdmin || hasRole('secretary_rvm'),
    canApproveDecision: isSuperAdmin || hasRole('chair_rvm'),
    canFinalizeDecision: isSuperAdmin || hasRole('chair_rvm'),

    // Audit permissions
    canViewAudit: isSuperAdmin || hasRole('audit_readonly'),

    // Super admin
    isSuperAdmin,

    // Helpers
    hasRole,
    hasAnyRole,
  }
}
