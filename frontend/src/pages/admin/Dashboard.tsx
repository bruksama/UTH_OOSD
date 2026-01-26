import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import { getAlertLevelColor, getStatusColor } from '../../utils/helpers';
import { fetchStudents } from '../../services/student.api';
import { fetchUnresolvedAlerts } from '../../services/alert.api';
import { StudentDTO, AlertDTO, StudentStatus, DashboardStats, GpaTrendData } from '../../types';

/* ===== STAT CARD ===== */
interface StatCardProps {
  title: string;
  value: string | number;
}

const StatCard = ({ title, value }: StatCardProps) => (
  <div className="card text-center">
    <p className="text-sm text-slate-500">{title}</p>
    <p className="text-3xl font-bold mt-1">{value}</p>
  </div>
);

/* ================= ADMIN DASHBOARD ================= */
const AdminDashboard = () => {
  const [students, setStudents] = useState<StudentDTO[]>([]);
  const [alerts, setAlerts] = useState<AlertDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchStudents(),
      fetchUnresolvedAlerts()
    ])
      .then(([studentsData, alertsData]) => {
        setStudents(studentsData);
        setAlerts(alertsData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Calculate stats from real data
  const stats: DashboardStats = {
    totalStudents: students.length,
    atRiskCount: students.filter(s => s.status === StudentStatus.AT_RISK).length,
    probationCount: students.filter(s => s.status === StudentStatus.PROBATION).length,
    averageGpa: students.length > 0
      ? students.reduce((sum, s) => sum + (s.gpa || 0), 0) / students.length
      : 0,
    activeAlerts: alerts.length,
  };

  const recentAlerts = alerts.slice(0, 3);

  // Mock GPA trend for now (could be fetched from backend later)
  const gpaTrend: GpaTrendData[] = [
    { semester: 'Fall 2023', gpa: 2.8 },
    { semester: 'Spring 2024', gpa: 2.9 },
    { semester: 'Fall 2024', gpa: 3.1 },
    { semester: 'Spring 2025', gpa: 3.0 },
  ];

  /* ===== CREDIT PROGRESS ===== */
  const TOTAL_CREDITS = 120;
  const completedCredits = students.length > 0
    ? Math.round(students.reduce((sum, s) => sum + (s.totalCredits || 0), 0) / students.length)
    : 0;

  const creditProgress = [
    { name: 'Completed', value: completedCredits },
    { name: 'Remaining', value: TOTAL_CREDITS - completedCredits },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ===== STATS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={stats.totalStudents} />
        <StatCard title="At Risk" value={stats.atRiskCount} />
        <StatCard title="Average GPA" value={stats.averageGpa.toFixed(2)} />
        <StatCard title="Active Alerts" value={stats.activeAlerts} />
      </div>

      {/* ===== CHARTS ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* GPA LINE CHART */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">
            GPA Trend (Average)
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={gpaTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="semester" />
                <YAxis domain={[0, 4]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="gpa"
                  stroke="#0ea5e9"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CREDIT DONUT */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">
            Credit Progress (120 Credits)
          </h3>

          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={creditProgress}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  startAngle={90}
                  endAngle={-270}
                >
                  <Cell fill="#22c55e" />
                  <Cell fill="#e5e7eb" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-2xl font-bold">
                {completedCredits}/{TOTAL_CREDITS}
              </p>
              <p className="text-sm text-slate-500">
                Credits Completed
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== ALERTS + STUDENTS ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ALERTS */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">
            Recent Alerts
          </h3>

          {recentAlerts.map(alert => (
            <div
              key={alert.id}
              className="p-3 bg-slate-50 rounded-lg mb-2"
            >
              <span className={getAlertLevelColor(alert.level)}>
                {alert.level}
              </span>
              <p className="mt-1 font-medium">
                {alert.studentName}
              </p>
              <p className="text-sm text-slate-600">
                {alert.message}
              </p>
            </div>
          ))}
        </div>

        {/* STUDENTS AT RISK */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">
            Students Requiring Attention
          </h3>

          {students
            .filter((s: StudentDTO) => s.status === StudentStatus.AT_RISK)
            .map(student => (
              <div
                key={student.studentId}
                className="p-3 bg-slate-50 rounded-lg mb-2"
              >
                <p className="font-medium">
                  {student.firstName} {student.lastName}
                </p>
                <span className={getStatusColor(student.status)}>
                  {student.status.replace('_', ' ')}
                </span>
              </div>
            ))}
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
