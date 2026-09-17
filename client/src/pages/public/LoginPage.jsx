import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Key
} from 'lucide-react';
import { useDialog, useToast } from '../../context/NotificationContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { showAlert } = useDialog();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Universal Role-Aware Routing: Routes each accredited role directly to their authorized workspace
  const routeByRole = (userRole) => {
    const roleLower = (userRole || '').toLowerCase();
    if (roleLower === 'institute_admin' || roleLower === 'org_admin') {
      navigate('/institute/dashboard');
    } else if (roleLower === 'platform_admin' || roleLower === 'platform_super_admin' || roleLower === 'admin') {
      navigate('/admin/dashboard');
    } else if (roleLower === 'trainer') {
      navigate('/trainer/dashboard');
    } else if (roleLower === 'certificate_verifier') {
      navigate('/verify');
    } else {
      navigate('/trainee/dashboard');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      toast.success(`Welcome, ${user.name}! Redirecting to workspace...`, 'Login Successful');
      routeByRole(user.role);
    } catch (err) {
      const errorMsg = err.message || 'Authentication failed. Please verify your email and password.';
      setError(errorMsg);
      toast.error(errorMsg, 'Sign In Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFillCredentials = (fillEmail, fillPassword) => {
    setEmail(fillEmail);
    setPassword(fillPassword);
    setError('');
  };

  return (
    <div className="w-full min-h-full flex items-center justify-center p-3 sm:p-4 lg:p-6 select-none bg-gradient-to-b from-slate-100 via-[#F8FAFC] to-slate-100">
      <div className="max-w-md w-full my-auto py-4">
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xl space-y-3.5 text-xs">

          {/* Header */}
          <div className="space-y-2 pb-2 border-b border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-1.5">
              <div className="flex items-center space-x-1.5 bg-slate-100 px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-slate-700 border border-slate-200">
                <svg className="w-3.5 h-2.5 rounded-xs border border-white/20 flex-shrink-0" viewBox="0 0 900 600">
                  <rect width="900" height="200" fill="#FF9933" />
                  <rect y="200" width="900" height="200" fill="#FFFFFF" />
                  <rect y="400" width="900" height="200" fill="#138808" />
                  <circle cx="450" cy="300" r="80" fill="none" stroke="#000080" strokeWidth="12" />
                  <circle cx="450" cy="300" r="16" fill="#000080" />
                </svg>
                <span className="font-bold text-slate-900">भारत सरकार</span>
                <span className="text-slate-400">|</span>
                <span>MoES / IMD</span>
              </div>

              <div className="inline-flex items-center space-x-1.5 bg-blue-50 text-blue-800 px-2.5 py-0.5 rounded-full font-bold text-[10px] border border-blue-200">
                <Shield className="w-3 h-3 text-blue-600" />
                <span>Official Single Sign-In</span>
              </div>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Sign In to Your Workspace
              </h2>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Enter your official credentials or student enrollment number.
              </p>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-start space-x-2 animate-in fade-in text-xs">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="leading-snug">{error}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-3">

            {/* Email / Enrollment No Input */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center justify-between text-[11px]">
                <span>Official Email or Enrollment No</span>
                <span className="text-[10px] text-blue-600 font-mono font-normal">Student ID Supported</span>
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="Enter your email or enrollment number"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-[#0B2545] focus:bg-white transition"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <label className="font-bold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => showAlert({
                    title: 'Official Credential Recovery',
                    message: 'For security reasons, password recovery for MoES/IMD official accounts is handled through the Central IT Cell.\n\nTrainee note: For accounts created via student bulk upload, your default password is the last 6 digits of your Enrollment Number.',
                    confirmText: 'Understood',
                    type: 'info'
                  })}
                  className="text-[10px] text-blue-600 hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-[#0B2545] focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 p-0.5 transition cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5 text-blue-600" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="rememberMe"
                defaultChecked
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
              />
              <label htmlFor="rememberMe" className="text-[11px] text-slate-600 cursor-pointer">
                Remember session on this terminal
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#0B2545] hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center space-x-1.5 disabled:opacity-70 cursor-pointer"
            >
              <span>{loading ? 'Authenticating Account...' : 'Sign In to Official Workspace'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Auto-Fill Credential Selector (Space-Efficient Compact Pills) */}
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-700">
              <span className="flex items-center gap-1">
                <Key className="w-3 h-3 text-blue-600" />
                <span>Fill Credentials (Click any role):</span>
              </span>
              <span className="text-[9px] text-emerald-700 bg-emerald-100 px-1 py-0.2 rounded font-mono">Live DB</span>
            </div>

            <div className="flex flex-wrap gap-1.5 text-[10px]">
              <button
                type="button"
                onClick={() => handleFillCredentials('bhaumikkothiya1@gmail.com', 'Bhaumik@1910')}
                className="px-2 py-1 bg-white hover:bg-slate-800 hover:text-white border border-slate-200 rounded-lg font-semibold text-slate-700 transition cursor-pointer"
              >
                🏛️ Admin
              </button>
              <button
                type="button"
                onClick={() => handleFillCredentials('info@ljku.edu.in', 'Alok@123')}
                className="px-2 py-1 bg-white hover:bg-emerald-700 hover:text-white border border-slate-200 rounded-lg font-semibold text-slate-700 transition cursor-pointer"
              >
                🏢 Institute
              </button>
              <button
                type="button"
                onClick={() => handleFillCredentials('jd@gmail.com', 'Jd@123')}
                className="px-2 py-1 bg-white hover:bg-indigo-700 hover:text-white border border-slate-200 rounded-lg font-semibold text-slate-700 transition cursor-pointer"
              >
                👨‍🏫 Trainer
              </button>
              <button
                type="button"
                onClick={() => handleFillCredentials('25004406110009', '110009')}
                className="px-2 py-1 bg-white hover:bg-blue-700 hover:text-white border border-slate-200 rounded-lg font-semibold text-slate-700 transition cursor-pointer"
              >
                🎓 Student
              </button>
              <button
                type="button"
                onClick={() => handleFillCredentials('verifier@moes.gov.in', 'Verifier@123')}
                className="px-2 py-1 bg-white hover:bg-rose-700 hover:text-white border border-slate-200 rounded-lg font-semibold text-slate-700 transition cursor-pointer"
              >
                🔍 Verifier
              </button>
            </div>
          </div>

          {/* Registration Links */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <Link to="/register" className="text-blue-600 font-bold hover:underline">
              Register Forecaster
            </Link>
            <span className="text-slate-300">•</span>
            <Link to="/register-institute" className="text-amber-700 font-bold hover:underline">
              Register Institute
            </Link>
          </div>

          {/* Security Footnote */}
          <div className="text-center text-[9px] text-slate-400">
            <span className="font-mono">TLS 1.3 256-Bit Encrypted Session • MoES WMO-1083 Standard</span>
          </div>

        </div>

      </div>

    </div>
  );
};

export default LoginPage;
