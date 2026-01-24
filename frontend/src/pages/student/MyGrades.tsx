import { useEffect, useState } from 'react';

interface Course {
    id: number;
    name: string;
    credits: number;
    score: number;
    year: number;
    semester: number;
}

const MyGrades = () => {
    const [courses, setCourses] = useState<Course[]>(() => {
        return JSON.parse(localStorage.getItem('courses') || '[]');
    });

    const [name, setName] = useState('');
    const [credits, setCredits] = useState('');
    const [score, setScore] = useState('');
    const [year, setYear] = useState(1);
    const [semester, setSemester] = useState(1);

    useEffect(() => {
        localStorage.setItem('courses', JSON.stringify(courses));
    }, [courses]);

    const addCourse = () => {
        if (!name || !credits || !score) return;

        setCourses([
            ...courses,
            {
                id: Date.now(),
                name,
                credits: +credits,
                score: +score,
                year,
                semester,
            },
        ]);

        setName('');
        setCredits('');
        setScore('');
    };

    const deleteCourse = (id: number) => {
        setCourses(courses.filter(c => c.id !== id));
    };

    return (
        <div className="space-y-6">

            {/* INPUT */}
            <div className="card">
                <h3 className="font-semibold mb-3">Add Course</h3>

                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                    <input className="input" placeholder="Course"
                           value={name} onChange={e => setName(e.target.value)} />

                    <input className="input" type="number" placeholder="Credits"
                           value={credits} onChange={e => setCredits(e.target.value)} />

                    <input className="input" type="number" step="0.1" placeholder="Score"
                           value={score} onChange={e => setScore(e.target.value)} />

                    <select className="input" value={year}
                            onChange={e => setYear(+e.target.value)}>
                        <option value={1}>Year 1</option>
                        <option value={2}>Year 2</option>
                        <option value={3}>Year 3</option>
                        <option value={4}>Year 4</option>
                    </select>

                    <select className="input" value={semester}
                            onChange={e => setSemester(+e.target.value)}>
                        <option value={1}>Semester 1</option>
                        <option value={2}>Semester 2</option>
                    </select>

                    <button onClick={addCourse}
                            className="bg-blue-600 text-white rounded">
                        Add
                    </button>
                </div>
            </div>

            {/* TABLE */}
            <div className="card">
                <h3 className="font-semibold mb-3">My Courses</h3>

                {courses.length === 0 ? (
                    <p className="text-gray-500">No courses yet</p>
                ) : (
                    <table className="w-full">
                        <thead>
                        <tr className="border-b">
                            <th>Course</th>
                            <th>Credits</th>
                            <th>Score</th>
                            <th>Year</th>
                            <th>Sem</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {courses.map(c => (
                            <tr key={c.id} className="border-b">
                                <td>{c.name}</td>
                                <td className="text-center">{c.credits}</td>
                                <td className="text-center">{c.score}</td>
                                <td className="text-center">{c.year}</td>
                                <td className="text-center">{c.semester}</td>
                                <td>
                                    <button
                                        onClick={() => deleteCourse(c.id)}
                                        className="text-red-500">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default MyGrades;
