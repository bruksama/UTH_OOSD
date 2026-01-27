import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Main layout component with navigation sidebar
 * Displays different menus based on user role (admin/student)
 */
const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Get user role from auth context
  const userRole = user?.role || 'student';

  // Admin navigation items
  const adminNavItems = [
    {
      path: '/admin/dashboard',
      label: 'Dashboard',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    },
    {
      path: '/admin/students',
      label: 'Students',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
    },
    {
      path: '/admin/courses',
      label: 'Courses',
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    },
    {
      path: '/admin/alerts',
      label: 'Alerts',
      icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
    },
  ];

  // Student navigation items
  const studentNavItems = [
    {
      path: '/student/dashboard',
      label: 'Dashboard',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    },
    {
      path: '/student/courses',
      label: 'Courses',
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    },
    {
      path: '/student/grades',
      label: 'My Grades',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      path: '/student/alerts',
      label: 'Alerts',
      icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
    },
  ];

  // Select nav items based on role
  const navItems = userRole === 'admin' ? adminNavItems : studentNavItems;

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch {
      // Error is handled by AuthContext
    }
  };

  // Get display name from user
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-100 shadow-sm z-30 transition-all duration-300">
        <div className="flex items-center justify-start h-20 px-8 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              SPTS <span className="text-slate-400 font-medium text-sm ml-1">v2.0</span>
            </h1>
          </div>
        </div>

        <nav className="mt-8 px-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-4">
            Menu
          </div>
          <ul className="space-y-1.5">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 group font-medium ${isActive(item.path)
                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                >
                  <svg
                    className={`w-5 h-5 mr-3.5 transition-colors ${isActive(item.path)
                      ? 'text-primary-600'
                      : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={item.icon}
                    />
                  </svg>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile Snippet at Bottom */}
        <Link
          to={userRole === 'student' ? '/student/profile' : '#'}
          className="absolute bottom-0 left-0 right-0 p-4 m-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md hover:border-slate-200 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-primary-700 transition-colors">
                {displayName}
              </p>
              <p className="text-xs text-slate-500 capitalize">
                {userRole}
              </p>
            </div>
            {/* Edit Icon hint (only for students) */}
            {userRole === 'student' && (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </div>
            )}
          </div>
        </Link>
      </aside>

      <main className="flex-1 ml-72 min-h-screen">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-20 flex items-center justify-between px-8 transition-all">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {navItems.find((item) => isActive(item.path))?.label || 'Dashboard'}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Welcome back, <span className="font-medium text-slate-700">{displayName}</span>! Here's what's happening.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="group flex items-center gap-2 px-4 py-2 rounded-xl text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
            >
              <span className="text-sm font-medium">Sign Out</span>
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
