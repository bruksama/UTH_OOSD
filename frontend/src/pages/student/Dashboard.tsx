import { useState, useEffect } from 'react';
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import { Link } from 'react-router-dom';
import { enrollmentService } from '../../services';
import { EnrollmentDTO } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { getAcademicClassification, getClassificationColor } from '../../utils/helpers';

const Dashboard = () => {
    const { user } = useAuth();
    const [enrollments, setEnrollments] = useState<EnrollmentDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get student ID from auth context (priority) or localStorage (fallback)
                let studentId = user?.studentId;
                if (!studentId) {
                    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
                    studentId = currentUser.studentId;
                }

                if (studentId) {
                    const response = await enrollmentService.getByStudent(studentId);
                    setEnrollments(response.data);
                } else {
                    setEnrollments([]);
                }
            } catch (err) {
                console.error('Error fetching enrollments:', err);
                // Don't show error for new students, just empty state
                setEnrollments([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    // Calculate GPA ONLY from completed courses (with valid scores)
    const gradedEnrollments = enrollments.filter(e => e.finalScore !== null && e.finalScore !== undefined);

    // Total completed credits (for GPA calculation)
    const completedCredits = gradedEnrollments.reduce((sum, e) => sum + (e.credits || 0), 0);
    // Weighted sum using gpaValue provided by Backend
    const totalPoints = gradedEnrollments.reduce((sum, e) => sum + ((e.gpaValue || 0) * (e.credits || 0)), 0);

    const overallGpa = completedCredits === 0 ? 0 : totalPoints / completedCredits;
    const TOTAL_CREDITS = 120;
    const progressPercent = Math.min((completedCredits / TOTAL_CREDITS) * 100, 100);

    const creditData = [
        { name: 'Completed', value: completedCredits },
        { name: 'Remaining', value: Math.max(TOTAL_CREDITS - completedCredits, 0) },
    ];

    const statusInfo = getAcademicClassification(overallGpa, completedCredits);
    const classificationColor = getClassificationColor(statusInfo);

    if (loading) return <div className="text-center py-8">Loading...</div>;
    // Error not shown to user to keep UI clean, fallback to empty state was handled.
    if (error) return <div className="text-red-500 py-8">{error}</div>;

    return (
        <div className="space-y-6 lg:space-y-8">
            {/* WELCOME HEADER (Optional but good for UX) */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2rem] p-6 lg:p-10 text-white shadow-2xl shadow-indigo-200">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <svg className="w-48 h-48 lg:w-64 lg:h-64" fill="currentColor" viewBox="0 0 200 200">
                        <path d="M45,-75C58.3,-69.3,69.1,-58.3,77.2,-46C85.3,-33.7,90.7,-20.1,89.6,-7.1C88.5,5.9,80.9,18.3,71.5,28.8C62.1,39.3,50.8,47.9,39.2,54.8C27.6,61.7,15.6,66.9,2.8,62.1C-10,57.3,-23.6,42.5,-35.1,30.3C-46.6,18.1,-56,8.5,-59.6,-3.4C-63.2,-15.3,-61,-29.5,-52.7,-40.4C-44.4,-51.3,-30,-58.9,-16.2,-64.1C-2.4,-69.3,10.8,-72,24.5,-73.4C38.2,-74.8,52.4,-74.9,45,-75Z" transform="translate(100 100)" />
                    </svg>
                </div>
                <div className="relative z-10">
                    <h1 className="text-2xl lg:text-4xl font-black mb-2 tracking-tight">Welcome back, {user?.displayName || 'Student'}! 👋</h1>
                    <p className="text-indigo-100 text-sm lg:text-lg font-medium opacity-90 max-w-xl">
                        You've completed {progressPercent.toFixed(0)}% of your degree. Keep up the great work!
                    </p>
                </div>
            </div>

            {/* ALERTS */}
            {(() => {
                if (completedCredits > 0) {
                    if (overallGpa < 1.0) {
                        return (
                            <div className="bg-red-50 border-2 border-red-100 p-5 rounded-3xl shadow-sm flex items-start gap-4 animate-pulse">
                                <div className="p-3 bg-red-500 rounded-2xl text-white shadow-lg shadow-red-200">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-red-800 uppercase tracking-widest">Immediate Academic Risk</h3>
                                    <p className="text-xs lg:text-sm text-red-700 mt-1 font-bold">
                                        GPA: {overallGpa.toFixed(2)}. Critical warning level. Please contact faculty administration immediately.
                                    </p>
                                </div>
                            </div>
                        );
                    } else if (overallGpa < 2.0) {
                        return (
                            <div className="bg-amber-50 border-2 border-amber-100 p-5 rounded-3xl shadow-sm flex items-start gap-4">
                                <div className="p-3 bg-amber-500 rounded-2xl text-white shadow-lg shadow-amber-200">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-amber-800 uppercase tracking-widest">Academic Probation</h3>
                                    <p className="text-xs lg:text-sm text-amber-700 mt-1 font-bold">
                                        GPA: {overallGpa.toFixed(2)}. You are currently on probation. Aim for better results this term!
                                    </p>
                                </div>
                            </div>
                        );
                    }
                }
                return null;
            })()}

            {/* SUMMARY STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                <div className="bg-white p-6 lg:p-8 rounded-[2rem] shadow-sm border border-slate-100 group hover:shadow-xl hover:shadow-indigo-50 transition-all duration-300">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 group-hover:text-indigo-500 transition-colors">Cumulative GPA</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl lg:text-5xl font-black text-slate-800 tracking-tighter">{overallGpa.toFixed(2)}</span>
                        <span className="text-sm font-bold text-slate-400">/ 4.0</span>
                    </div>
                </div>

                <div className="bg-white p-6 lg:p-8 rounded-[2rem] shadow-sm border border-slate-100 group hover:shadow-xl hover:shadow-emerald-50 transition-all duration-300">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 group-hover:text-emerald-500 transition-colors">Credits Earned</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl lg:text-5xl font-black text-slate-800 tracking-tighter">{completedCredits}</span>
                        <span className="text-sm font-bold text-slate-400">/ {TOTAL_CREDITS}</span>
                    </div>
                </div>

                <div className="sm:col-span-2 lg:col-span-1 bg-white p-6 lg:p-8 rounded-[2rem] shadow-sm border border-slate-100 group hover:shadow-xl transition-all duration-300">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 group-hover:text-indigo-500 transition-colors">Academic Standing</p>
                    <span className={`inline-block px-5 py-2 rounded-2xl text-xs lg:text-sm font-black uppercase tracking-widest shadow-sm ${classificationColor.replace('badge ', '')}`}>
                        {statusInfo}
                    </span>
                </div>
            </div>

            {/* LOWER GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* PROGRESS CHART */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                        </div>
                        <h3 className="text-lg font-black text-slate-800">Degree Progress</h3>
                    </div>

                    <div className="h-64 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={creditData}
                                    dataKey="value"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    stroke="none"
                                >
                                    <Cell fill="url(#colorGreen)" />
                                    <Cell fill="#f1f5f9" />
                                </Pie>
                                <defs>
                                    <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" />
                                        <stop offset="100%" stopColor="#059669" />
                                    </linearGradient>
                                </defs>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-4xl font-black text-slate-800 tracking-tighter">{progressPercent.toFixed(0)}%</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Complete</span>
                        </div>
                    </div>
                </div>

                {/* RECENT ENROLLMENTS */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col">
                    <div className="flex justify-between items-center mb-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 border border-indigo-100">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                            </div>
                            <h3 className="text-lg font-black text-slate-800">Latest Grades</h3>
                        </div>
                        <Link to="/student/grades" className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-xl transition-all">
                            Full Record
                        </Link>
                    </div>

                    <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                        {enrollments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                                <svg className="w-12 h-12 opacity-20 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                <p className="text-sm font-bold uppercase tracking-widest opacity-50">No courses yet</p>
                            </div>
                        ) : (
                            enrollments.slice(0, 5).map((e) => (
                                <div key={e.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-white transition-all group">
                                    <div className="min-w-0">
                                        <p className="text-xs font-black text-slate-700 truncate group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{e.courseName}</p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">{e.semester} {e.academicYear}</p>
                                    </div>
                                    <div className={`px-3 py-1 rounded-xl text-xs font-black min-w-[40px] text-center border shadow-sm ${e.finalScore !== null ? 'bg-white text-slate-700 border-slate-100' : 'bg-slate-100 text-slate-400 border-transparent'}`}>
                                        {e.finalScore ?? '--'}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
