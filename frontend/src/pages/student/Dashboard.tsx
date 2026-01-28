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
// import { convertTo4Scale } from '../../utils/helpers';

const Dashboard = () => {
    const { user } = useAuth();
    const [enrollments, setEnrollments] = useState<EnrollmentDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    // Calculate GPA from enrollments (Scale 4 Thresholds)
    const getStatus = (gpa: number, credits: number) => {
        if (credits === 0) return 'Normal';
        if (gpa >= 3.6) return 'Excellent';     // Xuất sắc
        if (gpa >= 3.2) return 'Very Good';     // Giỏi
        if (gpa >= 2.5) return 'Good';          // Khá
        if (gpa >= 2.0) return 'Average';       // Trung bình
        return 'At Risk';                       // Yếu/Kém
    };

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

    const status = getStatus(overallGpa, completedCredits);

    if (loading) return <div className="text-center py-8">Loading...</div>;
    // Error not shown to user to keep UI clean, fallback to empty state was handled.
    if (error) return <div className="text-red-500 py-8">{error}</div>;

    return (
        <div className="space-y-6">
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
                    <p
                        className={`text-xl font-semibold ${status === 'Excellent'
                            ? 'text-green-600'
                            : status === 'Very Good'
                                ? 'text-emerald-600'
                                : status === 'Good'
                                    ? 'text-blue-600'
                                    : status === 'Average'
                                        ? 'text-yellow-600'
                                        : status === 'Normal'
                                            ? 'text-slate-600'
                                            : 'text-red-600'
                            }`}
                    >
                        {status}
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
