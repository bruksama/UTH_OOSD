import { useEffect, useState } from 'react';
import { enrollmentService, courseOfferingService, gradeEntryService } from '../../services';
import { EnrollmentDTO, CourseOfferingDTO, EnrollmentStatus, GradeEntryDTO, GradeEntryType } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { getEnrollmentStatusDisplay, getLetterGradeColor } from '../../utils/helpers';

const MyGrades = () => {
    const { user } = useAuth();
    const [enrollments, setEnrollments] = useState<EnrollmentDTO[]>([]);
    const [availableOfferings, setAvailableOfferings] = useState<CourseOfferingDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Feature Loop: Interactive Scale Toggle
    const [isScale4Primary, setIsScale4Primary] = useState(true);

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showGradeModal, setShowGradeModal] = useState(false);
    const [selectedOfferingId, setSelectedOfferingId] = useState<number | ''>('');
    const [selectedEnrollment, setSelectedEnrollment] = useState<EnrollmentDTO | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [modalDeptFilter, setModalDeptFilter] = useState('All');

    // Recursive Grade Entry States
    const [gradeHierarchy, setGradeHierarchy] = useState<GradeEntryDTO[]>([]);
    const [loadingGrades, setLoadingGrades] = useState(false);
    const [addingChildTo, setAddingChildTo] = useState<number | null>(null); // Parent ID or null for root
    const [newEntryName, setNewEntryName] = useState('');
    const [newEntryWeight, setNewEntryWeight] = useState('');

    useEffect(() => {
        loadData();
    }, [user?.studentId]);

    const loadData = async (silent = false) => {
        if (!silent) setLoading(true);
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
                // Now supports filtering: students see their own PENDING courses
                const offeringsRes = await courseOfferingService.getAll(user?.email || '', user?.role || 'student');
                setAvailableOfferings(offeringsRes.data);
            } catch (err) {
                console.error('Error fetching offerings:', err);
                setAvailableOfferings([]);
            }

            // 2. Load student enrollments
            if (studentId) {
                const enrollmentsRes = await enrollmentService.getByStudent(studentId);
                setEnrollments(enrollmentsRes.data);

                // If a modal is open, ensure the selectedEnrollment is updated too to reflect new final scores
                if (selectedEnrollment) {
                    const upToDate = enrollmentsRes.data.find(e => e.id === selectedEnrollment.id);
                    if (upToDate) setSelectedEnrollment(upToDate);
                }
            } else {
                setEnrollments([]);
            }
        } catch (err) {
            console.error('Error loading data:', err);
            setError('Failed to load data');
        } finally {
            if (!silent) setLoading(false);
        }
    };

    // Calculate Stats
    const completedEnrollments = enrollments.filter(e => e.finalScore !== null && e.finalScore !== undefined);
    const totalCredits = enrollments.reduce((sum, e) => sum + (e.credits || 0), 0);

    // Calculate GPA Scale 4
    const completedCredits = completedEnrollments.reduce((sum, e) => sum + (e.credits || 0), 0);
    const weightedSum = completedEnrollments.reduce((sum, e) => sum + ((e.gpaValue || 0) * (e.credits || 0)), 0);
    const gpa = completedCredits > 0 ? (weightedSum / completedCredits) : 0;

    // Calculate GPA Scale 10
    const weightedSum10 = completedEnrollments.reduce((sum, e) => sum + ((e.finalScore || 0) * (e.credits || 0)), 0);
    const gpa10 = completedCredits > 0 ? (weightedSum10 / completedCredits) : 0;

    const enrolledCount = enrollments.length;

    // Valid offerings to enroll:
    // 1. Check if student is already enrolled in THIS offering (by ID)
    // 2. Check if student is already enrolled in this COURSE (by Course Code) to prevent taking same subject twice
    //    (Unless we want to allow re-taking failed courses, but for now let's hide active enrollments)

    // Get list of Course Codes currently enrolled (or completed)
    const enrolledCourseCodes = enrollments.map(e => e.courseCode);

    const modalDepartments = ['All', ...Array.from(new Set(availableOfferings.map(o => o.department || 'General')))];

    const validOfferings = availableOfferings.filter(o => {
        // Exclude if student already has an enrollment for this Course Code
        const alreadyEnrolled = enrolledCourseCodes.includes(o.courseCode);
        if (alreadyEnrolled) return false;

        // Apply department filter
        if (modalDeptFilter !== 'All' && (o.department || 'General') !== modalDeptFilter) return false;

        return true;
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

    // Calculate remaining weight for the current context (Root or Parent)
    const getRemainingWeight = () => {
        let siblings: GradeEntryDTO[] = [];
        if (addingChildTo) {
            // Find parent
            const findParent = (entries: GradeEntryDTO[]): GradeEntryDTO | undefined => {
                for (const entry of entries) {
                    if (entry.id === addingChildTo) return entry;
                    if (entry.children) {
                        const found = findParent(entry.children);
                        if (found) return found;
                    }
                }
                return undefined;
            };
            const parent = findParent(gradeHierarchy);
            siblings = parent?.children || [];
        } else {
            siblings = gradeHierarchy;
        }

        const currentTotal = siblings.reduce((sum, e) => sum + (e.weight || 0), 0);
        return Math.max(0, 1 - currentTotal); // scale 0-1
    };

    // Auto-set weight when opening form or changing context
    useEffect(() => {
        const remaining = getRemainingWeight();
        if (remaining > 0) {
            setNewEntryWeight((remaining * 100).toFixed(0));
        } else {
            setNewEntryWeight('0');
        }
    }, [addingChildTo, gradeHierarchy]);

    const loadGradeHierarchy = async (courseId?: number) => {
        if (!selectedEnrollment?.id && !courseId) return;
        const id = courseId || selectedEnrollment?.id;

        try {
            setLoadingGrades(true);
            const res = await gradeEntryService.getHierarchy(id!);
            setGradeHierarchy(res.data);
        } catch (err) {
            console.error('Failed to load grades', err);
        } finally {
            setLoadingGrades(false);
        }
    };

    const handleAddEntry = async () => {
        if (!selectedEnrollment?.id || !newEntryName || !newEntryWeight) return;

        try {
            const weight = parseFloat(newEntryWeight) / 100; // Convert 20 to 0.2

            const payload: GradeEntryDTO = {
                enrollmentId: selectedEnrollment.id,
                name: newEntryName,
                weight: weight,
                entryType: GradeEntryType.COMPONENT
            };

            if (addingChildTo) {
                await gradeEntryService.addChild(addingChildTo, payload);
            } else {
                await gradeEntryService.create(payload);
            }

            // Reset and reload
            setNewEntryName('');
            setNewEntryWeight('');
            setAddingChildTo(null);
            await loadGradeHierarchy(selectedEnrollment.id);
            await loadData(true); // Silent refresh
        } catch (err) {
            console.error('Failed to add entry', err);
            alert('Failed to add grade entry');
        }
    };

    const handleDeleteEntry = async (id: number) => {
        if (!confirm('Are you sure? This will delete all sub-entries as well.')) return;
        try {
            await gradeEntryService.delete(id);
            if (selectedEnrollment?.id) {
                await loadGradeHierarchy(selectedEnrollment.id);
                await loadData(true); // Silent refresh
            }
        } catch (err) {
            console.error('Failed to delete', err);
        }
    };

    const handleScoreUpdate = async (id: number, score: number) => {
        try {
            await gradeEntryService.updateScore(id, score);
            // We need to reload to get recalculated parent scores
            if (selectedEnrollment?.id) {
                await loadGradeHierarchy(selectedEnrollment.id);
                await loadData(true); // Silent refresh
            }
        } catch (err) {
            console.error('Failed to update score', err);
        }
    };

    const openGradeModal = (enrollment: EnrollmentDTO) => {
        setSelectedEnrollment(enrollment);
        setGradeHierarchy([]); // Clear previous

        // Reset input forms to prevent data persisting between different courses
        setNewEntryName('');
        setNewEntryWeight('');
        setAddingChildTo(null);

        setShowGradeModal(true);
        // Load hierarchy immediately
        if (enrollment.id) {
            // We use a timeout to allow state to settle or direct call
            // But verify we can pass ID directly
            gradeEntryService.getHierarchy(enrollment.id).then(res => {
                setGradeHierarchy(res.data);
            });
        }
    };

    // Recursive renderer for grade entries
    const renderGradeEntry = (entry: GradeEntryDTO, level: number = 0) => {
        const isLeaf = !entry.children || entry.children.length === 0;
        const isRoot = level === 0;

        const getScoreColor = (score: number | null | undefined) => {
            if (score === null || score === undefined) return 'bg-slate-100 text-slate-400 border-slate-200';
            if (score >= 8.5) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            if (score >= 7.0) return 'bg-blue-50 text-blue-700 border-blue-200';
            if (score >= 5.0) return 'bg-amber-50 text-amber-700 border-amber-200';
            return 'bg-red-50 text-red-700 border-red-200';
        };

        const scoreValue = isLeaf ? entry.score : entry.calculatedScore;
        const scoreColor = getScoreColor(scoreValue);

        return (
            <div key={entry.id} className={`relative ${isRoot ? 'mb-4' : 'mt-1'}`}>
                {/* Connector Lines */}
                {level > 0 && (
                    <div
                        className="absolute left-0 top-0 bottom-0 w-px bg-slate-200"
                        style={{ left: `12px`, top: '-20px', height: 'calc(100% + 10px)' }}
                    />
                )}
                {level > 0 && (
                    <div
                        className="absolute h-px bg-slate-200 w-3"
                        style={{ left: `12px`, top: '22px' }}
                    />
                )}

                <div
                    className={`
                        group relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 transition-all duration-200
                        ${isRoot
                            ? 'bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-200'
                            : 'ml-6 sm:ml-12 rounded-lg bg-slate-50/50 hover:bg-slate-50 border border-transparent hover:border-slate-200'
                        }
                    `}
                >
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 w-full sm:w-auto mb-3 sm:mb-0">
                        <div className={`
                            w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center shadow-md border-2 shrink-0
                            ${isRoot
                                ? 'bg-gradient-to-br from-indigo-600 to-violet-600 border-indigo-400/30 text-white'
                                : 'bg-white text-slate-600 border-slate-200'
                            }
                        `}>
                            <span className="text-sm sm:text-lg font-black">{(entry.weight * 100).toFixed(0)}</span>
                            <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider opacity-60">%</span>
                        </div>

                        <div className="min-w-0">
                            <h4 className={`font-bold truncate ${isRoot ? 'text-slate-800 text-sm sm:text-base' : 'text-slate-700 text-xs sm:text-sm'}`}>
                                {entry.name}
                            </h4>
                            <div className="w-20 sm:w-32 h-1 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${isRoot ? 'bg-indigo-500' : 'bg-slate-400'}`}
                                    style={{ width: `${entry.weight * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-8 w-full sm:w-auto border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                        <div className="text-right min-w-[70px] sm:min-w-[80px]">
                            {isLeaf ? (
                                <div className="flex items-center sm:block">
                                    <span className="sm:hidden text-[10px] text-slate-400 font-bold uppercase mr-2">Score:</span>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            max="10"
                                            step="0.01"
                                            className="w-16 sm:w-20 text-center font-bold text-base sm:text-xl bg-transparent border-b-2 border-transparent hover:border-slate-200 focus:border-indigo-500 outline-none p-0"
                                            defaultValue={entry.score ?? ''}
                                            placeholder="--"
                                            onBlur={(e) => {
                                                const val = parseFloat(e.target.value);
                                                if (!isNaN(val) && val >= 0 && val <= 10) handleScoreUpdate(entry.id!, val);
                                            }}
                                            onKeyDown={(e) => { e.key === 'Enter' && e.currentTarget.blur() }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center sm:flex-col sm:items-end">
                                    <span className="sm:hidden text-[10px] text-slate-400 font-bold uppercase mr-2">GPA:</span>
                                    <div className={`text-sm sm:text-lg font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg border ${scoreColor}`}>
                                        {entry.calculatedScore !== null ? entry.calculatedScore?.toFixed(2) : '--'}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-1 sm:gap-2">
                            <button
                                onClick={() => setAddingChildTo(entry.id!)}
                                className="p-1.5 sm:p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                            >
                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                            </button>
                            <button
                                onClick={() => handleDeleteEntry(entry.id!)}
                                className="p-1.5 sm:p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            >
                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>
                    </div>
                </div>

                {entry.children && entry.children.length > 0 && (
                    <div className="border-l-2 border-slate-100 ml-3 sm:ml-6 pl-0 pb-1 sm:pb-2">
                        {entry.children.map(child => renderGradeEntry(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    if (loading) return <div className="text-center py-10"><div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div></div>;

    return (
        <div className="space-y-4 lg:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-slate-900">Manage Enrollments & Grades</h1>
                    <p className="text-xs lg:text-sm text-slate-500">View and manage your academic progress</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="w-full sm:w-auto btn-primary flex items-center justify-center gap-2 py-2.5 text-sm"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Enrollment
                </button>
            </div>

            {/* ERROR MSG */}
            {error && (
                <div className="bg-red-50 text-red-600 p-3 lg:p-4 rounded-xl border border-red-200 text-sm">
                    {error}
                </div>
            )}

            {/* STATS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                <div className="bg-white p-4 lg:p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="p-2.5 lg:p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                        <svg className="w-6 h-6 lg:w-8 lg:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-[10px] lg:text-sm font-bold uppercase tracking-wider text-slate-400">Total Credits</p>
                        <p className="text-xl lg:text-3xl font-bold text-slate-900">{totalCredits}</p>
                    </div>
                </div>

                {/* Interactive GPA Card */}
                <div
                    onClick={() => setIsScale4Primary(!isScale4Primary)}
                    className="bg-white p-4 lg:p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 relative overflow-hidden group cursor-pointer hover:shadow-md transition-all select-none"
                    title="Click to toggle GPA Scale"
                >
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                        <svg className="w-24 lg:w-32 h-24 lg:h-32 text-green-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                    </div>

                    <div className="p-2.5 lg:p-3 bg-emerald-50 text-emerald-600 rounded-xl z-10 shrink-0 transition-transform group-hover:scale-110 duration-300">
                        <svg className="w-6 h-6 lg:w-8 lg:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>

                    <div className="z-10 flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <p className="text-[10px] lg:text-sm font-bold uppercase tracking-wider text-slate-400 mb-1 lg:mb-1.5 truncate">Cumulative Grade</p>
                        </div>

                        <div className="relative h-8 lg:h-10 w-full">
                            {/* Scale 4 Display */}
                            <div className={`absolute top-0 left-0 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isScale4Primary
                                ? 'opacity-100 translate-y-0 scale-100 origin-bottom-left'
                                : 'opacity-40 translate-y-[-10%] translate-x-[90px] lg:translate-x-[120px] scale-60 lg:scale-75 origin-bottom-left'
                                }`}>
                                <div className="flex items-end gap-1">
                                    <span className={`font-black text-slate-800 leading-none ${isScale4Primary ? 'text-2xl lg:text-3xl' : 'text-base lg:text-xl'}`}>
                                        {gpa.toFixed(2)}
                                    </span>
                                    <span className="text-[10px] lg:text-sm font-bold text-slate-400 mb-0.5">/ 4.0</span>
                                </div>
                            </div>

                            {/* Scale 10 Display */}
                            <div className={`absolute top-0 left-0 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${!isScale4Primary
                                ? 'opacity-100 translate-y-0 scale-100 origin-bottom-left'
                                : 'opacity-40 translate-y-[-10%] translate-x-[90px] lg:translate-x-[120px] scale-60 lg:scale-75 origin-bottom-left'
                                }`}>
                                <div className="flex items-end gap-1">
                                    <span className={`font-black text-slate-800 leading-none ${!isScale4Primary ? 'text-2xl lg:text-3xl' : 'text-base lg:text-xl'}`}>
                                        {gpa10.toFixed(2)}
                                    </span>
                                    <span className="text-[10px] lg:text-sm font-bold text-slate-400 mb-0.5">/ 10</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 lg:p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 sm:col-span-2 lg:col-span-1">
                    <div className="p-2.5 lg:p-3 bg-purple-50 text-purple-600 rounded-xl shrink-0">
                        <svg className="w-6 h-6 lg:w-8 lg:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-[10px] lg:text-sm font-bold uppercase tracking-wider text-slate-400">Enrolled Subjects</p>
                        <p className="text-xl lg:text-3xl font-bold text-slate-900">{enrolledCount}</p>
                    </div>
                </div>
            </div>

            {/* ENROLLMENT CONTAINER */}
            <div className="bg-white lg:bg-transparent shadow-none lg:shadow-none border-none lg:border-none rounded-none lg:rounded-none">
                <div className="flex justify-between items-center mb-4 px-1">
                    <h3 className="text-lg font-bold text-slate-800">Course Enrollments</h3>
                    <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
                        Fall 2024
                    </span>
                </div>

                {/* DESKTOP TABLE */}
                <div className="hidden lg:block card overflow-hidden p-0 border-slate-200">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase text-slate-400 font-black tracking-widest">
                            <tr>
                                <th className="px-6 py-4 text-left">Subject Name</th>
                                <th className="px-6 py-4 text-center">Credits</th>
                                <th className="px-6 py-4 text-center">Grade</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {enrollments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <p className="text-4xl">📚</p>
                                            <p className="text-sm font-medium">No enrollments found.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                enrollments.map((e) => (
                                    <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-5">
                                            <p className="font-bold text-slate-900 text-sm">{e.courseName}</p>
                                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{e.courseCode}</p>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs ring-1 ring-slate-200">
                                                {e.credits}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            {typeof e.finalScore === 'number' ? (
                                                <div className="flex flex-col items-center gap-1.5">
                                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base font-black shadow-sm border-2 ${getLetterGradeColor(e.finalScore)}`}>
                                                        {e.letterGrade}
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-xs font-black text-slate-700">{e.gpaValue?.toFixed(1)} <span className="text-[10px] text-slate-400 font-normal">/ 4.0</span></p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase scale-90">Raw: {e.finalScore}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex justify-center">
                                                    <span className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-300 font-bold">--</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            {(() => {
                                                const { label, color } = getEnrollmentStatusDisplay(e);
                                                return <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border-2 ${color}`}>{label}</span>;
                                            })()}
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    onClick={() => openGradeModal(e)}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all hover:shadow-sm ring-1 ring-transparent hover:ring-slate-100"
                                                    title="Grade Calculator"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                {typeof e.finalScore !== 'number' && e.status !== 'WITHDRAWN' && (
                                                    <button
                                                        onClick={() => handleWithdraw(e.id!)}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-xl transition-all hover:shadow-sm ring-1 ring-transparent hover:ring-slate-100"
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

                {/* MOBILE CARD VIEW */}
                <div className="lg:hidden space-y-4">
                    {enrollments.length === 0 ? (
                        <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
                            <p className="text-4xl mb-2">📚</p>
                            <p className="text-slate-500 font-medium">No enrollments yet.</p>
                        </div>
                    ) : (
                        enrollments.map((e) => {
                            const { label, color } = getEnrollmentStatusDisplay(e);
                            return (
                                <div key={e.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4">
                                    <div className="flex justify-between items-start">
                                        <div className="min-w-0 flex-1">
                                            <h4 className="font-black text-slate-800 text-base leading-tight truncate">{e.courseName}</h4>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{e.courseCode} • {e.credits} Credits</p>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border-2 shrink-0 ${color}`}>
                                            {label}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-3 border border-slate-100">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black shadow-sm border-2 ${typeof e.finalScore === 'number' ? getLetterGradeColor(e.finalScore) : 'bg-white text-slate-200 border-slate-200'}`}>
                                            {e.letterGrade || '--'}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-lg font-black text-slate-800">{e.gpaValue?.toFixed(2) || '0.00'}</span>
                                                <span className="text-[10px] font-bold text-slate-400">/ 4.0 GPA</span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <div className="h-1.5 flex-1 bg-slate-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                                                        style={{ width: `${(e.finalScore || 0) * 10}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-500 shrink-0">{e.finalScore || 0} / 10</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-1">
                                        <button
                                            onClick={() => openGradeModal(e)}
                                            className="flex-1 py-3 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            calculator
                                        </button>
                                        {typeof e.finalScore !== 'number' && e.status !== 'WITHDRAWN' && (
                                            <button
                                                onClick={() => handleWithdraw(e.id!)}
                                                className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center hover:bg-red-100 transition-colors border border-red-100"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* ADD COURSE MODAL */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-6 lg:p-8 w-full max-w-md shadow-2xl transform transition-all border border-white/20">
                        <div className="flex justify-between items-center mb-6 lg:mb-8">
                            <div>
                                <h2 className="text-xl lg:text-2xl font-black text-slate-900">Enroll in Course</h2>
                                <p className="text-xs lg:text-sm text-slate-500 font-medium mt-1">Select your desired subject</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-5 lg:space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] lg:text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Department</label>
                                <select
                                    className="w-full border-2 border-slate-100 rounded-2xl p-3 lg:p-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all bg-slate-50/50 font-bold text-slate-700 text-sm appearance-none"
                                    value={modalDeptFilter}
                                    onChange={(e) => {
                                        setModalDeptFilter(e.target.value);
                                        setSelectedOfferingId('');
                                    }}
                                >
                                    {modalDepartments.map(dept => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] lg:text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Select Offering</label>
                                <select
                                    className="w-full border-2 border-slate-100 rounded-2xl p-3 lg:p-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all bg-white font-bold text-slate-700 text-sm appearance-none"
                                    value={selectedOfferingId}
                                    onChange={(e) => setSelectedOfferingId(e.target.value ? Number(e.target.value) : '')}
                                >
                                    <option value="">-- Choose a course --</option>
                                    {validOfferings.length > 0 ? (
                                        validOfferings.map((o) => (
                                            <option key={o.id} value={o.id}>
                                                {o.courseName} ({o.semester} {o.academicYear})
                                            </option>
                                        ))
                                    ) : (
                                        <option value="" disabled>No courses available</option>
                                    )}
                                </select>
                            </div>

                            {validOfferings.length === 0 && modalDeptFilter === 'All' && (
                                <div className="p-4 bg-amber-50 rounded-2xl border-2 border-amber-100 flex gap-3">
                                    <span className="text-lg">⚠️</span>
                                    <p className="text-amber-700 text-xs font-bold leading-relaxed">
                                        No courses available to enroll at the moment. Please contact the registrar.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 mt-8 lg:mt-10">
                            <button
                                className="order-2 sm:order-1 flex-1 py-3.5 border-2 border-slate-100 rounded-2xl hover:bg-slate-50 font-black text-[10px] sm:text-xs uppercase tracking-widest text-slate-500 transition-all"
                                onClick={() => setShowAddModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="order-1 sm:order-2 flex-1 py-3.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-xl shadow-indigo-200 disabled:opacity-50 disabled:shadow-none transition-all"
                                onClick={handleAddEnrollment}
                                disabled={!selectedOfferingId || submitting}
                            >
                                {submitting ? 'Processing...' : 'Enroll Now'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* GRADE CALCULATOR MODAL */}
            {showGradeModal && selectedEnrollment && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-slate-100">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Grade Calculator</h2>
                                <p className="text-sm text-slate-500">{selectedEnrollment.courseName} • {selectedEnrollment.credits} credits</p>
                            </div>
                            <button onClick={() => setShowGradeModal(false)} className="text-slate-400 hover:text-slate-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Scrolling Body */}
                        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                            {loadingGrades ? (
                                <div className="text-center py-10 text-slate-500">Loading grades...</div>
                            ) : gradeHierarchy.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                                    <p className="text-slate-500 mb-2">No grade components defined yet.</p>
                                    <p className="text-xs text-slate-400">Add a component below to start predicting your grade.</p>
                                </div>
                            ) : (
                                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                                    {/* Header Row */}
                                    <div className="flex justify-between px-4 py-2 bg-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        <span>Component</span>
                                        <div className="flex gap-4">
                                            <span className="w-24 text-right">Score / 10</span>
                                            <span className="w-16">Actions</span>
                                        </div>
                                    </div>

                                    {gradeHierarchy.map(entry => renderGradeEntry(entry))}
                                </div>
                            )}
                        </div>

                        {/* Footer: Add Entry & Total */}
                        <div className="p-6 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl space-y-5 backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    {addingChildTo ? (
                                        <>
                                            <span className="text-indigo-600">↳ Adding sub-component</span>
                                            <span className="text-slate-400 font-normal">to ID: {addingChildTo}</span>
                                            <button
                                                onClick={() => setAddingChildTo(null)}
                                                className="text-xs text-red-500 hover:text-red-700 ml-2"
                                            >
                                                (Cancel)
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Add Root Component
                                        </>
                                    )}
                                </h4>

                                {getRemainingWeight() > 0 && (
                                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                                        {(getRemainingWeight() * 100).toFixed(0)}% weight remaining
                                    </span>
                                )}
                            </div>

                            {/* Add Entry Form Row */}
                            <datalist id="grade-component-suggestions">
                                <option value="Process Grade" />
                                <option value="Midterm Exam" />
                                <option value="Final Exam" />
                                <option value="Essay" />
                                <option value="Group Report" />
                                <option value="Project" />
                            </datalist>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                <div className="flex-1 relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Component Name (e.g. Midterm)"
                                        className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                                        value={newEntryName}
                                        onChange={(e) => setNewEntryName(e.target.value)}
                                        list="grade-component-suggestions"
                                    />
                                </div>

                                <div className="flex gap-2 sm:gap-3">
                                    <div className="relative flex-1 sm:w-32 group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                            </svg>
                                        </div>
                                        <input
                                            type="number"
                                            placeholder="Weight"
                                            className="block w-full pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                            value={newEntryWeight}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === '') { setNewEntryWeight(''); return; }
                                                const num = parseFloat(val);
                                                if (isNaN(num)) return;
                                                const max = getRemainingWeight() * 100;
                                                if (num > max + 0.1) return;
                                                setNewEntryWeight(val);
                                            }}
                                        />
                                        <span className="absolute right-3 top-2.5 text-slate-400 text-xs font-bold">%</span>
                                    </div>
                                    <button
                                        onClick={handleAddEntry}
                                        disabled={!newEntryName || !newEntryWeight}
                                        className="px-5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 transition-all duration-200"
                                    >
                                        <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                                    </button>
                                </div>
                            </div>

                            {/* Summary & Estimate */}
                            <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-slate-200/60 gap-4">
                                <p className="text-xs text-slate-500 italic flex items-center gap-1.5">
                                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Weights must sum to 100% for accurate calculation.
                                </p>
                                <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Estimated Grade</span>
                                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                                        {(() => {
                                            const total = gradeHierarchy.reduce((sum, entry) => {
                                                const score = (entry.children && entry.children.length > 0)
                                                    ? entry.calculatedScore
                                                    : entry.score;
                                                return sum + ((score || 0) * (entry.weight || 0));
                                            }, 0);
                                            return total.toFixed(2);
                                        })()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyGrades;
