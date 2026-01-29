import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Main layout component with navigation sidebar
 * Displays different menus based on user role (admin/student)
 */
const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Handle window resize - close sidebar if screen becomes large
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    <div className="min-h-screen bg-[#f8fafc] flex overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[60] lg:hidden transition-all duration-500 ease-in-out"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-80 bg-white/80 backdrop-blur-2xl border-r border-slate-200/60 shadow-2xl shadow-slate-200/50 z-[70] 
        transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) transform 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-between h-24 px-8 shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-200 ring-4 ring-indigo-50">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tighter text-slate-800 leading-none">
                  SPTS
                </h1>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Ecosytem v2</p>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-xl transition-all"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-8 overflow-y-auto custom-scrollbar">
            <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-6 px-6">
              Core Platform
            </div>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`
                      flex items-center px-6 py-4 rounded-[1.25rem] transition-all duration-300 group
                      ${isActive(item.path)
                        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                    `}
                  >
                    <svg
                      className={`w-5 h-5 mr-4 transition-all duration-300 ${isActive(item.path)
                        ? 'text-white'
                        : 'text-slate-400 group-hover:text-indigo-500 group-hover:scale-110'
                        }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d={item.icon}
                      />
                    </svg>
                    <span className="font-bold text-sm tracking-tight">{item.label}</span>
                    {isActive(item.path) && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Bottom Profile */}
          <div className="p-6 shrink-0 border-t border-slate-100 bg-slate-50/50">
            <Link
              to={userRole === 'student' ? '/student/profile' : '#'}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-indigo-50 hover:border-indigo-100 transition-all duration-300 group"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center text-indigo-600 font-black text-lg border border-indigo-100 group-hover:scale-110 transition-transform duration-500">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-slate-800 truncate leading-tight group-hover:text-indigo-600 transition-colors">
                  {displayName}
                </p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                  {userRole} Portal
                </p>
              </div>
              <svg className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </aside>

      <main className="flex-1 lg:ml-80 min-h-screen transition-all duration-500">
        <header className="h-24 bg-white/60 backdrop-blur-xl border-b border-slate-200/40 sticky top-0 z-[50] flex items-center justify-between px-6 lg:px-12 transition-all">
          <div className="flex items-center gap-6 min-w-0">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-3 -ml-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="truncate">
              <h2 className="text-xl lg:text-2xl font-black text-slate-800 tracking-tight truncate">
                {navItems.find((item) => isActive(item.path))?.label || 'Overview'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4 lg:gap-8 shrink-0">
            <button
              onClick={handleLogout}
              className="group flex items-center gap-3 px-5 py-3 rounded-2xl text-slate-500 hover:text-red-600 hover:bg-red-50/50 transition-all duration-300"
            >
              <span className="hidden sm:inline text-xs font-black uppercase tracking-widest">Sign Out</span>
              <div className="p-2 bg-slate-100 rounded-xl group-hover:bg-red-100 group-hover:text-red-600 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
            </button>
          </div>
        </header>

        <div className="p-6 lg:p-12 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
