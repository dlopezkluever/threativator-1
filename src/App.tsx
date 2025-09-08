import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import { GoalProvider } from './contexts/GoalContext'
import AuthErrorBoundary from './components/auth/AuthErrorBoundary'
import ProtectedRoute from './components/auth/ProtectedRoute'
import PublicRoute from './components/auth/PublicRoute'
import LoginPage from './components/auth/LoginPage'
import SignupPage from './components/auth/SignupPage'
import ForgotPasswordPage from './components/auth/ForgotPasswordPage'
import ResetPasswordPage from './components/auth/ResetPasswordPage'
import AuthTestPage from './components/auth/AuthTestPage'
import TwitterCallbackPage from './components/auth/TwitterCallbackPage'
import TwitterTestPage from './components/auth/TwitterTestPage'
import OnboardingWizard from './components/onboarding/OnboardingWizard'
import OnboardingTestPage from './components/onboarding/OnboardingTestPage'
import DashboardLayout from './components/dashboard/DashboardLayout'
import GoalCreation from './components/goals/GoalCreation'

function App() {
  return (
    <AuthErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <GoalProvider>
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
                
                <Route path="/create-goal" element={
                  <ProtectedRoute>
                    <GoalCreation />
                  </ProtectedRoute>
                } />

                {/* Test pages - can be accessed by anyone */}
                <Route path="/test" element={<AuthTestPage />} />
                <Route path="/test-onboarding" element={<OnboardingTestPage />} />
                <Route path="/test-twitter" element={<TwitterTestPage />} />

                {/* Default redirect */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                {/* Catch all - redirect to dashboard */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </div>
            </Router>
          </GoalProvider>
        </AuthProvider>
      </ToastProvider>
    </AuthErrorBoundary>
  )
}

export default App
