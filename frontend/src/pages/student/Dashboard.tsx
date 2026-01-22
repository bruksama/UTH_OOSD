import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

import {
    mockGpaTrend,
    mockAlerts,
    mockStudents,
    mockStudentCourses,
    getAlertLevelColor,
} from '../../data/mockData';

/* ===== STAT CARD ===== */
interface StatCardProps {
    title: string;
    value: string | number;
}

const StatCard = ({ title, value }: StatCardProps) => (
    <div className="card text-center">
        <p className="text-sm text-slate-500">{title}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
);

/* ===== HELPERS ===== */
const getLetterGrade = (score: number) => {
    if (score >= 8.5) return 'A';
    if (score >= 7.0) return 'B';
    if (score >= 5.5) return 'C';
    if (score >= 4.0) return 'D';
    return 'F';
};

const getCourseStatus = (score: number) =>
    score >= 4 ? 'Passed' : 'Failed';

const renderStudentStatus = (status: string) => {
    switch (status) {
        case 'ACTIVE':
            return 'Active';
        case 'PROBATION':
            return 'Probation';
        case 'SUSPENDED':
            return 'Suspended';
        default:
            return status;
    }
};

const Dashboard = () => {
    /* ===== CURRENT STUDENT ===== */
    const currentStudent = mockStudents[0];

    /* ===== COURSES ===== */
    const courses = mockStudentCourses;

    /* ===== GPA ===== */
    const totalCredits = courses.reduce(
        (sum, c) => sum + c.credits,
        0
    );

    const gpa =
        courses.reduce(
            (sum, c) => sum + c.score * c.credits,
            0
        ) / totalCredits;

    /* ===== COMPLETED CREDITS ===== */
    const completedCredits = courses
        .filter(c => c.score >= 4)
        .reduce((sum, c) => sum + c.credits, 0);

    const TOTAL_CREDITS = 120;

    const creditProgress = [
        { name: 'Completed', value: completedCredits },
        { name: 'Remaining', value: TOTAL_CREDITS - completedCredits },
    ];

    /* ===== ALERTS ===== */
    const myAlerts = mockAlerts.filter(
        a => String(a.studentId) === String(currentStudent.studentId)
    );

    return (
        <div className="space-y-6">

            {/* ===== SUMMARY ===== */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    title="Current GPA"
                    value={gpa.toFixed(2)}
                />
                <StatCard
                    title="Academic Status"
                    value={renderStudentStatus(currentStudent.status)}
                />
                <StatCard
                    title="Credits"
                    value={`${completedCredits}/${TOTAL_CREDITS}`}
                />
            </div>

            {/* ===== CHARTS ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* GPA TREND */}
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">
                        GPA Trend
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={mockGpaTrend}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="semester" />
                                <YAxis domain={[0, 10]} />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="gpa"
                                    stroke="#0ea5e9"
                                    strokeWidth={3}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* CREDIT PROGRESS */}
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">
                        Credit Progress
                    </h3>

                    <div className="h-64 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={creditProgress}
                                    dataKey="value"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={95}
                                    startAngle={90}
                                    endAngle={-270}
                                >
                                    <Cell fill="#22c55e" />
                                    <Cell fill="#e5e7eb" />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>

                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <p className="text-2xl font-bold">
                                {completedCredits}/{TOTAL_CREDITS}
                            </p>
                            <p className="text-sm text-slate-500">
                                Credits Completed
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== COURSE TABLE (FIX WARNING) ===== */}
            <div className="card">
                <h3 className="text-lg font-semibold mb-4">
                    My Courses
                </h3>

                <table className="w-full text-sm">
                    <thead>
                    <tr className="text-left text-slate-500">
                        <th>Môn</th>
                        <th>Điểm</th>
                        <th>Loại</th>
                        <th>Trạng thái</th>
                    </tr>
                    </thead>
                    <tbody>
                    {courses.map(course => (
                        <tr key={course.id} className="border-t">
                            <td>{course.name}</td>
                            <td>{course.score}</td>
                            <td>{getLetterGrade(course.score)}</td>
                            <td
                                className={
                                    course.score >= 4
                                        ? 'text-green-600'
                                        : 'text-red-500'
                                }
                            >
                                {getCourseStatus(course.score)}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* ===== ALERTS ===== */}
            <div className="card">
                <h3 className="text-lg font-semibold mb-4">
                    My Alerts
                </h3>

                {myAlerts.length === 0 && (
                    <p className="text-slate-500 text-sm">
                        No alerts 🎉
                    </p>
                )}

                {myAlerts.map(alert => (
                    <div
                        key={alert.id}
                        className="p-3 bg-slate-50 rounded-lg mb-2"
                    >
                        <span className={getAlertLevelColor(alert.level)}>
                            {alert.level}
                        </span>
                        <p className="mt-1 text-sm">
                            {alert.message}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
