import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');

    const handleRegister = () => {
        if (!username || !password) {
            alert('Please fill all fields');
            return;
        }

        if (password !== confirm) {
            alert('Passwords do not match');
            return;
        }

        localStorage.setItem(
            'user',
            JSON.stringify({ username, password })
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

            <button onClick={handleRegister}>Register</button>

            <p onClick={() => navigate('/login')}>Back to login</p>
        </div>
    );
}
