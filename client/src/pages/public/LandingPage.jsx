import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import {
  Shield,
  BookOpen,
  Award,
  Compass,
  Cpu,
  Sliders,
  CheckCircle,
  ArrowRight,
  Search,
  ExternalLink,
  Users,
  Building2,
  Calendar,
  Radio,
  CloudRain,
  Activity,
  AlertTriangle,
  Globe,
  Lock,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  GraduationCap,
  FileCheck,
  Zap,
  TrendingUp,
  Landmark,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  CreditCard,
  ChevronDown
} from 'lucide-react';

const ROLE_TABS = [
  {
    id: 'trainee',
    title: 'Operational Forecaster',
    badge: 'Trainee & Scientist',
    icon: '🎓',
    accentColor: 'blue',
    description: 'Operational meteorological officers strengthening domain competencies, completing certified course modules, and earning verifiable credentials.',
    highlights: [
      'Interactive multimedia course player with resume functionality',
      'Continuous progress & time tracking across structured lesson modules',
      'Timed, proctored examinations with instant pass/retake grading',
      'National Competency Passport with Skill-Gap Radar diagnostics',
      'Instant tamper-evident QR-verifiable certificate downloads (PDF & Image)'
    ],
    ctaText: 'Access Trainee Workspace',
    ctaLink: '/login'
  },
  {
    id: 'trainer',
    title: 'Faculty & Scientific Officer',
    badge: 'Curriculum Author',
    icon: '👨‍🏫',
    accentColor: 'indigo',
    description: 'Subject matter experts and faculty authoring national capacity programs, configuring question banks, and supervising learner cohorts.',
    highlights: [
      '5-Step Course Builder Wizard aligned with official MoES competency frameworks',
      'Dynamic Question Bank manager with multiple-choice questions & solutions',
      'Cohort Gradebook with automated At-Risk learner identification',
      'Real-time student roster manager with Excel/CSV bulk import',
      'Virtual laboratory & teleconference session scheduler'
    ],
    ctaText: 'Access Trainer Studio',
    ctaLink: '/login'
  },
  {
    id: 'institute',
    title: 'Institute & Academy Admin',
    badge: 'University Tenant',
    icon: '🏢',
    accentColor: 'emerald',
    description: 'Affiliated universities, colleges, and atmospheric research institutes managing autonomous faculty, departments, and branded credentials.',
    highlights: [
      'Autonomous institutional tenant registration with multi-campus support',
      'Faculty onboarding & direct course authoring delegation',
      'Custom institutional certificate templates with official signatory & seal',
      'Trainee cohort enrollment and bulk student credential issuance',
      'Institution-wide training performance metrics and audit trails'
    ],
    ctaText: 'Register or Manage Institute',
    ctaLink: '/register-institute'
  },
  {
    id: 'admin',
    title: 'MoES Central Governance Council',
    badge: 'National Governance',
    icon: '🏛️',
    accentColor: 'amber',
    description: 'Central Ministry of Earth Sciences (MoES) and IMD headquarters regulators enforcing national training standards and accreditation.',
    highlights: [
      'Official verification queue for institute and faculty accreditations',
      'Curriculum governance council for course publication and review',
      'AI-weighted competency-to-trainer matching matrix',
      'Cryptographic certificate repository and revocation governance',
      'Immutable security audit log center tracking all platform actions'
    ],
    ctaText: 'Access Governance Portal',
    ctaLink: '/login'
  }
];

