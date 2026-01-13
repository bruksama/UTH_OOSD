import { useState } from 'react';
import { mockStudents, getStatusColor, getStudentFullName } from '../data/mockData';
import { StudentDTO, StudentStatus } from '../types';

/**
 * Students list page component
 * Displays all students with filtering and search capabilities
 * 
 * @author SPTS Team
 */
const Students = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StudentStatus | 'ALL'>('ALL');

  const filteredStudents = mockStudents.filter((student) => {
    const matchesSearch =
      getStudentFullName(student).toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || student.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Students</h1>
          <p className="text-slate-600">Manage and monitor student performance</p>
        </div>
        <button className="btn-primary">
          Add Student
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
              placeholder="Search by name, ID, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="sm:w-48">
            <label className="label">Status</label>
            <select
              className="input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StudentStatus | 'ALL')}
            >
              <option value="ALL">All Status</option>
              <option value={StudentStatus.NORMAL}>Normal</option>
              <option value={StudentStatus.AT_RISK}>At Risk</option>
              <option value={StudentStatus.PROBATION}>Probation</option>
              <option value={StudentStatus.GRADUATED}>Graduated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                  Student
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                  Student ID
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                  Email
                </th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-slate-600">
                  GPA
                </th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-slate-600">
                  Credits
                </th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-slate-600">
                  Status
                </th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredStudents.map((student) => (
                <StudentRow key={student.id} student={student} />
              ))}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">No students found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="text-sm text-slate-500">
        Showing {filteredStudents.length} of {mockStudents.length} students
      </div>
    </div>
  );
};

// Student Row Component
interface StudentRowProps {
  student: StudentDTO;
}

const StudentRow = ({ student }: StudentRowProps) => {
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-primary-600 font-medium">
              {student.firstName[0]}{student.lastName[0]}
            </span>
          </div>
          <div>
            <p className="font-medium text-slate-900">
              {student.firstName} {student.lastName}
            </p>
            <p className="text-sm text-slate-500">
              Enrolled: {student.enrollmentDate}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="font-mono text-sm text-slate-700">{student.studentId}</span>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-slate-600">{student.email}</span>
      </td>
      <td className="px-6 py-4 text-center">
        <span className={`font-semibold ${getGpaColor(student.gpa || 0)}`}>
          {student.gpa?.toFixed(2) || 'N/A'}
        </span>
      </td>
      <td className="px-6 py-4 text-center">
        <span className="text-slate-700">{student.totalCredits || 0}</span>
      </td>
      <td className="px-6 py-4 text-center">
        <span className={getStatusColor(student.status)}>
          {formatStatus(student.status)}
        </span>
      </td>
      <td className="px-6 py-4 text-center">
        <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
          View Details
        </button>
      </td>
    </tr>
  );
};

// Helper functions
const getGpaColor = (gpa: number): string => {
  if (gpa >= 3.5) return 'text-green-600';
  if (gpa >= 2.0) return 'text-slate-700';
  if (gpa >= 1.5) return 'text-yellow-600';
  return 'text-red-600';
};

const formatStatus = (status: StudentStatus): string => {
  switch (status) {
    case StudentStatus.AT_RISK:
      return 'At Risk';
    case StudentStatus.PROBATION:
      return 'Probation';
    case StudentStatus.GRADUATED:
      return 'Graduated';
    default:
      return 'Normal';
  }
};

export default Students;
