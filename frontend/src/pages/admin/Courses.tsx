import { useState, useEffect } from 'react';
import { courseService, enrollmentService } from '../../services';
import { CourseDTO, ApprovalStatus, EnrollmentDTO } from '../../types';
import CourseProposalModal from '../../components/CourseProposalModal';
import { useAuth } from '../../contexts/AuthContext';
import { X, Users, Search } from 'lucide-react';

/**
 * Courses list page component
 * Displays all courses with filtering capabilities
 * 
 * @author SPTS Team
 */
const Courses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<CourseDTO[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Enrollment View States
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseDTO | null>(null);
  const [enrolledStudents, setEnrolledStudents] = useState<EnrollmentDTO[]>([]);
  const [isLoadingEnrollments, setIsLoadingEnrollments] = useState(false);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getAll();
      setCourses(response.data);
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      await courseService.approve(id);
      loadCourses();
    } catch (err) {
      console.error('Error approving course:', err);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await courseService.reject(id);
      loadCourses();
    } catch (err) {
      console.error('Error rejecting course:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this course? This will also delete its offerings if no students are enrolled.')) return;
    try {
      await courseService.delete(id, user?.email || '', user?.role || 'admin');
      loadCourses();
    } catch (err: any) {
      console.error('Error deleting course:', err);
      alert(err.response?.data?.message || 'Failed to delete course. It may have active enrollments.');
    }
  };

  const handleCreateCourse = async (data: CourseDTO) => {
    try {
      setIsSubmitting(true);
      await courseService.create({
        ...data,
        status: ApprovalStatus.APPROVED
      });
      setIsModalOpen(false);
      loadCourses();
    } catch (err) {
      console.error('Error creating course:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewEnrollments = async (course: CourseDTO) => {
    if (!course.id) return;
    setSelectedCourse(course);
    setIsEnrollmentModalOpen(true);
    setIsLoadingEnrollments(true);
    setEnrolledStudents([]);

    try {
      // 1. Get offerings for this course
      const offeringsRes = await courseService.getOfferings(course.id);
      const offerings = offeringsRes.data;

      // 2. Map offerings to enrollment lists
      const enrollmentPromises = offerings.map(o =>
        enrollmentService.getByOffering(o.id!)
      );

      const enrollmentsResponses = await Promise.all(enrollmentPromises);
      const allEnrollments = enrollmentsResponses.flatMap(res => res.data);

      // Remove duplicates if any student is somehow in multiple offerings (shouldn't happen)
      const uniqueEnrollments = allEnrollments.reduce((acc: EnrollmentDTO[], current) => {
        const x = acc.find(item => item.studentCode === current.studentCode);
        if (!x) return acc.concat([current]);
        return acc;
      }, []);

      setEnrolledStudents(uniqueEnrollments);
    } catch (err) {
      console.error('Error fetching course enrollments:', err);
    } finally {
      setIsLoadingEnrollments(false);
    }
  };

  const departments = [...new Set(courses.map((c) => c.department).filter(Boolean))];

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.courseCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment =
      departmentFilter === 'ALL' || course.department === departmentFilter;

    const matchesStatus = statusFilter === 'ALL'
      ? course.status !== ApprovalStatus.REJECTED
      : course.status === statusFilter;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Loading Course Catalog...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="relative">
          <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            Academic <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Catalog</span>
          </h1>
          <p className="text-slate-500 font-bold mt-1 uppercase tracking-[0.2em] text-[10px]">Management Control Panel</p>
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-600 to-violet-600 rounded-full" />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="group relative px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest overflow-hidden hover:shadow-2xl hover:shadow-indigo-200 transition-all active:scale-95"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="relative z-10 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
            Add New Course
          </span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-4 lg:p-6 border border-slate-200/60 shadow-xl shadow-slate-200/40">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Search Box */}
          <div className="flex-1 relative group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name, code or keyword..."
              className="w-full pl-14 pr-6 py-4 bg-white border-2 border-slate-50 rounded-2xl font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 lg:w-[450px]">
            {/* Department Select */}
            <div className="flex-1 relative">
              <select
                className="w-full pl-6 pr-10 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 focus:bg-white focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="ALL">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>

            {/* Status Select */}
            <div className="flex-1 relative">
              <select
                className="w-full pl-6 pr-10 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 focus:bg-white focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="ALL">All Status</option>
                <option value={ApprovalStatus.APPROVED}>Active (Approved)</option>
                <option value={ApprovalStatus.PENDING}>Pending Approval</option>
                <option value={ApprovalStatus.REJECTED}>Rejected</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredCourses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onApprove={handleApprove}
            onReject={handleReject}
            onDelete={handleDelete}
            onViewEnrollments={() => handleViewEnrollments(course)}
          />
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white/40 rounded-[3rem] border-2 border-dashed border-slate-200">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p className="text-xl font-black text-slate-800 tracking-tight">Search Result Empty</p>
          <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-[10px]">No courses matched "{searchTerm}"</p>
          <button
            onClick={() => { setSearchTerm(''); setDepartmentFilter('ALL'); setStatusFilter('ALL'); }}
            className="mt-6 text-indigo-600 font-black text-xs uppercase tracking-widest hover:text-indigo-700 transition-colors underline decoration-2 underline-offset-4"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Pagination / Info Footer */}
      <div className="flex justify-between items-center px-8">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Catalog Statistics: <span className="text-slate-800">{filteredCourses.length}</span> course entries found
          </p>
        </div>
      </div>

      <CourseProposalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateCourse}
        isLoading={isSubmitting}
        existingDepartments={departments as string[]}
      />

      <EnrolledStudentsModal
        isOpen={isEnrollmentModalOpen}
        onClose={() => setIsEnrollmentModalOpen(false)}
        course={selectedCourse}
        enrollments={enrolledStudents}
        isLoading={isLoadingEnrollments}
      />
    </div>
  );
};
// Course Card Component
interface CourseCardProps {
  course: CourseDTO;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onDelete: (id: number) => void;
  onViewEnrollments: () => void;
}

