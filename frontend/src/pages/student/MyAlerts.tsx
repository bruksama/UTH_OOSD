import { useState, useEffect } from 'react';
import { alertService } from '../../services';
import { AlertDTO } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

const MyAlerts = () => {
    const [alerts, setAlerts] = useState<AlertDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { user } = useAuth();

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const studentId = user?.studentId;
                if (!studentId) return;

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
    }, [user]);

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
                            className={`p-4 rounded-xl bg-gradient-to-r from-slate-50 to-white border border-slate-100 transition-all hover:shadow-md border-l-4 ${alert.level === 'CRITICAL'
                                    ? 'border-l-red-500 bg-red-50/30'
                                    : alert.level === 'HIGH'
                                        ? 'border-l-orange-500 bg-orange-50/30'
                                        : 'border-l-blue-500 bg-blue-50/30'
                                }`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${alert.level === 'CRITICAL'
                                                ? 'bg-red-100 text-red-700'
                                                : alert.level === 'HIGH'
                                                    ? 'bg-orange-100 text-orange-700'
                                                    : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {alert.level}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{alert.type.replace('_', ' ')}</span>
                                    </div>
                                    <p className="text-sm text-slate-700 font-medium leading-relaxed">{alert.message}</p>
                                </div>
                                <div className="flex gap-2 ml-4">
                                    {!alert.isRead && (
                                        <button
                                            onClick={() => handleMarkAsRead(alert.id!)}
                                            className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-colors"
                                        >
                                            Mark Read
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleResolve(alert.id!)}
                                        className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-colors"
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
