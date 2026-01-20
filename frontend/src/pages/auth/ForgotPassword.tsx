import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleReset = () => {
        if (!username || !newPassword || !confirmPassword) {
            alert('Please fill in all fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        // ✅ LẤY USER TỪ localStorage
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

        if (!storedUser.username) {
            alert('No user found. Please register first');
            return;
        }

        if (storedUser.username !== username) {
            alert('Username not found');
            return;
        }

        // ✅ CẬP NHẬT MẬT KHẨU
        localStorage.setItem(
            'user',
            JSON.stringify({ username, password: newPassword })
        );

        alert('Password reset successful');
        navigate('/login');
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Reset Password</h2>

                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={styles.input}
                />

                <input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={styles.input}
                />

                <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={styles.input}
                />

                <button onClick={handleReset} style={styles.button}>
                    Confirm
                </button>

                <p style={styles.back} onClick={() => navigate('/login')}>
                    Back to login
                </p>
            </div>
        </div>
    );
}

/* ===== Styles (GIỮ NGUYÊN) ===== */
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
    back: {
        marginTop: 15,
        textAlign: 'center',
        color: '#2563eb',
        cursor: 'pointer',
        fontSize: 14,
    },
};
