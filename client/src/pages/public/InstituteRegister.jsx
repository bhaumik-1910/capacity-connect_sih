import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { useToast } from '../../context/NotificationContext';
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
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
  Award,
  ChevronRight,
  Radio,
  Sparkles,
  Landmark,
  Users,
  ShieldCheck
} from 'lucide-react';

const InstituteRegister = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const initialPlan = searchParams.get('plan') || 'STANDARD_1000';
  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
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
      const warnMsg = 'You must accept the Government of India NDEAR & MoES compliance guidelines.';
      setError(warnMsg);
      toast.warning(warnMsg, 'Compliance Required');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await api.registerOrganization({
        ...formData,
        subscriptionPlan: selectedPlan
      });
      if (res.success) {
        setSuccess(true);
        toast.success('Institute registration application submitted successfully! It will be verified by the MoES Central Authority.', 'Application Submitted');
      }
    } catch (err) {
      const errText = err.message || 'Institute registration failed';
      setError(errText);
      toast.error(errText, 'Registration Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-full flex flex-col items-center justify-center p-3 sm:p-5 lg:p-6 select-none bg-gradient-to-b from-slate-100 via-[#F8FAFC] to-slate-100">
      
      <div className="max-w-3xl w-full my-auto py-4">
        
        {/* Back to Home Navigation */}
        <div className="mb-3">
          <button
            type="button"
            onClick={() => {
              const mainEl = document.getElementById('main-content');
              if (mainEl) mainEl.scrollTop = 0;
              window.scrollTo(0, 0);
              navigate('/');
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1F4E79] hover:text-[#163A5C] bg-white px-3 py-1.5 rounded-[6px] border border-slate-200 hover:border-[#1F4E79] shadow-xs cursor-pointer transition-all group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Home</span>
          </button>
        </div>

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

            {/* Subscription Quota Tier Selection */}
            <div className="p-3 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 border border-blue-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  Select Institutional Capacity & Student Quota Tier
                </span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/80 px-2 py-0.5 rounded">
                  Campus Trainees: 100% Free
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'STARTER_250', name: 'Starter Campus', quota: '250 Trainees', fee: '₹25,000/yr' },
                  { id: 'STANDARD_1000', name: 'Standard College', quota: '1,000 Trainees', fee: '₹75,000/yr', popular: true },
                  { id: 'ENTERPRISE_5000', name: 'Enterprise Univ', quota: '5,000 Trainees', fee: '₹2,50,000/yr' }
                ].map((plan) => {
                  const isSelected = selectedPlan === plan.id;
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`p-2 rounded-xl text-left border transition relative cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-700 shadow-md ring-2 ring-blue-400/40'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      {plan.popular && (
                        <span className={`absolute -top-2 right-2 text-[8px] font-black uppercase px-1.5 py-0.2 rounded-full ${
                          isSelected ? 'bg-amber-400 text-slate-950' : 'bg-blue-600 text-white'
                        }`}>
                          Most Popular
                        </span>
                      )}
                      <div className="font-extrabold text-[11px] leading-tight">{plan.name}</div>
                      <div className={`text-[10px] font-bold ${isSelected ? 'text-blue-100' : 'text-blue-600'}`}>
                        {plan.fee}
                      </div>
                      <div className={`text-[9px] ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                        {plan.quota} included
                      </div>
                    </button>
                  );
                })}
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
                  placeholder="Enter your institute's legal name"
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
                  placeholder="Enter display acronym (e.g. IITM)"
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
                  placeholder="Enter institute code (e.g. IITM-01)"
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
                  placeholder="Enter campus domain (e.g. college.edu.in)"
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
                placeholder="Enter campus physical address and city"
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
                    placeholder="Enter authorized signatory full name"
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
                    placeholder="Enter signatory official designation"
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
                    placeholder="Enter your full name"
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
                    placeholder="Enter your official email address"
                    value={formData.adminEmail}
                    onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                    className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-[11px] text-slate-900 focus:ring-1 focus:ring-[#0B2545] transition"
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="font-bold text-slate-700 text-[10px]">Mobile Contact</label>
                  <input
                    type="tel"
                    placeholder="Enter your 10-digit mobile number"
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
                      placeholder="Enter your password"
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
