import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { mockDashboardStats, mockGpaTrend, mockAlerts, mockStudents } from '../data/mockData';
import { getAlertLevelColor, getStatusColor } from '../data/mockData';
import { StudentStatus } from '../types';

/**
 * Dashboard page component
 * Displays overview statistics, GPA trends, and recent alerts
 * 
 * @author SPTS Team
 */
const Dashboard = () => {
  const stats = mockDashboardStats;
  const gpaTrend = mockGpaTrend;
  const recentAlerts = mockAlerts.filter((a) => !a.isResolved).slice(0, 3);

  // Status distribution for bar chart
  const statusDistribution = [
    { status: 'Normal', count: mockStudents.filter((s) => s.status === StudentStatus.NORMAL).length },
    { status: 'At Risk', count: mockStudents.filter((s) => s.status === StudentStatus.AT_RISK).length },
    { status: 'Probation', count: mockStudents.filter((s) => s.status === StudentStatus.PROBATION).length },
    { status: 'Graduated', count: mockStudents.filter((s) => s.status === StudentStatus.GRADUATED).length },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          color="primary"
        />
        <StatCard
          title="At Risk"
          value={stats.atRiskCount}
          icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          color="warning"
        />
        <StatCard
          title="On Probation"
          value={stats.probationCount}
          icon="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
          color="danger"
        />
        <StatCard
          title="Average GPA"
          value={stats.averageGpa.toFixed(2)}
          icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          color="success"
        />
        <StatCard
          title="Active Alerts"
          value={stats.activeAlerts}
          icon="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          color="info"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GPA Trend Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">GPA Trend (Average)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={gpaTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="semester" tick={{ fontSize: 12 }} stroke="#64748b" />
                <YAxis domain={[0, 4]} tick={{ fontSize: 12 }} stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="gpa"
                  stroke="#0ea5e9"
                  strokeWidth={3}
                  dot={{ fill: '#0ea5e9', strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Student Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="status" tick={{ fontSize: 12 }} stroke="#64748b" />
                <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Alerts and At-Risk Students */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Recent Alerts</h3>
            <a href="/alerts" className="text-sm text-primary-600 hover:text-primary-700">
              View all
            </a>
          </div>
          <div className="space-y-3">
            {recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start p-3 bg-slate-50 rounded-lg"
              >
                <span className={`${getAlertLevelColor(alert.level)} mr-3`}>
                  {alert.level}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{alert.studentName}</p>
                  <p className="text-sm text-slate-600 truncate">{alert.message}</p>
                  <p className="text-xs text-slate-400 mt-1">{alert.createdDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* At-Risk Students */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Students Requiring Attention</h3>
            <a href="/students" className="text-sm text-primary-600 hover:text-primary-700">
              View all
            </a>
          </div>
          <div className="space-y-3">
            {mockStudents
              .filter((s) => s.status === StudentStatus.AT_RISK || s.status === StudentStatus.PROBATION)
              .map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {student.firstName} {student.lastName}
                    </p>
                    <p className="text-sm text-slate-600">{student.studentId}</p>
                  </div>
                  <div className="text-right">
                    <span className={getStatusColor(student.status)}>{student.status}</span>
                    <p className="text-sm text-slate-600 mt-1">GPA: {student.gpa?.toFixed(2)}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

const StatCard = ({ title, value, icon, color }: StatCardProps) => {
  const colorClasses = {
    primary: 'bg-primary-100 text-primary-600',
    success: 'bg-green-100 text-green-600',
    warning: 'bg-yellow-100 text-yellow-600',
    danger: 'bg-red-100 text-red-600',
    info: 'bg-blue-100 text-blue-600',
  };

  return (
    <div className="card">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
