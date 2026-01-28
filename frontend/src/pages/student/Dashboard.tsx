import { useState, useEffect } from 'react';
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import { Link } from 'react-router-dom';
import { enrollmentService } from '../../services';
import { EnrollmentDTO } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { getAcademicClassification, getClassificationColor } from '../../utils/helpers';

const Dashboard = () => {
    const { user } = useAuth();
    const [enrollments, setEnrollments] = useState<EnrollmentDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get student ID from auth context (priority) or localStorage (fallback)
                let studentId = user?.studentId;
                if (!studentId) {
                    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
                    studentId = currentUser.studentId;
                }

                if (studentId) {
                    const response = await enrollmentService.getByStudent(studentId);
                    setEnrollments(response.data);
                } else {
                    setEnrollments([]);
                }
            } catch (err) {
                console.error('Error fetching enrollments:', err);
                // Don't show error for new students, just empty state
                setEnrollments([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    // Calculate GPA ONLY from completed courses (with valid scores)
    const gradedEnrollments = enrollments.filter(e => e.finalScore !== null && e.finalScore !== undefined);

    // Total completed credits (for GPA calculation)
    const completedCredits = gradedEnrollments.reduce((sum, e) => sum + (e.credits || 0), 0);
    // Weighted sum using gpaValue provided by Backend
    const totalPoints = gradedEnrollments.reduce((sum, e) => sum + ((e.gpaValue || 0) * (e.credits || 0)), 0);

    const overallGpa = completedCredits === 0 ? 0 : totalPoints / completedCredits;

    const TOTAL_CREDITS = 120;
    const creditData = [
        { name: 'Completed', value: completedCredits },
        { name: 'Remaining', value: Math.max(TOTAL_CREDITS - completedCredits, 0) },
    ];

    const statusInfo = getAcademicClassification(overallGpa, completedCredits);
    const classificationColor = getClassificationColor(statusInfo);

    if (loading) return <div className="text-center py-8">Loading...</div>;
    // Error not shown to user to keep UI clean, fallback to empty state was handled.
    if (error) return <div className="text-red-500 py-8">{error}</div>;

    return (
        <div className="space-y-6">
            {/* ALERTS - Automatic Early Warning System */}
            {(() => {
                // Warning logic based on Academic Regulations
                if (completedCredits > 0) {
                    if (overallGpa < 1.0) {
                        return (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg shadow-sm">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-bold text-red-800 uppercase tracking-wide">
                                            Critical Academic Alert
                                        </h3>
                                        <p className="text-sm text-red-700 mt-1">
                                            Your GPA is <strong>{overallGpa.toFixed(2)}</strong>, which is below 1.0.
                                            You are at immediate risk of forced withdrawal (Xuất toán). Please contact your Academic Advisor immediately.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    } else if (overallGpa < 2.0) {
                        return (
                            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-r-lg shadow-sm">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wide">
                                            Academic Warning
                                        </h3>
                                        <p className="text-sm text-amber-700 mt-1">
                                            Your GPA is <strong>{overallGpa.toFixed(2)}</strong>. Falling below 2.0 places you on Academic Probation.
                                            You need to improve your grades in the upcoming semesters to avoid further restrictions.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    }
                }
                return null;
            })()}

            {/* SUMMARY */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card text-center">
                    <p className="text-gray-500">Overall GPA</p>
                    <p className="text-3xl font-bold">{overallGpa.toFixed(2)}</p>
                </div>

                <div className="card text-center">
                    <p className="text-gray-500">Credits Completed</p>
                    <p className="text-3xl font-bold">{completedCredits}/{TOTAL_CREDITS}</p>
                </div>

                <div className="card text-center">
                    <p className="text-gray-500">Academic Status</p>
                    <p className="flex justify-center mt-2">
                        <span className={`${classificationColor} text-lg px-4 py-1`}>
                            {statusInfo}
                        </span>
                    </p>
                </div>
            </div>

            {/* CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* CREDIT PROGRESS */}
                <div className="card">
                    <h3 className="font-semibold mb-4">Credit Progress</h3>
                    <div className="h-64 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={creditData}
                                    dataKey="value"
                                    innerRadius={60}
                                    outerRadius={90}
                                >
                                    <Cell fill="#22c55e" />
                                    <Cell fill="#e5e7eb" />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>

                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <p className="text-2xl font-bold">{completedCredits}/{TOTAL_CREDITS}</p>
                            <p className="text-sm text-gray-500">Credits Completed</p>
                        </div>
                    </div>
                </div>

                {/* ENROLLMENTS LIST */}
                <div className="card">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold">Recent Enrollments</h3>
                        <Link to="/student/grades" className="text-sm text-primary-600 hover:text-primary-700 font-medium hover:underline">
                            View All
                        </Link>
                    </div>
                    {enrollments.length === 0 ? (
                        <p className="text-gray-500 text-sm">No enrollments yet</p>
                    ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {enrollments.slice(0, 5).map((e) => (
                                <div key={e.id} className="flex justify-between text-sm border-b pb-2">
                                    <span>{e.courseName}</span>
                                    <span className="font-semibold">{e.finalScore !== null && e.finalScore !== undefined ? e.finalScore : 'N/A'}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
