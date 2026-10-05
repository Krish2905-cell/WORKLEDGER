import { supabase } from '@/lib/supabase'

/**
 * authService
 *
 * All Supabase Auth calls live here, not scattered across components.
 * Each function returns { data, error } so the caller can handle both cases.
 *
 * Why centralise here?
 * - If Supabase auth API changes, we fix it in one place.
 * - Components stay focused on rendering; they don't know how auth works.
 * - Easy to test in isolation.
 */

export async function signUp(email, password) {
  /**
   * Creates a new user account.
   *
   * Supabase behaviour:
   * - If "Confirm email" is ON in project settings: creates the user but does
   *   NOT return a session. The user receives a confirmation email and must
   *   click it before they can log in.
   * - If "Confirm email" is OFF: creates the user AND returns a session
   *   immediately (auto-confirmed).
   *
   * The caller (SignupPage) must check data.session === null to detect the
   * confirmation-required case and show the appropriate message.
   */
  return supabase.auth.signUp({ email, password })
}

export async function signIn(email, password) {
  /**
   * Signs in an existing user with email + password.
   * Returns a session on success; error on wrong credentials.
   */
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signOut() {
  /**
   * Signs out the current user.
   * Supabase clears the session from localStorage.
   * onAuthStateChange fires and sets user → null in AuthContext.
   */
  return supabase.auth.signOut()
}

export async function sendPasswordResetEmail(email) {
  /**
   * Sends a password-reset link to the given email address.
   * Uses Supabase's built-in reset flow — we do not build a custom one.
   *
   * The user clicks the link in the email, which redirects to the app
   * with a recovery token. Supabase handles token validation.
   *
   * In v1, the redirect URL is the default Supabase callback.
   * (We can customise it in Supabase dashboard → Auth → URL configuration
   * when we deploy to production.)
   */
  return supabase.auth.resetPasswordForEmail(email)
}
