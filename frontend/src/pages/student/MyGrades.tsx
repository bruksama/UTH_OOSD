import {
    mockStudentCourses,
} from '../../data/mockData';

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

const MyGrades = () => {
    const courses = mockStudentCourses;

    return (
        <div className="space-y-6">

            {/* ===== COURSE RESULTS ===== */}
            <div className="card">
                <h3 className="text-lg font-semibold mb-4">
                    Course Results
                </h3>

                <table className="w-full text-sm">
                    <thead>
                    <tr className="border-b text-slate-600">
                        <th className="text-left py-2">Course</th>
                        <th>Credits</th>
                        <th>Score</th>
                        <th>Grade</th>
                        <th>Status</th>
                    </tr>
                    </thead>

                    <tbody>
                    {courses.map(course => (
                        <tr key={course.id} className="border-b">
                            <td className="py-2">{course.name}</td>
                            <td className="text-center">{course.credits}</td>
                            <td className="text-center">{course.score}</td>
                            <td className="text-center font-semibold">
                                {getLetterGrade(course.score)}
                            </td>
                            <td
                                className={`text-center font-medium ${
                                    course.score >= 4
                                        ? 'text-green-600'
                                        : 'text-red-500'
                                }`}
                            >
                                {getCourseStatus(course.score)}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MyGrades;
