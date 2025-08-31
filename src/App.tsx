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

// Placeholder components for routes that will be implemented later
const DashboardPage: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full text-center">
      <h2 className="text-3xl font-extrabold text-gray-900">Dashboard</h2>
      <p className="mt-2 text-sm text-gray-600">Welcome to Threativator! This page will be implemented in Task 2.</p>
    </div>
  </div>
)

const OnboardingPage: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full text-center">
      <h2 className="text-3xl font-extrabold text-gray-900">Onboarding</h2>
      <p className="mt-2 text-sm text-gray-600">Complete your setup. This will be implemented in Task 2.</p>
    </div>
  </div>
)

function App() {
  return (
    <AuthErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <div className="App">
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

                {/* Protected routes - require authentication */}
                <Route path="/dashboard" element={
                  <ProtectedRoute requiredOnboarding>
                    <DashboardPage />
                  </ProtectedRoute>
                } />
                
                <Route path="/onboarding" element={
                  <ProtectedRoute>
                    <OnboardingPage />
                  </ProtectedRoute>
                } />

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
