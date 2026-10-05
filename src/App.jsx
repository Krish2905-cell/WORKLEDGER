import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/auth/LoginPage'
import SignupPage from '@/pages/auth/SignupPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import DashboardPage from '@/pages/DashboardPage'
import HelpPage from '@/pages/HelpPage'
import ContactPage from '@/pages/ContactPage'

/**
 * App — root of the component tree.
 *
 * Route structure:
 *
 * Public routes (no authentication required):
 *   /                 → LandingPage  (redirects to /dashboard if already signed in)
 *   /login            → LoginPage
 *   /signup           → SignupPage
 *   /forgot-password  → ForgotPasswordPage
 *   /help             → HelpPage
 *   /contact          → ContactPage
 *
 * Protected routes (require authentication — ProtectedRoute guards these):
 *   /dashboard        → DashboardPage (Phase 1: placeholder only)
 *
 * Fallback:
 *   *  →  redirect to /login
 *
 * AuthProvider wraps everything so all routes can call useAuth().
 */
export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public auth & informational routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Protected routes — wrapped in ProtectedRoute */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>

        {/* Public landing page — authenticated users are redirected to /dashboard inside LandingPage */}
        <Route path="/" element={<LandingPage />} />

        {/* Catch-all → /login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  )
}