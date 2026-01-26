import { useNavigate } from 'react-router-dom';

const Header = ({ title }: { title: string }) => {
    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem('isAuthenticated');
        navigate('/login');
    };

    return (
        <header className="h-16 bg-white border-b flex items-center justify-between px-6">
            <h2 className="text-lg font-semibold">{title}</h2>

            <button
                onClick={logout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
                Logout
            </button>
        </header>
    );
};

export default Header;
