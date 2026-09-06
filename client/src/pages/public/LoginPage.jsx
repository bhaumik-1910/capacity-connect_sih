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
  Sparkles,
  CheckCircle2,
  Key,
  Building2,
  GraduationCap,
  Landmark,
  FileCheck,
  ChevronRight,
  Radio,
  Zap
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
      setError(err.message || 'Authentication failed. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    setLoading(true);
    try {
      const user = await login(demoEmail, demoPass);
      toast.success(`Signed in as ${user.name}`, 'Instant Access');
      routeByRole(user.role);
    } catch (err) {
      setError(err.message || 'Login failed');
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
    <div className="w-full h-full flex flex-col lg:flex-row select-none overflow-hidden">

      {/* ========================================================================= */}
      {/* LEFT HALF: 50% FULL-BLEED EDGE-TO-EDGE GOVERNMENT SHOWCASE */}
      {/* ========================================================================= */}
      <div className="lg:w-1/2 w-full h-full bg-gradient-to-b from-[#05172E] via-[#0B2545] to-[#040E1B] text-white p-6 sm:p-8 lg:p-10 xl:p-12 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-700/80">

        {/* Subtle Ambient Radial Glows */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        {/* Top Header & Branding Section */}
        <div className="space-y-4 relative z-10 max-w-xl mx-auto w-full">

          {/* Government of India Identity Strip */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md border border-white/20 text-slate-200">
              <svg className="w-4 h-3 rounded-xs border border-white/20 flex-shrink-0" viewBox="0 0 900 600">
                <rect width="900" height="200" fill="#FF9933" />
                <rect y="200" width="900" height="200" fill="#FFFFFF" />
                <rect y="400" width="900" height="200" fill="#138808" />
                <circle cx="450" cy="300" r="80" fill="none" stroke="#000080" strokeWidth="12" />
                <circle cx="450" cy="300" r="16" fill="#000080" />
              </svg>
              <span className="font-bold text-white">भारत सरकार</span>
              <span className="text-slate-400">|</span>
              <span>Ministry of Earth Sciences (MoES)</span>
            </div>

            <span className="bg-amber-400/20 text-amber-300 px-2.5 py-1 rounded-full text-[10px] font-bold border border-amber-400/30">
              🏛️ सत्यમેવ જયતે • NDEAR & WMO-1083
            </span>
          </div>

          {/* Main Titles */}
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight uppercase font-sans">
              CAPACITY CONNECT
            </h1>
            <p className="text-xs sm:text-sm text-amber-300 font-bold tracking-wide">
              National Digital Capacity Building & Competency Assurance Ecosystem
            </p>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
            Unified authentication portal serving the India Meteorological Department (IMD), autonomous institutes (IITM, NCMRWF, INCOIS, NCPOR), accredited universities, and operational meteorologists across 28 states & UTs.
          </p>

          {/* 4 Official Capabilities (Compact 2x2 Grid) */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="flex items-center space-x-2 p-2 rounded-xl bg-white/5 border border-white/10 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span className="text-slate-200 font-medium truncate">WMO-1083 Curriculum</span>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded-xl bg-white/5 border border-white/10 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
              <span className="text-slate-200 font-medium truncate">Competency Passports</span>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded-xl bg-white/5 border border-white/10 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span className="text-slate-200 font-medium truncate">Tamper-Evident QR Proof</span>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded-xl bg-white/5 border border-white/10 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
              <span className="text-slate-200 font-medium truncate">Autonomous Academies</span>
            </div>
          </div>

          {/* 1-Click Persona Quick Access Launcher */}
          <div className="pt-2 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>1-Click Instant Demo Login (Direct to Dashboard)</span>
              </span>
              <span className="text-[9px] bg-white/15 text-sky-200 px-2 py-0.5 rounded font-mono">
                5 Roles
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">

              {/* Persona 1: Platform Admin */}
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('bhaumikkothiya1@gmail.com', 'Bhaumik@1910')}
                className="p-2 bg-white/10 hover:bg-amber-500 hover:text-slate-950 rounded-xl border border-white/15 transition text-center group cursor-pointer"
              >
                <div className="text-base">🏛️</div>
                <div className="font-bold text-[10px] text-white group-hover:text-slate-950 truncate">Platform Admin</div>
                <div className="text-[9px] text-slate-300 group-hover:text-slate-900 truncate">Bhaumik</div>
              </button>

              {/* Persona 2: Institute Admin */}
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('info@ljku.edu.in', 'Alok@123')}
                className="p-2 bg-white/10 hover:bg-emerald-500 hover:text-slate-950 rounded-xl border border-white/15 transition text-center group cursor-pointer"
              >
                <div className="text-base">🏢</div>
                <div className="font-bold text-[10px] text-white group-hover:text-slate-950 truncate">Institute Admin</div>
                <div className="text-[9px] text-slate-300 group-hover:text-slate-900 truncate">Alok (LJKU)</div>
              </button>

              {/* Persona 3: Faculty Trainer */}
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('jd@gmail.com', 'Jd@123')}
                className="p-2 bg-white/10 hover:bg-indigo-500 hover:text-white rounded-xl border border-white/15 transition text-center group cursor-pointer"
              >
                <div className="text-base">👨‍🏫</div>
                <div className="font-bold text-[10px] text-white group-hover:text-white truncate">Faculty Trainer</div>
                <div className="text-[9px] text-slate-300 group-hover:text-indigo-100 truncate">JD Sir</div>
              </button>

              {/* Persona 4: Student / Trainee */}
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('25004406110009', '110009')}
                className="p-2 bg-white/10 hover:bg-blue-500 hover:text-white rounded-xl border border-white/15 transition text-center group cursor-pointer"
              >
                <div className="text-base">🎓</div>
                <div className="font-bold text-[10px] text-white group-hover:text-white truncate">Student / Trainee</div>
                <div className="text-[9px] text-slate-300 group-hover:text-blue-100 truncate">Deep</div>
              </button>

              {/* Persona 5: Certificate Verifier */}
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('verifier@moes.gov.in', 'Verifier@123')}
                className="p-2 bg-white/10 hover:bg-rose-500 hover:text-white rounded-xl border border-white/15 transition text-center group cursor-pointer col-span-2 sm:col-span-1"
              >
                <div className="text-base">🔍</div>
                <div className="font-bold text-[10px] text-white group-hover:text-white truncate">Cert Verifier</div>
                <div className="text-[9px] text-slate-300 group-hover:text-rose-100 truncate">Verma</div>
              </button>

            </div>
          </div>

        </div>

        {/* Bottom Left Live Telemetry Ribbon */}
        <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400 relative z-10 mt-3 max-w-xl mx-auto w-full">
          <div className="flex items-center space-x-2 text-amber-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping flex-shrink-0" />
            <span className="font-mono text-emerald-400 font-bold uppercase text-[10px]">LIVE TELEMETRY:</span>
            <span className="truncate text-slate-300 text-[10px]">NDEAR Competency Registry 2026 Online</span>
          </div>
          <span className="font-mono text-[9px] text-slate-500 hidden sm:inline">SHA-256 Auth</span>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* RIGHT HALF: 50% FULL-BLEED WHITE AUTHENTICATION TERMINAL */}
      {/* ========================================================================= */}
      <div className="lg:w-1/2 w-full h-full bg-white flex items-center justify-center p-6 sm:p-8 lg:p-10 xl:p-14 overflow-y-auto lg:overflow-hidden">

        <div className="max-w-md w-full space-y-4 text-xs">

          {/* Header */}
          <div className="space-y-1 pb-2 border-b border-slate-100">
            <div className="inline-flex items-center space-x-1.5 bg-blue-50 text-blue-800 px-2.5 py-0.5 rounded-full font-bold text-[10px] border border-blue-200">
              <Shield className="w-3 h-3 text-blue-600" />
              <span>Official Single Sign-In Terminal</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Sign In to Your Workspace
            </h2>
            <p className="text-slate-500 text-[11px]">
              Enter your official credentials or student enrollment number.
            </p>
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
                  placeholder="Email or Enrollment No"
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
