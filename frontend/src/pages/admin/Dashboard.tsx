import { useState, useEffect } from 'react';
import {
  Users,
  BookOpen,
  Clock,
  AlertTriangle,
  ShieldAlert,
  TrendingUp,
  CheckCircle,
  ClipboardList,
  BarChart3,
} from 'lucide-react';

import { getAlertLevelColor, getStatusColor, getStatusDisplay } from '../../utils/helpers';
import { studentService, alertService, courseService, statisticsService } from '../../services';
import { StudentDTO, AlertDTO, StudentStatus, DashboardStats, CourseDTO, ApprovalStatus } from '../../types';
import {
  AdminDashboardStats,
} from '../../services/statistics.service';

// Import reusable chart components (DRY principle)
import {
  StatCard,
  ChartCard,
  BarChartWidget,
  PieChartWidget,
  RadarChartWidget,
  LoadingSpinner,
  EmptyState,
  GRADIENT_COLORS,
} from '../../components/charts/ChartComponents';

/**
 * Admin Dashboard - Premium statistics display
 * Uses reusable chart components for consistency and DRY compliance
 * 
 * @author SPTS Team
 */

/* ===== GPA CHART COLORS ===== */
const GPA_COLORS = {
  'excellent': '#a855f7',
  'veryGood': '#10b981',
  'good': '#3b82f6',
  'average': '#f59e0b',
  'weak': '#ef4444',
};

/* ===== STATUS CHART COLORS ===== */
const getChartColor = (label: string): string => {
  const colorMap: Record<string, string> = {
    'Excellent': '#a855f7',
    'Very Good': '#10b981',
    'Good': '#3b82f6',
    'Average': '#eab308',
    'Weak': '#f43f5e',
    'Graduated': '#06b6d4',
    'Probation': '#f97316',
    'At Risk': '#dc2626',
  };
  return colorMap[label] || '#94a3b8';
};

