import { useState, useEffect } from 'react';
import { alertService } from '../../services';
import { AlertDTO } from '../../types';

const MyAlerts = () => {
    const [alerts, setAlerts] = useState<AlertDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const studentId = 1; // Get from auth/context
                const response = await alertService.getByStudent(studentId);
                setAlerts(response.data);
            } catch (err) {
                console.error('Error fetching alerts:', err);
                setError('Failed to load alerts');
            } finally {
                setLoading(false);
            }
        };
        fetchAlerts();
    }, []);

    const handleMarkAsRead = async (id: number) => {
        try {
            await alertService.markAsRead(id);
            setAlerts(alerts.map(a => a.id === id ? { ...a, isRead: true } : a));
        } catch (err) {
            console.error('Error marking alert as read:', err);
        }
    };

    const handleResolve = async (id: number) => {
        try {
            await alertService.resolve(id, 'STUDENT');
            setAlerts(alerts.map(a => a.id === id ? { ...a, isResolved: true } : a));
        } catch (err) {
            console.error('Error resolving alert:', err);
        }
    };

    if (loading) return <div className="text-center py-8">Loading...</div>;
    if (error) return <div className="text-red-500 py-8">{error}</div>;

    const unresolvedAlerts = alerts.filter(a => !a.isResolved);

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">My Alerts</h2>

            {unresolvedAlerts.length === 0 ? (
                <div className="card text-green-600 font-medium">
                    🎉 No active alerts! Great job!
                </div>
            ) : (
                <div className="space-y-3">
                    {unresolvedAlerts.map((alert) => (
                        <div
                            key={alert.id}
                            className={`card p-4 border-l-4 ${
                                alert.level === 'CRITICAL'
                                    ? 'border-red-500 bg-red-50'
                                    : alert.level === 'HIGH'
                                        ? 'border-orange-500 bg-orange-50'
                                        : 'border-yellow-500 bg-yellow-50'
                            }`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <p className="font-semibold">{alert.title}</p>
                                    <p className="text-sm text-gray-600">{alert.message}</p>
                                </div>
                                <div className="flex gap-2 ml-4">
                                    {!alert.isRead && (
                                        <button
                                            onClick={() => handleMarkAsRead(alert.id)}
                                            className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                        >
                                            Mark Read
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleResolve(alert.id)}
                                        className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                    >
                                        Resolve
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyAlerts;
