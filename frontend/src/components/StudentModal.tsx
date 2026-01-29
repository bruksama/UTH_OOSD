import { useState, useEffect } from 'react';
import { StudentDTO, StudentStatus } from '../types';
import { User, Mail, Calendar, Hash, GraduationCap, Info, X, Loader2, Sparkles } from 'lucide-react';

interface StudentModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  student?: StudentDTO | null;
  onClose: () => void;
  onSubmit: (data: StudentDTO) => Promise<void>;
  isLoading?: boolean;
}

/**
 * Generate a unique student ID
 * Format: STU-YYYY-XXXXX (e.g., STU-2026-00001)
 */
const generateStudentId = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000); // 5-digit random
  return `STU-${year}-${random}`;
};

const StudentModal = ({
  isOpen,
  mode,
  student,
  onClose,
  onSubmit,
  isLoading = false,
}: StudentModalProps) => {
  const [formData, setFormData] = useState<Partial<StudentDTO>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === 'edit' && student) {
      setFormData(student);
    } else {
      // Generate new student ID for create mode
      setFormData({
        studentId: generateStudentId(),
        status: StudentStatus.NORMAL,
      });
    }
    setErrors({});
  }, [mode, student, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName?.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.studentId?.trim()) {
      newErrors.studentId = 'Student ID is required';
    }
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await onSubmit(formData as StudentDTO);
      onClose();
    } catch (err) {
      console.error('Error submitting form:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const regenerateStudentId = () => {
    setFormData((prev) => ({ ...prev, studentId: generateStudentId() }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-slate-900/30 transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto transform transition-all border border-slate-100">
        {/* Header */}
        <div className="border-b border-slate-100 px-8 py-6 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${mode === 'create'
                ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                : 'bg-gradient-to-br from-blue-500 to-indigo-600'} shadow-lg`}>
                {mode === 'create' ? (
                  <User className="h-6 w-6 text-white" />
                ) : (
                  <GraduationCap className="h-6 w-6 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {mode === 'create' ? 'Add New Student' : 'Edit Student'}
                </h2>
                <p className="text-slate-500 text-sm mt-0.5">
                  {mode === 'create'
                    ? 'Register a new student with default password: 123456'
                    : 'Update student information'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">

          {/* Student ID Section */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Hash className="h-5 w-5 text-indigo-600" />
                <label className="font-semibold text-indigo-900">Student ID</label>
              </div>
              {mode === 'create' && (
                <button
                  type="button"
                  onClick={regenerateStudentId}
                  className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                >
                  <Sparkles className="h-4 w-4" />
                  Generate New
                </button>
              )}
            </div>
            <input
              type="text"
              name="studentId"
              value={formData.studentId || ''}
              onChange={handleChange}
              className={`input font-mono text-lg tracking-wide ${errors.studentId ? 'ring-2 ring-red-500/50 border-red-500' : 'border-indigo-200'} ${mode === 'edit' ? 'bg-slate-100 cursor-not-allowed' : ''}`}
              placeholder="STU-2026-00001"
              disabled={mode === 'edit'}
              readOnly={mode === 'create'}
            />
            {errors.studentId && (
              <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                <Info className="w-3 h-3" />
                {errors.studentId}
              </p>
            )}
            {mode === 'create' && (
              <p className="text-xs text-indigo-600 mt-2 flex items-center gap-1">
                <Info className="w-3 h-3" />
                Auto-generated ID. Click "Generate New" for a different one.
              </p>
            )}
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-px bg-slate-200"></span>
              Personal Information
              <span className="flex-1 h-px bg-slate-200"></span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="label flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName || ''}
                  onChange={handleChange}
                  className={`input ${errors.firstName ? 'ring-2 ring-red-500/50 border-red-500' : ''}`}
                  placeholder="e.g. John"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.firstName}</p>
                )}
              </div>
              <div>
                <label className="label flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName || ''}
                  onChange={handleChange}
                  className={`input ${errors.lastName ? 'ring-2 ring-red-500/50 border-red-500' : ''}`}
                  placeholder="e.g. Doe"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="label flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  className={`input ${errors.email ? 'ring-2 ring-red-500/50 border-red-500' : ''}`}
                  placeholder="student@university.edu"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="label flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth || ''}
                  onChange={handleChange}
                  className={`input ${errors.dateOfBirth ? 'ring-2 ring-red-500/50 border-red-500' : ''}`}
                />
                {errors.dateOfBirth && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.dateOfBirth}</p>
                )}
              </div>
            </div>
          </div>

          {/* Info Banner for Create Mode */}
          {mode === 'create' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-800">Account Creation Notice</p>
                <p className="text-amber-700 mt-1">
                  A login account will be created automatically with:
                </p>
                <ul className="text-amber-600 mt-1 space-y-0.5">
                  <li>• <strong>Username:</strong> Student's email address</li>
                  <li>• <strong>Default Password:</strong> <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono">123456</code></li>
                </ul>
                <p className="text-amber-600 mt-1.5 text-xs">
                  Students can change their password after first login.
                </p>
              </div>
            </div>
          )}

          {/* Edit Mode: Read-only Academic Info */}
          {mode === 'edit' && student && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-px bg-slate-200"></span>
                Academic Information
                <span className="flex-1 h-px bg-slate-200"></span>
              </h3>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                  <p className="text-2xl font-bold text-indigo-600">{student.gpa?.toFixed(2) || 'N/A'}</p>
                  <p className="text-xs text-slate-500 mt-1">Current GPA</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                  <p className="text-2xl font-bold text-emerald-600">{student.totalCredits || 0}</p>
                  <p className="text-xs text-slate-500 mt-1">Total Credits</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                  <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${student.status === StudentStatus.NORMAL ? 'bg-green-100 text-green-700' :
                    student.status === StudentStatus.AT_RISK ? 'bg-yellow-100 text-yellow-700' :
                      student.status === StudentStatus.PROBATION ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                    }`}>
                    {student.status?.replace('_', ' ')}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Status</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 text-center">
                * GPA, Credits, and Status are calculated automatically based on enrollment records
              </p>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="border-t border-slate-100 px-8 py-5 flex justify-end gap-4 sticky bottom-0 bg-slate-50/80 backdrop-blur rounded-b-2xl">
          <button
            onClick={onClose}
            type="button"
            className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-white hover:text-slate-900 transition focus:ring-2 focus:ring-slate-200"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            type="button"
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/30 hover:from-indigo-700 hover:to-purple-700 hover:shadow-indigo-500/40 transition active:scale-95 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : mode === 'create' ? (
              <>
                <User className="h-4 w-4" />
                Create Student
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentModal;
