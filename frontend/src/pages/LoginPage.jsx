import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../components/card.jsx';
import { Droplets, Mail, Smartphone, Send, Key } from 'lucide-react';
import API, { AuthAPI } from '../api.js';

const LoginPage = ({ onLogin }) => {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [mode, setMode] = useState('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [fullname, setFullname] = useState('');
  const [role, setRole] = useState('guest');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEmail = identifier.includes('@');
  const identifierType = isEmail ? 'Email' : 'Phone Number';

  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);
    setIsResettingPassword(false);

    if (!identifier) {
      setError('Please enter your email or phone number.');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await AuthAPI.post('/initiate-auth', { identifier, mode });
      const data = res.data;

      if (data.nextStep === 'password') {
        setStep(1);
        if (data.error) {
          setError(data.error);
          setMode('signup');
        }
      } else if (data.nextStep === 'otp') {
        setStep(2);
        setMessage(data.message);
      } else {
        setError('Invalid response from server.');
      }
    } catch (err) {
      console.error('Auth initiation error:', err);
      setError(err.response?.data?.error || `Could not initiate authentication.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordAuth = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setIsSubmitting(false);
        return;
      }
      if (!fullname) {
        setError('Full Name is required.');
        setIsSubmitting(false);
        return;
      }
    } else if (!password) {
      setError('Password is required.');
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = { identifier, password, fullname, role, mode };
      const res = await AuthAPI.post('/password-auth', payload);

      if (res.data?.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', res.data.role);
        if (onLogin) onLogin(true);
        navigate('/dashboard');
      } else if (res.data?.nextStep === 'otp') {
        setStep(2);
        setMessage(res.data.message);
      }
    } catch (err) {
      console.error('Password Auth error:', err);
      setError(err.response?.data?.error || 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestOtp = async () => {
    setError('');
    setMessage('');
    setIsSubmitting(true);
    setIsResettingPassword(true);

    try {
      const res = await AuthAPI.post('/request-otp', { identifier });
      setStep(2);
      setMessage(res.data.message);
    } catch (err) {
      setIsResettingPassword(false);
      setError(err.response?.data?.error || 'Failed to send OTP. User not found.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOTPVerify = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!otp) {
      setError('OTP is required.');
      setIsSubmitting(false);
      return;
    }
    
    if (isResettingPassword) {
      if (!newPassword || newPassword.length < 6) {
        setError('New password must be at least 6 characters long.');
        setIsSubmitting(false);
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setError('New passwords do not match.');
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const payload = isResettingPassword 
        ? { identifier, otp, newPassword } 
        : { identifier, otp };
        
      const res = await AuthAPI.post('/verify-otp', payload);

      if (res.data?.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', res.data.role);
        if (onLogin) onLogin(true);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'OTP verification failed. Incorrect or expired code.');
    } finally {
      setIsSubmitting(false);
      setNewPassword('');
      setConfirmNewPassword('');
      setIsResettingPassword(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setStep(0);
    setError('');
    setMessage('');
    setIdentifier('');
    setPassword('');
    setOtp('');
    setFullname('');
    setConfirmPassword('');
    setRole('guest');
    setIsResettingPassword(false);
  };

  const renderFormStep = () => {
    if (step === 0) {
      return (
        <form onSubmit={handleInitialSubmit} className="space-y-4">
          <div>
            <label htmlFor="identifier" className="sr-only">Email or Phone</label>
            <input
              id="identifier"
              name="identifier"
              type="text"
              required
              placeholder="Email or Phone Number"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-secondary-dark text-gray-800 dark:text-text-light rounded-md focus:ring-accent-blue focus:border-accent-blue"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 px-4 text-sm font-medium rounded-md text-white dark:text-primary-dark bg-sky-500 dark:bg-accent-blue hover:bg-sky-600 dark:hover:bg-sky-400/80 transition disabled:opacity-50"
          >
            {isSubmitting ? 'Checking...' : mode === 'login' ? 'Continue to Login' : 'Continue to Sign Up'}
          </button>
        </form>
      );
    }

    if (step === 1) {
      return (
        <form onSubmit={handlePasswordAuth} className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-text-muted text-center font-semibold">
            {mode === 'login' ? `Login as ${identifier}:` : `Complete sign up for ${identifier}:`}
          </p>

          {mode === 'signup' && (
            <>
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-600 dark:text-text-muted">Select Role</label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-secondary-dark text-gray-800 dark:text-text-light rounded-md shadow-sm focus:outline-none focus:ring-accent-blue focus:border-accent-blue"
                >
                  <option value="ngo">NGO</option>
                  <option value="guest">Guest</option>
                  <option value="researcher">Researcher</option>
                </select>
              </div>
              <div>
                <label htmlFor="fullname" className="sr-only">Full Name</label>
                <input
                  id="fullname"
                  name="fullname"
                  type="text"
                  required
                  placeholder="Full Name / Organization Name"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-secondary-dark text-gray-800 dark:text-text-light rounded-md focus:ring-accent-blue focus:border-accent-blue"
                />
              </div>
            </>
          )}

          <div>
            <div className="flex items-center space-x-2">
              <Key className="h-4 w-4 text-gray-500 dark:text-text-muted" />
              <label htmlFor="password" className="block text-sm font-medium text-gray-600 dark:text-text-muted">Password</label>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-secondary-dark text-gray-800 dark:text-text-light rounded-md focus:ring-accent-blue focus:border-accent-blue"
            />
          </div>

          {mode === 'signup' && (
            <div>
              <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-secondary-dark text-gray-800 dark:text-text-light rounded-md focus:ring-accent-blue focus:border-accent-blue"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 px-4 text-sm font-medium rounded-md text-white dark:text-primary-dark bg-emerald-500 dark:bg-success hover:bg-emerald-600 dark:hover:bg-success/80 transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Key className="h-4 w-4" />
            <span>{mode === 'login' ? 'Login with Password' : 'Sign Up'}</span>
          </button>

          {mode === 'login' && (
            <button
              type="button"
              onClick={handleRequestOtp}
              disabled={isSubmitting}
              className="w-full py-2 px-4 text-sm font-medium rounded-md text-white dark:text-primary-dark bg-sky-500 dark:bg-accent-blue hover:bg-sky-600 dark:hover:bg-sky-400/80 transition flex items-center justify-center space-x-2 mt-2 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              <span>Forgot Password? Request Reset OTP</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setStep(0)}
            className="w-full text-gray-600 dark:text-text-muted hover:underline text-sm mt-4"
          >
            Change Identifier
          </button>
        </form>
      );
    }

    if (step === 2) {
      return (
        <form onSubmit={handleOTPVerify} className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-text-muted text-center">
            Enter the 6-digit code sent to your {identifierType}.
          </p>
          
          {isResettingPassword && (
              <>
              <p className="text-sm font-semibold text-accent-blue text-center pt-2">Set New Password</p>
              <div>
                <label htmlFor="newPassword" className="sr-only">New Password</label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  placeholder="New Password (min 6 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-secondary-dark text-gray-800 dark:text-text-light rounded-md focus:ring-accent-blue focus:border-accent-blue"
                />
              </div>
              <div>
                <label htmlFor="confirmNewPassword" className="sr-only">Confirm New Password</label>
                <input
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  type="password"
                  required
                  placeholder="Confirm New Password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-secondary-dark text-gray-800 dark:text-text-light rounded-md focus:ring-accent-blue focus:border-accent-blue"
                />
              </div>
              </>
          )}

          <div>
            <label htmlFor="otp" className="sr-only">OTP Code</label>
            <input
              id="otp"
              name="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              required
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-secondary-dark text-gray-800 dark:text-text-light text-center rounded-md focus:ring-accent-blue focus:border-accent-blue tracking-widest"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 px-4 text-sm font-medium rounded-md text-white dark:text-primary-dark bg-emerald-500 dark:bg-success hover:bg-emerald-600 dark:hover:bg-success/80 transition disabled:opacity-50"
          >
            {isResettingPassword ? 'Reset Password & Login' : 'Verify OTP'}
          </button>
          <button
            type="button"
            onClick={handleRequestOtp}
            disabled={isSubmitting}
            className="w-full text-accent-blue hover:underline text-sm mt-2 disabled:opacity-50"
          >
            Resend OTP
          </button>
          <button
            type="button"
            onClick={() => setStep(0)}
            className="w-full text-gray-600 dark:text-text-muted hover:underline text-sm mt-4"
          >
            Change Identifier
          </button>
        </form>
      );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-primary-dark">
      <Card className="max-w-md w-full p-8 space-y-6">
        <div className="flex flex-col items-center">
          <Droplets className="h-12 w-12 text-accent-blue mb-2" />
          <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-text-light">
            {isResettingPassword ? 'Reset Account' : (mode === 'login' ? 'Access Account' : 'Create Account')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-text-muted">
            {step === 0 ? 'Enter email or phone to begin.' : `Authenticating: ${identifier}`}
          </p>
        </div>

        {error && <p className="text-sm text-danger text-center">{error}</p>}
        {message && <p className="text-sm text-success text-center">{message}</p>}

        {renderFormStep()}

        <div className="flex justify-center items-center text-sm border-t border-gray-200 dark:border-gray-700 pt-4">
          <button onClick={toggleMode} className="text-gray-600 dark:text-text-muted hover:underline">
            {mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Login'}
          </button>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;