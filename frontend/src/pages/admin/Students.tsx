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

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedStudent, setSelectedStudent] = useState<StudentDTO | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
      setError('Failed to connect to student database');
    } finally {
      setLoading(false);
    }
  };

  const isAdminAccount = (student: StudentDTO): boolean => {
    const email = student.email?.toLowerCase() || '';
    const firstName = student.firstName?.toLowerCase() || '';
    return email.includes('admin') || firstName.includes('admin');
  };

  const hasStudentData = (student: StudentDTO): boolean => {
    return (student.gpa !== undefined && student.gpa !== null && student.gpa > 0) ||
      (student.totalCredits !== undefined && student.totalCredits !== null && student.totalCredits > 0);
  };

  const filteredStudents = students
    .filter(student => !isAdminAccount(student))
    .filter((student) => {
      const matchesSearch =
        getStudentFullName(student).toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' || student.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

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
      await fetchStudents();
      setModalOpen(false);
    } catch (err) {
      console.error('Error submitting form:', err);
      alert('Failed to save student record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = async (student: StudentDTO) => {
    if (hasStudentData(student)) {
      setStudentToDelete(student);
      setDeleteMessage(
        `Are you sure you want to delete "${getStudentFullName(student)}"?\n\n` +
        `This student has active academic records. Deleting will permanently remove all enrollments and grade history.`
      );
      setDeleteConfirm(true);
    } else {
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
      alert(`Delete failed: ${err.response?.data?.message || 'Unauthorized action'}`);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    await deleteStudent(studentToDelete);
  };

  const adminCount = students.filter(isAdminAccount).length;
  const displayedCount = filteredStudents.length;
  const totalNonAdmin = students.filter(s => !isAdminAccount(s)).length;

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96">
      <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-slate-500 font-bold animate-pulse uppercase tracking-[0.2em] text-[10px]">Accessing Student Directory...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-96 text-center space-y-6">
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
        <span className="text-4xl text-red-500">⚠️</span>
      </div>
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">{error}</h2>
        <p className="text-slate-500 mt-2">The system encountered an error connecting to the backend services.</p>
      </div>
      <button
        onClick={() => { setError(null); setLoading(true); fetchStudents(); }}
        className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
      >
        Retry connection
      </button>
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="relative">
          <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            Student <span className="text-indigo-600">Directory</span>
          </h1>
          <p className="text-slate-500 font-bold mt-1 uppercase tracking-[0.2em] text-[10px]">Academic Records Management</p>
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-indigo-600 rounded-full" />
        </div>
        <button
          onClick={openCreateModal}
          className="group relative px-8 py-4 bg-indigo-600 text-white rounded-[1.25rem] font-black text-xs uppercase tracking-widest overflow-hidden hover:shadow-2xl hover:shadow-indigo-200 transition-all active:scale-95 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
          Register New Student
        </button>
      </div>

      {/* Modern Filter Card */}
      <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-4 lg:p-6 border border-slate-200/60 shadow-xl shadow-slate-200/40">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 relative group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              className="w-full pl-14 pr-6 py-4 bg-white border-2 border-slate-50 rounded-2xl font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
              placeholder="Search by student name, ID or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="sm:w-64 relative">
            <select
              className="w-full pl-6 pr-10 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 focus:bg-white focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StudentStatus | 'ALL')}
            >
              <option value="ALL">All Status</option>
              <option value={StudentStatus.NORMAL}>Normal Performance</option>
              <option value={StudentStatus.AT_RISK}>At-Risk Warning</option>
              <option value={StudentStatus.PROBATION}>Probation Alert</option>
              <option value={StudentStatus.GRADUATED}>Graduated Status</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100/60 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Student Profile</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">GPA Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Credit Progress</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Performance Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.map((student) => {
                const { label, color } = getStatusDisplay(student);
                return (
                  <tr key={student.id || student.studentId} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-[1.25rem] bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-sm group-hover:scale-110 transition-transform shadow-sm">
                          {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors uppercase text-sm">
                            {getStudentFullName(student)}
                          </p>
                          <p className="text-xs text-slate-400 font-bold">{student.studentId} • {student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`text-lg font-black tracking-tighter ${(student.gpa || 0) >= 3.5 ? 'text-emerald-600' :
                          (student.gpa || 0) >= 2.5 ? 'text-indigo-600' :
                            (student.gpa || 0) >= 2.0 ? 'text-amber-600' : 'text-red-500'
                        }`}>
                        {student.gpa?.toFixed(2) ?? '0.00'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-black text-slate-700">{student.totalCredits ?? 0}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">credits</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`inline-flex px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.05em] border-2 shadow-sm ${color}`}>
                        {label}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(student)}
                          className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-sm"
                          title="Edit Personal Information"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(student)}
                          disabled={deleting}
                          className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all active:scale-95 shadow-sm"
                          title="Permanent Deletion"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden p-4 space-y-4">
          {filteredStudents.map((student) => {
            const { label, color } = getStatusDisplay(student);
            return (
              <div key={student.id || student.studentId} className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 flex flex-col gap-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center text-indigo-600 font-black text-sm">
                      {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-slate-800 text-sm uppercase tracking-tight">{getStudentFullName(student)}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{student.studentId}</p>
                    </div>
                  </div>
                  <span className={`inline-flex px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border-2 ${color}`}>
                    {label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">GPA</p>
                    <p className={`text-xl font-black ${(student.gpa || 0) >= 3.5 ? 'text-emerald-500' : (student.gpa || 0) >= 2.0 ? 'text-indigo-600' : 'text-red-500'}`}>
                      {student.gpa?.toFixed(2) ?? '0.00'}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Credits</p>
                    <p className="text-xl font-black text-slate-700">{student.totalCredits ?? 0}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(student)}
                    className="flex-1 py-4 bg-indigo-50 text-indigo-700 rounded-2xl text-[10px] font-black uppercase tracking-widest active:bg-indigo-100 transition-colors"
                  >
                    Edit Record
                  </button>
                  <button
                    onClick={() => handleDeleteClick(student)}
                    disabled={deleting}
                    className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center active:bg-red-100 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredStudents.length === 0 && (
          <div className="px-8 py-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl text-slate-300">🔍</span>
            </div>
            <p className="text-xl font-black text-slate-800 tracking-tight">Access Directory Failed</p>
            <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-[10px]">No matches found for your search parameters</p>
          </div>
        )}
      </div>

      {/* Modern Status Tracking */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-100/50 p-6 rounded-[2rem] gap-4">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Showing <span className="text-slate-900">{displayedCount}</span> of <span className="text-slate-900">{totalNonAdmin}</span> indexed records
          </p>
        </div>
        {adminCount > 0 && (
          <div className="px-4 py-1.5 bg-white rounded-full border border-slate-200 shadow-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-slate-300 animate-pulse" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Security: {adminCount} root instance{adminCount > 1 ? 's' : ''} masked
            </span>
          </div>
        )}
      </div>

      {/* Modals Container */}
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
          title="⚠️ PERMANENT DESTRUCTION"
          message={deleteMessage}
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setDeleteConfirm(false);
            setStudentToDelete(null);
          }}
          confirmText={deleting ? 'EXECUTING...' : 'CONFIRM DELETION'}
          cancelText="HALT"
          isDangerous={true}
        />
      </>
    </div>
  );
};

export default Students;
