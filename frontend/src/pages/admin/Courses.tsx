import { useState, useEffect } from 'react';
import { courseService } from '../../services';
import { CourseDTO, ApprovalStatus } from '../../types';
import CourseProposalModal from '../../components/CourseProposalModal';
import { useAuth } from '../../contexts/AuthContext';

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
      // Admin created courses are APPROVED by default
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

  // Get unique departments
  const departments = [...new Set(courses.map((c) => c.department).filter(Boolean))];

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.courseCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment =
      departmentFilter === 'ALL' || course.department === departmentFilter;

    const matchesStatus = statusFilter === 'ALL'
      ? course.status !== ApprovalStatus.REJECTED // Hide REJECTED by default in 'ALL' view
      : course.status === statusFilter;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Courses</h1>
          <p className="text-slate-600">Manage course catalog and offerings</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
        >
          Add Course
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <label className="label">Search</label>
            <input
              type="text"
              className="input"
              placeholder="Search by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Department Filter */}
          <div className="sm:w-48">
            <label className="label">Department</label>
            <select
              className="input"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="ALL">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:w-48">
            <label className="label">Status</label>
            <select
              className="input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="ALL">All Status</option>
              <option value={ApprovalStatus.APPROVED}>Active (Approved)</option>
              <option value={ApprovalStatus.PENDING}>Pending Approval</option>
              <option value={ApprovalStatus.REJECTED}>Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onApprove={handleApprove}
            onReject={handleReject}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500">No courses found matching your criteria.</p>
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-slate-500">
        Showing {filteredCourses.length} of {courses.length} courses
      </div>

      <CourseProposalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateCourse}
        isLoading={isSubmitting}
        existingDepartments={departments as string[]}
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
}

const CourseCard = ({ course, onApprove, onReject, onDelete }: CourseCardProps) => {
  const isPending = course.status === ApprovalStatus.PENDING;
  const isRejected = course.status === ApprovalStatus.REJECTED;

  return (
    <div className={`card hover:shadow-md transition-shadow ${isPending ? 'border-amber-200 bg-amber-50/10' :
      isRejected ? 'border-red-200 bg-red-50/10' : ''
      }`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-primary-600 font-medium">
            {course.courseCode}
          </span>
          {isPending && (
            <span className="bg-amber-100 text-amber-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
              Pending Proposal
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="badge bg-slate-100 text-slate-600">
            {course.credits} credits
          </span>
          <button
            onClick={() => course.id && onDelete(course.id)}
            className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Course"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-slate-900 mb-2">
        {course.courseName}
      </h3>

      {course.description && (
        <p className="text-sm text-slate-600 mb-4 line-clamp-2">
          {course.description}
        </p>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="flex items-center">
          <svg
            className="w-4 h-4 text-slate-400 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <span className="text-sm text-slate-500">{course.department}</span>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        {isPending ? (
          <>
            <button
              onClick={() => course.id && onApprove(course.id)}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
            >
              Approve
            </button>
            <button
              onClick={() => course.id && onReject(course.id)}
              className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition"
            >
              Reject
            </button>
          </>
        ) : (
          <button className="w-full btn-secondary text-sm">
            View Offerings
          </button>
        )}
      </div>
      {course.creatorEmail && (
        <p className="mt-2 text-[10px] text-slate-400 italic">
          Proposed by: {course.creatorEmail}
        </p>
      )}
    </div>
  );
};

export default Courses;
