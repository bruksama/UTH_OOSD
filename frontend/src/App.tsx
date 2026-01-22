import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';

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

// ===== AUTH PAGES =====
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(
        localStorage.getItem('isAuthenticated') === 'true'
    );

    return (
        <Router>
            <Routes>

                {/* ===== AUTH ===== */}
                <Route
                    path="/login"
                    element={<Login setIsAuthenticated={setIsAuthenticated} />}
                />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* ===== PROTECTED AREA ===== */}
                <Route
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <Layout />
                        </ProtectedRoute>
                    }
                >
                    {/* ===== ADMIN ===== */}
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/students" element={<Students />} />
                    <Route path="/admin/courses" element={<Courses />} />
                    <Route path="/admin/alerts" element={<Alerts />} />

                    {/* ===== STUDENT ===== */}
                    <Route path="/student/dashboard" element={<StudentDashboard />} />
                    <Route path="/student/alerts" element={<StudentAlerts />} />
                    <Route path="/student/grades" element={<MyGrades />} />

                    {/* ===== FIX TRANG TRẮNG /courses ===== */}
                    <Route path="/courses" element={<Navigate to="/admin/courses" />} />

                    {/* ===== DEFAULT ===== */}
                    <Route path="/" element={<Navigate to="/login" />} />
                </Route>

                {/* ===== FALLBACK (URL SAI) ===== */}
                <Route path="*" element={<Navigate to="/login" />} />

            </Routes>
        </Router>
    );
}

export default App;
