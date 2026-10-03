import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { handleApiError } from '../services/api';
import { 
  Mail, Lock, Loader2, AlertCircle, Eye, EyeOff, 
  Bed, Wrench, BarChart3, CheckCircle2, User, UserPlus, X, Building2
} from 'lucide-react';

const Login = () => {
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Registration Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState('resident');
  
  const [regErrors, setRegErrors] = useState({});
  const [regApiError, setRegApiError] = useState('');
  const [regIsLoading, setRegIsLoading] = useState(false);

  const navigate = useNavigate();

  // --- Login Logic ---
  const validateLogin = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email address is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    }
    return newErrors;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setApiSuccess('');
    
    const formErrors = validateLogin();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setErrors({});
    setIsLoading(true);

    try {
      console.log('Sending login request:', { email });
      const response = await api.post('/auth/login', {
        email,
        password
      });

      console.log('Login response status:', response.status);
      console.log('Login response data:', response.data);

      const { token, user } = response.data;

      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect to dashboard
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Login error caught:', error);
      const errorMsg = handleApiError(error, 'Unable to connect to backend');
      setApiError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Registration Logic ---
  const validateRegistration = () => {
    const newErrors = {};
    if (!regFullName) newErrors.fullName = 'Full Name is required';
    
    if (!regEmail) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(regEmail)) {
      newErrors.email = 'Email address is invalid';
    }
    
    if (!regPassword) {
      newErrors.password = 'Password is required';
    } else if (regPassword.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (regPassword !== regConfirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    return newErrors;
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegApiError('');
    
    const formErrors = validateRegistration();
    if (Object.keys(formErrors).length > 0) {
      setRegErrors(formErrors);
      return;
    }
    
    setRegErrors({});
    setRegIsLoading(true);

    try {
      console.log('Sending registration request:', { email: regEmail, name: regFullName, role: regRole });
      const response = await api.post('/auth/register', {
        name: regFullName,
        email: regEmail,
        password: regPassword,
        role: regRole
      });

      console.log('Registration response status:', response.status);
      console.log('Registration response data:', response.data);

      // On Success
      setIsModalOpen(false);
      setApiSuccess('Account created successfully! Please sign in.');
      setEmail(regEmail); // Auto-fill login email
      
      // Reset registration form
      setRegFullName('');
      setRegEmail('');
      setRegPassword('');
      setRegConfirmPassword('');
      setRegRole('resident');
      
    } catch (error) {
      console.error('Registration error caught:', error);
      const errorMsg = handleApiError(error, 'Unable to connect to backend');
      setRegApiError(errorMsg);
    } finally {
      setRegIsLoading(false);
    }
  };

  const closeRegistrationModal = () => {
    setIsModalOpen(false);
    setRegErrors({});
    setRegApiError('');
  };

  return (
    <div className="min-h-screen flex w-full font-sans bg-gray-50">
      
      {/* LEFT SIDE - Desktop Only */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-900 via-indigo-700 to-violet-800 p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-white/5 blur-[100px]"></div>
          <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-400/10 blur-[80px]"></div>
        </div>

        <div className="z-10 text-white mt-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-white/20 p-2.5 rounded-full backdrop-blur-sm border border-white/20 shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">Hostel Management System</h1>
          </div>
          <p className="text-xl text-indigo-100/90 max-w-md font-light leading-relaxed">
            Manage residents, rooms, maintenance and billing in one place.
          </p>
        </div>

        <div className="z-10 space-y-5 mb-10">
          <div className="bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-2xl flex items-start gap-4 transition-transform hover:-translate-y-1 duration-300 shadow-[0_4px_20px_rgb(0,0,0,0.1)]">
            <div className="bg-gradient-to-br from-indigo-400 to-indigo-600 p-3 rounded-xl shadow-inner">
              <Bed className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Room Allocation</h3>
              <p className="text-indigo-200/80 text-sm mt-1">Smart assignments and capacity management</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-2xl flex items-start gap-4 transition-transform hover:-translate-y-1 duration-300 shadow-[0_4px_20px_rgb(0,0,0,0.1)]">
            <div className="bg-gradient-to-br from-indigo-400 to-indigo-600 p-3 rounded-xl shadow-inner">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Maintenance Tracking</h3>
              <p className="text-indigo-200/80 text-sm mt-1">Streamlined ticketing and issue resolution</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-2xl flex items-start gap-4 transition-transform hover:-translate-y-1 duration-300 shadow-[0_4px_20px_rgb(0,0,0,0.1)]">
            <div className="bg-gradient-to-br from-indigo-400 to-indigo-600 p-3 rounded-xl shadow-inner">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Financial Reports</h3>
              <p className="text-indigo-200/80 text-sm mt-1">Automated billing and real-time insights</p>
            </div>
          </div>
        </div>
        
        <div className="z-10 text-indigo-200/60 text-sm">
          &copy; {new Date().getFullYear()} Hostel Management System. All rights reserved.
        </div>
      </div>

      {/* RIGHT SIDE - Login Area */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-gray-50/50">
        <div className="w-full max-w-md">
          {/* Mobile header (hidden on desktop) */}
          <div className="lg:hidden text-center mb-8 flex flex-col items-center">
            <div className="inline-flex bg-gradient-to-br from-indigo-600 to-violet-600 p-3 rounded-full mb-4 shadow-lg shadow-indigo-600/30 text-white border border-indigo-400/20">
              <Building2 className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900">Welcome Back</h1>
            <p className="text-gray-500 mt-2">Sign in to continue</p>
          </div>

          {/* Desktop header */}
          <div className="hidden lg:block mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome Back</h2>
            <p className="text-gray-500 mt-2 text-base">Sign in to continue</p>
          </div>

          {apiError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-start gap-3 mb-6 animate-in fade-in slide-in-from-top-2 shadow-sm">
              <AlertCircle className="text-red-500 mt-0.5 shrink-0" size={18} />
              <p className="text-sm text-red-700 font-medium">{apiError}</p>
            </div>
          )}

          {apiSuccess && (
            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-xl flex items-start gap-3 mb-6 animate-in fade-in slide-in-from-top-2 shadow-sm">
              <CheckCircle2 className="text-emerald-500 mt-0.5 shrink-0" size={18} />
              <p className="text-sm text-emerald-700 font-medium">{apiSuccess}</p>
            </div>
          )}

          {/* Glassmorphism form wrapper */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8">
            <form className="space-y-5" onSubmit={handleLoginSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className={`h-5 w-5 ${errors.email ? 'text-red-400' : 'text-gray-400'}`} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className={`appearance-none block w-full pl-12 pr-3 py-3 border ${errors.email ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500'} rounded-2xl focus:outline-none focus:ring-2 sm:text-sm transition-all duration-200 hover:border-gray-300`}
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                  />
                </div>
                {errors.email && <p className="mt-1.5 text-sm text-red-600 font-medium animate-in fade-in">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className={`h-5 w-5 ${errors.password ? 'text-red-400' : 'text-gray-400'}`} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className={`appearance-none block w-full pl-12 pr-12 py-3 border ${errors.password ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500'} rounded-2xl focus:outline-none focus:ring-2 sm:text-sm transition-all duration-200 hover:border-gray-300`}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: '' });
                    }}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors rounded-r-2xl focus:outline-none focus:text-indigo-500"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && <p className="mt-1.5 text-sm text-red-600 font-medium animate-in fade-in">{errors.password}</p>}
              </div>

              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center group">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer transition-colors group-hover:border-indigo-400"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 cursor-pointer select-none group-hover:text-gray-900 transition-colors">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <button type="button" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                    Forgot password?
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-2xl shadow-[0_4px_14px_0_rgb(79,70,229,0.39)] text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-[0_6px_20px_rgb(79,70,229,0.23)] active:scale-[0.98]"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="animate-spin h-5 w-5" />
                      Signing in...
                    </span>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">OR</span>
                </div>
              </div>

              <div className="mt-8 text-center bg-gray-50/50 p-4 rounded-2xl border border-gray-100/80">
                <p className="text-sm text-gray-600 font-medium">
                  Don't have an account?{' '}
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors ml-1 focus:outline-none focus:underline"
                  >
                    Create Account
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          {/* Background backdrop */}
          <div 
            className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
          >
            <div 
              className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity duration-300" 
              aria-hidden="true"
              onClick={closeRegistrationModal}
            ></div>

            {/* Center modal trick */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            {/* Modal panel */}
            <div className="relative z-10 inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md w-full animate-in zoom-in-95 duration-200 border border-gray-100">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-8 sm:pb-6 relative">
                
                <button 
                  onClick={closeRegistrationModal}
                  className="absolute top-5 right-5 text-gray-400 hover:text-gray-900 transition-colors rounded-full p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <X size={20} />
                </button>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-2xl leading-6 font-extrabold text-gray-900 mb-2" id="modal-title">
                      Create an Account
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">Join the hostel management system today.</p>
                    
                    {regApiError && (
                      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-start gap-2 mb-6">
                        <AlertCircle className="text-red-500 mt-0.5 shrink-0" size={16} />
                        <p className="text-sm text-red-700 font-medium">{regApiError}</p>
                      </div>
                    )}

                    <form className="space-y-4" onSubmit={handleRegisterSubmit}>
                      
                      {/* Full Name */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <User className={`h-5 w-5 ${regErrors.fullName ? 'text-red-400' : 'text-gray-400'}`} />
                          </div>
                          <input
                            type="text"
                            className={`appearance-none block w-full pl-12 pr-3 py-3 border ${regErrors.fullName ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500'} rounded-2xl focus:outline-none focus:ring-2 sm:text-sm transition-all duration-200`}
                            placeholder="John Doe"
                            value={regFullName}
                            onChange={(e) => {
                              setRegFullName(e.target.value);
                              if (regErrors.fullName) setRegErrors({...regErrors, fullName: ''});
                            }}
                          />
                        </div>
                        {regErrors.fullName && <p className="mt-1.5 text-xs text-red-600 font-medium">{regErrors.fullName}</p>}
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className={`h-5 w-5 ${regErrors.email ? 'text-red-400' : 'text-gray-400'}`} />
                          </div>
                          <input
                            type="email"
                            className={`appearance-none block w-full pl-12 pr-3 py-3 border ${regErrors.email ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500'} rounded-2xl focus:outline-none focus:ring-2 sm:text-sm transition-all duration-200`}
                            placeholder="you@example.com"
                            value={regEmail}
                            onChange={(e) => {
                              setRegEmail(e.target.value);
                              if (regErrors.email) setRegErrors({...regErrors, email: ''});
                            }}
                          />
                        </div>
                        {regErrors.email && <p className="mt-1.5 text-xs text-red-600 font-medium">{regErrors.email}</p>}
                      </div>

                      {/* Password */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className={`h-5 w-5 ${regErrors.password ? 'text-red-400' : 'text-gray-400'}`} />
                          </div>
                          <input
                            type="password"
                            className={`appearance-none block w-full pl-12 pr-3 py-3 border ${regErrors.password ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500'} rounded-2xl focus:outline-none focus:ring-2 sm:text-sm transition-all duration-200`}
                            placeholder="••••••••"
                            value={regPassword}
                            onChange={(e) => {
                              setRegPassword(e.target.value);
                              if (regErrors.password) setRegErrors({...regErrors, password: ''});
                            }}
                          />
                        </div>
                        {regErrors.password && <p className="mt-1.5 text-xs text-red-600 font-medium">{regErrors.password}</p>}
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className={`h-5 w-5 ${regErrors.confirmPassword ? 'text-red-400' : 'text-gray-400'}`} />
                          </div>
                          <input
                            type="password"
                            className={`appearance-none block w-full pl-12 pr-3 py-3 border ${regErrors.confirmPassword ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500'} rounded-2xl focus:outline-none focus:ring-2 sm:text-sm transition-all duration-200`}
                            placeholder="••••••••"
                            value={regConfirmPassword}
                            onChange={(e) => {
                              setRegConfirmPassword(e.target.value);
                              if (regErrors.confirmPassword) setRegErrors({...regErrors, confirmPassword: ''});
                            }}
                          />
                        </div>
                        {regErrors.confirmPassword && <p className="mt-1.5 text-xs text-red-600 font-medium">{regErrors.confirmPassword}</p>}
                      </div>

                      {/* Role */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Select Role</label>
                        <div className="relative group">
                          <select
                            className="appearance-none block w-full pl-4 pr-10 py-3 border border-gray-200 bg-gray-50/50 hover:bg-gray-100 focus:bg-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm cursor-pointer transition-all duration-200 font-medium text-gray-700"
                            value={regRole}
                            onChange={(e) => setRegRole(e.target.value)}
                          >
                            <option value="resident">Resident</option>
                            <option value="staff">Staff</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 group-hover:text-indigo-500 transition-colors">
                            <svg className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 mt-6 border-t border-gray-100">
                        <button
                          type="submit"
                          disabled={regIsLoading}
                          className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-2xl shadow-[0_4px_14px_0_rgb(79,70,229,0.39)] text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-[0_6px_20px_rgb(79,70,229,0.23)] active:scale-[0.98]"
                        >
                          {regIsLoading ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="animate-spin h-5 w-5" />
                              Creating Account...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <UserPlus className="h-5 w-5" />
                              Register
                            </span>
                          )}
                        </button>
                      </div>

                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Login;
