import { useState, useEffect } from 'react';
import { EnrollmentDTO, EnrollmentStatus } from '../types';
import { enrollmentService } from '../services';

interface GradeEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

/**
 * Modal for entering grades for student enrollments
 *
 * @author SPTS Team
 */
const GradeEntryModal = ({ isOpen, onClose, onSuccess }: GradeEntryModalProps) => {
    const [enrollments, setEnrollments] = useState<EnrollmentDTO[]>([]);
    const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<number | ''>('');
    const [finalScore, setFinalScore] = useState<number | ''>('');
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string>('');

    const selectedEnrollment = enrollments.find((e) => e.id === selectedEnrollmentId);

    useEffect(() => {
        if (isOpen) {
            loadEnrollments();
        }
    }, [isOpen]);

    const loadEnrollments = async () => {
        try {
            setLoadingData(true);
            const response = await enrollmentService.getAll();
            // Filter to show only IN_PROGRESS enrollments
            const inProgressEnrollments = response.data.filter(
                (e) => e.status === EnrollmentStatus.IN_PROGRESS || (e.status === EnrollmentStatus.COMPLETED && !e.finalScore)
            );
            setEnrollments(inProgressEnrollments);
        } catch (err) {
            console.error('Error loading enrollments:', err);
            setError('Failed to load enrollments');
        } finally {
            setLoadingData(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!selectedEnrollmentId || finalScore === '') {
            setError('Please select an enrollment and enter a final score');
            return;
        }

        const scoreNum = Number(finalScore);
        if (scoreNum < 0 || scoreNum > 10) {
            setError('Final score must be between 0 and 10');
            return;
        }

        setLoading(true);

        try {
            await enrollmentService.completeWithStrategy(selectedEnrollmentId as number, scoreNum);
            onSuccess();
            onClose();
            setSelectedEnrollmentId('');
            setFinalScore('');
            setError('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error submitting grade');
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
                    <h2 className="text-xl font-bold text-slate-900">Enter Grade</h2>
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
                        <div className="text-center py-4 text-slate-500">Loading enrollments...</div>
                    ) : (
                        <>
                            {/* Select Enrollment */}
                            <div>
                                <label className="label">Select Enrollment *</label>
                                <select
                                    className="input"
                                    value={selectedEnrollmentId}
                                    onChange={(e) => {
                                        setSelectedEnrollmentId(e.target.value ? Number(e.target.value) : '');
                                        setFinalScore('');
                                    }}
                                    required
                                >
                                    <option value="">-- Choose an enrollment --</option>
                                    {enrollments.map((enrollment) => (
                                        <option key={enrollment.id} value={enrollment.id}>
                                            {enrollment.studentCode} - {enrollment.studentName} ({enrollment.courseCode})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Display enrollment details */}
                            {selectedEnrollment && (
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-slate-700 space-y-1">
                                    <div>
                                        <strong>Student:</strong> {selectedEnrollment.studentName}
                                    </div>
                                    <div>
                                        <strong>Course:</strong> {selectedEnrollment.courseCode} - {selectedEnrollment.courseName}
                                    </div>
                                    <div>
                                        <strong>Credits:</strong> {selectedEnrollment.credits}
                                    </div>
                                </div>
                            )}

                            {/* Final Score */}
                            <div>
                                <label className="label">Final Score (0-10) *</label>
                                <input
                                    type="number"
                                    className="input"
                                    min="0"
                                    max="10"
                                    step="0.1"
                                    placeholder="Enter score (0-10)"
                                    value={finalScore}
                                    onChange={(e) => setFinalScore(e.target.value ? Number(e.target.value) : '')}
                                    required
                                />
                            </div>

                            {/* Score help text */}
                            <div className="p-2 bg-amber-50 border border-amber-200 rounded text-xs text-slate-600">
                                <strong>Score Scale:</strong> 0-10 (Vietnamese 10-point scale)
                            </div>
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
                            {loading ? 'Submitting...' : 'Submit Grade'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GradeEntryModal;


