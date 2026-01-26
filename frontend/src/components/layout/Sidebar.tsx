import { Link, useLocation } from 'react-router-dom';

const navItems = [
    {
        path: '/student/dashboard',
        label: 'Dashboard',
        icon: 'M3 12l2-2m0 0l7-7 7 7...',
    },
    {
        path: '/student/grades',
        label: 'My Grades',
        icon: 'M12 6.253v13m0-13...',
    },
    {
        path: '/student/alerts',
        label: 'Alerts',
        icon: 'M15 17h5l-1.405...',
    },
];

const Sidebar = () => {
    const location = useLocation();

    return (
        <aside className="fixed inset-y-0 left-0 w-64 bg-slate-900 text-white">
            <div className="flex items-center justify-center h-16 border-b border-slate-800">
                <h1 className="text-xl font-bold">
                    <span className="text-primary-400">SPTS</span>
                </h1>
            </div>

            <nav className="mt-6 px-3">
                <ul className="space-y-1">
                    {navItems.map((item) => {
                        const active = location.pathname === item.path;
                        return (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`flex items-center px-4 py-3 rounded-lg ${
                                        active
                                            ? 'bg-primary-600 text-white'
                                            : 'text-slate-300 hover:bg-slate-800'
                                    }`}
                                >
                                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor">
                                        <path strokeWidth={2} d={item.icon} />
                                    </svg>
                                    {item.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;
