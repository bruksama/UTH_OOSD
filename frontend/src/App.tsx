import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// ===== ADMIN PAGES =====
import AdminDashboard from './pages/admin/Dashboard';
import Students from './pages/admin/Students';
import Courses from './pages/admin/Courses';
import Alerts from './pages/admin/Alerts';

// ===== STUDENT PAGES =====
import StudentDashboard from './pages/student/Dashboard';
import StudentAlerts from './pages/student/MyAlerts';
import MyGrades from './pages/student/MyGrades';
import MyCourses from './pages/student/MyCourses';
import StudentProfile from './pages/student/StudentProfile';

// ===== AUTH PAGES =====
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Component for smart default redirect based on user role
function DefaultRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* ===== AUTH ===== */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* ===== ADMIN ROUTES ===== */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/students" element={<Students />} />
        <Route path="/admin/courses" element={<Courses />} />
        <Route path="/admin/alerts" element={<Alerts />} />
      </Route>

      {/* ===== STUDENT ROUTES ===== */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/courses" element={<MyCourses />} />
        <Route path="/student/grades" element={<MyGrades />} />
        <Route path="/student/alerts" element={<StudentAlerts />} />
        <Route path="/student/profile" element={<StudentProfile />} />
      </Route>

      {/* ===== LEGACY REDIRECT ===== */}
      <Route path="/courses" element={<Navigate to="/admin/courses" replace />} />

      {/* ===== DEFAULT & FALLBACK ===== */}
      <Route path="/" element={<DefaultRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
