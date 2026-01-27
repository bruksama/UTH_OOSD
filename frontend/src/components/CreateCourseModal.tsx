import { useState } from 'react';
import { CourseDTO, GradingType } from '../types';
import api from '../services/api';

interface CreateCourseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

/**
 * Modal for creating a new course
 *
 * @author SPTS Team
 */
const CreateCourseModal = ({ isOpen, onClose, onSuccess }: CreateCourseModalProps) => {
    const [formData, setFormData] = useState<CourseDTO>({
        courseCode: '',
        courseName: '',
        credits: 3,
        department: '',
        description: '',
        gradingType: GradingType.SCALE_10,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'credits' ? parseInt(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/courses', formData);
            onSuccess();
            onClose();
            setFormData({
                courseCode: '',
                courseName: '',
                credits: 3,
                department: '',
                description: '',
                gradingType: GradingType.SCALE_10,
            });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error creating course');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900">Create New Course</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-700 text-2xl leading-none"
                    >
                        ×
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Course Code */}
                    <div>
                        <label className="label">Course Code *</label>
                        <input
                            type="text"
                            name="courseCode"
                            className="input"
                            placeholder="e.g., CS101"
                            value={formData.courseCode}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    {/* Course Name */}
                    <div>
                        <label className="label">Course Name *</label>
                        <input
                            type="text"
                            name="courseName"
                            className="input"
                            placeholder="e.g., Introduction to Programming"
                            value={formData.courseName}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    {/* Credits */}
                    <div>
                        <label className="label">Credits *</label>
                        <input
                            type="number"
                            name="credits"
                            className="input"
                            min="1"
                            max="12"
                            value={formData.credits}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    {/* Department */}
                    <div>
                        <label className="label">Department</label>
                        <input
                            type="text"
                            name="department"
                            className="input"
                            placeholder="e.g., Computer Science"
                            value={formData.department}
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Grading Type */}
                    <div>
                        <label className="label">Grading Type *</label>
                        <select
                            name="gradingType"
                            className="input"
                            value={formData.gradingType}
                            onChange={handleInputChange}
                        >
                            <option value={GradingType.SCALE_10}>10-Point Scale (Vietnamese)</option>
                            <option value={GradingType.SCALE_4}>4-Point Scale (US)</option>
                            <option value={GradingType.PASS_FAIL}>Pass/Fail</option>
                        </select>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="label">Description</label>
                        <textarea
                            name="description"
                            className="input"
                            placeholder="Course description..."
                            rows={3}
                            value={formData.description}
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Footer */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary flex-1"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary flex-1"
                        >
                            {loading ? 'Creating...' : 'Create Course'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCourseModal;


