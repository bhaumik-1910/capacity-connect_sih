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
  CheckCircle2,
  FileCheck,
} from 'lucide-react';
import { useDialog, useToast } from '../../context/NotificationContext';
import { Button, Input } from '../../components/design-system';

/**
 * Government Minimalism Login Page (Section 21)
 * Two-column desktop layout (Left: institutional mission, Right: clean login form)
 * Single column mobile layout.
 */
const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { showAlert } = useDialog();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Universal Role-Aware Routing
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
      toast.success(`Welcome, ${user.name}! Redirecting...`, 'Sign In Successful');
      routeByRole(user.role);
    } catch (err) {
      const errorMsg = err.message || 'Authentication failed. Please verify credentials.';
      setError(errorMsg);
      toast.error(errorMsg, 'Authentication Error');
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
    <div className="w-full min-h-[calc(100vh-66px)] flex items-center justify-center p-4 sm:p-6 lg:p-12 bg-[#F7F8FA]">
      <div className="w-full max-w-4xl bg-white rounded-[8px] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden grid grid-cols-1 md:grid-cols-2">
        
        {/* LEFT COLUMN: Institutional Credibility & Identity */}
        <div className="p-6 sm:p-10 lg:p-12 bg-[#F8FAFC] border-b md:border-b-0 md:border-r border-[#E5E7EB] flex flex-col justify-between">
          <div>
            {/* National Authority Badge */}
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xs font-bold text-[#1F4E79] uppercase tracking-wider">
                MoES · IMD
              </span>
              <span className="text-[#87919B] text-xs">|</span>
              <span className="text-xs text-[#5F6B76]">
                Problem Statement ID: 26075
              </span>
            </div>

            {/* Title & Subtitle */}
            <h1 className="text-2xl sm:text-3xl font-bold text-[#17202A] tracking-tight mb-3">
              CAPACITY CONNECT
            </h1>
            <p className="text-sm font-medium text-[#1F4E79] mb-4">
              Smart Education & Learning Management Platform
            </p>
            <p className="text-xs sm:text-sm text-[#5F6B76] leading-relaxed mb-6">
              Centralized institutional capacity building, meteorological competency tracking, and verifiable credential governance for India Meteorological Department and affiliated academic institutes.
            </p>

            {/* Trust Points */}
            <div className="space-y-2.5 pt-4 border-t border-[#E5E7EB]">
              <div className="flex items-center gap-2 text-xs text-[#5F6B76]">
                <CheckCircle2 className="w-4 h-4 text-[#1F7A4D] flex-shrink-0" />
                <span>Multi-tenant accredited institute isolation</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#5F6B76]">
                <CheckCircle2 className="w-4 h-4 text-[#1F7A4D] flex-shrink-0" />
                <span>Cryptographically verifiable QR certificates</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#5F6B76]">
                <CheckCircle2 className="w-4 h-4 text-[#1F7A4D] flex-shrink-0" />
                <span>WMO-1083 meteorological competency taxonomy</span>
              </div>
            </div>
          </div>

          {/* Left Footer: Public Certificate Verification Link */}
          <div className="pt-8 mt-6 border-t border-[#E5E7EB]">
            <Link
              to="/verify"
              className="inline-flex items-center gap-2 text-xs font-medium text-[#1F4E79] hover:underline"
            >
              <FileCheck className="w-4 h-4" />
              <span>Verify Certificate Authenticity (No Login Required)</span>
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN: Minimalist Login Form */}
        <div className="p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#17202A] tracking-tight">
                Account Sign In
              </h2>
              <p className="text-xs text-[#5F6B76] mt-1">
                Enter your official email address or student enrollment ID.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-[#FEE4E2] border border-[#FECDCA] rounded-[6px] text-xs text-[#912018] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email or Student Enrollment Number"
                required
                type="text"
                placeholder="name@domain.gov.in or ST-1002"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={Mail}
              />

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#17202A]">Password</label>
                  <button
                    type="button"
                    onClick={() =>
                      showAlert({
                        title: 'Official Credential Recovery',
                        message:
                          'For security reasons, password recovery for MoES/IMD official accounts is coordinated with the Institutional IT Cell.\n\nTrainees: Your default password is the last 6 digits of your Enrollment Number.',
                        confirmText: 'Understood',
                        type: 'info',
                      })
                    }
                    className="text-xs text-[#1F4E79] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white text-[#17202A] text-sm rounded-[6px] border border-[#E5E7EB] focus:border-[#1F4E79] focus:ring-2 focus:ring-[#EAF2F8] px-3 py-2 pr-9 transition-colors focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[#87919B] hover:text-[#17202A] transition cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded-[4px] border-[#E5E7EB] text-[#1F4E79] focus:ring-[#1F4E79] w-4 h-4 cursor-pointer"
                />
                <label htmlFor="rememberMe" className="text-xs text-[#5F6B76] cursor-pointer">
                  Remember session on this computer
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                loading={loading}
                variant="primary"
                className="w-full mt-2"
              >
                Sign In
              </Button>
            </form>

            {/* Minimalist Demo Credential Selector */}
            <div className="mt-6 pt-4 border-t border-[#E5E7EB]">
              <div className="flex items-center justify-between text-xs text-[#5F6B76] mb-2">
                <span className="font-medium">Quick Credentials:</span>
                <span className="text-[11px] text-[#87919B]">Click to test</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleFillCredentials('bhaumikkothiya1@gmail.com', 'Bhaumik@1910')}
                  className="px-2 py-1 bg-[#F8FAFC] hover:bg-[#EAF2F8] text-[#17202A] hover:text-[#1F4E79] border border-[#E5E7EB] rounded-[4px] text-xs transition-colors cursor-pointer"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleFillCredentials('info@ljku.edu.in', 'Alok@123')}
                  className="px-2 py-1 bg-[#F8FAFC] hover:bg-[#EAF2F8] text-[#17202A] hover:text-[#1F4E79] border border-[#E5E7EB] rounded-[4px] text-xs transition-colors cursor-pointer"
                >
                  Institute
                </button>
                <button
                  type="button"
                  onClick={() => handleFillCredentials('jd@gmail.com', 'Jd@123')}
                  className="px-2 py-1 bg-[#F8FAFC] hover:bg-[#EAF2F8] text-[#17202A] hover:text-[#1F4E79] border border-[#E5E7EB] rounded-[4px] text-xs transition-colors cursor-pointer"
                >
                  Trainer
                </button>
                <button
                  type="button"
                  onClick={() => handleFillCredentials('25004406110009', '110009')}
                  className="px-2 py-1 bg-[#F8FAFC] hover:bg-[#EAF2F8] text-[#17202A] hover:text-[#1F4E79] border border-[#E5E7EB] rounded-[4px] text-xs transition-colors cursor-pointer"
                >
                  Student
                </button>
              </div>
            </div>
          </div>

          {/* Registration Links */}
          <div className="pt-6 mt-4 border-t border-[#E5E7EB] flex items-center justify-between text-xs text-[#5F6B76]">
            <Link to="/register-institute" className="hover:text-[#1F4E79] hover:underline">
              Register New Institute
            </Link>
            <span>·</span>
            <Link to="/register" className="hover:text-[#1F4E79] hover:underline">
              Student Self-Registration
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;