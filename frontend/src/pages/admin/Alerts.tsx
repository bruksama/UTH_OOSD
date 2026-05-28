import { useState, useEffect } from 'react';
import { alertService } from '../../services';
import { AlertDTO, AlertLevel } from '../../types';

/**
 * Alerts page component
 * Displays all alerts with filtering and management capabilities
 * 
 * @author SPTS Team
 */
const Alerts = () => {
  const [alerts, setAlerts] = useState<AlertDTO[]>([]);
  const [levelFilter, setLevelFilter] = useState<AlertLevel | 'ALL'>('ALL');
  const [showResolved, setShowResolved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const response = await alertService.getAll();
        setAlerts(response.data);
      } catch (err) {
        console.error('Error fetching alerts:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAlerts();
  }, []);

  const filteredAlerts = alerts.filter((alert) => {
    const matchesLevel = levelFilter === 'ALL' || alert.level === levelFilter;
    const matchesResolved = showResolved || !alert.isResolved;
    return matchesLevel && matchesResolved;
  });

  const handleMarkAsRead = async (id: number) => {
    setActionLoading(id);
    try {
      await alertService.markAsRead(id);
      setAlerts(alerts.map(a => a.id === id ? { ...a, isRead: true } : a));
    } catch (err) {
      console.error('Error marking alert as read:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResolve = async (id: number) => {
    setActionLoading(id);
    try {
      await alertService.resolve(id, 'ADMIN');
      setAlerts(alerts.map(a => a.id === id ? { ...a, isResolved: true } : a));
    } catch (err) {
      console.error('Error resolving alert:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const unresolvedCount = alerts.filter((a) => !a.isResolved).length;

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96">
      <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Scanning System Alerts...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="relative">
          <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            System <span className="text-rose-600">Alerts</span>
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-2 h-2 rounded-full ${unresolvedCount > 0 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">
              {unresolvedCount} Active notifications require attention
            </p>
          </div>
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-rose-600 rounded-full" />
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-4 lg:p-6 border border-slate-200/60 shadow-xl shadow-slate-200/40">
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          <div className="flex-1 w-full lg:w-auto relative group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <select
              className="w-full pl-14 pr-10 py-4 bg-white border-2 border-slate-50 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 focus:bg-white focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value as AlertLevel | 'ALL')}
            >
              <option value="ALL">All Alert Levels</option>
              <option value={AlertLevel.CRITICAL}>Critical Priority</option>
              <option value={AlertLevel.HIGH}>High Importance</option>
              <option value={AlertLevel.WARNING}>Standard Warning</option>
              <option value={AlertLevel.INFO}>System Information</option>
            </select>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border-2 border-slate-50">
            <label className="relative inline-flex items-center cursor-pointer px-4 py-2">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={showResolved}
                onChange={(e) => setShowResolved(e.target.checked)}
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[10px] after:left-[18px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
              <span className="ml-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Include Resolved</span>
            </label>
          </div>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="grid grid-cols-1 gap-4 lg:gap-6">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => {
            const isCritical = alert.level === AlertLevel.CRITICAL;
            const isHigh = alert.level === AlertLevel.HIGH;
            const isWarning = alert.level === AlertLevel.WARNING;

            return (
              <div
                key={alert.id}
                className={`
                  group relative bg-white rounded-[2rem] p-6 lg:p-8 border border-slate-200/60 shadow-lg shadow-slate-200/20 
                  transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 overflow-hidden
                  ${alert.isResolved ? 'opacity-70 saturate-50' : ''}
                `}
              >
                {/* Visual Level Indicator */}
                <div className={`absolute top-0 bottom-0 left-0 w-2 ${isCritical ? 'bg-rose-500' : isHigh ? 'bg-orange-500' : isWarning ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />

                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${isCritical ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                          isHigh ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                            isWarning ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                              'bg-blue-50 text-blue-600 border border-blue-100'
                        }`}>
                        {alert.level} PRIORITY
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {new Date(alert.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        {alert.type.replace('_', ' ')}
                        {alert.isResolved && (
                          <span className="text-emerald-500">
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                          </span>
                        )}
                      </h3>
                      <p className="text-slate-600 font-bold leading-relaxed max-w-2xl">{alert.message}</p>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 uppercase">
                        {alert.studentName?.charAt(0)}
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                        Concerned Student: <span className="text-slate-700 not-italic">{alert.studentName}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 w-full lg:w-auto">
                    {!alert.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(alert.id!)}
                        disabled={actionLoading === alert.id}
                        className="flex-1 lg:flex-none px-6 py-3 bg-slate-50 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 transition-all active:scale-95 disabled:opacity-50"
                      >
                        {actionLoading === alert.id ? '...' : 'Mark Read'}
                      </button>
                    )}
                    {!alert.isResolved && (
                      <button
                        onClick={() => handleResolve(alert.id!)}
                        disabled={actionLoading === alert.id}
                        className="flex-1 lg:flex-none px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-slate-200"
                      >
                        {actionLoading === alert.id ? '...' : 'Resolve Alert'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white/40 rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xl font-black text-slate-800 tracking-tight">System Clear</p>
            <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-[10px]">No alerts matched your current focus</p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex justify-between items-center px-8 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-slate-400" />
          <p className="text-[10px] font-black uppercase tracking-widest">
            Audit Trail: <span className="text-slate-900">{filteredAlerts.length}</span> security entries displayed
          </p>
        </div>
      </div>
    </div>
  );
};

export default Alerts;
