import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  BookOpen,
  Award,
  Compass,
  Sliders,
  CheckCircle2,
  ArrowRight,
  Building2,
  Users,
  Radio,
  CloudRain,
  Activity,
  FileCheck,
  Lock,
  Sparkles,
  Globe,
  Layers,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  GraduationCap,
  Scale,
  Server,
  Calendar,
  Check,
  Zap,
  BarChart3,
  Network,
  Fingerprint,
  Landmark,
  HelpCircle,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

const AboutFramework = () => {
  const [activeFaq, setActiveFaq] = useState(null);
  const [selectedRole, setSelectedRole] = useState('forecaster');

  const institutes = [
    {
      name: 'India Meteorological Department (IMD)',
      city: 'HQ New Delhi & 6 RMCs',
      type: 'National Forecasting Authority',
      badge: 'Principal Mandate',
      desc: 'Formulates operational forecasting protocols, oversees Doppler weather radar networks, and manages 6 Regional Meteorological Centres (RMCs).'
    },
    {
      name: 'Indian Institute of Tropical Meteorology (IITM)',
      city: 'Pune, Maharashtra',
      type: 'Atmospheric Research Institute',
      badge: 'Climate & Monsoon Modeling',
      desc: 'Conducts fundamental and applied research in tropical meteorology, monsoon dynamics, and high-performance climate simulation.'
    },
    {
      name: 'National Centre for Medium Range Weather Forecasting (NCMRWF)',
      city: 'Noida, Uttar Pradesh',
      type: 'Supercomputing & NWP',
      badge: 'Global Numerical Prediction',
      desc: 'Operates state-of-the-art supercomputers running deterministic and ensemble global numerical weather prediction models.'
    },
    {
      name: 'Indian National Centre for Ocean Information Services (INCOIS)',
      city: 'Hyderabad, Telangana',
      type: 'Oceanographic Service',
      badge: 'Tsunami & Coastal Warning',
      desc: 'Provides ocean state forecasting, ocean hazard early warnings (Tsunami/Storm Surges), and marine advisory services.'
    },
    {
      name: 'National Centre for Polar & Ocean Research (NCPOR)',
      city: 'Vasco da Gama, Goa',
      type: 'Cryosphere Research',
      badge: 'Polar Meteorology',
      desc: 'Coordinates scientific expeditions to Arctic, Antarctic, and Himalayas, evaluating cryospheric telemetry and polar atmospheric changes.'
    },
    {
      name: 'Central Training Institute (CTI) & RTCs',
      city: 'Pashan (Pune) & Regional Nodes',
      type: 'WMO Regional Training Centre',
      badge: 'WMO-1083 Accredited',
      desc: 'Conducts basic and advanced meteorological training courses adhering strictly to WMO-No. 1083 and WMO-No. 49 guidelines.'
    }
  ];

  const roleMatrices = {
    forecaster: {
      title: 'Operational Synoptic & Cyclone Forecaster',
      moesTier: 'Level 3 - Proficient to Expert',
      competencies: [
        { name: 'Synoptic Chart Analysis & NWP Ensemble Interpretation', level: 'Expert (100%)', code: 'MET-SYN-401' },
        { name: 'Doppler Weather Radar (DWR) Severe Storm Nowcasting', level: 'Proficient (85%)', code: 'RAD-NOW-302' },
        { name: 'Cyclone Track & Storm Surge Warning Bulletins', level: 'Proficient (80%)', code: 'CYC-WRN-305' },
        { name: 'Satellite Meteorology (INSAT-3D/3DR Multispectral Imagery)', level: 'Expert (95%)', code: 'SAT-MET-402' }
      ]
    },
    radar: {
      title: 'Doppler Weather Radar (DWR) Specialist',
      moesTier: 'Level 3 - Proficient',
      competencies: [
        { name: 'Dual-Polarization Hydrometeor Classification', level: 'Proficient (85%)', code: 'RAD-POL-301' },
        { name: 'Reflectivity (Z) & Radial Velocity (V) Inversion', level: 'Expert (90%)', code: 'RAD-INV-401' },
        { name: 'Mesocyclone & Microburst Signature Detection', level: 'Proficient (80%)', code: 'RAD-SIG-303' },
        { name: 'Radar Hardware Telemetry & Calibration Maintenance', level: 'Working (70%)', code: 'ENG-CAL-201' }
      ]
    },
    aviation: {
      title: 'Aviation Meteorological Forecaster',
      moesTier: 'Level 2 - Working to Proficient',
      competencies: [
        { name: 'METAR / SPECI / TAF Aeronautical Code Formulation', level: 'Expert (100%)', code: 'AV-COD-401' },
        { name: 'Terminal Aerodrome Wind Shear & Turbulence Warning', level: 'Proficient (85%)', code: 'AV-TURB-302' },
        { name: 'Runway Visual Range (RVR) Assessment under Low Visibility', level: 'Proficient (80%)', code: 'AV-RVR-304' },
        { name: 'SIGMET Dissemination for En-Route Convective Weather', level: 'Proficient (85%)', code: 'AV-SIG-306' }
      ]
    }
  };

  const faqs = [
    {
      q: 'How does CAPACITY CONNECT modernize national capacity building?',
      a: 'CAPACITY CONNECT delivers an institutional-grade capacity building and competency tracking framework for Earth Sciences personnel across India by providing an automated trainer matching engine, longitudinal competency passports, timed proctored examinations, and tamper-evident QR verification.'
    },
    {
      q: 'Are certificates issued by CAPACITY CONNECT verifiable by third parties?',
      a: 'Yes. Every issued certificate receives an immutable SHA-256 cryptographic signature, an official serial number (e.g. MOES-2026-XXXX), and a scannable QR code. Disaster response authorities, aviation operators, and international bodies can verify authenticity instantly at /verify/:certificateNumber without requiring a portal login.'
    },
    {
      q: 'What is the server-side eligibility threshold for earning a Certificate?',
      a: 'A forecaster must achieve 100% curriculum module completion (tracked per video/document) followed by achieving a minimum passing score of ≥60% in the proctored examination arena. Claiming certificates without satisfying both criteria is rejected by server-side verification logic.'
    },
    {
      q: 'How does the AI Trainer Matching algorithm calculate instructor compatibility?',
      a: 'The algorithm evaluates instructors across four weighted attributes: Verified Domain Competency (40%), Teaching & Authoring Tenure (25%), Cohort Learner Satisfaction & Pass Velocity (20%), and Active Teaching Workload (15%), ensuring objective, merit-based instructor allocation.'
    },
    {
      q: 'Can external universities and regional institutes register their own academies?',
      a: 'Yes. Authorized autonomous bodies, state disaster management authorities, and academic universities can register through the "Register Institute" pipeline. Upon administrative vetting by central MoES, the institute receives its own tenant workspace with custom signatories.'
    }
  ];

  return (
    <div className="w-full flex flex-col min-h-full select-none transition-all">
      
      {/* ========================================================================= */}
      {/* 1. OFFICIAL GOVERNMENT ACCESSIBILITY & EMERGENCY BROADCAST TICKER */}
      {/* ========================================================================= */}
      <div className="w-full bg-gradient-to-r from-[#07192F] via-[#0B2545] to-[#0A1F3B] text-slate-200 text-xs px-4 sm:px-8 lg:px-12 py-2.5 border-b border-blue-900/60 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: National Identity Strip */}
        <div className="flex items-center space-x-2.5">
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

        {/* Right: Live Telemetry / Directive */}
        <div className="flex items-center space-x-2 text-[11px] overflow-hidden text-amber-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping flex-shrink-0" />
          <span className="font-mono text-emerald-400 font-bold uppercase tracking-wider">OFFICIAL DIRECTIVE:</span>
          <span className="truncate max-w-xs md:max-w-md text-slate-200">
            National Meteorological Capacity Blueprint 2026 • WMO-1083 Standard Compliant
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
            <span>सत्यમેવ જયતે</span>
            <span className="text-slate-400">•</span>
            <span className="font-bold text-white">Ministry of Earth Sciences (MoES)</span>
            <span className="text-slate-400">•</span>
            <span className="text-emerald-300 font-semibold">NDEAR & WMO-1083 Certified</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight uppercase font-sans">
              MoES / IMD Capacity Blueprint
            </h1>
            <p className="text-sm sm:text-lg text-amber-300 font-bold tracking-wide">
              National Digital Capacity Building, Competency Assurance & Forensic Credentialing Ecosystem
            </p>
          </div>

          <p className="text-xs sm:text-sm text-slate-200 font-normal max-w-3xl mx-auto leading-relaxed">
            Commissioned for the Ministry of Earth Sciences (MoES) and India Meteorological Department (IMD), CAPACITY CONNECT is an institutional-grade capacity ecosystem engineered for operational meteorologists, climate modelers, and disaster authorities across 28 Regional Meteorological Centres (RMCs) and Ministry autonomous institutes.
          </p>

          {/* Quick Action Navigation Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/login"
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center space-x-1.5 cursor-pointer"
            >
              <span>Access Official Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/trainee/catalogue"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/30 backdrop-blur-md transition flex items-center space-x-1.5 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-sky-300" />
              <span>Explore Course Catalogue</span>
            </Link>
            <Link
              to="/register-institute"
              className="px-6 py-3 bg-slate-800/90 hover:bg-slate-800 text-amber-300 font-bold text-xs rounded-xl border border-amber-400/40 transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Register Institute / Academy</span>
            </Link>
          </div>

        </div>
      </section>

      {/* Middle Content Wrapper */}
      <div className="w-full space-y-16 py-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto flex-1">

      {/* ========================================================================= */}
      {/* 2. INSTITUTIONAL TRANSFORMATION: LEGACY SILOS VS CAPACITY CONNECT */}
      {/* ========================================================================= */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-widest">
            Institutional Capacity Innovation
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Transforming Earth Sciences Training into a Continuous Ecosystem
          </h2>
          <p className="text-xs text-slate-500 max-w-xl mx-auto">
            Directly addressing operational bottlenecks identified across India's meteorological and environmental research bodies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Legacy Challenges */}
          <div className="bg-rose-50/60 rounded-2xl p-6 sm:p-7 border border-rose-200/80 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 text-rose-800 font-bold text-sm">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Conventional Training Silos (Pre-Capacity Connect)</span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-start space-x-2">
                <span className="text-rose-600 font-bold mt-0.5">✕</span>
                <span><strong>Manual Roster Dispatch:</strong> Instructor availability and trainee allocations maintained across disparate paper logs and spreadsheets.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-rose-600 font-bold mt-0.5">✕</span>
                <span><strong>Static PDF Credentials:</strong> Easy-to-forge course attendance certificates with zero cryptographic verification mechanisms.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-rose-600 font-bold mt-0.5">✕</span>
                <span><strong>Disconnected Skill Tracking:</strong> No real-time visibility into whether forecasters meet WMO-1083 requirements for critical weather duties.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-rose-600 font-bold mt-0.5">✕</span>
                <span><strong>Unverified Assessment Claims:</strong> Certificates issued without rigorous time-bound proctoring or algorithmic pass-rate validation.</span>
              </li>
            </ul>
          </div>

          {/* Capacity Connect Architecture */}
          <div className="bg-emerald-50/60 rounded-2xl p-6 sm:p-7 border border-emerald-200/80 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>CAPACITY CONNECT Modern Architecture</span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-start space-x-2">
                <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                <span><strong>Multi-Variate Trainer Matching:</strong> Algorithmic 0–100 match scoring based on competency, tenure, cohort ratings, and workload balance.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                <span><strong>Tamper-Evident QR Verification:</strong> Cryptographically generated certificates verifiable publicly by disaster teams via instant QR scan.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                <span><strong>Longitudinal Competency Passport:</strong> Dynamic career readiness scoring mapping individual forecasters to standardized MoES job profiles.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                <span><strong>Strict Server-Side Eligibility Gate:</strong> 100% curriculum completion + timed proctored exam qualification (≥60%) required before certificate release.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. THE 4 PILLARS OF THE CAPACITY CONNECT ARCHITECTURE */}
      {/* ========================================================================= */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-widest">
            Foundational Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Four Core Pillars of Institutional Credentialing
          </h2>
          <p className="text-xs text-slate-500 max-w-xl mx-auto">
            Architected in strict compliance with the National Digital Education Architecture (NDEAR) for transparent atmospheric competency governance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Pillar 1 */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-3 flex flex-col justify-between hover:shadow-md transition">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xl border border-blue-100">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                1. Longitudinal Competency Passport & Skill-Gap Radar
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Rather than tracking one-off test certificates, each forecaster holds a persistent, longitudinal Competency Passport. The system continuously evaluates an officer's demonstrated proficiency against four standardized MoES competency tiers: <strong>Beginner</strong>, <strong>Working</strong>, <strong>Proficient</strong>, and <strong>Expert</strong>.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Real-time Readiness Score mapped to benchmark government roles</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Dynamic identification of missing operational proficiencies</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Auto-recommended curriculum pathways to close operational skill-gaps</span>
                </li>
              </ul>
            </div>
            <div className="text-[11px] font-mono font-bold text-blue-700 pt-2">
              Standard: NDEAR Competency Registry Specification
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-3 flex flex-col justify-between hover:shadow-md transition">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xl border border-indigo-100">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                2. AI-Weighted Trainer-Competency Matching Engine
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Centralized manual instructor dispatching is replaced by an automated multi-variate scoring algorithm. When curriculum requirements arise, the system calculates an objective 0–100 match score for available scientists across India.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span><strong>Domain Competency Level (40% Weight):</strong> Verified domain expertise</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span><strong>Teaching Experience (25% Weight):</strong> Scientific authoring tenure</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span><strong>Learner Feedback (20% Weight):</strong> Cohort satisfaction and pass rate</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span><strong>Current Workload (15% Weight):</strong> Active courses and lab hours</span>
                </li>
              </ul>
            </div>
            <div className="text-[11px] font-mono font-bold text-indigo-700 pt-2">
              Formula: MatchScore = 0.40(Comp) + 0.25(Exp) + 0.20(Rating) + 0.15(Load)
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-3 flex flex-col justify-between hover:shadow-md transition">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xl border border-amber-100">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                3. Proctored Assessments & Cryptographic QR Verification
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Credentials cannot be claimed casually. Every certificate is earned strictly through a dual server-side verification barrier: 100% curriculum module progress completion followed by qualifying an official timed proctored examination.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Timed examination mode with instant algorithmic scoring and feedback</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Server-side cryptographic hash generation at issuance</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Embedded tamper-evident QR code verifiable publicly by disaster authorities</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Administrative revocation registry with transparent audit justification</span>
                </li>
              </ul>
            </div>
            <div className="text-[11px] font-mono font-bold text-amber-700 pt-2">
              Verification Route: /verify/:certificateNumber
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-3 flex flex-col justify-between hover:shadow-md transition">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xl border border-purple-100">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                4. Multi-Tenant Regional Institutional Governance
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                India’s meteorological infrastructure spans across universities, autonomous research bodies, and regional forecasting centers. CAPACITY CONNECT features dedicated multi-tenant institute registration and workspace partitioning.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Decentralized institute registration under MoES compliance</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Organization-level user verification queues and access governance</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Custom institutional signatories and branded tamper-evident certificates</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Independent curriculum catalogs for specialized regional needs</span>
                </li>
              </ul>
            </div>
            <div className="text-[11px] font-mono font-bold text-purple-700 pt-2">
              Institutes: IMD HQ, IITM Pune, NCMRWF Noida, INCOIS Hyderabad, Academies
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. INTERACTIVE COMPETENCY MATRIX PREVIEW (WMO-1083 BENCHMARK) */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-blue-700 uppercase tracking-widest">
              WMO-No. 1083 & BIP-M Standard Alignment
            </span>
            <h3 className="text-xl font-bold text-slate-900">
              Interactive Operational Competency Matrix
            </h3>
            <p className="text-xs text-slate-500">
              How the platform tracks specialized Earth Sciences capabilities across national forecasting roles.
            </p>
          </div>

          {/* Role Filter Tabs */}
          <div className="inline-flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setSelectedRole('forecaster')}
              className={`px-3 py-1.5 rounded-lg transition ${
                selectedRole === 'forecaster' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Synoptic Forecaster
            </button>
            <button
              onClick={() => setSelectedRole('radar')}
              className={`px-3 py-1.5 rounded-lg transition ${
                selectedRole === 'radar' ? 'bg-white text-indigo-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Radar Specialist
            </button>
            <button
              onClick={() => setSelectedRole('aviation')}
              className={`px-3 py-1.5 rounded-lg transition ${
                selectedRole === 'aviation' ? 'bg-white text-amber-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Aviation Met
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs">
            <div>
              <span className="text-slate-500 font-medium">Target Role Profile: </span>
              <strong className="text-slate-900">{roleMatrices[selectedRole].title}</strong>
            </div>
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-mono font-bold text-[11px]">
              {roleMatrices[selectedRole].moesTier}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {roleMatrices[selectedRole].competencies.map((comp, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                    {comp.code}
                  </span>
                  <span className="font-bold text-emerald-600 text-xs">{comp.level}</span>
                </div>
                <div className="font-semibold text-slate-800 text-xs leading-snug">
                  {comp.name}
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full"
                    style={{ width: comp.level.includes('100%') ? '100%' : comp.level.includes('95%') ? '95%' : comp.level.includes('90%') ? '90%' : comp.level.includes('85%') ? '85%' : comp.level.includes('80%') ? '80%' : '70%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. MOES AUTONOMOUS INSTITUTES & SCIENTIFIC NETWORK */}
      {/* ========================================================================= */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-widest">
            Institutional Network
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Participating MoES Institutes & Regional Centers
          </h2>
          <p className="text-xs text-slate-500 max-w-xl mx-auto">
            Federated access across India’s premier earth sciences and climate research establishments.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {institutes.map((inst, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                    {inst.city}
                  </span>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {inst.badge}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 leading-snug">
                  {inst.name}
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {inst.desc}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">{inst.type}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. THE THREE OPERATIONAL PERSONAS */}
      {/* ========================================================================= */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-widest">
            Role Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Strict Separation of Duties & Specialized Role Suites
          </h2>
          <p className="text-xs text-slate-500 max-w-xl mx-auto">
            Every operational persona operates within dedicated, protected boundaries with server-side RBAC enforcement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Persona 1: Trainee */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl">🎓</span>
                <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded">
                  ROLE: TRAINEE
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-base">Operational Forecaster</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Meteorologists, synoptic observers, and climate research scholars enrolled in specialized capacity tracks.
              </p>
              <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex items-start space-x-2">
                  <Check className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Interactive course player with resume & progress velocity</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Timed proctored examination arena with instant grading</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>National Competency Passport with target role readiness</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Downloadable, printable cryptographic QR credentials</span>
                </div>
              </div>
            </div>
            <Link
              to="/login"
              className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl text-center transition flex items-center justify-center space-x-1"
            >
              <span>Sign In as Trainee</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Persona 2: Trainer */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl">👨‍🏫</span>
                <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded">
                  ROLE: TRAINER
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-base">Scientist / Senior Instructor</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Subject matter authorities authoring accredited curricula, conducting radar lab webinars, and supervising cohorts.
              </p>
              <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex items-start space-x-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <span>5-Step Course Builder Wizard with multimedia sequencing</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <span>Assessment Question Bank Manager with scientific rationales</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <span>Live forecaster analytics with automated At-Risk alerts</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <span>Synchronous lab scheduling & one-click attendance rosters</span>
                </div>
              </div>
            </div>
            <Link
              to="/login"
              className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl text-center transition flex items-center justify-center space-x-1"
            >
              <span>Sign In as Trainer</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Persona 3: Admin */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl">🏛️</span>
                <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-900 border border-amber-300 px-2 py-0.5 rounded">
                  ROLE: ADMIN
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-base">Central Governance Administrator</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Central MoES & institutional administrators moderating curriculum, approving personnel, and auditing operations.
              </p>
              <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex items-start space-x-2">
                  <Check className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span>User verification queue with detailed credential auditing</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span>Curriculum review pipeline (Review → Approve & Publish)</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span>AI weighted trainer-competency matching control console</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span>Cryptographically immutable security & administrative audit logs</span>
                </div>
              </div>
            </div>
            <Link
              to="/login"
              className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-xl text-center transition flex items-center justify-center space-x-1"
            >
              <span>Sign In as Admin</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. END-TO-END 5-STEP GOVERNANCE LIFECYCLE */}
      {/* ========================================================================= */}
      <section className="bg-slate-100/90 rounded-3xl p-8 sm:p-10 border border-slate-200/80 space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-widest">
            Operational Lifecycle
          </span>
          <h2 className="text-2xl font-bold text-slate-900">
            5-Stage Competency Assurance Workflow
          </h2>
          <p className="text-xs text-slate-500 max-w-xl mx-auto">
            How a scientific capability requirement transforms into a verified national meteorological credential.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 font-black text-xs flex items-center justify-center border border-blue-200">
              01
            </div>
            <h4 className="font-bold text-slate-900 text-xs">Curriculum Formulation</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Subject matter expert designs syllabus, uploads multimedia lessons, and builds examination questions with explanations.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-black text-xs flex items-center justify-center border border-indigo-200">
              02
            </div>
            <h4 className="font-bold text-slate-900 text-xs">MoES Governance Audit</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Central administrators verify syllabus alignment against national competency benchmarks before publishing to catalogue.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 font-black text-xs flex items-center justify-center border border-sky-200">
              03
            </div>
            <h4 className="font-bold text-slate-900 text-xs">Operational Training</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Trainees complete video and telemetry modules, attend live virtual radar labs, and maintain 100% curriculum velocity.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 font-black text-xs flex items-center justify-center border border-amber-200">
              04
            </div>
            <h4 className="font-bold text-slate-900 text-xs">Proctored Assessment</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Forecasters undergo timed examination arena evaluation requiring a strict ≥60% pass threshold to earn eligibility.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 font-black text-xs flex items-center justify-center border border-emerald-200">
              05
            </div>
            <h4 className="font-bold text-slate-900 text-xs">Cryptographic Credential</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Server generates tamper-evident credential with embedded QR verification, logged in the national security audit registry.
            </p>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. NON-NEGOTIABLE ENGINEERING & SECURITY COMPLIANCE */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <Shield className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">Non-Negotiable Government Engineering & Security Standards</h3>
            <p className="text-xs text-slate-500">Rigorous technical benchmarks implemented across the CAPACITY CONNECT platform.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
          
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
            <div className="font-bold text-slate-900 flex items-center space-x-1.5">
              <Lock className="w-4 h-4 text-blue-600" />
              <span>Zero-Trust Role-Based Access Control (RBAC)</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Strict server-side route guards prevent unauthorized privilege escalation between Trainees, Trainers, and Governance Administrators.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
            <div className="font-bold text-slate-900 flex items-center space-x-1.5">
              <Scale className="w-4 h-4 text-emerald-600" />
              <span>Server-Side Eligibility Validation</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Certificate claims are evaluated purely in server memory against enrollment progress (100%) and assessment pass criteria (≥60%).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
            <div className="font-bold text-slate-900 flex items-center space-x-1.5">
              <FileCheck className="w-4 h-4 text-purple-600" />
              <span>Snapshotting of Certificate Artifacts</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Recipient metadata, organizational signatories, and course details are permanently snapshotted at issuance to preserve forensic validity.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
            <div className="font-bold text-slate-900 flex items-center space-x-1.5">
              <Server className="w-4 h-4 text-amber-600" />
              <span>Cryptographic Audit Registry</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Privileged administrative actions (user approval, certificate revocation, syllabus publication) are logged immutably with IP addresses.
            </p>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. FREQUENTLY ASKED QUESTIONS (OFFICIAL KNOWLEDGE BASE) */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">Frequently Asked Institutional Questions</h3>
            <p className="text-xs text-slate-500">Official guidance for forecasters, academic institutes, and disaster management authorities.</p>
          </div>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div
                key={index}
                className="border border-slate-200 rounded-2xl overflow-hidden transition"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  className="w-full text-left p-4.5 sm:p-5 flex items-center justify-between hover:bg-slate-50 transition"
                >
                  <span className="text-xs sm:text-sm font-bold text-slate-800 pr-4">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? 'transform rotate-180 text-blue-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4.5 sm:px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. CALL TO ACTION STRIP */}
      {/* ========================================================================= */}
      <section className="bg-gradient-to-r from-slate-900 via-[#0B2545] to-slate-900 text-white rounded-3xl p-8 sm:p-10 text-center space-y-5 shadow-xl border border-slate-800">
        <div className="max-w-2xl mx-auto space-y-2">
          <h3 className="text-xl sm:text-2xl font-black">
            Access the National Capacity Ecosystem
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Whether you are an operational meteorological forecaster developing your capability profile or an accredited academic institute seeking tenant onboarding, connect today.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/login"
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition"
          >
            Sign In to Official Workspace
          </Link>
          <Link
            to="/trainee/catalogue"
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/30 backdrop-blur-sm transition"
          >
            Explore Curriculum Catalogue
          </Link>
          <Link
            to="/verify"
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-sky-300 font-semibold text-xs rounded-xl border border-sky-400/40 transition flex items-center space-x-1.5"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Public Certificate Verification</span>
          </Link>
        </div>
      </section>

      </div>

      {/* ========================================================================= */}
      {/* 11. OFFICIAL GOVERNMENT PORTAL FOOTER (FULL WIDTH EDGE-TO-EDGE) */}
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

export default AboutFramework;
