import { useState } from 'react';
import { mockAlerts, getAlertLevelColor } from '../../data/mockData';
import { AlertDTO } from '../../types';

/**
 * Student Alerts Page
 * Student can only VIEW their own alerts
 */
const MyAlerts = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // giả sử username = studentName
    const studentAlerts = mockAlerts.filter(
        (alert) => alert.studentName === user.username
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">
                    My Alerts
                </h1>
                <p className="text-slate-600">
                    You have {studentAlerts.length} alerts
                </p>
            </div>

            {/* Alerts List */}
            <div className="space-y-4">
                {studentAlerts.map((alert) => (
                    <StudentAlertCard key={alert.id} alert={alert} />
                ))}
            </div>

            {studentAlerts.length === 0 && (
                <div className="card text-center py-12 text-slate-500">
                    No alerts for you 🎉
                </div>
            )}
        </div>
    );
};

interface StudentAlertCardProps {
    alert: AlertDTO;
}

const StudentAlertCard = ({ alert }: StudentAlertCardProps) => {
    return (
        <div
            className={`card ${
                alert.isResolved ? 'opacity-60' : ''
            }`}
        >
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <span className={getAlertLevelColor(alert.level)}>
                        {alert.level}
                    </span>

                    {!alert.isRead && (
                        <span className="badge bg-primary-100 text-primary-700">
                            New
                        </span>
                    )}

                    {alert.isResolved && (
                        <span className="badge bg-green-100 text-green-700">
                            Resolved
                        </span>
                    )}
                </div>

                <p className="text-slate-700">{alert.message}</p>

                <div className="text-sm text-slate-500">
                    {alert.createdAt}
                </div>
            </div>
        </div>
    );
};

export default MyAlerts;
