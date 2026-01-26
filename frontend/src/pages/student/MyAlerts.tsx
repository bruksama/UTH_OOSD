interface Course {
    id: number;
    name: string;
    credits: number;
    score: number;
}

const MyAlerts = () => {
    const courses: Course[] = (() => {
        try {
            return JSON.parse(localStorage.getItem('courses') || '[]');
        } catch {
            return [];
        }
    })();

    const totalCredits = courses.reduce(
        (sum, c) => sum + c.credits,
        0
    );

    const totalScore = courses.reduce(
        (sum, c) => sum + c.score * c.credits,
        0
    );

    const gpa =
        totalCredits === 0 ? 0 : totalScore / totalCredits;

    /* ===== ALERT LOGIC (FIX) ===== */
    const alerts: { text: string; className: string }[] = [];

    if (gpa < 5) {
        alerts.push({
            text: `⚠️ At risk: you need ${(5 - gpa).toFixed(
                2
            )} more GPA to reach Average.`,
            className: 'bg-red-50 text-red-700',
        });
    } else if (gpa < 6.5) {
        alerts.push({
            text: `📈 To reach Good, you need ${(6.5 - gpa).toFixed(
                2
            )} more GPA.`,
            className: 'bg-yellow-50 text-yellow-800',
        });
    } else if (gpa < 8) {
        alerts.push({
            text: `🏆 To reach Excellent, you need ${(8 - gpa).toFixed(
                2
            )} more GPA.`,
            className: 'bg-blue-50 text-blue-800',
        });
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">My Alerts</h2>

            {alerts.length === 0 ? (
                <div className="card bg-green-50 text-green-700 font-medium">
                    🎉 Excellent performance! Keep it up!
                </div>
            ) : (
                <div className="space-y-3">
                    {alerts.map((alert, index) => (
                        <div
                            key={index}
                            className={`card ${alert.className}`}
                        >
                            {alert.text}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyAlerts;
