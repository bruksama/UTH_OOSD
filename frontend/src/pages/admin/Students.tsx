import { useEffect, useState } from 'react';
import { getStatusColor } from '../../utils/helpers';
import { fetchStudents } from '../../services/student.api';
import { StudentDTO, StudentStatus } from '../../types';

const formatStatus = (status: StudentStatus) =>
    status.replace('_', ' ');

const Students = () => {
  const [students, setStudents] = useState<StudentDTO[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StudentStatus | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchStudents();
      setStudents(data);
    } catch {
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const filteredStudents = students.filter((s) => {
    const matchSearch =
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus =
        statusFilter === 'ALL' || s.status === statusFilter;

    return matchSearch && matchStatus;
  });

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Loading...</div>;
  }

  if (error) {
    return (
        <div className="text-center py-20">
          <p className="text-red-500 mb-4">{error}</p>
          <button className="btn-primary" onClick={loadStudents}>Retry</button>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Students</h1>
            <p className="text-slate-600">Manage student information</p>
          </div>

          <div className="flex gap-2">
            <button className="btn-outline" onClick={loadStudents}>Refresh</button>
            <button className="btn-primary">Add Student</button>
          </div>
        </div>

        {/* Filter */}
        <div className="card flex gap-4">
          <input
              className="input"
              placeholder="Search name, ID, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
              className="input w-48"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="ALL">All Status</option>
            {Object.values(StudentStatus).map((s) => (
                <option key={s} value={s}>{formatStatus(s)}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="card p-0 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3 text-center">GPA</th>
              <th className="px-6 py-3 text-center">Credits</th>
              <th className="px-6 py-3 text-center">Status</th>
            </tr>
            </thead>

            <tbody className="divide-y">
            {filteredStudents.map((s) => (
                <tr key={s.studentId} className="hover:bg-slate-50">
                  <td className="px-6 py-4">{s.firstName} {s.lastName}</td>
                  <td className="px-6 py-4">{s.studentId}</td>
                  <td className="px-6 py-4">{s.email}</td>
                  <td className="px-6 py-4 text-center">{s.gpa?.toFixed(2) ?? '—'}</td>
                  <td className="px-6 py-4 text-center">{s.totalCredits}</td>
                  <td className="px-6 py-4 text-center">
                  <span className={getStatusColor(s.status)}>
                    {formatStatus(s.status)}
                  </span>
                  </td>
                </tr>
            ))}
            </tbody>
          </table>

          {filteredStudents.length === 0 && (
              <div className="text-center py-10 text-slate-500">
                No students found
              </div>
          )}
        </div>

        <div className="text-sm text-slate-500">
          Showing {filteredStudents.length} / {students.length} students
        </div>
      </div>
  );
};

export default Students;
