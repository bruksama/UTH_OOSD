import { useState, useEffect } from 'react';
import { StudentDTO, StudentStatus } from '../types';

interface StudentModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  student?: StudentDTO | null;
  onClose: () => void;
  onSubmit: (data: StudentDTO) => Promise<void>;
  isLoading?: boolean;
}

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
      setFormData({});
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-slate-900/30 transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto transform transition-all border border-slate-100">
        {/* Header */}
        <div className="border-b border-slate-100 px-8 py-6 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {mode === 'create' ? 'Add New Student' : 'Edit Student'}
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Fill in the details below to {mode === 'create' ? 'register a new' : 'update the'} student record.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-8">

          {/* Section: Personal Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-primary-600 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-px bg-primary-200"></span>
              Personal Information
              <span className="flex-1 h-px bg-slate-100"></span>
            </h3>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="label">First Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName || ''}
                  onChange={handleChange}
                  className={`input ${errors.firstName ? 'ring-2 ring-red-500/50 border-red-500' : ''}`}
                  placeholder="e.g. John"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div>
                <label className="label">Last Name <span className="text-red-500">*</span></label>
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

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="label">Date of Birth <span className="text-red-500">*</span></label>
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
              <div>
                <label className="label">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g. 123 Campus Dr"
                />
              </div>
            </div>
          </div>

          {/* Section: Academic Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-primary-600 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-px bg-primary-200"></span>
              Academic Details
              <span className="flex-1 h-px bg-slate-100"></span>
            </h3>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="label">Student ID <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0c0 .883.393 1.627 1 2.188C8.607 7.627 9 6.883 9 6" /></svg>
                  </span>
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId || ''}
                    onChange={handleChange}
                    className={`input pl-10 ${errors.studentId ? 'ring-2 ring-red-500/50 border-red-500' : ''}`}
                    placeholder="e.g. STU-2024-001"
                    disabled={mode === 'edit'}
                  />
                </div>
                {errors.studentId && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.studentId}</p>
                )}
              </div>

              <div>
                <label className="label">Academic Status</label>
                <select
                  name="status"
                  value={formData.status || StudentStatus.NORMAL}
                  onChange={handleChange}
                  className="input appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%20stroke%3D%22%236b7280%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22M6%208l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat pr-10"
                >
                  <option value={StudentStatus.NORMAL}>Normal Standing</option>
                  <option value={StudentStatus.AT_RISK}>At Risk (Warning)</option>
                  <option value={StudentStatus.PROBATION}>Probation</option>
                  <option value={StudentStatus.GRADUATED}>Alumni / Graduated</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">Major / Program</label>
              <input
                type="text"
                name="major"
                value={formData.major || ''}
                onChange={handleChange}
                className="input"
                placeholder="e.g. Computer Science"
              />
            </div>
          </div>

          {/* Section: Contact */}
          <div className="space-y-4">
             <h3 className="text-sm font-semibold text-primary-600 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-px bg-primary-200"></span>
              Contact Info
              <span className="flex-1 h-px bg-slate-100"></span>
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="label">Email Address <span className="text-red-500">*</span></label>
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
                <label className="label">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber || ''}
                  onChange={handleChange}
                  className="input"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="border-t border-slate-100 px-8 py-5 flex justify-end gap-4 sticky bottom-0 bg-slate-50/80 backdrop-blur rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-white hover:text-slate-900 transition focus:ring-2 focus:ring-slate-200"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-medium shadow-lg shadow-primary-500/30 hover:bg-primary-700 hover:shadow-primary-500/40 transition active:scale-95 focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
            ) : mode === 'create' ? 'Create Student' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentModal;
