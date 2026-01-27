import { useState, useEffect } from 'react';
import { courseService } from '../../services';
import { CourseDTO, GradingType } from '../../types';
import CreateCourseModal from '../../components/CreateCourseModal';

/**
 * Courses list page component
 * Displays all courses with filtering capabilities
 *
 * @author SPTS Team
 */
const Courses = () => {
  const [courses, setCourses] = useState<CourseDTO[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

  // Get unique departments
  const departments = [...new Set(courses.map((c) => c.department).filter(Boolean))];

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
        course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.courseCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment =
        departmentFilter === 'ALL' || course.department === departmentFilter;

    return matchesSearch && matchesDepartment;
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
              onClick={() => setIsCreateModalOpen(true)}
              className="btn-primary"
          >
            Add Course
          </button>
        </div>

        {/* Create Course Modal */}
        <CreateCourseModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSuccess={() => {
              setIsCreateModalOpen(false);
              loadCourses();
            }}
        />

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
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
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
      </div>
  );
};

// Course Card Component
interface CourseCardProps {
  course: CourseDTO;
}

const CourseCard = ({ course }: CourseCardProps) => {
  return (
      <div className="card hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-3">
        <span className="font-mono text-sm text-primary-600 font-medium">
          {course.courseCode}
        </span>
          <span className="badge bg-slate-100 text-slate-600">
          {course.credits} credits
        </span>
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

          <span className={`badge ${getGradingTypeStyle(course.gradingType)}`}>
          {formatGradingType(course.gradingType)}
        </span>
        </div>

        <div className="mt-4">
          <button className="w-full btn-secondary text-sm">
            View Offerings
          </button>
        </div>
      </div>
  );
};

// Helper functions
const formatGradingType = (type: GradingType): string => {
  switch (type) {
    case GradingType.SCALE_10:
      return 'Scale 10';
    case GradingType.SCALE_4:
      return 'Scale 4';
    case GradingType.PASS_FAIL:
      return 'Pass/Fail';
    default:
      return type;
  }
};

const getGradingTypeStyle = (type: GradingType): string => {
  switch (type) {
    case GradingType.SCALE_10:
      return 'bg-blue-100 text-blue-700';
    case GradingType.SCALE_4:
      return 'bg-purple-100 text-purple-700';
    case GradingType.PASS_FAIL:
      return 'bg-green-100 text-green-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
};

export default Courses;


