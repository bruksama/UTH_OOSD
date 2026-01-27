import { useEffect, useState } from 'react';
import { enrollmentService } from '../../services';
import { EnrollmentDTO } from '../../types';

const MyGrades = () => {
    const [enrollments, setEnrollments] = useState<EnrollmentDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchGrades = async () => {
            try {
                // Get student ID from current logged in user
                const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
                const studentId = currentUser.studentId || 1;
                const response = await enrollmentService.getByStudent(studentId);
                setEnrollments(response.data);
            } catch (err) {
                console.error('Error fetching grades:', err);
                setError('Failed to load grades');
            } finally {
                setLoading(false);
            }
        };
        fetchGrades();
    }, []);

    const handleWithdraw = async (enrollmentId: number) => {
        try {
            await enrollmentService.withdraw(enrollmentId);
            setEnrollments(enrollments.filter(e => e.id !== enrollmentId));
        } catch (err) {
            console.error('Error withdrawing enrollment:', err);
        }
    };

    if (loading) return <div className="text-center py-8">Loading...</div>;
    if (error) return <div className="text-red-500 py-8">{error}</div>;

    const completedEnrollments = enrollments.filter(e => e.finalScore);
    const currentEnrollments = enrollments.filter(e => !e.finalScore && e.status === 'IN_PROGRESS');

    return (
        <div className="space-y-6">
            {/* COMPLETED COURSES */}
            <div className="card">
                <h3 className="font-semibold mb-3">Completed Courses</h3>

                {completedEnrollments.length === 0 ? (
                    <p className="text-gray-500">No completed courses yet</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2">Course</th>
                                    <th className="text-center">Credits</th>
                                    <th className="text-center">Score</th>
                                    <th className="text-center">Grade</th>
                                </tr>
                            </thead>
                            <tbody>
                                {completedEnrollments.map((e) => (
                                    <tr key={e.id} className="border-b hover:bg-gray-50">
                                        <td className="py-2">{e.courseName}</td>
                                        <td className="text-center">{e.credits}</td>
                                        <td className="text-center">{e.finalScore?.toFixed(2)}</td>
                                        <td className="text-center font-semibold">{e.letterGrade || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* CURRENT ENROLLMENTS */}
            <div className="card">
                <h3 className="font-semibold mb-3">Current Enrollments</h3>

                {currentEnrollments.length === 0 ? (
                    <p className="text-gray-500">No active enrollments</p>
                ) : (
                    <div className="space-y-3">
                        {currentEnrollments.map((e) => (
                            <div
                                key={e.id}
                                className="flex justify-between items-center border rounded p-3 hover:bg-gray-50"
                            >
                                <div>
                                    <p className="font-semibold">{e.courseName}</p>
                                    <p className="text-sm text-gray-600">{e.courseCode}</p>
                                </div>
                                <button
                                    onClick={() => handleWithdraw(e.id!)}
                                    className="text-red-500 hover:text-red-700 text-sm"
                                >
                                    Withdraw
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyGrades;
