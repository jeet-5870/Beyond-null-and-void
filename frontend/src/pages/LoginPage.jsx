import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/card.jsx';
import { Droplets } from 'lucide-react';
import API from '../api.js';

const LoginPage = ({ onLogin }) => {
  const [mode, setMode] = useState('signup'); // 'login' or 'signup'
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('guest'); // 'ngo', 'guest', 'researcher'
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await API.post('/api/auth/login', { fullname, password, role });

      if (res.data?.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', role);
        onLogin(true);

        if (role === 'ngo') navigate('/ngo-dashboard');
        else if (role === 'researcher') navigate('/researcher-dashboard');
        else navigate('/guest-dashboard');
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const res = await API.post('/api/auth/signup', {
        fullname,
        email,
        password,
        role
      });

      if (res.data?.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', role);
        onLogin(true);

        if (role === 'ngo') navigate('/ngo-dashboard');
        else if (role === 'researcher') navigate('/researcher-dashboard');
        else navigate('/guest-dashboard');
      } else {
        setError('Sign-up failed. Please try again.');
      }
    } catch (err) {
      console.error('Sign-up error:', err);
      setError(err.response?.data?.error || 'Sign-up failed. Please check your input.');
    }
  };

  const handleForgotPassword = () => {
    console.log('Forgot password clicked');
    // You can navigate to a /forgot-password route or show a modal
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-color">
      <Card className="max-w-md w-full p-8 space-y-6">
        <div className="flex flex-col items-center">
          <Droplets className="h-12 w-12 text-blue-600 mb-2" />
          <h2 className="text-3xl font-bold text-center text-gray-900">
            {mode === 'login' ? 'Login' : 'Sign Up'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {mode === 'login'
              ? 'Sign in to access the dashboard.'
              : 'Create an account to get started.'}
          </p>
        </div>

        <form onSubmit={mode === 'login' ? handleLogin : handleSignUp} className="space-y-4">
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">Select Role</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
              placeholder="Full Name"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              className="block w-full px-3 py-2 border rounded-md text-gray-900"
            />
          </div>

          {mode === 'signup' && (
            <>
              <div>
                <label htmlFor="email" className="sr-only">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-3 py-2 border rounded-md text-gray-900"
                />
              </div>
            </>
          )}

          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-3 py-2 border rounded-md text-gray-900"
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
                className="block w-full px-3 py-2 border rounded-md text-gray-900"
              />
            </div>
          )}

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <button
            type="submit"
            className="w-full py-2 px-4 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            {mode === 'login' ? 'Sign in' : 'Sign up'}
          </button>
        </form>

        <div className="flex justify-between items-center text-sm">
          {mode === 'login' ? (
            <>
              <button onClick={handleForgotPassword} className="text-blue-600 hover:underline">
                Forgot Password?
              </button>
              <button onClick={() => setMode('signup')} className="text-gray-600 hover:underline">
                Create Account
              </button>
            </>
          ) : (
            <button onClick={() => setMode('login')} className="text-gray-600 hover:underline">
              Back to Login
            </button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
