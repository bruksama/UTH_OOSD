import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/student/dashboard', label: 'Dashboard' },
    { path: '/student/grades', label: 'My Grades' },
    { path: '/student/alerts', label: 'Alerts' },
  ];

  // 👉 ICON MAP THEO ROUTE
  const iconMap: Record<string, string> = {
    '/student/dashboard': '📊',
    '/student/grades': '🎓',
    '/student/alerts': '🔔',
  };

  const currentPath = location.pathname;
  const currentTitle =
      navItems.find((i) => i.path === currentPath)?.label ?? '';
  const currentIcon = iconMap[currentPath] ?? '';

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  return (
      <div className="min-h-screen flex bg-slate-100">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 text-white fixed inset-y-0">
          <div className="h-16 flex items-center justify-center border-b border-slate-800">
            <span className="text-xl font-bold text-blue-400">SPTS</span>
          </div>

          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                  <Link
                      key={item.path}
                      to={item.path}
                      className={`block px-4 py-3 rounded-lg transition ${
                          active
                              ? 'bg-blue-600 text-white'
                              : 'text-slate-300 hover:bg-slate-800'
                      }`}
                  >
                    {item.label}
                  </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main */}
        <div className="ml-64 flex-1 flex flex-col">
          <header className="h-16 bg-white border-b px-6 flex items-center justify-between">
            {/* 👉 TITLE + ICON */}
            <h1 className="flex items-center gap-3 text-3xl font-extrabold text-slate-900 tracking-tight">
              <span className="text-3xl">{currentIcon}</span>
              <span>{currentTitle}</span>
            </h1>

            <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </header>

          <main className="p-6 flex-1">
            <Outlet />
          </main>
        </div>
      </div>
  );
};

export default Layout;
