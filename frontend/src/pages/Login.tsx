import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LoginProps {
    setIsAuthenticated: (value: boolean) => void;
}

function Login({ setIsAuthenticated }: LoginProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        const user = JSON.parse(localStorage.getItem('user') || 'null');

        if (
            user &&
            username === user.username &&
            password === user.password
        ) {
            setIsAuthenticated(true);
            navigate('/');
        } else {
            alert('Incorrect account or password');
        }
    };

    return (
        <div style={styles.container}>
            <form style={styles.card} onSubmit={handleLogin}>
                <h2 style={styles.title}>Login</h2>

                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={styles.input}
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={styles.input}
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
                        Forgot your password?
                    </span>
                </div>
            </form>
        </div>
    );
}

export default Login;

/* ===== Styles  ===== */
const styles: any = {
    container: {
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f3f4f6',
    },
    card: {
        width: 380,
        padding: 30,
        borderRadius: 10,
        background: '#fff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    },
    title: {
        textAlign: 'center',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        padding: 12,
        marginBottom: 15,
        borderRadius: 6,
        border: '1px solid #ddd',
        fontSize: 16,
    },
    button: {
        width: '100%',
        padding: 12,
        background: '#2563eb',
        color: '#fff',
        border: 'none',
        borderRadius: 6,
        fontSize: 16,
        cursor: 'pointer',
    },
    links: {
        marginTop: 15,
        textAlign: 'center',
        fontSize: 14,
    },
    link: {
        color: '#2563eb',
        cursor: 'pointer',
    },
    divider: {
        margin: '0 8px',
        color: '#999',
    },
};
