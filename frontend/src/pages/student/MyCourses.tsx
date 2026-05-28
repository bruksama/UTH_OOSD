import { useEffect, useState } from 'react';
import { courseService, courseOfferingService, enrollmentService } from '../../services';
import { CourseDTO, ApprovalStatus, CourseOfferingDTO, EnrollmentDTO, EnrollmentStatus } from '../../types';
import CourseProposalModal from '../../components/CourseProposalModal';
import { useAuth } from '../../contexts/AuthContext';

/**
 * MyCourses - Course Catalog
 * Students can view all available courses offered by the university.
 * Supports Quick Enrollment for active courses.
 */

interface CourseWithStatus extends CourseDTO {
    isEnrolled: boolean;
    hasOffering: boolean;
    priority: number;
}

const MyCourses = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState<CourseDTO[]>([]);
    const [offerings, setOfferings] = useState<CourseOfferingDTO[]>([]);
    const [enrollments, setEnrollments] = useState<EnrollmentDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [enrollingId, setEnrollingId] = useState<number | null>(null);

    const loadData = async () => {
        try {
            setLoading(true);
            const [coursesRes, offeringsRes] = await Promise.all([
                courseService.getAll(),
                courseOfferingService.getAll(user?.email || '', user?.role || 'student')
            ]);

            setCourses(coursesRes.data);
            setOfferings(offeringsRes.data);

            if (user?.studentId) {
                const enrollmentRes = await enrollmentService.getByStudent(user.studentId);
                setEnrollments(enrollmentRes.data);
            }
        } catch (err) {
            console.error('Error fetching catalog data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [user]);

    const handleDeleteCourse = async (id: number) => {
        if (!confirm('Are you sure you want to delete your course proposal?')) return;
        try {
            await courseService.delete(id, user?.email || '', user?.role || 'student');
            await loadData();
        } catch (err) {
            console.error('Error deleting course:', err);
            alert('Failed to delete course.');
        }
    };

    const handleProposeCourse = async (data: CourseDTO) => {
        try {
            setIsSubmitting(true);
            await courseService.create(data);
            await loadData();
            setIsModalOpen(false);
        } catch (err) {
            console.error('Error proposing course:', err);
            alert('Failed to propose course. Probably course code already exists.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleQuickEnroll = async (courseCode: string) => {
        // Find a valid offering for this course
        const offering = offerings.find(o => o.courseCode === courseCode);
        if (!offering || !user?.studentId) return;

        if (!confirm(`Register for ${offering.courseName}?`)) return;

        try {
            setEnrollingId(offering.id || 0);
            await enrollmentService.create({
                studentId: user.studentId,
                courseOfferingId: offering.id!,
                status: EnrollmentStatus.IN_PROGRESS
            });
            await loadData(); // Refresh to show "Enrolled" status
        } catch (err) {
            console.error('Error enrolling:', err);
            alert('Failed to enroll. Course might be full.');
        } finally {
            setEnrollingId(null);
        }
    };

    // Extract unique departments for filtering
    const allDepartments = ['All', ...Array.from(new Set(courses.map(c => c.department || 'General')))];

    // Extract departments for the proposal modal (excluding 'All')
    const uniqueDepartments = Array.from(new Set(courses.map(c => c.department).filter(Boolean))) as string[];

    const processedCourses: CourseWithStatus[] = courses.map(course => {
        const isEnrolled = enrollments.some(e => e.courseCode === course.courseCode);
        const hasOffering = offerings.some(o => o.courseCode === course.courseCode);
        // Priority: Unenrolled & Has Offering (1) -> Enrolled (2) -> Others (3)
        let priority = 3;
        if (isEnrolled) priority = 2;
        else if (hasOffering) priority = 1;

        return { ...course, isEnrolled, hasOffering, priority };
    });

    const filteredCourses = processedCourses
        .filter(c => {
            const isVisible = c.status === ApprovalStatus.APPROVED || c.creatorEmail === user?.email;
            if (!isVisible) return false;

            const matchesSearch = c.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDept = selectedDepartment === 'All' || (c.department || 'General') === selectedDepartment;

            return matchesSearch && matchesDept;
        })
        .sort((a, b) => a.priority - b.priority);

    if (loading) return <div className="text-center py-10"><div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div></div>;

    return (
        <div className="space-y-6 lg:space-y-10">
            {/* SEARCH & FILTER BAR */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Course Catalog</h1>
                    <p className="text-slate-500 font-medium mt-1">Discover opportunities and shape your academic path.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                    {/* Search Field */}
                    <div className="relative flex-1 sm:min-w-[300px] group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name or code..."
                            className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm font-bold text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-3">
                        {/* Dept Filter */}
                        <div className="relative flex-1 sm:w-48 group">
                            <select
                                className="w-full pl-4 pr-10 py-3.5 bg-white border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none appearance-none transition-all shadow-sm font-bold text-sm cursor-pointer"
                                value={selectedDepartment}
                                onChange={(e) => setSelectedDepartment(e.target.value)}
                            >
                                {allDepartments.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 group-hover:text-indigo-500 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>

                        {/* Propose Button */}
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-indigo-600 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center gap-2 shrink-0"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                            <span className="hidden sm:inline">Propose</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* COURSE GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                {filteredCourses.map((course) => (
                    <div
                        key={course.id}
                        className={`
                            group bg-white rounded-[2.5rem] p-6 lg:p-8 border-2 transition-all duration-300 flex flex-col h-full relative
                            ${course.isEnrolled
                                ? 'border-emerald-100 shadow-xl shadow-emerald-50/50'
                                : 'border-slate-50 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-50/50 hover:-translate-y-1'
                            }
                        `}
                    >
                        {/* Delete Button for Proposals */}
                        {course.creatorEmail === user?.email && course.status !== ApprovalStatus.APPROVED && (
                            <button
                                onClick={() => course.id && handleDeleteCourse(course.id)}
                                className="absolute top-6 right-6 p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        )}

                        <div className="flex justify-between items-start mb-6">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 bg-indigo-50/50 px-3 py-1.5 rounded-xl border border-indigo-50">
                                {course.department || 'General'}
                            </span>
                            {course.isEnrolled && (
                                <div className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-100">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    Enrolled
                                </div>
                            )}
                        </div>

                        <div className="mb-4">
                            <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">#{course.courseCode}</span>
                            <h3 className="text-xl lg:text-2xl font-black text-slate-800 leading-tight mt-1 group-hover:text-indigo-600 transition-colors uppercase tracking-tight line-clamp-2 min-h-[3.5rem]">{course.courseName}</h3>
                        </div>

                        <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8 line-clamp-3">
                            {course.description || "Detailed curriculum and learning objectives for this academic subject are currently being finalized."}
                        </p>

                        <div className="mt-auto pt-6 border-t-2 border-slate-50 flex justify-between items-center">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Credit Load</span>
                                <span className="text-lg font-black text-slate-700">{course.credits} <span className="text-xs">CR</span></span>
                            </div>

                            <div className="flex items-center gap-3">
                                {course.status === ApprovalStatus.PENDING && (
                                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100">
                                        Proposal Pending
                                    </span>
                                )}

                                {course.status === ApprovalStatus.APPROVED && !course.isEnrolled && (
                                    course.hasOffering ? (
                                        <button
                                            disabled={enrollingId !== null}
                                            onClick={() => handleQuickEnroll(course.courseCode)}
                                            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-slate-800 hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {enrollingId === course.id ? '...' : 'Enroll'}
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                        </button>
                                    ) : (
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl">
                                            No Offerings
                                        </span>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredCourses.length === 0 && (
                <div className="text-center py-20 lg:py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <h3 className="text-xl font-black text-slate-800">No courses found</h3>
                    <p className="text-slate-400 font-medium mt-2">Try adjusting your search or filters.</p>
                </div>
            )}

            <CourseProposalModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleProposeCourse}
                isLoading={isSubmitting}
                existingDepartments={uniqueDepartments}
            />
        </div>
    );
};

export default MyCourses;
