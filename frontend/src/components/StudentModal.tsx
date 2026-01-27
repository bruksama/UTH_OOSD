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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="border-b px-6 py-4 sticky top-0 bg-white">
            <h2 className="text-2xl font-semibold text-slate-900">
              {mode === 'create' ? 'Add Student' : 'Edit Student'}
            </h2>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
            {/* Row 1 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First Name *</label>
                <input
                    type="text"
                    name="firstName"
                    value={formData.firstName || ''}
                    onChange={handleChange}
                    className={`input ${errors.firstName ? 'border-red-500' : ''}`}
                    placeholder="John"
                />
                {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                )}
              </div>
              <div>
                <label className="label">Last Name *</label>
                <input
                    type="text"
                    name="lastName"
                    value={formData.lastName || ''}
                    onChange={handleChange}
                    className={`input ${errors.lastName ? 'border-red-500' : ''}`}
                    placeholder="Doe"
                />
                {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Student ID *</label>
                <input
                    type="text"
                    name="studentId"
                    value={formData.studentId || ''}
                    onChange={handleChange}
                    className={`input ${errors.studentId ? 'border-red-500' : ''}`}
                    placeholder="STU001"
                    disabled={mode === 'edit'}
                />
                {errors.studentId && (
                    <p className="text-red-500 text-sm mt-1">{errors.studentId}</p>
                )}
              </div>
              <div>
                <label className="label">Email *</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                    className={`input ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="john@example.com"
                />
                {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Date of Birth *</label>
                <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth || ''}
                    onChange={handleChange}
                    className={`input ${errors.dateOfBirth ? 'border-red-500' : ''}`}
                />
                {errors.dateOfBirth && (
                    <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>
                )}
              </div>
              <div>
                <label className="label">Status</label>
                <select
                    name="status"
                    value={formData.status || StudentStatus.NORMAL}
                    onChange={handleChange}
                    className="input"
                >
                  <option value={StudentStatus.NORMAL}>Normal</option>
                  <option value={StudentStatus.AT_RISK}>At Risk</option>
                  <option value={StudentStatus.PROBATION}>Probation</option>
                  <option value={StudentStatus.GRADUATED}>Graduated</option>
                </select>
              </div>
            </div>

            {/* Enrollment Date */}
            <div>
              <label className="label">Enrollment Date</label>
              <input
                  type="date"
                  name="enrollmentDate"
                  value={formData.enrollmentDate || ''}
                  onChange={handleChange}
                  className="input"
              />
            </div>
          </form>

          {/* Footer */}
          <div className="border-t px-6 py-4 flex justify-end gap-3 sticky bottom-0 bg-white">
            <button
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded hover:bg-slate-50 transition"
                disabled={isLoading}
            >
              Cancel
            </button>
            <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
                disabled={isLoading}
            >
              {isLoading ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
            </button>
          </div>
        </div>
      </div>
  );
};

export default StudentModal;


