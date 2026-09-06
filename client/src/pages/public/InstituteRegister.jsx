import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import {
  Building2,
  Shield,
  CheckCircle2,
  FileCheck,
  Mail,
  Lock,
  User,
  Globe,
  MapPin,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Award,
  ChevronRight,
  Radio,
  Sparkles,
  Landmark
} from 'lucide-react';

const InstituteRegister = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    legalName: '',
    displayName: '',
    code: '',
    type: 'Autonomous Institute',
    domain: '',
    website: '',
    address: '',
    signatoryName: '',
    signatoryDesignation: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    adminMobile: '',
    agreeTerms: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.agreeTerms) {
      setError('You must accept the Government of India NDEAR & MoES compliance guidelines.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await api.registerOrganization(formData);
      if (res.success) {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.message || 'Institute registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-2 sm:p-3 lg:p-4 select-none bg-gradient-to-b from-slate-100 via-[#F8FAFC] to-slate-100 overflow-hidden">
      
      <div className="max-w-3xl w-full my-auto">
        
        {success ? (
          <div className="bg-white rounded-2xl border-2 border-emerald-500 p-6 sm:p-8 text-center space-y-3.5 shadow-xl animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-2xl shadow-xs">
              🏛️
            </div>
            <div className="space-y-0.5">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Application Submitted Successfully!
              </h2>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Your application for <strong>{formData.legalName}</strong> (Code: <code>{formData.code}</code>) has been registered. Central MoES administrators will verify your accreditation and activate your workspace.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 max-w-md mx-auto text-left space-y-1">
              <div><span className="font-bold text-slate-900">Tenant Administrator:</span> {formData.adminName}</div>
              <div><span className="font-bold text-slate-900">Login Email:</span> {formData.adminEmail}</div>
              <div>
                <span className="font-bold text-slate-900">Status:</span>{' '}
                <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-bold text-[10px]">
                  Pending Central MoES Verification
                </span>
              </div>
            </div>

            <div className="pt-1 flex justify-center gap-3">
              <Link
                to="/login"
                className="px-6 py-2.5 bg-[#0B2545] hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition"
              >
                Go to Sign In Portal
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-md space-y-2.5 text-xs">
            
            {/* Form Top Official Header (Ultra Compact) */}
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
                  <span>Ministry of Earth Sciences (MoES)</span>
                </div>

                <div className="inline-flex items-center space-x-1.5 bg-blue-50 text-blue-800 px-2.5 py-0.5 rounded-full font-bold text-[10px] border border-blue-200">
                  <Building2 className="w-3 h-3 text-blue-600" />
                  <span>🏛️ सत्यમેવ જયતે • Multi-Tenant Accreditation</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-none">
                    Register Institute / Academy
                  </h1>
                  <p className="text-slate-400 text-[10px] mt-0.5">
                    Onboard autonomous research academies, colleges & universities as independent tenant workspaces.
                  </p>
                </div>
                <span className="text-[9px] font-mono text-slate-400 hidden sm:inline">NDEAR Verified</span>
              </div>
            </div>

            {error && (
              <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 flex items-start space-x-1.5 text-[11px]">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0 mt-0.5" />
                <div className="leading-snug">{error}</div>
              </div>
            )}

            {/* Row 1: Legal Name (2 cols) + Display Name / Acronym (1 col) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="space-y-0.5 sm:col-span-2">
                <label className="font-bold text-slate-700 text-[10px]">Legal Institute Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Indian Institute of Tropical Meteorology"
                  value={formData.legalName}
                  onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-[11px] text-slate-900 focus:ring-1 focus:ring-[#0B2545] focus:bg-white transition"
                />
              </div>

              <div className="space-y-0.5 sm:col-span-1">
                <label className="font-bold text-slate-700 text-[10px]">Display Name / Acronym *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., IITM Pune"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-[11px] text-slate-900 focus:ring-1 focus:ring-[#0B2545] focus:bg-white transition"
                />
              </div>
            </div>

            {/* Row 2: Institute Code + Category + Domain */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="space-y-0.5">
                <label className="font-bold text-slate-700 text-[10px]">Institute Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., IITM-PUNE-01"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-[11px] font-mono uppercase text-slate-900 focus:ring-1 focus:ring-[#0B2545] focus:bg-white transition"
                />
              </div>

              <div className="space-y-0.5">
                <label className="font-bold text-slate-700 text-[10px]">Organization Category *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-[11px] text-slate-900 focus:ring-1 focus:ring-[#0B2545] focus:bg-white transition"
                >
                  <option value="Autonomous Institute">Autonomous Research Institute</option>
                  <option value="Government Ministry">Government Ministry / Dept</option>
                  <option value="University">University / Higher Education</option>
                  <option value="Training Academy">Accredited Academy</option>
                  <option value="R&D Center">National R&D Center</option>
                </select>
              </div>

              <div className="space-y-0.5">
                <label className="font-bold text-slate-700 text-[10px]">Official Domain *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., tropmet.res.in"
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-[11px] font-mono text-slate-900 focus:ring-1 focus:ring-[#0B2545] focus:bg-white transition"
                />
              </div>
            </div>

            {/* Row 3: Physical Campus / Postal Address */}
            <div className="space-y-0.5">
              <label className="font-bold text-slate-700 text-[10px]">Physical Campus / Postal Address *</label>
              <input
                type="text"
                required
                placeholder="Official physical campus location and city"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-[11px] text-slate-900 focus:ring-1 focus:ring-[#0B2545] focus:bg-white transition"
              />
            </div>

            {/* Row 4: Certificate Signatory Box (Full Name & Designation in 2 cols) */}
            <div className="p-2 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1">
              <div className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider flex items-center space-x-1">
                <FileCheck className="w-3 h-3 text-emerald-600" />
                <span>Authorized Signatory for Certificates</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <label className="font-bold text-slate-700 text-[10px]">Signatory Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter authorized signatory name"
                    value={formData.signatoryName}
                    onChange={(e) => setFormData({ ...formData, signatoryName: e.target.value })}
                    className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-[11px] text-slate-900 focus:ring-1 focus:ring-[#0B2545] transition"
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="font-bold text-slate-700 text-[10px]">Signatory Official Designation *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Director & Senior Scientist"
                    value={formData.signatoryDesignation}
                    onChange={(e) => setFormData({ ...formData, signatoryDesignation: e.target.value })}
                    className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-[11px] text-slate-900 focus:ring-1 focus:ring-[#0B2545] transition"
                  />
                </div>
              </div>
            </div>

            {/* Row 5: Institute Administrator Account (4 cols in 1 line!) */}
            <div className="p-2 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1">
              <div className="text-[10px] font-bold text-purple-900 uppercase tracking-wider flex items-center space-x-1">
                <User className="w-3 h-3 text-purple-600" />
                <span>Institute Administrator Account</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                <div className="space-y-0.5">
                  <label className="font-bold text-slate-700 text-[10px]">Admin Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Dr. Sanjay Jha"
                    value={formData.adminName}
                    onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                    className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-[11px] text-slate-900 focus:ring-1 focus:ring-[#0B2545] transition"
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="font-bold text-slate-700 text-[10px]">Admin Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="admin@tropmet.res.in"
                    value={formData.adminEmail}
                    onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                    className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-[11px] text-slate-900 focus:ring-1 focus:ring-[#0B2545] transition"
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="font-bold text-slate-700 text-[10px]">Mobile Contact</label>
                  <input
                    type="tel"
                    placeholder="+91-9876543210"
                    value={formData.adminMobile}
                    onChange={(e) => setFormData({ ...formData, adminMobile: e.target.value })}
                    className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-[11px] text-slate-900 focus:ring-1 focus:ring-[#0B2545] transition"
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="font-bold text-slate-700 text-[10px]">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={formData.adminPassword}
                      onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                      className="w-full px-2 py-1 pr-7 bg-white border border-slate-300 rounded-lg text-[11px] text-slate-900 focus:ring-1 focus:ring-[#0B2545] transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-1.5 top-1 text-slate-400 hover:text-slate-700 p-0.5 transition cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-3 h-3 text-blue-600" /> : <Eye className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 6: Compliance Checkbox */}
            <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start space-x-1.5">
              <input
                type="checkbox"
                id="agreeTerms"
                checked={formData.agreeTerms}
                onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3 h-3 cursor-pointer"
              />
              <label htmlFor="agreeTerms" className="text-[9px] text-slate-600 leading-tight cursor-pointer">
                I certify that our institute is an accredited entity under MoES or state authorities, and agree to strictly enforce server-side competency and certificate integrity rules.
              </label>
            </div>

            {/* Row 7: Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-0.5">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-5 py-2 bg-[#0B2545] hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-70"
              >
                <span>{loading ? 'Submitting Application...' : 'Register Institute in National Registry'}</span>
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
        )}

      </div>

    </div>
  );
};

export default InstituteRegister;
