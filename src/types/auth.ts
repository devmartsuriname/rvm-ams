export type UserType = {
  id: string           // app_user.id (UUID)
  auth_id: string      // Supabase auth.users.id
  username?: string    // Darkone compat (derived from email)
  email: string
  password?: string    // Darkone compat (not stored)
  firstName?: string   // Darkone compat
  lastName?: string    // Darkone compat
  full_name: string    // app_user.full_name
  role: string         // Primary role (Darkone compat)
  roles: string[]      // All assigned role codes from user_role
  is_super_admin?: boolean // Super admin bootstrap status (from RPC)
  token?: string       // Supabase access_token (for compat)
}
