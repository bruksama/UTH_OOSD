import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';

/**
 * Main layout component with navigation sidebar
 */
const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      path: '/student/dashboard',
      label: 'Dashboard',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    },
    {
      path: '/admin/students',
      label: 'Students',
      icon: 'M12 4.354a4 4 0 110 8.646 4 4 0 010-8.646M9 9a6 6 0 1112 0A6 6 0 019 9z',
    },
    {
      path: '/admin/courses',
      label: 'Courses',
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    },
    {
      path: '/student/alerts',
      label: 'Alerts',
      icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  return (
      <div className="min-h-screen bg-slate-50">
        <aside className="fixed inset-y-0 left-0 w-64 bg-slate-900 text-white">
          <div className="flex items-center justify-center h-16 border-b border-slate-800">
            <h1 className="text-xl font-bold tracking-tight">
              <span className="text-primary-400">SPTS</span>
            </h1>
          </div>

          <nav className="mt-6 px-3">
            <ul className="space-y-1">
              {navItems.map((item) => (
                  <li key={item.path}>
                    <Link
                        to={item.path}
                        className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                            isActive(item.path)
                                ? 'bg-primary-600 text-white'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                    >
                      <svg
                          className="w-5 h-5 mr-3"
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
        </aside>

        <main className="ml-64 min-h-screen">
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
            <h2 className="text-lg font-semibold text-slate-800">
              {navItems.find((item) => isActive(item.path))?.label || 'Dashboard'}
            </h2>

            <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          </header>

          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
  );
};

export default Layout;


