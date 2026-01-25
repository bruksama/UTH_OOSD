interface Course {
    id: number;
    name: string;
    credits: number;
    score: number;
}

const MyAlerts = () => {
    const courses: Course[] = JSON.parse(
        localStorage.getItem('courses') || '[]'
    );

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

    /* ===== ALERT LOGIC ===== */
    const alerts: string[] = [];

    if (gpa < 5) {
        alerts.push(
            `⚠️ At risk: you need ${(5 - gpa).toFixed(
                2
            )} more GPA to reach Average.`
        );
    }

    if (gpa < 6.5) {
        alerts.push(
            `📈 To reach Good, you need ${(6.5 - gpa).toFixed(
                2
            )} more GPA.`
        );
    }

    if (gpa < 8) {
        alerts.push(
            `🏆 To reach Excellent, you need ${(8 - gpa).toFixed(
                2
            )} more GPA.`
        );
    }
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">My Alerts</h2>

            {alerts.length === 0 ? (
                <div className="card text-green-600 font-medium">
                    🎉 Excellent performance! Keep it up!
                </div>
            ) : (
                <div className="space-y-3">
                    {alerts.map((alert, index) => (
                        <div
                            key={index}
                            className="card bg-yellow-50 text-yellow-800"
                        >
                            {alert}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyAlerts;
