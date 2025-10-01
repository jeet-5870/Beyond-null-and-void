import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/card.jsx';
import { Droplets, Mail, Smartphone, Send, Lock } from 'lucide-react'; // Added icons
import API from '../api.js';

const LoginPage = () => {
  // 🔑 Step 1: Input Identifier (Email/Phone), Step 2: Input OTP, Step 3: Done/Redirect
  const [step, setStep] = useState(1); 
  const [mode, setMode] = useState('signup'); // 'login' or 'signup'
  
  // 🔑 Identifier state now holds either email or phone number
  const [identifier, setIdentifier] = useState(''); 
  const [otp, setOtp] = useState('');
  
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState(''); // Retained for signup data collection
  const [phone, setPhone] = useState(''); // New state for phone in signup
  
  const [password, setPassword] = useState(''); // Retained for backend compatibility, though functionally unused in OTP login
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('guest');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  
  const isEmail = identifier.includes('@');
  const identifierType = isEmail ? 'Email' : 'Phone Number';

  const handleIdentifierChange = (e) => {
    setIdentifier(e.target.value);
    // Auto-fill email/phone state if in signup mode
    if (mode === 'signup') {
        if (e.target.value.includes('@')) {
            setEmail(e.target.value);
            setPhone('');
        } else {
            setPhone(e.target.value);
            setEmail('');
        }
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const payload = mode === 'signup' ? 
        { fullname, email: email || null, phone: phone || null, role, identifier } :
        { identifier };

    try {
        const endpoint = mode === 'signup' ? '/api/auth/signup' : '/api/auth/login';
        
        // 🔑 1. Mock API call to initiate OTP or sign up + send OTP
        const res = await API.post(endpoint, payload); 

        if (res.data?.success) {
            setMessage(`OTP sent successfully to ${identifier}!`);
            setStep(2); // Move to OTP verification step
        } else {
            // Handle case where login endpoint might reject without success: true
            setError(res.data?.error || 'Failed to send OTP. Please check your details.');
        }
    } catch (err) {
        console.error('OTP send error:', err);
        setError(err.response?.data?.error || `Error sending OTP via ${identifierType}.`);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      // 🔑 2. Mock API call to verify OTP
      const res = await API.post('/api/auth/verify-otp', { identifier, otp });

      if (res.data?.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', res.data.role);
        // Assuming navigation works without onLogin prop (as updated in App.jsx)
        navigate('/dashboard'); 
      } else {
        setError(res.data?.error || 'OTP verification failed. Check the code and try again.');
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      setError(err.response?.data?.error || 'OTP verification failed.');
    }
  };

  const handleForgotPassword = () => {
    console.log('Forgot password clicked');
    // In an OTP flow, "Forgot Password" usually means starting the OTP process again.
    setStep(1); 
    setIdentifier('');
    setOtp('');
    setError('');
    setMessage('');
    setMode('login');
  };
  
  // 🔑 Helper function to render step 1 content
  const renderStep1 = () => (
    <>
        <div className="space-y-4">
            {mode === 'signup' && (
                <>
                    {/* Full Name / Organization Name */}
                    <div>
                        <input
                            id="fullname"
                            name="fullname"
                            type="text"
                            required
                            placeholder="Full Name / Organization Name"
                            value={fullname}
                            onChange={(e) => setFullname(e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-600 bg-secondary-dark text-text-light rounded-md focus:ring-accent-blue focus:border-accent-blue"
                        />
                    </div>
                    {/* Role Selection */}
                    <div>
                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-600 bg-secondary-dark text-text-light rounded-md shadow-sm focus:outline-none focus:ring-accent-blue focus:border-accent-blue"
                        >
                            <option value="ngo">NGO</option>
                            <option value="guest">Guest</option>
                            <option value="researcher">Researcher</option>
                        </select>
                    </div>
                </>
            )}

            {/* Identifier (Email/Phone) Input */}
            <div className="relative">
                <Mail className={`h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 ${identifier && identifier.includes('@') ? 'text-accent-blue' : 'text-text-muted'}`} />
                <Smartphone className={`h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 ${identifier && !identifier.includes('@') && identifier.length > 0 ? 'text-accent-blue' : 'text-text-muted'}`} />
                <input
                    id="identifier"
                    name="identifier"
                    type="text"
                    required
                    placeholder="Email OR Phone Number"
                    value={identifier}
                    onChange={handleIdentifierChange}
                    className="block w-full px-3 py-2 pl-10 border border-gray-600 bg-secondary-dark text-text-light rounded-md focus:ring-accent-blue focus:border-accent-blue"
                />
            </div>
            
            {/* Note: Password fields are removed for OTP flow */}
            {error && <p className="text-sm text-danger text-center">{error}</p>}
            {message && <p className="text-sm text-success text-center">{message}</p>}

            <button
                type="submit"
                className="w-full py-2 px-4 text-sm font-medium rounded-md text-primary-dark bg-accent-blue hover:bg-sky-400/80 flex items-center justify-center space-x-2 transition"
            >
                <Send className="h-4 w-4" />
                <span>Send OTP</span>
            </button>
        </div>
    </>
  );

  // 🔑 Helper function to render step 2 content
  const renderStep2 = () => (
    <div className="space-y-4">
        <p className="text-sm text-text-light text-center">
            Verification code sent to <span className="font-semibold text-accent-blue">{identifier}</span>.
        </p>
        
        {/* OTP Input */}
        <div className="relative">
            <Lock className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" />
            <input
                id="otp"
                name="otp"
                type="text"
                required
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className="block w-full px-3 py-2 pl-10 border border-gray-600 bg-primary-dark text-text-light rounded-md focus:ring-accent-blue focus:border-accent-blue text-center tracking-widest"
            />
        </div>
        
        {error && <p className="text-sm text-danger text-center">{error}</p>}
        {message && <p className="text-sm text-success text-center">{message}</p>}

        <button
            type="submit"
            className="w-full py-2 px-4 text-sm font-medium rounded-md text-primary-dark bg-success hover:bg-success/80 flex items-center justify-center space-x-2 transition"
        >
            <Lock className="h-4 w-4" />
            <span>Verify & Login</span>
        </button>
        
        <div className="flex justify-center pt-2">
            <button 
                type="button" 
                onClick={() => setStep(1)} 
                className="text-sm text-text-muted hover:text-accent-blue transition"
            >
                Resend or Change Identifier
            </button>
        </div>
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-primary-dark">
      <Card className="max-w-md w-full p-8 space-y-6">
        <div className="flex flex-col items-center">
          <Droplets className="h-12 w-12 text-accent-blue mb-2" />
          <h2 className="text-3xl font-bold text-center text-text-light">
            {mode === 'login' ? 'Login via OTP' : 'Sign Up via OTP'}
          </h2>
          <p className="mt-2 text-center text-sm text-text-muted">
            {step === 1 
                ? `Enter your details to receive an OTP for ${mode} access.`
                : 'Enter the verification code sent to your device.'}
          </p>
        </div>

        <form onSubmit={step === 1 ? handleSendOTP : handleVerifyOTP} className="space-y-4">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
        </form>

        <div className="flex justify-between items-center text-sm">
          {mode === 'login' ? (
            <>
              {/* Resetting flow for security */}
              <button onClick={handleForgotPassword} className="text-accent-blue hover:underline">
                Start Over / Resend Code
              </button>
              <button onClick={() => {setMode('signup'); setStep(1); setError(''); setMessage('');}} className="text-text-muted hover:underline">
                Need an Account?
              </button>
            </>
          ) : (
            <button onClick={() => {setMode('login'); setStep(1); setError(''); setMessage('');}} className="text-text-muted hover:underline">
              Already have an Account?
            </button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
