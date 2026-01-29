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
        <div className="space-y-4 lg:space-y-6">
            {/* HEADER CARD */}
            <div className="bg-white rounded-2xl lg:rounded-[2rem] shadow-sm border border-slate-100 p-4 lg:p-8 flex flex-col items-center md:flex-row md:items-start gap-6 lg:gap-10 relative overflow-hidden">
                {/* Background Pattern Decoration */}
                <div className="absolute -top-10 -right-10 opacity-[0.03] pointer-events-none">
                    <svg className="w-64 h-64 lg:w-96 lg:h-96 text-indigo-900" fill="currentColor" viewBox="0 0 200 200">
                        <path d="M45,-75C58.3,-69.3,69.1,-58.3,77.2,-46C85.3,-33.7,90.7,-20.1,89.6,-7.1C88.5,5.9,80.9,18.3,71.5,28.8C62.1,39.3,50.8,47.9,39.2,54.8C27.6,61.7,15.6,66.9,2.8,62.1C-10,57.3,-23.6,42.5,-35.1,30.3C-46.6,18.1,-56,8.5,-59.6,-3.4C-63.2,-15.3,-61,-29.5,-52.7,-40.4C-44.4,-51.3,-30,-58.9,-16.2,-64.1C-2.4,-69.3,10.8,-72,24.5,-73.4C38.2,-74.8,52.4,-74.9,45,-75Z" transform="translate(100 100)" />
                    </svg>
                </div>

                {/* Avatar */}
                <div className="relative shrink-0">
                    <div className="w-24 h-24 lg:w-40 lg:h-40 rounded-2xl lg:rounded-[2.5rem] bg-indigo-50 flex items-center justify-center border-4 border-white shadow-xl overflow-hidden ring-1 ring-indigo-50">
                        <img
                            src={`https://ui-avatars.com/api/?name=${student.firstName}+${student.lastName}&background=6366f1&color=fff&size=256&font-size=0.33`}
                            alt="Student Avatar"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {/* Classification Badge */}
                    <div className={`absolute -bottom-2 -right-2 px-3 py-1.5 rounded-xl lg:rounded-2xl text-[10px] lg:text-xs font-black uppercase tracking-widest border-2 border-white shadow-lg ${getClassificationColor(getAcademicClassification(gpa, totalCredits)).replace('badge ', '')}`}>
                        {getAcademicClassification(gpa, totalCredits)}
                    </div>
                </div>

                {/* Main Info */}
                <div className="flex-1 text-center md:text-left z-10 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-baseline gap-2 mb-2 lg:mb-3">
                        <h1 className="text-2xl lg:text-4xl font-black text-slate-800 tracking-tight truncate">{student.firstName} {student.lastName}</h1>
                        <span className="text-[10px] lg:text-sm font-bold text-indigo-500 uppercase tracking-[0.2em] font-mono">#{student.studentId}</span>
                    </div>

                    <p className="text-sm lg:text-lg text-slate-500 font-bold mb-4">Computer Science & Engineering</p>

                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                        <div className="px-3 py-1.5 lg:px-4 lg:py-2 bg-slate-50 text-slate-600 text-[10px] lg:text-xs font-black uppercase tracking-widest rounded-xl flex items-center gap-2 border border-slate-100">
                            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            Joined: {student.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString() : 'N/A'}
                        </div>
                    </div>
                </div>

                {/* Edit Button */}
                <div className="w-full md:w-auto z-10">
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="w-full md:w-auto btn-primary flex items-center justify-center gap-2 px-6 lg:px-8 py-3 lg:py-4 shadow-xl shadow-indigo-100 rounded-2xl"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            <span className="text-[10px] lg:text-xs font-black uppercase tracking-widest">Edit Profile</span>
                        </button>
                    ) : (
                        <div className="flex flex-col sm:flex-row gap-2">
                            <button
                                onClick={() => { setIsEditing(false); setFormData(student); }}
                                className="w-full sm:w-auto px-6 py-3 border-2 border-slate-100 rounded-2xl hover:bg-slate-50 font-black text-[10px] uppercase tracking-widest text-slate-500 transition-all"
                                disabled={saving}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 transition-all"
                                disabled={saving}
                            >
                                {saving ? 'Writing...' : 'Save Profile'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* CONTENT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT COL: PERSONAL INFO */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 lg:p-8">
                        <div className="flex items-center gap-3 mb-8 lg:mb-10">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 border border-indigo-100">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            </div>
                            <h2 className="text-lg lg:text-xl font-black text-slate-800">Personal Account Details</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 group-focus-within:text-indigo-500 transition-colors">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName || ''}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className={`w-full p-3 lg:p-4 rounded-xl lg:rounded-2xl border-2 ${isEditing ? 'border-indigo-100 bg-white ring-4 ring-indigo-500/5 focus:border-indigo-500' : 'border-slate-50 bg-slate-50/50 text-slate-600'} transition-all outline-none font-bold text-sm`}
                                />
                            </div>

                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 group-focus-within:text-indigo-500 transition-colors">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName || ''}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className={`w-full p-3 lg:p-4 rounded-xl lg:rounded-2xl border-2 ${isEditing ? 'border-indigo-100 bg-white ring-4 ring-indigo-500/5 focus:border-indigo-500' : 'border-slate-50 bg-slate-50/50 text-slate-600'} transition-all outline-none font-bold text-sm`}
                                />
                            </div>

                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 group-focus-within:text-indigo-500 transition-colors">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email || ''}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className={`w-full p-3 lg:p-4 rounded-xl lg:rounded-2xl border-2 ${isEditing ? 'border-indigo-100 bg-white ring-4 ring-indigo-500/5 focus:border-indigo-500' : 'border-slate-50 bg-slate-50/50 text-slate-600'} transition-all outline-none font-bold text-sm`}
                                />
                            </div>

                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 group-focus-within:text-indigo-500 transition-colors">Date of Birth</label>
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : ''}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className={`w-full p-3 lg:p-4 rounded-xl lg:rounded-2xl border-2 ${isEditing ? 'border-indigo-100 bg-white ring-4 ring-indigo-500/5 focus:border-indigo-500' : 'border-slate-50 bg-slate-50/50 text-slate-600'} transition-all outline-none font-bold text-sm`}
                                />
                            </div>
                        </div>

                        <div className="mt-10 lg:mt-12 pt-8 lg:pt-10 border-t-2 border-slate-50">
                            <div className="flex items-center gap-3 mb-4 lg:mb-6">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </div>
                                <h3 className="text-sm lg:text-base font-black text-slate-800 uppercase tracking-wider">Residential Campus Address</h3>
                            </div>
                            <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-100">
                                <p className="text-sm font-bold text-slate-700 leading-relaxed">123 University Way, Campus View Residence, Hall A-402, Ho Chi Minh City, VN</p>
                                <div className="mt-3 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest italic bg-white w-fit px-3 py-1 rounded-lg border border-slate-100 shadow-sm">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                    Updates locked by administration
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COL: ACADEMIC STATS */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 lg:p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/30 rounded-full blur-3xl -mr-10 -mt-10"></div>

                        <div className="flex items-center gap-3 mb-8 lg:mb-10 relative">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 border border-blue-100">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                            </div>
                            <h2 className="text-lg lg:text-xl font-black text-slate-800">Academic Overview</h2>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 mb-8">
                            <div className="p-4 lg:p-6 bg-slate-50/50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-md group">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 group-hover:text-indigo-500 transition-colors">Current Term</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl lg:text-3xl font-black text-slate-800">
                                        {(() => {
                                            if (!student.enrollmentDate) return '1st';
                                            const start = new Date(student.enrollmentDate);
                                            const now = new Date();
                                            const sem = Math.max(1, Math.floor(((now.getFullYear() - start.getFullYear()) * 12 + now.getMonth() - start.getMonth()) / 6) + 1);
                                            const s = ["th", "st", "nd", "rd"], v = sem % 100;
                                            return sem + (s[(v - 20) % 10] || s[v] || s[0]);
                                        })()}
                                    </span>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Semester</span>
                                </div>
                            </div>

                            <div className="p-4 lg:p-6 bg-slate-50/50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-md group">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 group-hover:text-emerald-500 transition-colors">Cumulative GPA</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl lg:text-5xl font-black text-slate-800">{gpa.toFixed(2)}</span>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">/ 4.0</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 mb-8">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                <span className="text-slate-400">Course Progress</span>
                                <span className="text-slate-800">{totalCredits} / {MAX_CREDITS} CR</span>
                            </div>
                            <div className="h-2.5 w-full bg-slate-50 rounded-full p-0.5 border border-slate-100">
                                <div
                                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(99,102,241,0.3)]"
                                    style={{ width: `${progressPercent}%` }}
                                ></div>
                            </div>
                            <p className="text-right text-[10px] text-indigo-500 font-black uppercase tracking-widest">{progressPercent.toFixed(0)}% to graduation</p>
                        </div>

                        <div className="p-5 bg-gradient-to-br from-emerald-50/50 to-blue-50/50 rounded-2xl border border-emerald-100 flex items-start gap-3">
                            <div className="mt-1">
                                <div className="p-1.5 bg-emerald-500 rounded-lg text-white">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs lg:text-sm font-black text-slate-800 uppercase tracking-wide">Academic Progress</p>
                                <p className="text-[10px] lg:text-xs text-slate-500 font-bold mt-1 leading-relaxed">You are currently performing above average requirements.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentProfile;
