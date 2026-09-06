import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import {
  Shield,
  User,
  Mail,
  Lock,
  Building,
  Briefcase,
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  BookOpen
} from 'lucide-react';
import { useToast, useDialog } from '../../context/NotificationContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { showAlert } = useDialog();
  const [showPassword, setShowPassword] = useState(false);
  const [learnerType, setLearnerType] = useState('independent'); // 'independent' | 'institute'
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'trainee', // Fixed strictly to trainee as requested
    organizationName: '',
    department: '',
    designation: '',
    mobile: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const finalOrg = learnerType === 'independent' 
        ? (formData.organizationName.trim() || 'Independent Public Learner')
        : (formData.organizationName.trim() || 'Affiliated Training Institute');

      const finalDept = formData.department.trim() || (learnerType === 'independent' ? 'General Capacity Building' : 'Meteorology');
      const finalDesig = formData.designation.trim() || (learnerType === 'independent' ? 'Direct Enrolled Learner' : 'Student Trainee');

      const res = await api.register({
        ...formData,
        organizationName: finalOrg,
        department: finalDept,
        designation: finalDesig,
        role: 'trainee' // Always locked to trainee for immediate approval
      });
      if (res.success) {
        toast.success('Registration successful! You now have direct access to official Government Courses.', 'Welcome to MoES Portal');
        navigate('/login');
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-2 sm:p-3 lg:p-4 select-none bg-gradient-to-b from-slate-100 via-[#F8FAFC] to-slate-100 overflow-hidden">
      
      <div className="max-w-xl w-full my-auto">
        
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-md space-y-2.5 text-xs">
          
          {/* Header */}
          <div className="pb-2 border-b border-slate-100 space-y-1">
            <div className="flex flex-wrap items-center justify-between gap-1">
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
                <GraduationCap className="w-3 h-3 text-blue-600" />
                <span>🏛️ सत्यમેવ જયતે • Trainee Enlistment</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-none">
                  Trainee & Forecaster Registration
                </h1>
                <p className="text-slate-400 text-[10px] mt-0.5">
                  Direct registration for official Ministry of Earth Sciences accredited capacity courses.
                </p>
              </div>
              <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 font-bold hidden sm:inline">
                Auto-Approved
              </span>
            </div>
          </div>

          {error && (
            <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 flex items-start space-x-1.5 text-[11px]">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="leading-snug">{error}</div>
            </div>
          )}

          {/* SINGLE LOCKED ROLE BADGE (ONLY TRAINEE SHOWN) */}
          <div className="p-2 bg-blue-50/80 border border-blue-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-[#0B2545] text-white flex items-center justify-center font-bold text-xs">
                🎓
              </div>
              <div>
                <div className="font-bold text-slate-900 text-[11px] flex items-center space-x-1.5">
                  <span>Role: Trainee / Open Forecaster</span>
                  <span className="text-[9px] bg-blue-200/80 text-blue-900 px-1.5 py-0.2 rounded font-mono font-semibold">Government Program</span>
                </div>
                <span className="text-[10px] text-slate-500 block">Direct self-enrollment in all published MoES & IMD curricula</span>
              </div>
            </div>
            <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 hidden sm:inline">
              Instant Access
            </span>
          </div>

          {/* Learner Category Toggle: Independent vs Institute */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 text-[10px] block">Candidate Affiliation Category *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLearnerType('independent')}
                className={`p-2 rounded-xl border text-left transition flex items-start space-x-2 cursor-pointer ${
                  learnerType === 'independent'
                    ? 'bg-sky-50 border-sky-500 text-sky-950 ring-1 ring-sky-400 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="text-sm mt-0.5">🌐</span>
                <div>
                  <div className="font-bold text-[11px] leading-tight">Independent / General Learner</div>
                  <div className="text-[9px] text-slate-500 mt-0.5">No institute required • Instant self-enrollment</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setLearnerType('institute')}
                className={`p-2 rounded-xl border text-left transition flex items-start space-x-2 cursor-pointer ${
                  learnerType === 'institute'
                    ? 'bg-blue-50 border-blue-500 text-blue-950 ring-1 ring-blue-400 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="text-sm mt-0.5">🏛️</span>
                <div>
                  <div className="font-bold text-[11px] leading-tight">Institute / Academy Student</div>
                  <div className="text-[9px] text-slate-500 mt-0.5">University, College, or IMD RMC Trainee</div>
                </div>
              </button>
            </div>
          </div>

          {learnerType === 'independent' && (
            <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-[10px] text-emerald-800 flex items-center space-x-1.5">
              <span className="font-bold text-emerald-700">✓ Public Access Mode:</span>
              <span>You can register freely and start enrolling in official Government & MoES courses immediately!</span>
            </div>
          )}

          {/* Row 1: Full Name & Official Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="space-y-0.5">
              <label className="font-bold text-slate-700 text-[10px]">Full Name *</label>
              <div className="relative">
                <User className="w-3 h-3 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-7 pr-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-[11px] text-slate-900 focus:ring-1 focus:ring-[#0B2545] focus:bg-white transition"
                />
              </div>
            </div>

            <div className="space-y-0.5">
              <label className="font-bold text-slate-700 text-[10px]">Email Address *</label>
              <div className="relative">
                <Mail className="w-3 h-3 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="Enter your official email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-7 pr-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-[11px] text-slate-900 focus:ring-1 focus:ring-[#0B2545] focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* Row 2: Department & Designation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="space-y-0.5">
              <label className="font-bold text-slate-700 text-[10px]">
                {learnerType === 'independent' ? 'Area of Interest / Specialization' : 'Department / Scientific Division'}
              </label>
              <div className="relative">
                <Building className="w-3 h-3 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder={learnerType === 'independent' ? 'Enter area of interest' : 'Enter scientific department / division'}
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full pl-7 pr-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-[11px] text-slate-900 focus:ring-1 focus:ring-[#0B2545] focus:bg-white transition"
                />
              </div>
            </div>

            <div className="space-y-0.5">
              <label className="font-bold text-slate-700 text-[10px]">
                {learnerType === 'independent' ? 'Occupation / Background' : 'Designation / Rank'}
              </label>
              <div className="relative">
                <Briefcase className="w-3 h-3 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder={learnerType === 'independent' ? 'Enter occupation / background' : 'Enter official designation'}
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full pl-7 pr-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-[11px] text-slate-900 focus:ring-1 focus:ring-[#0B2545] focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* Row 3: Organization & Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="space-y-0.5">
              <label className="font-bold text-slate-700 text-[10px]">
                {learnerType === 'independent' ? 'Affiliation (Optional)' : 'Organization / Institute Name *'}
              </label>
              <input
                type="text"
                placeholder={learnerType === 'independent' ? 'Independent Public Learner' : 'Enter organization / institute name'}
                value={formData.organizationName}
                onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-[11px] text-slate-900 focus:ring-1 focus:ring-[#0B2545] focus:bg-white transition"
              />
            </div>

            <div className="space-y-0.5">
              <label className="font-bold text-slate-700 text-[10px]">Account Password *</label>
              <div className="relative">
                <Lock className="w-3 h-3 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-7 pr-7 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-[11px] text-slate-900 focus:ring-1 focus:ring-[#0B2545] focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-700 p-0.5 transition cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-3 h-3 text-blue-600" /> : <Eye className="w-3 h-3 text-slate-400" />}
                </button>
              </div>
            </div>
          </div>

          {/* Course Access Notice */}
          <div className="p-1.5 bg-emerald-50/80 border border-emerald-200 rounded-lg flex items-center space-x-1.5 text-[10px] text-emerald-900">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span>Registered trainees instantly gain enrollment access to all accredited government meteorological courses.</span>
          </div>

          {/* Action Button & Sign In Link */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 border-t border-slate-100">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-5 py-2 bg-[#0B2545] hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-70"
            >
              <span>{loading ? 'Submitting Application...' : 'Register Official Trainee Account'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <div className="text-center text-slate-500 text-[10px]">
              Already registered?{' '}
              <Link to="/login" className="text-blue-600 font-bold hover:underline">
                Sign In to Workspace
              </Link>
            </div>
          </div>

          {/* Footnote */}
          <div className="text-center text-[9px] text-slate-400 pt-0.5 border-t border-slate-100 font-mono">
            National Digital Education Architecture (NDEAR) • WMO-No. 1083 Standard • MoES 2026
          </div>

        </form>

      </div>

    </div>
  );
};

export default RegisterPage;
