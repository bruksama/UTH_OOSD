import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

/* ===== TYPES ===== */
interface Course {
    id: number;
    name: string;
    credits: number;
    score: number;
    year: number;     // 1 - 4
    semester: number; // 1 - 2
}

/* ===== HELPERS ===== */
const getStatus = (gpa: number) => {
    if (gpa >= 8) return 'Excellent';
    if (gpa >= 7) return 'Good';
    if (gpa >= 5.5) return 'Average';
    return 'At Risk';
};

const Dashboard = () => {
    /* ===== LOAD DATA FROM LOCALSTORAGE ===== */
    const courses: Course[] = JSON.parse(
        localStorage.getItem('courses') || '[]'
    );

    /* ===== GPA BY YEAR ===== */
    const yearMap: Record<
        number,
        { credits: number; points: number }
    > = {};

    courses.forEach(c => {
        if (!yearMap[c.year]) {
            yearMap[c.year] = { credits: 0, points: 0 };
        }
        yearMap[c.year].credits += c.credits;
        yearMap[c.year].points += c.score * c.credits;
    });

    const gpaByYear = Object.keys(yearMap).map(year => ({
        year: `Year ${year}`,
        gpa: +(
            yearMap[+year].points /
            yearMap[+year].credits
        ).toFixed(2),
    }));

    /* ===== OVERALL GPA ===== */
    const totalCredits = courses.reduce(
        (sum, c) => sum + c.credits,
        0
    );

    const totalPoints = courses.reduce(
        (sum, c) => sum + c.score * c.credits,
        0
    );

    const overallGpa =
        totalCredits === 0 ? 0 : totalPoints / totalCredits;

    /* ===== CREDIT PIE ===== */
    const TOTAL_CREDITS = 120;

    const creditData = [
        { name: 'Completed', value: totalCredits },
        {
            name: 'Remaining',
            value: Math.max(TOTAL_CREDITS - totalCredits, 0),
        },
    ];

    const status = getStatus(overallGpa);

    return (
        <div className="space-y-6">

            {/* ===== SUMMARY ===== */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card text-center">
                    <p className="text-gray-500">Overall GPA</p>
                    <p className="text-3xl font-bold">
                        {overallGpa.toFixed(2)}
                    </p>
                </div>

                <div className="card text-center">
                    <p className="text-gray-500">Credits Completed</p>
                    <p className="text-3xl font-bold">
                        {totalCredits}/{TOTAL_CREDITS}
                    </p>
                </div>

                <div className="card text-center">
                    <p className="text-gray-500">Academic Status</p>
                    <p
                        className={`text-xl font-semibold ${
                            status === 'Excellent'
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

            {/* ===== CHARTS ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* GPA BY YEAR */}
                <div className="card">
                    <h3 className="font-semibold mb-4">
                        GPA by Academic Year
                    </h3>

                    {gpaByYear.length === 0 ? (
                        <p className="text-gray-500 text-sm">
                            No data yet. Please enter courses.
                        </p>
                    ) : (
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={gpaByYear}>
                                    <XAxis dataKey="year" />
                                    <YAxis domain={[0, 10]} />
                                    <Tooltip />
                                    <Bar dataKey="gpa" fill="#3b82f6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* CREDIT PROGRESS */}
                <div className="card">
                    <h3 className="font-semibold mb-4">
                        Credit Progress
                    </h3>

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
                            <p className="text-2xl font-bold">
                                {totalCredits}/{TOTAL_CREDITS}
                            </p>
                            <p className="text-sm text-gray-500">
                                Credits Completed
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