/* ================= ADMIN DASHBOARD ================= */
const AdminDashboard = () => {
  const [students, setStudents] = useState<StudentDTO[]>([]);
  const [alerts, setAlerts] = useState<AlertDTO[]>([]);
  const [courses, setCourses] = useState<CourseDTO[]>([]);
  const [advancedStats, setAdvancedStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      studentService.getAll(),
      alertService.getAll(),
      courseService.getAll(),
      statisticsService.getDashboardStats()
    ])
      .then(([studentsData, alertsData, coursesData, statsData]) => {
        setStudents(studentsData.data);
        setAlerts(alertsData.data);
        setCourses(coursesData.data);
        setAdvancedStats(statsData.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ==================== Computed Data ====================

  // Helper: Check if student is an admin account (consistent with Students page)
  const isAdminAccount = (student: StudentDTO): boolean => {
    const email = student.email?.toLowerCase() || '';
    const firstName = student.firstName?.toLowerCase() || '';
    return email.includes('admin') || firstName.includes('admin');
  };

  // Filter out admin accounts for statistics
  const realStudents = students.filter(s => !isAdminAccount(s));

  const stats: DashboardStats = {
    totalStudents: realStudents.length,
    atRiskCount: realStudents.filter(s => s.status === StudentStatus.AT_RISK).length,
    probationCount: realStudents.filter(s => s.status === StudentStatus.PROBATION).length,
    averageGpa: realStudents.length > 0
      ? realStudents.reduce((sum, s) => sum + (s.gpa || 0), 0) / realStudents.length
      : 0,
    activeAlerts: alerts.filter(a => !a.isResolved).length,
    pendingCourses: courses.filter(c => c.status === ApprovalStatus.PENDING).length,
  };

  const recentAlerts = [...alerts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  // GPA Distribution data
  const gpaDistribution = [
    { range: '3.5-4.0', count: realStudents.filter(s => (s.gpa || 0) >= 3.5).length, fill: GPA_COLORS.excellent },
    { range: '3.0-3.5', count: realStudents.filter(s => (s.gpa || 0) >= 3.0 && (s.gpa || 0) < 3.5).length, fill: GPA_COLORS.veryGood },
    { range: '2.5-3.0', count: realStudents.filter(s => (s.gpa || 0) >= 2.5 && (s.gpa || 0) < 3.0).length, fill: GPA_COLORS.good },
    { range: '2.0-2.5', count: realStudents.filter(s => (s.gpa || 0) >= 2.0 && (s.gpa || 0) < 2.5).length, fill: GPA_COLORS.average },
    { range: '<2.0', count: realStudents.filter(s => (s.gpa || 0) < 2.0).length, fill: GPA_COLORS.weak },
  ];

  // Status Distribution data
  const statusCounts = realStudents.reduce((acc, student) => {
    const { label } = getStatusDisplay(student);
    if (!acc[label]) acc[label] = { count: 0, label };
    acc[label].count++;
    return acc;
  }, {} as Record<string, { count: number, label: string }>);

  const statusDistribution = Object.values(statusCounts)
    .map(item => ({ name: item.label, value: item.count, color: getChartColor(item.label) }))
    .sort((a, b) => b.value - a.value);

  // Top Courses data
  const topCoursesData = advancedStats?.topCourses?.slice(0, 5).map(course => ({
    name: course.courseCode,
    enrollments: course.totalEnrollments,
    completed: course.completedEnrollments,
  })) || [];

  // Department Radar data
  const departmentRadarData = advancedStats?.departmentStats?.slice(0, 6).map(dept => ({
    department: dept.department?.substring(0, 15) || 'Unknown',
    enrollments: dept.totalEnrollments,
    students: dept.totalStudents,
  })) || [];

  // NOTE: Enrollment Trends and Credit Distribution will be developed later

  // ==================== Loading State ====================

  if (loading) return <LoadingSpinner />;

  // ==================== Render ====================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* ===== HEADER ===== */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
              <p className="text-slate-500">Real-time overview of student performance and enrollments</p>
            </div>
          </div>
        </div>

        {/* ===== PRIMARY STAT CARDS ===== */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Students" value={stats.totalStudents} icon={<Users className="h-7 w-7" />} gradient={GRADIENT_COLORS.primary} />
          <StatCard title="Total Enrollments" value={advancedStats?.totalEnrollments || 0} icon={<BookOpen className="h-7 w-7" />} gradient={GRADIENT_COLORS.success} />
          <StatCard title="Active Enrollments" value={advancedStats?.activeEnrollments || 0} icon={<Clock className="h-7 w-7" />} gradient={GRADIENT_COLORS.info} />
          <StatCard title="Active Alerts" value={stats.activeAlerts} icon={<AlertTriangle className="h-7 w-7" />} gradient={GRADIENT_COLORS.danger} />
        </div>

        {/* ===== SECONDARY STAT CARDS ===== */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="At Risk Students" value={stats.atRiskCount} icon={<ShieldAlert className="h-7 w-7" />} gradient={['#f97316', '#fb923c']} />
          <StatCard title="Overall Avg GPA" value={(advancedStats?.overallAverageGpa || stats.averageGpa).toFixed(2)} icon={<TrendingUp className="h-7 w-7" />} gradient={GRADIENT_COLORS.purple} />
          <StatCard title="Completed Courses" value={advancedStats?.completedEnrollments || 0} icon={<CheckCircle className="h-7 w-7" />} gradient={['#14b8a6', '#2dd4bf']} />
          <StatCard title="Pending Approvals" value={stats.pendingCourses || 0} icon={<ClipboardList className="h-7 w-7" />} gradient={['#64748b', '#94a3b8']} />
        </div>

        {/* ===== TOP COURSES & DEPARTMENT STATS ===== */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartCard title="🏆 Top Enrolled Courses" subtitle="Most popular courses by enrollment">
            <BarChartWidget
              data={topCoursesData}
              bars={[
                { dataKey: 'enrollments', name: 'Enrollments', gradient: true },
                { dataKey: 'completed', name: 'Completed', fill: '#10b981' },
              ]}
              xAxisKey="name"
              layout="vertical"
              height={320}
            />
          </ChartCard>

          <ChartCard title="🎯 Department Performance" subtitle="Enrollments and students by department">
            <RadarChartWidget
              data={departmentRadarData}
              radars={[
                { dataKey: 'enrollments', name: 'Enrollments', color: '#6366f1' },
                { dataKey: 'students', name: 'Students', color: '#10b981' },
              ]}
              angleAxisKey="department"
              height={320}
            />
          </ChartCard>
        </div>



        {/* ===== GPA & STATUS DISTRIBUTION ===== */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartCard title="📊 GPA Distribution" subtitle="Students by GPA range">
            <BarChartWidget
              data={gpaDistribution}
              bars={[{ dataKey: 'count', name: 'Students' }]}
              xAxisKey="range"
              height={288}
            />
          </ChartCard>

          <ChartCard title="🎓 Student Status Distribution" subtitle="Academic classification overview">
            <PieChartWidget
              data={statusDistribution}
              innerRadius={60}
              centerLabel={{ value: realStudents.length, label: 'Students' }}
              height={288}
            />
          </ChartCard>
        </div>

        {/* ===== DEPARTMENT LEADERBOARD ===== */}
        <ChartCard title="🏛️ Department Leaderboard" subtitle="Top departments by enrollments">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {advancedStats?.departmentStats?.slice(0, 6).map((dept, index) => (
              <div
                key={dept.department || index}
                className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50 to-white border border-slate-100 transition-all hover:border-indigo-200 hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full text-white font-bold ${index === 0 ? 'bg-gradient-to-r from-amber-400 to-yellow-500' :
                    index === 1 ? 'bg-gradient-to-r from-slate-400 to-slate-500' :
                      index === 2 ? 'bg-gradient-to-r from-orange-400 to-amber-500' :
                        'bg-gradient-to-r from-indigo-400 to-purple-500'
                    }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{dept.department || 'Unknown'}</p>
                    <p className="text-sm text-slate-500">{dept.totalCourses} courses • {dept.totalStudents} students</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-indigo-600">{dept.totalEnrollments}</p>
                  <p className="text-sm text-slate-500">enrollments</p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* ===== ALERTS & AT-RISK STUDENTS ===== */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartCard title="🔔 Recent Alerts" subtitle="Latest system notifications">
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {recentAlerts.length > 0 ? recentAlerts.map(alert => (
                <div key={alert.id} className="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-white border border-slate-100 transition-all hover:border-orange-200 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getAlertLevelColor(alert.level)}`}>
                      {alert.level}
                    </span>
                    <span className="text-xs text-slate-400">{new Date(alert.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-2 font-semibold text-slate-800">{alert.studentName}</p>
                  <p className="text-sm text-slate-600">{alert.message}</p>
                </div>
              )) : <EmptyState icon="🎉" message="No recent alerts" />}
            </div>
          </ChartCard>

          <ChartCard title="🚨 Students Requiring Attention" subtitle="Students with at-risk status">
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {realStudents.filter(s => s.status === StudentStatus.AT_RISK).length > 0
                ? realStudents.filter(s => s.status === StudentStatus.AT_RISK).map(student => (
                  <div key={student.studentId} className="p-4 rounded-xl bg-gradient-to-r from-red-50 to-white border border-red-100 transition-all hover:border-red-300 hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-800">{student.firstName} {student.lastName}</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(student.status)}`}>
                        {student.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">ID: {student.studentId} • GPA: {student.gpa?.toFixed(2) || 'N/A'}</p>
                  </div>
                ))
                : <EmptyState icon="✨" message="No at-risk students" />}
            </div>
          </ChartCard>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
