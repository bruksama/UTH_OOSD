import { useState, useEffect } from 'react';
import { studentService, enrollmentService } from '../../services';
import { StudentDTO, EnrollmentDTO } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { getAcademicClassification, getClassificationColor } from '../../utils/helpers';

const StudentProfile = () => {
    const { user, updateUser } = useAuth();
    const [student, setStudent] = useState<StudentDTO | null>(null);
    const [enrollments, setEnrollments] = useState<EnrollmentDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<StudentDTO>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Get Current Student ID
            let studentId = user?.studentId;
            if (!studentId) {
                const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
                studentId = currentUser.studentId;
            }

            if (studentId) {
                // Fetch Profile
                const profileRes = await studentService.getById(studentId);
                setStudent(profileRes.data);
                setFormData(profileRes.data);

                // Fetch Enrollments for Stats
                const enrollmentsRes = await enrollmentService.getByStudent(studentId);
                setEnrollments(enrollmentsRes.data);
            }
        } catch (err) {
            console.error('Error loading profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!student?.id) return;
        setSaving(true);
        try {
            const updatedData = { ...student, ...formData };
            await studentService.update(student.id, updatedData);

            // Sync with Auth Context to update Header "Welcome back" name immediately
            if (updateUser && (updatedData.firstName || updatedData.lastName)) {
                updateUser({ displayName: `${updatedData.firstName} ${updatedData.lastName}` });
            }

            setIsEditing(false);
            await loadData(); // Refresh data
            alert('Profile updated successfully!');
        } catch (err) {
            console.error('Error updating profile:', err);
            alert('Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-center py-10">Loading profile...</div>;
    if (!student) return <div className="text-center py-10 text-red-500">Student not found</div>;

    // Calculate Academic Stats
    const gradedEnrollments = enrollments.filter(e => e.finalScore !== null);
    const totalCredits = gradedEnrollments.reduce((sum, e) => sum + (e.credits || 0), 0);

    // Calculate GPA Scale 4 dynamically (using values from Backend)
    const weightedSum = gradedEnrollments.reduce((sum, e) => sum + ((e.gpaValue || 0) * (e.credits || 0)), 0);
    // Use calculated GPA from current list for consistency, fallback to stored GPA
    const gpa = totalCredits > 0 ? (weightedSum / totalCredits) : (student.gpa || 0);

    // Calculate academic year progress (Example: 72/120 credits)
    const MAX_CREDITS = 120;
    const progressPercent = Math.min((totalCredits / MAX_CREDITS) * 100, 100);

    return (
        <div className="space-y-6">
            {/* HEADER CARD */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
                {/* Background Pattern Decoration */}
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <svg className="w-64 h-64 text-primary-600" fill="currentColor" viewBox="0 0 200 200">
                        <path d="M45,-75C58.3,-69.3,69.1,-58.3,77.2,-46C85.3,-33.7,90.7,-20.1,89.6,-7.1C88.5,5.9,80.9,18.3,71.5,28.8C62.1,39.3,50.8,47.9,39.2,54.8C27.6,61.7,15.6,66.9,2.8,62.1C-10,57.3,-23.6,42.5,-35.1,30.3C-46.6,18.1,-56,8.5,-59.6,-3.4C-63.2,-15.3,-61,-29.5,-52.7,-40.4C-44.4,-51.3,-30,-58.9,-16.2,-64.1C-2.4,-69.3,10.8,-72,24.5,-73.4C38.2,-74.8,52.4,-74.9,45,-75Z" transform="translate(100 100)" />
                    </svg>
                </div>

                {/* Avatar */}
                <div className="relative">
                    <div className="w-32 h-32 rounded-2xl bg-indigo-100 flex items-center justify-center text-4xl border-4 border-white shadow-lg overflow-hidden">
                        {/* Placeholder Avatar Image or Initial */}
                        <img
                            src={`https://ui-avatars.com/api/?name=${student.firstName}+${student.lastName}&background=6366f1&color=fff&size=256&font-size=0.33`}
                            alt="Student Avatar"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {/* Classification Badge - Dynamic based on GPA and Credits */}
                    <div className={`absolute bottom-2 right-[-8px] px-3 py-1 rounded-full text-xs font-bold border-2 border-white shadow-sm ${getClassificationColor(getAcademicClassification(gpa, totalCredits)).replace('badge ', '')}`}>
                        {getAcademicClassification(gpa, totalCredits)}
                    </div>
                </div>

                {/* Main Info */}
                <div className="flex-1 text-center md:text-left z-10">
                    <h1 className="text-3xl font-bold text-slate-900">{student.firstName} {student.lastName}</h1>
                    <p className="text-slate-500 font-medium mt-1">Student ID: <span className="text-slate-800 font-mono bg-slate-100 px-2 py-0.5 rounded">{student.studentId}</span></p>
                    <p className="text-primary-600 font-medium mt-1">Computer Science & Engineering</p>

                    <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-sm rounded-lg flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            Enrolled: {student.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString() : 'N/A'}
                        </span>
                    </div>
                </div>

                {/* Edit Button */}
                <div className="self-center md:self-start z-10">
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="btn-primary flex items-center gap-2 px-6 shadow-lg shadow-primary-200"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            Edit Profile
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={() => { setIsEditing(false); setFormData(student); }}
                                className="px-4 py-2 border border-slate-300 rounded-xl hover:bg-slate-50 font-medium text-slate-700"
                                disabled={saving}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium shadow-md flex items-center gap-2"
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* CONTENT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT COL: PERSONAL INFO */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0c0 .884-.716 1.6-1.6 2.4c-.655.59-1.4 1-2.4 1H5m5-4.4v4.4" /></svg>
                            Personal Details
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Inputs */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName || ''}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className={`w-full p-3 rounded-xl border ${isEditing ? 'border-primary-300 bg-white ring-2 ring-primary-100' : 'border-slate-200 bg-slate-50 text-slate-600'} transition-all outline-none`}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName || ''}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className={`w-full p-3 rounded-xl border ${isEditing ? 'border-primary-300 bg-white ring-2 ring-primary-100' : 'border-slate-200 bg-slate-50 text-slate-600'} transition-all outline-none`}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email || ''}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className={`w-full p-3 rounded-xl border ${isEditing ? 'border-primary-300 bg-white ring-2 ring-primary-100' : 'border-slate-200 bg-slate-50 text-slate-600'} transition-all outline-none`}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Date of Birth</label>
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : ''}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className={`w-full p-3 rounded-xl border ${isEditing ? 'border-primary-300 bg-white ring-2 ring-primary-100' : 'border-slate-200 bg-slate-50 text-slate-600'} transition-all outline-none`}
                                />
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100">
                            <h3 className="text-sm font-bold text-slate-900 mb-4">Residential Address</h3>
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-600">
                                <p>123 University Way, Campus View Residence, Hall A-402</p>
                                <p className="text-xs text-slate-400 mt-1 italic">(Address updates are handled by the Administration Office)</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COL: ACADEMIC STATS */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                            Academic Overview
                        </h2>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="p-4 bg-slate-50 rounded-xl text-center">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Current Semester</p>
                                <p className="text-2xl font-bold text-blue-600 mt-1">
                                    {(() => {
                                        if (!student.enrollmentDate) return '1st';
                                        const start = new Date(student.enrollmentDate);
                                        const now = new Date();
                                        const yearsDiff = now.getFullYear() - start.getFullYear();
                                        const monthsDiff = now.getMonth() - start.getMonth();
                                        const totalMonths = (yearsDiff * 12) + monthsDiff;
                                        const sem = Math.max(1, Math.floor(totalMonths / 6) + 1);
                                        // Ordinal suffix
                                        const s = ["th", "st", "nd", "rd"];
                                        const v = sem % 100;
                                        return sem + (s[(v - 20) % 10] || s[v] || s[0]);
                                    })()}
                                </p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl text-center">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Cumulative GPA</p>
                                <p className="text-3xl font-bold text-slate-900 mt-1">{gpa.toFixed(2)}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm font-medium">
                                <span className="text-slate-600">Total Credits Earned</span>
                                <span className="text-slate-900">{totalCredits} / {MAX_CREDITS}</span>
                            </div>
                            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${progressPercent}%` }}
                                ></div>
                            </div>
                            <p className="text-right text-xs text-blue-600 font-bold">{progressPercent.toFixed(0)}% Completed</p>
                        </div>

                        <div className="mt-6 p-4 border border-green-200 bg-green-50 rounded-xl flex items-start gap-3">
                            <div className="mt-0.5 min-w-[20px]">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-green-800">Degree Requirement Progress</p>
                                <p className="text-xs text-green-700 mt-1">You are on track to graduate on time.</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default StudentProfile;
