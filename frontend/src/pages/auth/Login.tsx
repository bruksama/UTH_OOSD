import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticateUser } from '../../utils/mockAuth';

interface LoginProps {
    setIsAuthenticated: (value: boolean) => void;
}

function Login({ setIsAuthenticated }: LoginProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Authenticate user from test accounts
        const user = authenticateUser(username, password);

        if (!user) {
            setError('Invalid username or password');
            return;
        }

        // Store auth info
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('userRole', user.role);
        setIsAuthenticated(true);

        // Redirect by role
        if (user.role === 'admin') {
            navigate('/admin/dashboard');
        } else if (user.role === 'student') {
            navigate('/student/dashboard');
        } else if (user.role === 'teacher') {
            navigate('/teacher/dashboard');
        }
    };

    return (
        <div style={styles.container}>
            <form style={styles.card} onSubmit={handleLogin}>
                <h2 style={styles.title}>SPTS Login</h2>

                {error && (
                    <div style={styles.error}>
                        {error}
                    </div>
                )}

                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={styles.input}
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={styles.input}
                    required
                />

                <button type="submit" style={styles.button}>
                    Login
                </button>
                <div style={styles.links}>
                    <span
                        style={styles.link}
                        onClick={() => navigate('/register')}
                    >
                        Register
                    </span>

                    <span style={styles.divider}>|</span>

                    <span
                        style={styles.link}
                        onClick={() => navigate('/forgot-password')}
                    >
                        Forgot password?
                    </span>
                </div>
            </form>
        </div>
    );
}

export default Login;

/* ===== Styles ===== */
const styles: any = {
    container: {
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f3f4f6',
    },
    card: {
        width: 400,
        padding: 30,
        borderRadius: 12,
        background: '#fff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    },
    title: {
        textAlign: 'center',
        marginBottom: 20,
        fontSize: 24,
        fontWeight: 'bold',
    },
    error: {
        padding: 12,
        marginBottom: 15,
        borderRadius: 6,
        backgroundColor: '#fee2e2',
        color: '#991b1b',
        fontSize: 14,
        textAlign: 'center',
        border: '1px solid #fca5a5',
    },
    input: {
        width: '100%',
        padding: 12,
        marginBottom: 15,
        borderRadius: 6,
        border: '1px solid #ddd',
        fontSize: 16,
        boxSizing: 'border-box',
    },
    button: {
        width: '100%',
        padding: 12,
        marginBottom: 15,
        borderRadius: 6,
        backgroundColor: '#3b82f6',
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        cursor: 'pointer',
        border: 'none',
    },
    demoBox: {
        padding: 12,
        marginBottom: 15,
        borderRadius: 6,
        backgroundColor: '#dbeafe',
        border: '1px solid #93c5fd',
        fontSize: 13,
    },
    demoTitle: {
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#1e40af',
    },
    demoItem: {
        marginBottom: 6,
        color: '#1e40af',
    },
    links: {
        textAlign: 'center',
        fontSize: 14,
    },
    link: {
        color: '#3b82f6',
        cursor: 'pointer',
        marginRight: 5,
        marginLeft: 5,
    },
    divider: {
        color: '#ddd',
    },
};
