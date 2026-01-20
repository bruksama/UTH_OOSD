import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LoginProps {
    setIsAuthenticated: (value: boolean) => void;
}

function Login({ setIsAuthenticated }: LoginProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'student' | 'teacher'>('student');

    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        const user = JSON.parse(localStorage.getItem('user') || 'null');

        if (!user) {
            alert('Account does not exist');
            return;
        }

        if (
            username === user.username &&
            password === user.password &&
            role === user.role
        ) {
            localStorage.setItem('isAuthenticated', 'true');
            setIsAuthenticated(true);

            // ✅ DẪN TRANG THEO ROLE ĐƯỢC CHỌN
            if (role === 'teacher') {
                navigate('/teacher/dashboard');
            } else {
                navigate('/student/dashboard');
            }
        } else {
            alert('Sai tài khoản / mật khẩu / vai trò');
        }
    };

    return (
        <div style={styles.container}>
            <form style={styles.card} onSubmit={handleLogin}>
                <h2 style={styles.title}>Đăng nhập</h2>

                <input
                    type="text"
                    placeholder="Tên đăng nhập"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={styles.input}
                />

                <input
                    type="password"
                    placeholder="Mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={styles.input}
                />

                {/* ✅ CHỌN SINH VIÊN / GIÁO VIÊN */}
                <div style={styles.roleBox}>
                    <label>
                        <input
                            type="radio"
                            value="student"
                            checked={role === 'student'}
                            onChange={() => setRole('student')}
                        />
                        Sinh viên
                    </label>

                    <label>
                        <input
                            type="radio"
                            value="teacher"
                            checked={role === 'teacher'}
                            onChange={() => setRole('teacher')}
                        />
                        Giáo viên
                    </label>
                </div>

                <button type="submit" style={styles.button}>
                    Đăng nhập
                </button>

                <div style={styles.links}>
                    <span
                        style={styles.link}
                        onClick={() => navigate('/register')}
                    >
                        Đăng ký
                    </span>

                    <span style={styles.divider}>|</span>

                    <span
                        style={styles.link}
                        onClick={() => navigate('/forgot-password')}
                    >
                        Quên mật khẩu?
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
    },
    input: {
        width: '100%',
        padding: 12,
        marginBottom: 15,
        borderRadius: 6,
        border: '1px solid #ddd',
        fontSize: 16,
    },
    roleBox: {
        display: 'flex',
        justifyContent: 'space-around',
        marginBottom: 15,
        fontSize: 15,
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