const AUTONOMOUS_INSTITUTES = [
  { code: 'IMD', name: 'India Meteorological Department', city: 'New Delhi (HQ)', type: 'National Met Service' },
  { code: 'IITM', name: 'Indian Institute of Tropical Meteorology', city: 'Pune, Maharashtra', type: 'Premier R&D Academy' },
  { code: 'NCMRWF', name: 'National Centre for Medium Range Weather Forecasting', city: 'Noida, UP', type: 'Supercomputing HPC' },
  { code: 'INCOIS', name: 'Indian National Centre for Ocean Information Services', city: 'Hyderabad, Telangana', type: 'Tsunami & Ocean Warning' },
  { code: 'NIOT', name: 'National Institute of Ocean Technology', city: 'Chennai, Tamil Nadu', type: 'Deep-Sea Technology' }
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeRoleTab, setActiveRoleTab] = useState('trainee');
  const [heroSearchQuery, setHeroSearchQuery] = useState('');
  const [certVerifyInput, setCertVerifyInput] = useState('');
  const [pricingTab, setPricingTab] = useState('institute'); // 'institute' | 'individual'
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    if (window.location.hash === '#pricing' || window.location.pathname === '/pricing') {
      setTimeout(() => {
        const el = document.getElementById('pricing');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    }
  }, []);

  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        const [courseRes, annRes, statsRes] = await Promise.all([
          api.getCourses(),
          api.getAnnouncements(),
          api.getPublicStats()
        ]);
        if (courseRes.success) setCourses((courseRes.courses || []).slice(0, 4));
        if (annRes.success) setAnnouncements(annRes.announcements || []);
        if (statsRes && statsRes.success) setStats(statsRes.stats);
      } catch (err) {
        console.error('Error fetching landing page data:', err);
      }
    };
    fetchLandingData();
  }, []);

  const handleHeroSearchSubmit = (e) => {
    e.preventDefault();
    if (heroSearchQuery.trim()) {
      navigate(`/trainee/catalogue?search=${encodeURIComponent(heroSearchQuery.trim())}`);
    } else {
      navigate('/trainee/catalogue');
    }
  };

  const handleQuickVerifySubmit = (e) => {
    e.preventDefault();
    if (certVerifyInput.trim()) {
      navigate(`/verify/${encodeURIComponent(certVerifyInput.trim())}`);
    } else {
      navigate('/verify');
    }
  };

  const selectedRole = ROLE_TABS.find((t) => t.id === activeRoleTab) || ROLE_TABS[0];

  return (
    <div className="w-full flex flex-col min-h-full select-none transition-all">
      
      {/* ========================================================================= */}
      {/* 1. OFFICIAL GOVERNMENT ACCESSIBILITY & EMERGENCY BROADCAST TICKER */}
      {/* ========================================================================= */}
      <div className="w-full bg-gradient-to-r from-[#07192F] via-[#0B2545] to-[#0A1F3B] text-slate-200 text-xs px-4 sm:px-8 lg:px-12 py-2.5 border-b border-blue-900/60 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: National Identity Strip */}
        <div className="flex items-center space-x-2.5">
          {/* Official Indian Tricolor Flag SVG */}
          <svg className="w-5 h-3.5 rounded shadow-2xs border border-white/20 flex-shrink-0" viewBox="0 0 900 600">
            <rect width="900" height="200" fill="#FF9933" />
            <rect y="200" width="900" height="200" fill="#FFFFFF" />
            <rect y="400" width="900" height="200" fill="#138808" />
            <circle cx="450" cy="300" r="80" fill="none" stroke="#000080" strokeWidth="12" />
            <circle cx="450" cy="300" r="16" fill="#000080" />
          </svg>
          <span className="font-bold text-white tracking-wide">भारत सरकार</span>
          <span className="text-slate-400">|</span>
          <span className="font-medium text-slate-300">Government of India</span>
          <span className="text-slate-400 hidden md:inline">•</span>
          <span className="text-sky-300 hidden md:inline font-semibold">Ministry of Earth Sciences (MoES)</span>
        </div>

        {/* Right: Real-time Telemetry Live Broadcast */}
        <div className="flex items-center space-x-2 text-[11px] overflow-hidden text-amber-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping flex-shrink-0" />
          <span className="font-mono text-emerald-400 font-bold uppercase tracking-wider">LIVE TELEMETRY:</span>
          <span className="truncate max-w-xs md:max-w-md text-slate-200">
            National Doppler Radar Network active • NDEAR Digital Competency Registry 2026 Online
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAJESTIC GOVERNMENT HERO SECTION (EDGE-TO-EDGE FULL-WIDTH) */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden w-full pt-10 pb-16 bg-gradient-to-b from-[#05172E] via-[#0B2545] to-[#040E1B] text-white px-4 sm:px-8 lg:px-16 shadow-2xl border-b border-slate-700/60">
        
        {/* Subtle Ambient Radial Glows */}
        <div className="absolute -right-24 -top-24 w-[450px] h-[450px] rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -bottom-24 w-[450px] h-[450px] rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-7 relative z-10">
          
          {/* Government Lion Capital Badge */}
          <div className="inline-flex items-center space-x-3 bg-white/10 px-4 py-2 rounded-full text-xs font-semibold backdrop-blur-md border border-white/20 text-sky-200 shadow-md">
            <span className="text-amber-400 text-sm">🏛️</span>
            <span>सत्यमेव जयते</span>
            <span className="text-slate-400">•</span>
            <span className="font-bold text-white">MoES & IMD National Capacity Portal</span>
            <span className="text-slate-400">•</span>
            <span className="text-emerald-300 font-semibold">NDEAR Certified</span>
          </div>

          {/* Main Titles */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight uppercase font-sans">
              CAPACITY CONNECT
            </h1>
            <p className="text-sm sm:text-lg text-amber-300 font-bold tracking-wide">
              National Digital Capacity Building & Competency Assurance Ecosystem
            </p>
          </div>

          <p className="text-xs sm:text-sm text-slate-200 font-normal max-w-3xl mx-auto leading-relaxed">
            Unifying scientific capacity development across 28 states and union territories. Empowering operational meteorologists, oceanographers, and disaster authorities with verifiable Competency Passports, proctored examinations, accredited curriculum authoring, and tamper-evident QR verification.
          </p>

          {/* Integrated High-Impact Search Bar */}
          <form onSubmit={handleHeroSearchSubmit} className="max-w-2xl mx-auto pt-2">
            <div className="relative flex items-center shadow-2xl rounded-2xl overflow-hidden border border-white/30 bg-white/15 backdrop-blur-md focus-within:border-amber-400 transition">
              <Search className="w-5 h-5 text-slate-300 ml-4 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search accredited courses (e.g. Python, Doppler Radar, NWP Modeling, Tropical Cyclone)..."
                value={heroSearchQuery}
                onChange={(e) => setHeroSearchQuery(e.target.value)}
                className="w-full py-3.5 px-3 bg-transparent text-white placeholder-slate-300 text-xs sm:text-sm focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm transition flex items-center space-x-1 flex-shrink-0 cursor-pointer"
              >
                <span>Search</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Primary Call-to-Actions */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link
              to="/login"
              className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-xl transition flex items-center space-x-2 transform hover:-translate-y-0.5"
            >
              <Lock className="w-4 h-4 text-slate-950" />
              <span>Access Official Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/trainee/catalogue"
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-xl border border-white/30 backdrop-blur-md transition flex items-center space-x-2 transform hover:-translate-y-0.5"
            >
              <BookOpen className="w-4 h-4 text-sky-300" />
              <span>Explore Course Catalogue</span>
            </Link>

            <Link
              to="/register-institute"
              className="px-6 py-3.5 bg-slate-800/90 hover:bg-slate-800 text-amber-300 font-bold text-xs sm:text-sm rounded-xl border border-amber-400/40 transition flex items-center space-x-2 transform hover:-translate-y-0.5"
            >
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Register Institute / Academy</span>
            </Link>
          </div>

          {/* Real-time Platform Metrics Cards */}
          <div className="pt-8 border-t border-slate-700/60 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm transition hover:bg-white/10">
              <div className="text-2xl sm:text-3xl font-black text-amber-400">{stats ? stats.totalCourses : (courses.length || 5)}</div>
              <div className="text-[11px] text-slate-200 font-bold uppercase mt-1">Accredited Curricula</div>
              <div className="text-[10px] text-slate-400">MoES & IMD Blueprints</div>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm transition hover:bg-white/10">
              <div className="text-2xl sm:text-3xl font-black text-sky-400">{stats ? stats.totalForecasters : 58}</div>
              <div className="text-[11px] text-slate-200 font-bold uppercase mt-1">Active Forecasters</div>
              <div className="text-[10px] text-slate-400">Enrolled & Certified</div>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm transition hover:bg-white/10">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">{stats ? stats.certificatesIssued : 12}</div>
              <div className="text-[11px] text-slate-200 font-bold uppercase mt-1">Verified Credentials</div>
              <div className="text-[10px] text-slate-400">Tamper-Evident QR Proof</div>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm transition hover:bg-white/10">
              <div className="text-2xl sm:text-3xl font-black text-purple-400">{stats ? stats.totalInstitutes : 5}</div>
              <div className="text-[11px] text-slate-200 font-bold uppercase mt-1">Partner Institutes</div>
              <div className="text-[10px] text-slate-400">IMD, IITM, NCMRWF & More</div>
            </div>
          </div>

        </div>
      </section>

      {/* Middle Content Wrapper */}
      <div className="w-full space-y-16 py-14 px-4 sm:px-6 lg:px-8">

        {/* ========================================================================= */}
        {/* 3. INTERACTIVE 4-ROLE ARCHITECTURE WORKSPACES */}
        {/* ========================================================================= */}
      <section className="max-w-6xl mx-auto px-4 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-widest flex items-center justify-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>One Unified National Platform • Specialized Role Workspaces</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Engineered for Students, Faculty, Institutes & Central Regulators
          </h2>
          <p className="text-xs text-slate-500 max-w-xl mx-auto leading-relaxed">
            Strict separation of duties, role-based backend authorization, and purpose-built toolsets matching official government operational standards.
          </p>
        </div>

        {/* Tab Selector Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-slate-100 rounded-2xl max-w-2xl mx-auto border border-slate-200">
          {ROLE_TABS.map((tab) => {
            const isActive = activeRoleTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveRoleTab(tab.id)}
                className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-[#0B2545] text-white shadow-md'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.badge}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Highlight Card for Selected Role */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm transition-all duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Role Info & Features */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">
                <span>{selectedRole.icon}</span>
                <span>{selectedRole.badge} Workspace</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {selectedRole.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {selectedRole.description}
              </p>

              <div className="pt-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
                  Core Capabilities & Workflow Integrations:
                </h4>
                <ul className="space-y-2 text-xs text-slate-700">
                  {selectedRole.highlights.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4">
                <Link
                  to={selectedRole.ctaLink}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-[#0B2545] hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition"
                >
                  <span>{selectedRole.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right: Visual Accent Mockup */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/40 rounded-2xl p-6 border border-slate-200/80 space-y-4 shadow-inner">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="font-mono text-xs font-bold text-slate-800">
                  MoES Accredited Ecosystem
                </span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                  Active Verified
                </span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="p-3 bg-white rounded-xl border border-slate-200/70 shadow-2xs space-y-1">
                  <div className="font-bold text-slate-800 text-xs flex items-center justify-between">
                    <span>Role Authorization</span>
                    <span className="text-[10px] font-mono text-indigo-600 font-semibold">RBAC Level-1</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    High-security cryptographic JWT token authentication with biometric & enrollment safeguards.
                  </p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200/70 shadow-2xs space-y-1">
                  <div className="font-bold text-slate-800 text-xs flex items-center justify-between">
                    <span>Audit & Compliance</span>
                    <span className="text-[10px] font-mono text-emerald-600 font-semibold">WMO-1083 Compliant</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Every assessment, enrollment, and certificate issuance is immutably logged to central MoES audit repositories.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SCIENTIFIC METEOROLOGICAL PILLARS (5 NATIONAL DISCIPLINES) */}
      {/* ========================================================================= */}
      <section className="bg-gradient-to-b from-slate-100/90 to-slate-50 rounded-3xl p-6 sm:p-12 max-w-6xl mx-auto space-y-8 border border-slate-200">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-widest">
            Ministry of Earth Sciences Disciplines
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Core Meteorological & Capacity Building Domains
          </h2>
          <p className="text-xs text-slate-500 max-w-xl mx-auto">
            Official operational curriculum tracks addressing extreme weather alerts, radar nowcasting, and supercomputer climate simulations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2.5 hover:border-blue-300 transition">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Radio className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Doppler Weather Radar (DWR)</h4>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Reflectivity (Z), radial velocity (V), and spectrum width (W) analysis for 0–3 hour nowcasting of squall lines, hail storms, and microbursts.
            </p>
            <div className="text-[10px] font-mono text-blue-700 font-bold bg-blue-50/80 px-2 py-0.5 rounded inline-block">
              Code: RAD-301
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2.5 hover:border-indigo-300 transition">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Numerical Weather Prediction</h4>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Primitive equations solvers, WRF domain nesting, and 4D-Var data assimilation on MoES Cray supercomputing architectures (Pratyush / Mihir).
            </p>
            <div className="text-[10px] font-mono text-indigo-700 font-bold bg-indigo-50/80 px-2 py-0.5 rounded inline-block">
              Code: NWP-101
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2.5 hover:border-rose-300 transition">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
              <CloudRain className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Tropical Cyclone Early Warning</h4>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Dvorak satellite intensity estimation, consensus track forecasting, and INCOIS coastal storm surge dynamic inundation risk models.
            </p>
            <div className="text-[10px] font-mono text-rose-700 font-bold bg-rose-50/80 px-2 py-0.5 rounded inline-block">
              Code: CYC-501
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2.5 hover:border-amber-300 transition">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Activity className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Satellite Meteorology</h4>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              INSAT-3D & 3DR multispectral imagery, brightness temperature analysis, sounder moisture profiles, and atmospheric cloud motion vectors.
            </p>
            <div className="text-[10px] font-mono text-amber-700 font-bold bg-amber-50/80 px-2 py-0.5 rounded inline-block">
              Code: SAT-401
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. ACCREDITED COURSES SHOWCASE (LIVE FROM MONGODB) */}
      {/* ========================================================================= */}
      <section className="max-w-6xl mx-auto px-4 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Accredited Curriculum Showcase
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mt-0.5">Featured Operational Training Modules</h2>
          </div>
          <Link
            to="/trainee/catalogue"
            className="text-xs text-blue-700 font-bold hover:underline flex items-center space-x-1"
          >
            <span>View Full Catalogue</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {courses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs space-y-2">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">Curriculum Pipeline Active</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              New meteorological capacity programs are authored directly by scientific trainers and published live to the national registry.
            </p>
            <Link to="/trainee/catalogue" className="inline-block mt-2 text-xs font-bold text-blue-600 hover:underline">
              Browse Catalogue Hub &rarr;
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((course) => (
              <div
                key={course._id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs whitespace-nowrap flex-shrink-0">
                      {course.code}
                    </span>
                    <div className="min-w-0 flex-1 text-right">
                      <span
                        title={course.category}
                        className="inline-block max-w-full truncate text-[10px] font-extrabold uppercase bg-blue-100 text-blue-800 px-2.5 py-1 rounded-md border border-blue-200/60"
                      >
                        {course.category}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug">{course.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{course.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <div>Trainer: <strong className="text-slate-800">{course.trainerName}</strong></div>
                    <div>Duration: <strong className="text-slate-800">{course.durationWeeks} Weeks</strong></div>
                    <div>Level: <strong className="text-slate-800">{course.level}</strong></div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-600 flex items-center space-x-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>NDEAR Accredited</span>
                  </span>
                  <Link
                    to={`/trainee/catalogue?search=${course.code}`}
                    className="px-4 py-2 bg-[#0B2545] hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                  >
                    View & Enroll
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 6. INSTANT CRYPTOGRAPHIC CERTIFICATE VERIFICATION WIDGET */}
      {/* ========================================================================= */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-gradient-to-br from-[#0B2545] via-[#0E3867] to-[#04162B] text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-blue-900/80 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center space-x-1.5 bg-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold text-emerald-300 border border-emerald-500/40">
                <Lock className="w-3.5 h-3.5" />
                <span>Tamper-Evident National Credential Verification</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                Instant Public Credential Verification
              </h3>
              <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
                Employers, universities, and disaster response bodies can verify the authenticity of any MoES / IMD certificate by entering the unique Certificate ID.
              </p>
            </div>

            {/* Inline Quick Verification Search Form */}
            <form onSubmit={handleQuickVerifySubmit} className="w-full md:w-auto flex-1 max-w-md">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Enter Certificate ID (e.g. CC-LJKU-001...)"
                  value={certVerifyInput}
                  onChange={(e) => setCertVerifyInput(e.target.value)}
                  className="w-full py-3 px-3.5 bg-white text-slate-900 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-1.5 flex-shrink-0 cursor-pointer"
                >
                  <Search className="w-4 h-4 text-slate-950" />
                  <span>Verify</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. NATIONAL CAPACITY BUILDING & MEMBERSHIP PRICING PLANS */}
      {/* ========================================================================= */}
      <section id="pricing" className="max-w-6xl mx-auto px-4 space-y-8 scroll-mt-24">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-200">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Transparent National Capacity Pricing
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Institutional Subscriptions & Trainee Access Plans
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Choose an institutional capacity tier for university campus-wide access, or explore individual professional course certifications.
          </p>

          {/* Pricing Model Switcher */}
          <div className="inline-flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200 gap-2 mt-4 shadow-inner">
            <button
              onClick={() => setPricingTab('institute')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                pricingTab === 'institute'
                  ? 'bg-[#0B2545] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>University / Institute Plans (1,000+ Quota)</span>
            </button>
            <button
              onClick={() => setPricingTab('individual')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                pricingTab === 'individual'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Individual External Trainees</span>
            </button>
          </div>
        </div>

        {/* Campus Guarantee Banner */}
        {pricingTab === 'institute' && (
          <div className="p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 rounded-2xl text-xs flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="font-bold text-emerald-950 text-sm">Campus Student Guarantee: </span>
                <span className="text-slate-700 block sm:inline">
                  When an institution activates an Institutional Quota Plan, <strong>all enrolled campus students receive 100% Free Access</strong> to all courses, modules, and exam certifications with <strong>₹0 fee charged to the student</strong>.
                </span>
              </div>
            </div>
            <Link
              to="/register-institute?plan=STANDARD_1000"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs whitespace-nowrap transition flex items-center gap-1.5 flex-shrink-0"
            >
              <span>Onboard Your College</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Dynamic Pricing Cards Grid */}
        {pricingTab === 'institute' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Plan 1: Starter */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-xl hover:border-blue-300 transition-all">
              <div className="space-y-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Small Academy</div>
                <h3 className="text-xl font-bold text-slate-900">Starter Campus</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">₹25,000</span>
                  <span className="text-xs text-slate-500 font-medium">/ year</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-800 text-xs font-bold">
                  <Users className="w-3.5 h-3.5" />
                  Capacity: Up to 250 Trainees Included
                </div>
                <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" /><span>All courses 100% Free for 250 campus trainees</span></div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" /><span>Excel Bulk Student Ingestion & auto PINs</span></div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" /><span>Printable Live QR Exam Hall Tickets</span></div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" /><span>Standard Institute KPIs & Gradebook</span></div>
                </div>
              </div>
              <Link
                to="/register-institute?plan=STARTER_250"
                className="mt-8 w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs text-center block transition"
              >
                Choose Starter Plan
              </Link>
            </div>

            {/* Plan 2: Standard (1,000 Students) - Featured */}
            <div className="bg-gradient-to-b from-blue-50/50 to-white rounded-3xl border-2 border-blue-600 p-6 flex flex-col justify-between shadow-xl relative scale-100 md:-translate-y-2">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 bg-blue-600 text-white rounded-full text-[11px] font-black uppercase tracking-wider shadow-md flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Most Popular • Standard Plan
              </div>
              <div className="space-y-4 pt-2">
                <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">Affiliated College / Institute</div>
                <h3 className="text-2xl font-black text-slate-900">Standard College</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">₹75,000</span>
                  <span className="text-xs text-slate-500 font-medium">/ year (₹75/student)</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-100 text-blue-900 text-xs font-black">
                  <Users className="w-3.5 h-3.5 text-blue-700" />
                  Capacity: Up to 1,000 Trainees Included
                </div>
                <div className="space-y-2.5 pt-4 border-t border-slate-200/80 text-xs text-slate-700">
                  <div className="flex items-center gap-2 font-medium"><CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" /><span>All courses 100% Free for all 1,000 students</span></div>
                  <div className="flex items-center gap-2 font-medium"><CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" /><span>Custom Institute Certificate Template & Seal</span></div>
                  <div className="flex items-center gap-2 font-medium"><CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" /><span>Faculty Course & Examination Authoring Studio</span></div>
                  <div className="flex items-center gap-2 font-medium"><CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" /><span>Departments, Programs & Batch Cohort Management</span></div>
                  <div className="flex items-center gap-2 font-medium"><CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" /><span>WMO-258 National Standards Verification</span></div>
                </div>
              </div>
              <Link
                to="/register-institute?plan=STANDARD_1000"
                className="mt-8 w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs text-center block shadow-lg shadow-blue-500/30 transition"
              >
                Activate 1,000 Student Plan (₹75,000)
              </Link>
            </div>

            {/* Plan 3: Enterprise */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-xl hover:border-indigo-300 transition-all">
              <div className="space-y-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">State / Central University</div>
                <h3 className="text-xl font-bold text-slate-900">Enterprise University</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">₹2,50,000</span>
                  <span className="text-xs text-slate-500 font-medium">/ year (₹50/student)</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-800 text-xs font-bold">
                  <Users className="w-3.5 h-3.5" />
                  Capacity: Up to 5,000 Trainees Included
                </div>
                <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" /><span>All courses 100% Free for 5,000 campus trainees</span></div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" /><span>Multi-Campus Decentralized Administration</span></div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" /><span>Priority MoES National Accreditation Clearance</span></div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" /><span>Dedicated 24/7 Academic Support Line</span></div>
                </div>
              </div>
              <Link
                to="/register-institute?plan=ENTERPRISE_5000"
                className="mt-8 w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs text-center block transition"
              >
                Choose Enterprise Plan
              </Link>
            </div>
          </div>
        ) : (
          /* Individual External Trainees Pay-As-You-Go */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Free Open Citizen Preview */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-6 flex flex-col justify-between hover:shadow-lg transition">
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Public Access</span>
                <h3 className="text-2xl font-bold text-slate-900">Open Public Citizen Preview</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">₹0</span>
                  <span className="text-xs text-slate-500 font-medium">Free Forever</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Explore open meteorological syllabus overviews, public weather warnings, and radar terminology.
                </p>
                <div className="space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /><span>Browse National Course Catalogue</span></div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /><span>Preview introductory lecture materials</span></div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /><span>Access public circulars and weather radar map</span></div>
                </div>
              </div>
              <Link
                to="/trainee/catalogue"
                className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs text-center block transition"
              >
                Browse Free Catalogue
              </Link>
            </div>

            {/* Paid Individual Certification */}
            <div className="bg-gradient-to-b from-blue-50/50 to-white rounded-3xl border-2 border-blue-600 p-8 space-y-6 flex flex-col justify-between shadow-xl relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white rounded-full text-[11px] font-black uppercase tracking-wider shadow-md flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                Certified Career Progression
              </div>
              <div className="space-y-4 pt-2">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Direct External Learner</span>
                <h3 className="text-2xl font-black text-slate-900">Verified MoES-IMD Certification</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-blue-600">₹999</span>
                  <span className="text-xs text-slate-500 font-medium">/ course (one-time fee)</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  For external independent researchers and non-affiliated students wanting accredited career certification.
                </p>
                <div className="space-y-3 pt-4 border-t border-slate-200/80 text-xs text-slate-700 font-medium">
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" /><span>Full access to all course lectures & modules</span></div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" /><span>Official proctored timed examination</span></div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" /><span>Cryptographic SHA-256 Verifiable Certificate with Live QR</span></div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" /><span>National Competency Passport skill badge</span></div>
                </div>
              </div>
              <Link
                to="/trainee/catalogue"
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs text-center block shadow-lg shadow-blue-500/30 transition"
              >
                Enroll in Paid Certification (₹999)
              </Link>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* DUAL-TIER COMPARISON MATRIX */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              Clear Dual-Tier Access Model Comparison
            </h3>
            <p className="text-xs text-slate-500">
              Transparent policy: Campus students never pay individually; external trainees pay per certificate.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 font-bold">Platform Feature</th>
                  <th className="py-3 px-4 font-bold text-emerald-700 bg-emerald-50/50 rounded-t-xl">Campus Student (Subscribed College)</th>
                  <th className="py-3 px-4 font-bold text-blue-700 bg-blue-50/50 rounded-t-xl">External Independent Trainee</th>
                  <th className="py-3 px-4 font-bold text-slate-700">Institutional Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-900">Student Course Fee</td>
                  <td className="py-3.5 px-4 font-black text-emerald-600 bg-emerald-50/30">100% FREE (₹0 Charged)</td>
                  <td className="py-3.5 px-4 font-bold text-blue-600 bg-blue-50/30">₹999 / Course</td>
                  <td className="py-3.5 px-4">Funded via Quota (₹75k/yr)</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-900">Interactive Lecture Access</td>
                  <td className="py-3.5 px-4 text-emerald-700 bg-emerald-50/30">Unlimited Full Access</td>
                  <td className="py-3.5 px-4 text-blue-700 bg-blue-50/30">Full Access upon Enrollment</td>
                  <td className="py-3.5 px-4">Authoring & Preview Access</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-900">Proctored Timed Examination</td>
                  <td className="py-3.5 px-4 text-emerald-700 bg-emerald-50/30">Included Free</td>
                  <td className="py-3.5 px-4 text-blue-700 bg-blue-50/30">1 Exam Included</td>
                  <td className="py-3.5 px-4">Configure Pass Marks & Banks</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-900">Tamper-Proof QR Certificate</td>
                  <td className="py-3.5 px-4 text-emerald-700 bg-emerald-50/30">Included with Campus Seal</td>
                  <td className="py-3.5 px-4 text-blue-700 bg-blue-50/30">Included with MoES National Seal</td>
                  <td className="py-3.5 px-4">Custom Institutional Seal Studio</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-900">Roster Onboarding Method</td>
                  <td className="py-3.5 px-4 text-emerald-700 bg-emerald-50/30">Auto Ingestion by College Admin</td>
                  <td className="py-3.5 px-4 text-blue-700 bg-blue-50/30">Self-Registration</td>
                  <td className="py-3.5 px-4">Excel Batch Upload (Up to 1,000)</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-900">Government Mandatory Courses</td>
                  <td className="py-3.5 px-4 text-emerald-700 bg-emerald-50/30">100% Free for All</td>
                  <td className="py-3.5 px-4 text-emerald-700 bg-blue-50/30">100% Free for All</td>
                  <td className="py-3.5 px-4">Included in Curriculum</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* FREQUENTLY ASKED PRICING QUESTIONS (ACCORDION) */}
        {/* ========================================================================= */}
        <div className="bg-slate-50/80 rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-4">
          <div className="text-center space-y-1 pb-2">
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-widest">
              Got Questions?
            </span>
            <h3 className="text-xl font-bold text-slate-900">
              Frequently Asked Pricing & Quota Questions
            </h3>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto text-xs">
            {[
              {
                q: 'How does the 1,000-student quota work for an affiliated institute?',
                a: 'When an institute subscribes to the Standard College Plan (₹75,000/yr), their account is credited with a capacity of 1,000 trainees. The institute administrator can upload students via Excel or CSV. Each onboarded student receives credentials and gets 100% free access to all courses and certifications with zero extra charges.'
              },
              {
                q: 'Do college students ever need to pay individually for any course?',
                a: 'No! If a student is affiliated with an active subscribed institute, their training is 100% sponsored by the university. They are never prompted with payment walls or fees for any accredited curriculum.'
              },
              {
                q: 'What happens if our college exceeds its 1,000 student quota?',
                a: 'The system protects your capacity. If an Excel import batch exceeds the remaining quota, the system will notify the administrator with the exact count remaining. The institute admin can upgrade to the Enterprise University Plan (5,000 students) directly from their portal.'
              },
              {
                q: 'Can external independent trainees enroll without a college affiliation?',
                a: 'Yes. Independent scientists, researchers, and working professionals can register as Trainees and enroll in any course. For paid courses, a nominal one-time fee of ₹999 unlocks full access, exam retakes, and an official SHA-256 verifiable certificate.'
              },
              {
                q: 'Are Ministry of Earth Sciences mandatory courses free for everyone?',
                a: 'Yes! Core national awareness courses marked with the "Ministry Mandatory" badge are 100% free (₹0) for all registered citizens, whether affiliated with an institute or not.'
              },
              {
                q: 'What payment methods are supported on the platform?',
                a: 'We support all major Indian payment methods through Razorpay, including UPI (Google Pay, PhonePe, Paytm), Net Banking across 50+ Indian banks, Debit and Credit Cards (Visa, Mastercard, RuPay), and corporate institutional invoices.'
              }
            ].map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs transition"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 font-bold text-slate-800 hover:text-blue-700 transition cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <HelpCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span>{faq.q}</span>
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-slate-600 leading-relaxed border-t border-slate-50 animate-in fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Trust Strip */}
          <div className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-center gap-6 text-[11px] text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>256-Bit SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-blue-600" />
              <span>Razorpay Instant Settlement & GST Invoicing</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>NDEAR & MoES Accredited Security Standard</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. OFFICIAL AUTONOMOUS RESEARCH INSTITUTES DIRECTORY */}
      {/* ========================================================================= */}
      <section className="max-w-6xl mx-auto px-4 space-y-4 text-center">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
          Affiliated Autonomous Institutes & Research Laboratories
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
          {AUTONOMOUS_INSTITUTES.map((inst) => (
            <div key={inst.code} className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs text-left space-y-1 hover:border-blue-300 transition">
              <div className="font-mono font-bold text-blue-900 text-xs">{inst.code}</div>
              <div className="font-bold text-slate-800 text-[11px] leading-tight truncate">{inst.name}</div>
              <div className="text-[10px] text-slate-400">{inst.city}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. OFFICIAL NOTICES & CIRCULARS */}
      {/* ========================================================================= */}
      {announcements.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 space-y-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-base text-slate-900">Ministry Official Circulars & Advisories</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.map((ann) => (
              <div
                key={ann._id}
                className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                  ann.category === 'Urgent'
                    ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-white border">
                    {ann.category}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(ann.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm leading-snug">{ann.title}</h4>
                <p className="text-slate-600 leading-relaxed">{ann.content}</p>
                <div className="text-[10px] text-slate-500 pt-1">
                  Issued by: <strong>{ann.authorName}</strong>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      </div>

      {/* ========================================================================= */}
      {/* 9. PREMIUM AUTHENTIC GOVERNMENT FOOTER (FULL WIDTH EDGE-TO-EDGE) */}
      {/* ========================================================================= */}
      <footer className="w-full bg-[#071E3D] text-slate-300 py-12 px-4 sm:px-8 lg:px-12 border-t border-slate-800 text-xs mt-auto">
        <div className="max-w-6xl mx-auto space-y-10">
          {/* Top Grid: Links & Info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-700/80">
            
            {/* Column 1: Organization Info */}
            <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🏛️</span>
              <span className="font-black text-white text-base">CAPACITY CONNECT</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Unified National Capacity Building & Learning Management Ecosystem for the Ministry of Earth Sciences (MoES) and India Meteorological Department (IMD).
            </p>
            <div className="text-[10px] text-sky-300 font-mono">
              National Digital Education Architecture (NDEAR) • WMO-No. 1083 Standard
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Quick Navigation</h4>
            <ul className="space-y-2 text-[11px]">
              <li><Link to="/" className="hover:text-white transition">Home Portal</Link></li>
              <li><Link to="/trainee/catalogue" className="hover:text-white transition">Government Course Catalogue</Link></li>
              <li><Link to="/register-institute" className="hover:text-amber-300 transition">Register Institute / Academy</Link></li>
              <li><Link to="/verify" className="hover:text-white transition">Public Certificate Verification</Link></li>
              <li><Link to="/about" className="hover:text-white transition">MoES Competency Blueprint</Link></li>
              <li><Link to="/login" className="hover:text-white transition">Unified Single Sign-In</Link></li>
            </ul>
          </div>

          {/* Column 3: National Government Portals */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">National Digital Portals</h4>
            <ul className="space-y-2 text-[11px]">
              <li><a href="https://www.india.gov.in" target="_blank" rel="noreferrer" className="hover:text-white flex items-center space-x-1"><span>National Portal of India</span><ExternalLink className="w-3 h-3" /></a></li>
              <li><a href="https://mausam.imd.gov.in" target="_blank" rel="noreferrer" className="hover:text-white flex items-center space-x-1"><span>IMD Mausam Bhavan</span><ExternalLink className="w-3 h-3" /></a></li>
              <li><a href="https://www.moes.gov.in" target="_blank" rel="noreferrer" className="hover:text-white flex items-center space-x-1"><span>Ministry of Earth Sciences</span><ExternalLink className="w-3 h-3" /></a></li>
              <li><a href="https://www.education.gov.in/ndear" target="_blank" rel="noreferrer" className="hover:text-white flex items-center space-x-1"><span>NDEAR Architecture</span><ExternalLink className="w-3 h-3" /></a></li>
              <li><a href="https://pmevidya.education.gov.in" target="_blank" rel="noreferrer" className="hover:text-white flex items-center space-x-1"><span>PM e-VIDYA Portal</span><ExternalLink className="w-3 h-3" /></a></li>
            </ul>
          </div>

          {/* Column 4: Contact Directorate */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Directorate Contact</h4>
            <div className="space-y-2 text-[11px] text-slate-300">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <span>Mausam Bhavan, Lodhi Road, New Delhi 110003</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>Control Room: +91-11-24611068</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>support.capacity@imd.gov.in</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            © 2026 Ministry of Earth Sciences (MoES), Government of India. All Rights Reserved.
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/about" className="hover:text-white">Security & Privacy Policy</Link>
            <span>•</span>
            <Link to="/about" className="hover:text-white">Hyperlinking Policy</Link>
            <span>•</span>
            <Link to="/about" className="hover:text-white">Terms of Governance</Link>
          </div>
        </div>

        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
