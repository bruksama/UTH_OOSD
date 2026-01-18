import { useEffect, useState } from 'react';
import { getStatusColor, getStudentFullName } from '../data/mockData';
import { fetchStudents } from '../services/student.api';
import { StudentDTO, StudentStatus } from '../types';

/**
 * Students list page component
 * Displays all students with filtering and search capabilities
 *
 * @author SPTS Team
 */
const Students = () => {
  const [students, setStudents] = useState<StudentDTO[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StudentStatus | 'ALL'>('ALL');

  useEffect(() => {
    fetchStudents().then(setStudents);
  }, []);

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
        getStudentFullName(student).toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
        statusFilter === 'ALL' || student.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Students</h1>
            <p className="text-slate-600">Manage and monitor student performance</p>
          </div>
          <button className="btn-primary">Add Student</button>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="label">Search</label>
              <input
                  className="input"
                  placeholder="Search by name, ID, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="sm:w-48">
              <label className="label">Status</label>
              <select
                  className="input"
                  value={statusFilter}
                  onChange={(e) =>
                      setStatusFilter(e.target.value as StudentStatus | 'ALL')
                  }
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

        {/* Table */}
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left">Student</th>
                <th className="px-6 py-4 text-left">Student ID</th>
                <th className="px-6 py-4 text-left">Email</th>
                <th className="px-6 py-4 text-center">GPA</th>
                <th className="px-6 py-4 text-center">Credits</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
              </thead>
              <tbody className="divide-y">
              {filteredStudents.map((student) => (
                  <tr key={student.studentId} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      {student.firstName} {student.lastName}
                    </td>
                    <td className="px-6 py-4">{student.studentId}</td>
                    <td className="px-6 py-4">{student.email}</td>
                    <td className="px-6 py-4 text-center">
                      {student.gpa?.toFixed(2) ?? 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {student.totalCredits}
                    </td>
                    <td className="px-6 py-4 text-center">
                    <span className={getStatusColor(student.status)}>
                      {student.status}
                    </span>
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>

          {filteredStudents.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                No students found.
              </div>
          )}
        </div>

        <div className="text-sm text-slate-500">
          Showing {filteredStudents.length} of {students.length} students
        </div>
      </div>
  );
};

export default Students;
