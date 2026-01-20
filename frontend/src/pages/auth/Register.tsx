import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

export default function Register() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [role, setRole] = useState<'student' | 'teacher'>('student');

    const handleRegister = () => {
        if (!username || !password || !confirm) {
            alert('Please fill all fields');
            return;
        }

        if (password !== confirm) {
            alert('Passwords do not match');
            return;
        }

        localStorage.setItem(
            'user',
            JSON.stringify({
                username,
                password,
                role,
            })
        );

        alert('Register successful');
        navigate('/login');
    };

    return (
        <div className="auth">
            <h2>Register</h2>

            <input
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <input
                type="password"
                placeholder="Confirm Password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
            />

            <select
                value={role}
                onChange={(e) =>
                    setRole(e.target.value as 'student' | 'teacher')
                }
                className="auth-select"
            >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
            </select>

            <button onClick={handleRegister}>Register</button>

            <p className="auth-link" onClick={() => navigate('/login')}>
                Back to login
            </p>
        </div>
    );
}
