import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resetPassword } from '../../services/auth.service';
import { getFirebaseErrorMessage } from '../../utils/firebaseErrors';

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword(email);
      setSuccess('Password reset email sent! Check your inbox for instructions.');
      setEmail('');
    } catch (err: any) {
      const message = getFirebaseErrorMessage(err.code);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <form
        onSubmit={handleReset}
        className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg"
      >
        <h2 className="text-2xl font-bold text-center mb-2">Reset Password</h2>
        <p className="text-slate-600 text-center text-sm mb-6">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {error && (
          <div className="p-3 mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 mb-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm text-center">
            {success}
          </div>
        )}

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </div>

        <p
          className="mt-6 text-center text-sm text-primary-600 hover:underline cursor-pointer"
          onClick={() => navigate('/login')}
        >
          Back to login
        </p>
      </form>
    </div>
  );
}
