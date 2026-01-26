import { useEffect, useState } from 'react';
import { getStatusColor, getStudentFullName } from '../../utils/helpers';
import { studentService } from '../../services';
import { StudentDTO, StudentStatus } from '../../types';
import StudentModal from '../../components/StudentModal';
import ConfirmDialog from '../../components/ConfirmDialog';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedStudent, setSelectedStudent] = useState<StudentDTO | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<StudentDTO | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
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
    fetchStudents();
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
      const response = await studentService.getAll();
      setStudents(response.data);
    } catch (err) {
      console.error('Error submitting form:', err);
      alert('Failed to save student');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete handlers
  const openDeleteConfirm = (student: StudentDTO) => {
    setStudentToDelete(student);
    setDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!studentToDelete) return;
    
    setDeleting(true);
    try {
      await studentService.delete(studentToDelete.id!);
      setStudents(students.filter(s => s.id !== studentToDelete.id));
      setDeleteConfirm(false);
      setStudentToDelete(null);
    } catch (err) {
      console.error('Error deleting student:', err);
      alert('Failed to delete student');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-red-500 py-8">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Students</h1>
          <p className="text-slate-600">Manage and monitor student performance</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary">
          Add Student
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
                <th className="px-6 py-4 text-left">Student</th>
                <th className="px-6 py-4 text-left">Student ID</th>
                <th className="px-6 py-4 text-left">Email</th>
                <th className="px-6 py-4 text-center">GPA</th>
                <th className="px-6 py-4 text-center">Credits</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
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
                  <td className="px-6 py-4 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => openEditModal(student)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteConfirm(student)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="px-6 py-8 text-center text-slate-500">
            No students found.
          </div>
        ) : null}
      </div>

      <div className="text-sm text-slate-500">
        Showing {filteredStudents.length} of {students.length} students
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
          title="Delete Student"
          message={`Are you sure you want to delete ${studentToDelete?.firstName} ${studentToDelete?.lastName}? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => {
            setDeleteConfirm(false);
            setStudentToDelete(null);
          }}
          confirmText="Delete"
          cancelText="Cancel"
          isDangerous={true}
        />
      </>
    </div>
  );
};

export default Students;
