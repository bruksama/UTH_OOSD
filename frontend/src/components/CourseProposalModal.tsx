import { useState, useEffect } from 'react';
import { CourseDTO, GradingType, ApprovalStatus } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface CourseProposalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CourseDTO) => Promise<void>;
    isLoading?: boolean;
    existingDepartments: string[];
}

const CourseProposalModal = ({
    isOpen,
    onClose,
    onSubmit,
    isLoading = false,
    existingDepartments,
}: CourseProposalModalProps) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState<Partial<CourseDTO>>({
        gradingType: GradingType.SCALE_10, // Default but hidden from UI
        credits: 3,
        department: existingDepartments[0] || '',
    });
    const [isAddingNewDept, setIsAddingNewDept] = useState(false);
    const [newDeptName, setNewDeptName] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Helper to generate a Course Code based on Department
    const generateCourseCode = (dept: string, courseName: string): string => {
        if (!dept) return 'NEW-0000';

        // Systematic rule: Take first 3 letters of the department (normalized)
        const cleanDept = dept.trim().toUpperCase().replace(/[^A-Z]/g, '');
        const prefix = cleanDept.substring(0, 3).padEnd(3, 'X');

        // Generate 4 digits based on course name hash to keep it stable but unique-ish
        const nameSeed = courseName || '';
        let hash = 0;
        for (let i = 0; i < nameSeed.length; i++) {
            hash = ((hash << 5) - hash) + nameSeed.charCodeAt(i);
            hash |= 0;
        }
        const seed = Math.abs(hash) % 9000 + 1000; // Force 4 digits (1000-9999)

        return `${prefix}${seed}`;
    };

    // Auto-generate course code when department OR course name changes
    useEffect(() => {
        const dept = isAddingNewDept ? newDeptName : (formData.department || '');
        if (dept && formData.courseName) {
            setFormData(prev => ({
                ...prev,
                courseCode: generateCourseCode(dept, formData.courseName || '')
            }));
        }
    }, [formData.department, isAddingNewDept, newDeptName, formData.courseName]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.courseName?.trim()) {
            newErrors.courseName = 'Course name is required';
        }
        if (!formData.credits || formData.credits < 1) {
            newErrors.credits = 'Credits must be at least 1';
        }

        const dept = isAddingNewDept ? newDeptName : formData.department;
        if (!dept?.trim()) {
            newErrors.department = 'Department is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        const finalDept = isAddingNewDept ? newDeptName : formData.department;

        try {
            await onSubmit({
                ...formData,
                department: finalDept,
                status: ApprovalStatus.PENDING,
                creatorEmail: user?.email,
            } as CourseDTO);

            // Cleanup
            setNewDeptName('');
            setIsAddingNewDept(false);
            onClose();
        } catch (err) {
            console.error('Error submitting proposal:', err);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === 'department' && value === '__ADD_NEW__') {
            setIsAddingNewDept(true);
            return;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: name === 'credits' ? parseInt(value) : value
        }));

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
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-slate-900/30">
            <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-slate-100">
                {/* Header */}
                <div className="border-b border-slate-100 px-8 py-6 sticky top-0 bg-white z-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Propose New Course</h2>
                            <p className="text-slate-500 text-sm mt-1">Submit a new course for admin approval.</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
                    <div>
                        <label className="label">Course Name *</label>
                        <input
                            name="courseName"
                            value={formData.courseName || ''}
                            onChange={handleChange}
                            className={`input ${errors.courseName ? 'border-red-500' : ''}`}
                            placeholder="e.g. Introduction to Programming"
                        />
                        {errors.courseName && <p className="text-red-500 text-xs mt-1">{errors.courseName}</p>}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                            <label className="label">Category / Department *</label>
                            {!isAddingNewDept ? (
                                <div className="space-y-2">
                                    <select
                                        name="department"
                                        value={formData.department || ''}
                                        onChange={handleChange}
                                        className={`input ${errors.department ? 'border-red-500' : ''}`}
                                    >
                                        <option value="" disabled>Select a category</option>
                                        {existingDepartments.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                        <option value="__ADD_NEW__">+ Add New Category...</option>
                                    </select>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={newDeptName}
                                            onChange={(e) => setNewDeptName(e.target.value)}
                                            className={`input ${errors.department ? 'border-red-500' : ''}`}
                                            placeholder="Enter new category name..."
                                            autoFocus
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingNewDept(false)}
                                        className="px-3 text-slate-500 hover:text-slate-700 text-sm font-medium"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                            {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
                        </div>

                        <div>
                            <label className="label">Credits *</label>
                            <input
                                type="number"
                                name="credits"
                                value={formData.credits || ''}
                                onChange={handleChange}
                                className={`input ${errors.credits ? 'border-red-500' : ''}`}
                                min="1"
                                max="12"
                            />
                            {errors.credits && <p className="text-red-500 text-xs mt-1">{errors.credits}</p>}
                        </div>
                    </div>

                    {user?.role === 'admin' && (
                        <div>
                            <label className="label">Course ID (Auto-generated)</label>
                            <input
                                name="courseCode"
                                value={formData.courseCode || ''}
                                readOnly
                                className="input bg-slate-50 text-slate-500 cursor-not-allowed font-mono"
                            />
                        </div>
                    )}

                    <div>
                        <label className="label">Description</label>
                        <textarea
                            name="description"
                            value={formData.description || ''}
                            onChange={handleChange}
                            className="input min-h-[100px] py-3 text-sm"
                            placeholder="Brief course description..."
                        />
                    </div>

                </form>

                {/* Footer */}
                <div className="border-t border-slate-100 px-8 py-5 flex justify-end gap-3 bg-slate-50/80">
                    <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition" disabled={isLoading}>
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition active:scale-95 disabled:opacity-50"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Submitting...' : 'Submit Proposal'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CourseProposalModal;
