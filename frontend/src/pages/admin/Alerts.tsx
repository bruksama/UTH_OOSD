import { useState } from 'react';
import { mockAlerts, getAlertLevelColor } from '../../data/mockData.ts';
import { AlertDTO, AlertLevel, AlertType } from '../../types';

/**
 * Alerts page component
 * Displays all alerts with filtering and management capabilities
 * 
 * @author SPTS Team
 */
const Alerts = () => {
  const [levelFilter, setLevelFilter] = useState<AlertLevel | 'ALL'>('ALL');
  const [showResolved, setShowResolved] = useState(false);

  const filteredAlerts = mockAlerts.filter((alert) => {
    const matchesLevel = levelFilter === 'ALL' || alert.level === levelFilter;
    const matchesResolved = showResolved || !alert.isResolved;
    return matchesLevel && matchesResolved;
  });

  const unresolvedCount = mockAlerts.filter((a) => !a.isResolved).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Alerts</h1>
          <p className="text-slate-600">
            {unresolvedCount} unresolved alerts require attention
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          {/* Level Filter */}
          <div className="sm:w-48">
            <label className="label">Alert Level</label>
            <select
              className="input"
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value as AlertLevel | 'ALL')}
            >
              <option value="ALL">All Levels</option>
              <option value={AlertLevel.CRITICAL}>Critical</option>
              <option value={AlertLevel.HIGH}>High</option>
              <option value={AlertLevel.WARNING}>Warning</option>
              <option value={AlertLevel.INFO}>Info</option>
            </select>
          </div>

          {/* Show Resolved Toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showResolved"
              className="w-4 h-4 text-primary-600 border-slate-300 rounded 
                         focus:ring-primary-500"
              checked={showResolved}
              onChange={(e) => setShowResolved(e.target.checked)}
            />
            <label htmlFor="showResolved" className="ml-2 text-sm text-slate-700">
              Show resolved alerts
            </label>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <AlertCard key={alert.id} alert={alert} />
        ))}
      </div>

      {filteredAlerts.length === 0 && (
        <div className="card text-center py-12">
          <svg
            className="w-12 h-12 mx-auto text-slate-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-slate-500">No alerts found matching your criteria.</p>
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-slate-500">
        Showing {filteredAlerts.length} of {mockAlerts.length} alerts
      </div>
    </div>
  );
};

// Alert Card Component
interface AlertCardProps {
  alert: AlertDTO;
}

const AlertCard = ({ alert }: AlertCardProps) => {
  return (
    <div
      className={`card ${alert.isResolved ? 'opacity-60' : ''} 
                  ${!alert.isRead ? 'border-l-4 border-l-primary-500' : ''}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={getAlertLevelColor(alert.level)}>
              {alert.level}
            </span>
            <span className="badge bg-slate-100 text-slate-600">
              {formatAlertType(alert.type)}
            </span>
            {alert.isResolved && (
              <span className="badge bg-green-100 text-green-700">Resolved</span>
            )}
            {!alert.isRead && (
              <span className="badge bg-primary-100 text-primary-700">New</span>
            )}
          </div>

          <h3 className="font-semibold text-slate-900 mb-1">{alert.studentName}</h3>
          <p className="text-slate-600">{alert.message}</p>

          <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
            alert.createdAt
            {alert.isResolved && alert.resolvedBy && (
              <span>Resolved by: {alert.resolvedBy}</span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {!alert.isResolved && (
            <>
              <button className="btn-secondary text-sm">
                View Student
              </button>
              <button className="btn-primary text-sm">
                Resolve
              </button>
            </>
          )}
          {alert.isResolved && (
            <button className="btn-secondary text-sm">
              View Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function
const formatAlertType = (type: AlertType): string => {
  switch (type) {
    case AlertType.LOW_GPA:
      return 'Low GPA';
    case AlertType.GPA_DROP:
      return 'GPA Drop';
    case AlertType.STATUS_CHANGE:
      return 'Status Change';
    case AlertType.PROBATION:
      return 'Probation';
    case AlertType.IMPROVEMENT:
      return 'Improvement';
    default:
      return type;
  }
};

export default Alerts;
