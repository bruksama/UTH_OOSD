import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// ===== TEACHER PAGES =====
import TeacherDashboard from './pages/teacher/Dashboard';
import Students from './pages/teacher/Students';
import Courses from './pages/teacher/Courses';
import Alerts from './pages/teacher/Alerts';

// ===== STUDENT PAGES =====
import StudentDashboard from './pages/student/Dashboard';
import StudentAlerts from './pages/student/MyAlerts';

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
                {/* ===== AUTH (NO LAYOUT) ===== */}
                <Route
                    path="/login"
                    element={<Login setIsAuthenticated={setIsAuthenticated} />}
                />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* ===== PROTECTED (WITH LAYOUT) ===== */}
                <Route
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <Layout />
                        </ProtectedRoute>
                    }
                >
                    {/* ===== TEACHER ===== */}
                    <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
                    <Route path="/teacher/students" element={<Students />} />
                    <Route path="/teacher/courses" element={<Courses />} />
                    <Route path="/teacher/alerts" element={<Alerts />} />

                    {/* ===== STUDENT ===== */}
                    <Route path="/student/dashboard" element={<StudentDashboard />} />
                    <Route path="/student/alerts" element={<StudentAlerts />} />

                    {/* ===== DEFAULT ===== */}
                    <Route path="/" element={<Navigate to="/login" />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
