import { useState, useEffect } from 'react';
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import { enrollmentService } from '../../services';
import { EnrollmentDTO } from '../../types';

const Dashboard = () => {
    const [enrollments, setEnrollments] = useState<EnrollmentDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get student ID from current logged in user
                const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
                const studentId = currentUser.studentId || 1;
                const response = await enrollmentService.getByStudent(studentId);
                setEnrollments(response.data);
            } catch (err) {
                console.error('Error fetching enrollments:', err);
                setError('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Calculate GPA from enrollments
    const getStatus = (gpa: number) => {
        if (gpa >= 8) return 'Excellent';
        if (gpa >= 7) return 'Good';
        if (gpa >= 5.5) return 'Average';
        return 'At Risk';
    };

    // Calculate GPA ONLY from completed courses (with valid scores)
    const gradedEnrollments = enrollments.filter(e => e.finalScore !== null && e.finalScore !== undefined);

    // Total completed credits (for GPA calculation)
    const completedCredits = gradedEnrollments.reduce((sum, e) => sum + (e.credits || 0), 0);
    // Weighted sum of scores
    const totalPoints = gradedEnrollments.reduce((sum, e) => sum + ((e.finalScore || 0) * (e.credits || 0)), 0);

    const overallGpa = completedCredits === 0 ? 0 : totalPoints / completedCredits;


    const TOTAL_CREDITS = 120;
    const creditData = [
        { name: 'Completed', value: completedCredits },
        { name: 'Remaining', value: Math.max(TOTAL_CREDITS - completedCredits, 0) },
    ];

    const status = getStatus(overallGpa);

    if (loading) return <div className="text-center py-8">Loading...</div>;
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
                            : status === 'Good'
                                ? 'text-blue-600'
                                : status === 'Average'
                                    ? 'text-yellow-600'
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
                    <h3 className="font-semibold mb-4">Recent Enrollments</h3>
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