const CourseCard = ({ course, onApprove, onReject, onDelete, onViewEnrollments }: CourseCardProps) => {
  const isPending = course.status === ApprovalStatus.PENDING;
  const isRejected = course.status === ApprovalStatus.REJECTED;

  return (
    <div className={`
      group relative bg-white rounded-[2.5rem] p-8 border border-slate-200/60 shadow-lg shadow-slate-200/20 
      transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-100 hover:-translate-y-2 overflow-hidden
      ${isPending ? 'ring-2 ring-amber-400/50 bg-amber-50/10' : ''}
      ${isRejected ? 'ring-2 ring-red-400/50 bg-red-50/10' : ''}
    `}>
      {/* Visual Accent */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${isPending ? 'from-amber-400 to-orange-400' : isRejected ? 'from-red-400 to-rose-600' : 'from-indigo-600 to-violet-600'
        }`} />

      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col gap-2">
          <div className="px-3 py-1.5 bg-slate-50 rounded-xl w-fit border border-slate-100">
            <span className="font-mono text-xs text-indigo-600 font-black tracking-widest uppercase">
              {course.courseCode}
            </span>
          </div>
          {isPending && (
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              <span className="bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg">
                Pending Approval
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Weight</span>
            <span className="text-lg font-black text-slate-800 leading-none">
              {course.credits}
              <span className="text-[10px] text-slate-400 ml-0.5">CR</span>
            </span>
          </div>
          <button
            onClick={() => course.id && onDelete(course.id)}
            className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
            title="Remove from Catalog"
          >
            <svg className="w-5 h-5 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <h3 className="text-xl font-black text-slate-800 mb-3 tracking-tight leading-tight group-hover:text-indigo-600 transition-colors">
        {course.courseName}
      </h3>

      {course.description && (
        <p className="text-sm text-slate-500 font-bold mb-6 line-clamp-3 leading-relaxed">
          {course.description}
        </p>
      )}

      <div className="flex items-center gap-3 py-4 border-y border-slate-50 mb-6">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 border border-indigo-100">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Faculty Dept.</p>
          <p className="text-sm font-black text-slate-700">{course.department}</p>
        </div>
      </div>

      <div className="flex gap-3">
        {isPending ? (
          <>
            <button
              onClick={() => course.id && onApprove(course.id)}
              className="flex-1 bg-emerald-600 text-white py-4 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all active:scale-95"
            >
              Approve
            </button>
            <button
              onClick={() => course.id && onReject(course.id)}
              className="flex-1 bg-red-50 text-red-600 py-4 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all active:scale-95"
            >
              Reject
            </button>
          </>
        ) : (
          <button
            onClick={onViewEnrollments}
            className="w-full py-4 bg-slate-50 border-2 border-slate-100 text-slate-600 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest hover:bg-white hover:border-indigo-500 hover:text-indigo-600 hover:shadow-xl hover:shadow-indigo-50 transition-all active:scale-95"
          >
            View Enrolled Students
          </button>
        )}
      </div>

      {course.creatorEmail && (
        <div className="mt-6 pt-4 border-t border-slate-50 flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-500 font-bold uppercase transition-transform group-hover:rotate-12">
            {course.creatorEmail.charAt(0)}
          </div>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
            By: <span className="text-slate-600">{course.creatorEmail.split('@')[0]}</span>
          </p>
        </div>
      )}
    </div>
  );
};

/* ================= ENROLLED STUDENTS MODAL ================= */
interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: CourseDTO | null;
  enrollments: EnrollmentDTO[];
  isLoading: boolean;
}

const EnrolledStudentsModal = ({ isOpen, onClose, course, enrollments, isLoading }: EnrollmentModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl border border-slate-200/60 overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Enrolled Students
                </h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {course?.courseCode} • {course?.courseName}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 bg-white text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Locating Students...</p>
            </div>
          ) : enrollments.length > 0 ? (
            <div className="space-y-4">
              {enrollments.map((enr, idx) => (
                <div
                  key={enr.id || idx}
                  className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-3xl group hover:bg-white hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/50 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-xs font-black text-slate-400 group-hover:text-indigo-600 transition-colors">
                      {enr.studentName?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800 group-hover:text-indigo-600 transition-colors">
                        {enr.studentName}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        ID: {enr.studentCode}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex px-3 py-1 rounded-lg bg-white border border-slate-100 text-[9px] font-black uppercase tracking-wider text-slate-500">
                      {enr.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-sm font-black text-slate-700 tracking-tight">No Enrollments Found</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">There are no students enrolled in this course yet</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 bg-slate-50/80 border-t border-slate-100 flex justify-between items-center">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Total: <span className="text-indigo-600">{enrollments.length}</span> Participating Students
          </p>
          <button
            onClick={onClose}
            className="px-8 py-3 bg-white text-slate-900 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Courses;
