import { useState, useEffect } from 'react';
import { StudentDTO, CourseOfferingDTO, EnrollmentStatus } from '../types';
import { enrollmentService } from '../services';
import api from '../services/api';

interface EnrollStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

/**
 * Modal for enrolling a student in a course offering
 *
 * @author SPTS Team
 */
const EnrollStudentModal = ({ isOpen, onClose, onSuccess }: EnrollStudentModalProps) => {
    const [students, setStudents] = useState<StudentDTO[]>([]);
    const [courseOfferings, setCourseOfferings] = useState<CourseOfferingDTO[]>([]);
    const [selectedStudentId, setSelectedStudentId] = useState<number | ''>('');
    const [selectedOfferingId, setSelectedOfferingId] = useState<number | ''>('');
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (isOpen) {
            loadData();
        }
    }, [isOpen]);

    const loadData = async () => {
        try {
            setLoadingData(true);
            const [studentsRes, offeringsRes] = await Promise.all([
                api.get<StudentDTO[]>('/students'),
                api.get<CourseOfferingDTO[]>('/course-offerings'),
            ]);
            setStudents(studentsRes.data);
            setCourseOfferings(offeringsRes.data);
        } catch (err) {
            console.error('Error loading data:', err);
            setError('Failed to load students and course offerings');
        } finally {
            setLoadingData(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!selectedStudentId || !selectedOfferingId) {
            setError('Please select both student and course offering');
            return;
        }

        setLoading(true);

        try {
            await enrollmentService.create({
                studentId: selectedStudentId as number,
                courseOfferingId: selectedOfferingId as number,
                status: EnrollmentStatus.IN_PROGRESS,
            });
            onSuccess();
            onClose();
            setSelectedStudentId('');
            setSelectedOfferingId('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error enrolling student');
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
                    <h2 className="text-xl font-bold text-slate-900">Enroll Student</h2>
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

                    {loadingData ? (
                        <div className="text-center py-4 text-slate-500">Loading...</div>
                    ) : (
                        <>
                            {/* Select Student */}
                            <div>
                                <label className="label">Select Student *</label>
                                <select
                                    className="input"
                                    value={selectedStudentId}
                                    onChange={(e) => setSelectedStudentId(e.target.value ? Number(e.target.value) : '')}
                                    required
                                >
                                    <option value="">-- Choose a student --</option>
                                    {students.map((student) => (
                                        <option key={student.id} value={student.id}>
                                            {student.studentId} - {student.firstName} {student.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Select Course Offering */}
                            <div>
                                <label className="label">Select Course *</label>
                                <select
                                    className="input"
                                    value={selectedOfferingId}
                                    onChange={(e) => setSelectedOfferingId(e.target.value ? Number(e.target.value) : '')}
                                    required
                                >
                                    <option value="">-- Choose a course offering --</option>
                                    {courseOfferings.map((offering) => (
                                        <option key={offering.id} value={offering.id}>
                                            {offering.courseCode} - {offering.courseName} ({offering.semester} {offering.academicYear})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Display selected student info */}
                            {selectedStudentId && (
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-slate-700">
                                    <strong>Student:</strong>{' '}
                                    {students.find((s) => s.id === selectedStudentId)?.firstName}{' '}
                                    {students.find((s) => s.id === selectedStudentId)?.lastName}
                                </div>
                            )}

                            {/* Display selected offering info */}
                            {selectedOfferingId && (
                                <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-slate-700">
                                    <strong>Course:</strong>{' '}
                                    {courseOfferings.find((o) => o.id === selectedOfferingId)?.courseCode} -{' '}
                                    {courseOfferings.find((o) => o.id === selectedOfferingId)?.courseName}
                                </div>
                            )}
                        </>
                    )}

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
                            disabled={loading || loadingData}
                            className="btn-primary flex-1"
                        >
                            {loading ? 'Enrolling...' : 'Enroll'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EnrollStudentModal;



