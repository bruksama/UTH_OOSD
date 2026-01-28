import { useEffect, useState } from 'react';
import { courseService, courseOfferingService, enrollmentService } from '../../services';
import { CourseDTO, ApprovalStatus, CourseOfferingDTO, EnrollmentDTO, EnrollmentStatus } from '../../types';
import CourseProposalModal from '../../components/CourseProposalModal';
import { useAuth } from '../../contexts/AuthContext';
import { getApprovalStatusDisplay } from '../../utils/helpers';

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
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Course Catalog</h1>
                    <p className="text-slate-500">Browse and request new courses for all departments.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn-primary flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Propose Course
                    </button>
                    {/* Department Filter */}
                    <div className="relative w-full sm:w-48">
                        <select
                            className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none appearance-none bg-white cursor-pointer"
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                        >
                            {allDepartments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                    </div>

                    {/* Search Input */}
                    <div className="relative w-full sm:w-64">
                        <input
                            type="text"
                            placeholder="Search courses..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <svg className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                    <div key={course.id} className={`bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow p-6 flex flex-col h-full relative group ${course.isEnrolled ? 'border-l-4 border-l-green-500' : ''}`}>
                        {course.creatorEmail === user?.email && course.status !== ApprovalStatus.APPROVED && (
                            <button
                                onClick={() => course.id && handleDeleteCourse(course.id)}
                                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                title="Delete Proposal"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        )}

                        <div className="flex justify-between items-start mb-4">
                            <span className="text-xs font-semibold uppercase tracking-wider text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                                {course.department || 'General'}
                            </span>
                            {course.isEnrolled && (
                                <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    Enrolled
                                </span>
                            )}
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 mb-2">{course.courseName}</h3>

                        <p className="text-slate-600 text-sm flex-grow mb-6 line-clamp-3">
                            {course.description || "No description available for this course."}
                        </p>

                        <div className="pt-4 border-t border-slate-100 mt-auto flex justify-between items-center text-sm">
                            <span className="text-slate-500 font-medium">
                                {course.credits} Credits
                            </span>

                            {/* Actions Area */}
                            <div>
                                {course.status === ApprovalStatus.PENDING && (() => {
                                    const { label, color } = getApprovalStatusDisplay(ApprovalStatus.PENDING);
                                    return (
                                        <span className={`${color} px-2 py-0.5 rounded text-xs font-bold`}>
                                            {label}
                                        </span>
                                    );
                                })()}

                                {course.status === ApprovalStatus.APPROVED && !course.isEnrolled && course.hasOffering && (
                                    <button
                                        disabled={enrollingId !== null}
                                        onClick={() => handleQuickEnroll(course.courseCode)}
                                        className="text-white bg-primary-600 hover:bg-primary-700 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center gap-1 disabled:opacity-50"
                                    >
                                        {enrollingId ? '...' : (
                                            <>
                                                Enroll
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredCourses.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                    <p className="text-slate-500">No courses found matching "{searchTerm}"</p>
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
