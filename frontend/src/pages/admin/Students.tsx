import { useEffect, useState } from 'react';
import { getStudentFullName, getStatusDisplay } from '../../utils/helpers';
import { studentService } from '../../services';
import { StudentDTO, StudentStatus } from '../../types';
import StudentModal from '../../components/StudentModal';
import ConfirmDialog from '../../components/ConfirmDialog';

/**
 * Students list page component
 * Displays all students with filtering and search capabilities
 * 
 * Features:
 * - Hides admin accounts (email contains 'admin')
 * - Smart delete: confirms only for students with data (enrollments)
 * - Direct delete for new students without data
 *
 * @author SPTS Team
 */
const Students = () => {
  const [students, setStudents] = useState<StudentDTO[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StudentStatus | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedStudent, setSelectedStudent] = useState<StudentDTO | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete states
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<StudentDTO | null>(null);
  const [deleteMessage, setDeleteMessage] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await studentService.getAll();
      setStudents(response.data);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  // Helper: Check if student is an admin account
  const isAdminAccount = (student: StudentDTO): boolean => {
    const email = student.email?.toLowerCase() || '';
    const firstName = student.firstName?.toLowerCase() || '';
    return email.includes('admin') || firstName.includes('admin');
  };

  // Helper: Check if student has data (enrollments, GPA > 0, or credits > 0)
  const hasStudentData = (student: StudentDTO): boolean => {
    return (student.gpa !== undefined && student.gpa !== null && student.gpa > 0) ||
      (student.totalCredits !== undefined && student.totalCredits !== null && student.totalCredits > 0);
  };

  // Filter students: exclude admins and apply search/status filters
  const filteredStudents = students
    .filter(student => !isAdminAccount(student)) // Hide admin accounts
    .filter((student) => {
      const matchesSearch =
        getStudentFullName(student).toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' || student.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

  // Modal handlers
  const openCreateModal = () => {
    setModalMode('create');
    setSelectedStudent(null);
    setModalOpen(true);
  };

  const openEditModal = (student: StudentDTO) => {
    setModalMode('edit');
    setSelectedStudent(student);
    setModalOpen(true);
  };

  const handleModalSubmit = async (formData: StudentDTO) => {
    setSubmitting(true);
    try {
      if (modalMode === 'create') {
        await studentService.create(formData);
      } else {
        await studentService.update(formData.id!, formData);
      }
      // Refresh students list
      await fetchStudents();
      setModalOpen(false);
    } catch (err) {
      console.error('Error submitting form:', err);
      alert('Failed to save student');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete handlers
  const handleDeleteClick = async (student: StudentDTO) => {
    // Check if student has data - if yes, show confirmation
    if (hasStudentData(student)) {
      setStudentToDelete(student);
      setDeleteMessage(
        `Are you sure you want to delete "${getStudentFullName(student)}"?\n\n` +
        `⚠️ This student has:\n` +
        `- GPA: ${student.gpa?.toFixed(2) || '0.00'}\n` +
        `- Credits: ${student.totalCredits || 0}\n\n` +
        `All enrollment records and grades will be permanently deleted. This action cannot be undone.`
      );
      setDeleteConfirm(true);
    } else {
      // New student without data - delete directly without confirmation
      await deleteStudent(student);
    }
  };

  const deleteStudent = async (student: StudentDTO) => {
    setDeleting(true);
    try {
      await studentService.delete(student.id!);
      setStudents(prev => prev.filter(s => s.id !== student.id));
      setDeleteConfirm(false);
      setStudentToDelete(null);
    } catch (err: any) {
      console.error('Error deleting student:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to delete student';
      alert(`Delete failed: ${errorMsg}`);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    await deleteStudent(studentToDelete);
  };

  // Count of hidden admin accounts
  const adminCount = students.filter(isAdminAccount).length;
  const displayedCount = filteredStudents.length;
  const totalNonAdmin = students.filter(s => !isAdminAccount(s)).length;

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
    </div>
  );

  if (error) return (
    <div className="p-6 text-center">
      <div className="text-red-500 text-lg mb-4">⚠️ {error}</div>
      <button onClick={() => { setError(null); setLoading(true); fetchStudents(); }} className="btn-primary">
        Retry
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Students</h1>
          <p className="text-slate-600">Manage and monitor student performance</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary">
          ➕ Add Student
        </button>
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Student</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Student ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Email</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-600">GPA</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-600">Credits</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-600">Status</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredStudents.map((student) => {
                const hasData = hasStudentData(student);
                return (
                  <tr key={student.id || student.studentId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium text-sm">
                          {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{getStudentFullName(student)}</p>
                          {!hasData && (
                            <span className="text-xs text-slate-400">New student</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-slate-600">{student.studentId}</td>
                    <td className="px-6 py-4">
                      <a href={`mailto:${student.email}`} className="text-indigo-600 hover:text-indigo-800 hover:underline">
                        {student.email}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`font-medium ${(student.gpa || 0) >= 3.5 ? 'text-green-600' :
                        (student.gpa || 0) >= 2.5 ? 'text-blue-600' :
                          (student.gpa || 0) >= 2.0 ? 'text-yellow-600' :
                            'text-red-600'
                        }`}>
                        {student.gpa?.toFixed(2) ?? '0.00'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-600">
                      {student.totalCredits ?? 0}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {(() => {
                        const { label, color } = getStatusDisplay(student);
                        return <span className={color}>{label}</span>;
                      })()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => openEditModal(student)}
                          className="px-3 py-1 rounded-md text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(student)}
                          disabled={deleting}
                          className="px-3 py-1 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          {deleting ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-4xl mb-2">🔍</p>
            <p className="text-slate-500">No students found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex justify-between items-center text-sm text-slate-500">
        <span>Showing {displayedCount} of {totalNonAdmin} students</span>
        {adminCount > 0 && (
          <span className="text-slate-400 italic">
            ({adminCount} admin account{adminCount > 1 ? 's' : ''} hidden)
          </span>
        )}
      </div>

      {/* Modals */}
      <>
        <StudentModal
          isOpen={modalOpen}
          mode={modalMode}
          student={selectedStudent}
          onClose={() => setModalOpen(false)}
          onSubmit={handleModalSubmit}
          isLoading={submitting}
        />

        <ConfirmDialog
          isOpen={deleteConfirm}
          title="⚠️ Delete Student"
          message={deleteMessage}
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setDeleteConfirm(false);
            setStudentToDelete(null);
          }}
          confirmText={deleting ? 'Deleting...' : 'Delete Permanently'}
          cancelText="Cancel"
          isDangerous={true}
        />
      </>
    </div>
  );
};

export default Students;
