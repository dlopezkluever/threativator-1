import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import AuthErrorBoundary from './components/auth/AuthErrorBoundary'
import ProtectedRoute from './components/auth/ProtectedRoute'
import PublicRoute from './components/auth/PublicRoute'
import LoginPage from './components/auth/LoginPage'
import SignupPage from './components/auth/SignupPage'
import ForgotPasswordPage from './components/auth/ForgotPasswordPage'
import ResetPasswordPage from './components/auth/ResetPasswordPage'
import AuthTestPage from './components/auth/AuthTestPage'
import TwitterCallbackPage from './components/auth/TwitterCallbackPage'
import OnboardingWizard from './components/onboarding/OnboardingWizard'
import OnboardingTestPage from './components/onboarding/OnboardingTestPage'
import DashboardLayout from './components/dashboard/DashboardLayout'

function App() {
  return (
    <AuthErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <div className="App min-h-screen">
              <Routes>
                {/* Public routes - redirect authenticated users */}
                <Route path="/login" element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                } />
                <Route path="/signup" element={
                  <PublicRoute>
                    <SignupPage />
                  </PublicRoute>
                } />
                <Route path="/forgot-password" element={
                  <PublicRoute>
                    <ForgotPasswordPage />
                  </PublicRoute>
                } />
                <Route path="/auth/reset-password" element={
                  <PublicRoute>
                    <ResetPasswordPage />
                  </PublicRoute>
                } />
                <Route path="/auth/twitter/callback" element={
                  <ProtectedRoute>
                    <TwitterCallbackPage />
                  </ProtectedRoute>
                } />

                {/* Protected routes - require authentication */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                } />
                
                <Route path="/onboarding" element={
                  <ProtectedRoute>
                    <OnboardingWizard />
                  </ProtectedRoute>
                } />

                {/* Test pages - can be accessed by anyone */}
                <Route path="/test" element={<AuthTestPage />} />
                <Route path="/test-onboarding" element={<OnboardingTestPage />} />

                {/* Default redirect */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                {/* Catch all - redirect to dashboard */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </Router>
        </AuthProvider>
      </ToastProvider>
    </AuthErrorBoundary>
  )
}

export default App
