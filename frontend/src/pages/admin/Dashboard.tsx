import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import { getAlertLevelColor, getStatusColor, getStatusDisplay } from '../../utils/helpers';
import { studentService, alertService, courseService } from '../../services';
import { StudentDTO, AlertDTO, StudentStatus, DashboardStats, CourseDTO, ApprovalStatus } from '../../types';

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
  const [courses, setCourses] = useState<CourseDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      studentService.getAll(),
      alertService.getAll(),
      courseService.getAll()
    ])
      .then(([studentsData, alertsData, coursesData]) => {
        setStudents(studentsData.data);
        setAlerts(alertsData.data);
        setCourses(coursesData.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Calculate stats from real data
  // Calculate stats from real data
  const stats: DashboardStats = {
    totalStudents: students.length,
    atRiskCount: students.filter(s => s.status === StudentStatus.AT_RISK).length,
    probationCount: students.filter(s => s.status === StudentStatus.PROBATION).length, // Kept for internal logic if needed
    averageGpa: students.length > 0
      ? students.reduce((sum, s) => sum + (s.gpa || 0), 0) / students.length
      : 0,
    activeAlerts: alerts.filter(a => !a.isResolved).length, // Only count unresolved alerts
    pendingCourses: courses.filter(c => c.status === ApprovalStatus.PENDING).length,
  };

  // Get 3 most recent alerts (sort by created date desc)
  const recentAlerts = [...alerts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  // Calculate GPA distribution from real student data
  const gpaDistribution = [
    { range: '3.5-4.0', count: students.filter(s => (s.gpa || 0) >= 3.5).length },
    { range: '3.0-3.5', count: students.filter(s => (s.gpa || 0) >= 3.0 && (s.gpa || 0) < 3.5).length },
    { range: '2.5-3.0', count: students.filter(s => (s.gpa || 0) >= 2.5 && (s.gpa || 0) < 3.0).length },
    { range: '2.0-2.5', count: students.filter(s => (s.gpa || 0) >= 2.0 && (s.gpa || 0) < 2.5).length },
    { range: '<2.0', count: students.filter(s => (s.gpa || 0) < 2.0).length },
  ];

  /* ===== STUDENT STATUS DISTRIBUTION ===== */
  // Group students by their detailed status (including Academic Classification)
  const statusCounts = students.reduce((acc, student) => {
    const { label } = getStatusDisplay(student);
    if (!acc[label]) {
      acc[label] = { count: 0, label };
    }
    acc[label].count++;
    return acc;
  }, {} as Record<string, { count: number, label: string }>);

  // Map labels to Chart Colors
  const getChartColor = (label: string): string => {
    switch (label) {
      case 'Excellent': return '#a855f7'; // Purple
      case 'Very Good': return '#10b981'; // Emerald
      case 'Good': return '#3b82f6';      // Blue
      case 'Average': return '#eab308';   // Yellow
      case 'Weak': return '#f43f5e';      // Rose
      case 'Graduated': return '#06b6d4'; // Cyan
      case 'Probation': return '#f97316'; // Orange
      case 'At Risk': return '#dc2626';   // Red
      default: return '#94a3b8';          // Slate (New Student)
    }
  };

  const statusDistribution = Object.values(statusCounts)
    .map(item => ({
      name: item.label,
      value: item.count,
      color: getChartColor(item.label)
    }))
    .sort((a, b) => b.value - a.value); // Sort by count desc


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
        <StatCard title="Active Alerts" value={stats.activeAlerts} />
        <StatCard title="Pending Courses" value={stats.pendingCourses || 0} />
      </div>

      {/* ===== CHARTS ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* GPA DISTRIBUTION BAR CHART */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">
            GPA Distribution
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gpaDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill="#0ea5e9"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* STATUS DISTRIBUTION DONUT */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">
            Student Status Distribution
          </h3>

          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={5}
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-2xl font-bold">
                {students.length}
              </p>
              <p className="text-sm text-slate-500">
                Total Students
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
