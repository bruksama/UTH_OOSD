import { useEffect, useState } from 'react';
import { enrollmentService, courseOfferingService } from '../../services';
import { EnrollmentDTO, CourseOfferingDTO, EnrollmentStatus } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

const MyGrades = () => {
    const { user } = useAuth();
    const [enrollments, setEnrollments] = useState<EnrollmentDTO[]>([]);
    const [availableOfferings, setAvailableOfferings] = useState<CourseOfferingDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showGradeModal, setShowGradeModal] = useState(false);
    const [selectedOfferingId, setSelectedOfferingId] = useState<number | ''>('');
    const [selectedEnrollment, setSelectedEnrollment] = useState<EnrollmentDTO | null>(null);
    const [gradeInput, setGradeInput] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, [user?.studentId]);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Get student ID (try auth context first, then local storage fallback)
            let studentId = user?.studentId;
            if (!studentId) {
                const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
                studentId = currentUser.studentId;
            }

            // 1. Load available offerings (Active classes)
            try {
                // In a real app, you might want to filter by current semester
                const offeringsRes = await courseOfferingService.getAll();
                setAvailableOfferings(offeringsRes.data);
            } catch (err) {
                console.error('Error fetching offerings:', err);
                setAvailableOfferings([]);
            }

            // 2. Load student enrollments
            if (studentId) {
                const enrollmentsRes = await enrollmentService.getByStudent(studentId);
                setEnrollments(enrollmentsRes.data);
            } else {
                setEnrollments([]);
            }
        } catch (err) {
            console.error('Error loading data:', err);
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    // Calculate Stats
    const completedEnrollments = enrollments.filter(e => e.finalScore !== null && e.finalScore !== undefined);
    const totalCredits = enrollments.reduce((sum, e) => sum + (e.credits || 0), 0);

    // Calculate GPA based on completed courses
    const completedCredits = completedEnrollments.reduce((sum, e) => sum + (e.credits || 0), 0);
    const weightedSum = completedEnrollments.reduce((sum, e) => sum + ((e.finalScore || 0) * (e.credits || 0)), 0);
    const gpa = completedCredits > 0 ? (weightedSum / completedCredits) : 0;

    const enrolledCount = enrollments.length;

    // Valid offerings to enroll:
    // 1. Check if student is already enrolled in THIS offering (by ID)
    // 2. Check if student is already enrolled in this COURSE (by Course Code) to prevent taking same subject twice
    //    (Unless we want to allow re-taking failed courses, but for now let's hide active enrollments)

    // Get list of Course Codes currently enrolled (or completed)
    const enrolledCourseCodes = enrollments.map(e => e.courseCode);

    const validOfferings = availableOfferings.filter(o => {
        // Exclude if student already has an enrollment for this Course Code
        // (This covers both: same offering ID and different offering ID for same course)
        return !enrolledCourseCodes.includes(o.courseCode);
    });

    // --- ACTIONS ---

    const handleAddEnrollment = async () => {
        let studentId = user?.studentId;
        if (!studentId) {
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            studentId = currentUser.studentId;
        }

        if (!selectedOfferingId || !studentId) return;

        setSubmitting(true);
        try {
            await enrollmentService.create({
                studentId: studentId,
                courseOfferingId: Number(selectedOfferingId),
                status: EnrollmentStatus.IN_PROGRESS
            });
            setShowAddModal(false);
            setSelectedOfferingId('');
            await loadData();
        } catch (err) {
            console.error('Error adding enrollment:', err);
            alert('Failed to enroll. Course might be full or you are already enrolled.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateGrade = async () => {
        if (!selectedEnrollment?.id) return;

        // Replace comma with dot for validation
        const normalizedInput = gradeInput.replace(',', '.');
        const score = parseFloat(normalizedInput);

        if (isNaN(score) || score < 0 || score > 10) {
            alert('Grade must be a number between 0 and 10');
            return;
        }

        setSubmitting(true);
        try {
            await enrollmentService.completeWithStrategy(selectedEnrollment.id, score);
            setShowGradeModal(false);
            setSelectedEnrollment(null);
            setGradeInput('');
            await loadData();
        } catch (err: any) {
            console.error('Error updating grade:', err);
            // Show detailed error from backend if available
            const errorMsg = err.response?.text || err.response?.data?.message || err.message || 'Failed to update grade';
            alert(`Error: ${errorMsg}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleWithdraw = async (id: number) => {
        if (!confirm('Are you sure you want to withdraw from this course?')) return;
        try {
            await enrollmentService.withdraw(id);
            await loadData();
        } catch (err) {
            console.error('Error withdrawing:', err);
            alert('Failed to withdraw');
        }
    };

    const openGradeModal = (enrollment: EnrollmentDTO) => {
        setSelectedEnrollment(enrollment);
        setGradeInput(enrollment.finalScore?.toString() || '');
        setShowGradeModal(true);
    };

    if (loading) return <div className="text-center py-10"><div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Manage Enrollments & Grades</h1>
                    <p className="text-slate-500">View and manage your academic progress</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Enrollment
                </button>
            </div>

            {/* ERROR MSG */}
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
                    {error}
                </div>
            )}

            {/* STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Credits</p>
                        <p className="text-2xl font-bold text-slate-900">{totalCredits}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Current GPA (10.0)</p>
                        <p className="text-2xl font-bold text-slate-900">{gpa.toFixed(2)}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Enrolled Subjects</p>
                        <p className="text-2xl font-bold text-slate-900">{enrolledCount}</p>
                    </div>
                </div>
            </div>

            {/* ENROLLMENT TABLE */}
            <div className="card overflow-hidden p-0 bg-white border border-slate-200 shadow-sm rounded-xl">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-800">Course Enrollments</h3>
                    <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                        Fall Semester 2024
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500 font-semibold">
                            <tr>
                                <th className="px-6 py-4 text-left tracking-wider">Code</th>
                                <th className="px-6 py-4 text-left tracking-wider">Subject Name</th>
                                <th className="px-6 py-4 text-center tracking-wider">Credits</th>
                                <th className="px-6 py-4 text-center tracking-wider">Score</th>
                                <th className="px-6 py-4 text-center tracking-wider">Status</th>
                                <th className="px-6 py-4 text-center tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {enrollments.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                            <p>No enrollments found. Click "Add Enrollment" to start.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                enrollments.map((e) => (
                                    <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-sm font-medium text-slate-700">
                                            {e.courseCode}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                            {e.courseName}
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm text-slate-600">
                                            {e.credits}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {e.finalScore !== null ? (
                                                <div className="flex flex-col items-center">
                                                    <span className="text-lg font-bold text-slate-800">{e.finalScore}</span>
                                                    <span className={`text-xs px-1.5 rounded font-bold ${(e.finalScore || 0) >= 8.5 ? 'bg-green-100 text-green-700' :
                                                        (e.finalScore || 0) >= 7.0 ? 'bg-blue-100 text-blue-700' :
                                                            (e.finalScore || 0) >= 5.0 ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-red-100 text-red-700'
                                                        }`}>
                                                        {e.letterGrade}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 text-sm italic">--</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${e.finalScore ? 'bg-green-50 text-green-700 border-green-200' :
                                                e.status === 'WITHDRAWN' ? 'bg-red-50 text-red-700 border-red-200' :
                                                    'bg-amber-50 text-amber-700 border-amber-200'
                                                }`}>
                                                {e.finalScore ? 'Completed' : e.status === 'WITHDRAWN' ? 'Withdrawn' : 'In Progress'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => openGradeModal(e)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Edit Score"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                {!e.finalScore && e.status !== 'WITHDRAWN' && (
                                                    <button
                                                        onClick={() => handleWithdraw(e.id!)}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Withdraw"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ADD COURSE MODAL */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl transform transition-all">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-900">Enroll in a Course</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Select Course Offering</label>
                                <select
                                    className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                    value={selectedOfferingId}
                                    onChange={(e) => setSelectedOfferingId(e.target.value ? Number(e.target.value) : '')}
                                >
                                    <option value="">-- Choose a course offering --</option>
                                    {validOfferings.length > 0 ? (
                                        validOfferings.map((o) => (
                                            <option key={o.id} value={o.id}>
                                                {o.courseCode} - {o.courseName} ({o.semester} {o.academicYear})
                                            </option>
                                        ))
                                    ) : (
                                        <option value="" disabled>No available courses</option>
                                    )}
                                </select>
                            </div>

                            {validOfferings.length === 0 && (
                                <p className="text-amber-600 text-sm bg-amber-50 p-3 rounded-lg border border-amber-200">
                                    No courses available to enroll at the moment.
                                </p>
                            )}
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                className="flex-1 py-2.5 border border-slate-300 rounded-xl hover:bg-slate-50 font-medium text-slate-700 transition-colors"
                                onClick={() => setShowAddModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium shadow-lg shadow-primary-200 disabled:opacity-50 disabled:shadow-none transition-all"
                                onClick={handleAddEnrollment}
                                disabled={!selectedOfferingId || submitting}
                            >
                                {submitting ? 'Enrolling...' : 'Enroll Now'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT GRADE MODAL */}
            {showGradeModal && selectedEnrollment && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-900">Update Grade</h2>
                            <button onClick={() => setShowGradeModal(false)} className="text-slate-400 hover:text-slate-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <p className="font-bold text-slate-900">{selectedEnrollment.courseName}</p>
                                <p className="text-sm text-slate-500 mt-1">
                                    {selectedEnrollment.courseCode} • {selectedEnrollment.credits} credits
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Final Score (0 - 10)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="10"
                                    className="w-full border border-slate-300 rounded-xl p-3 text-lg font-bold text-center focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="8.5"
                                    value={gradeInput}
                                    onChange={(e) => setGradeInput(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                className="flex-1 py-2.5 border border-slate-300 rounded-xl hover:bg-slate-50 font-medium text-slate-700"
                                onClick={() => setShowGradeModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-lg shadow-blue-200 disabled:opacity-50"
                                onClick={handleUpdateGrade}
                                disabled={gradeInput === '' || submitting}
                            >
                                {submitting ? 'Saving...' : 'Save Grade'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyGrades;
