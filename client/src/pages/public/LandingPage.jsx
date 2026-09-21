import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../services/api';
import {
  ArrowRight,
  Search,
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  Award,
  CheckCircle2,
  Calendar,
  FileCheck,
  Shield,
  ShieldCheck,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Button, StatCard, Card, Badge } from '../../components/design-system';

/**
 * Government Minimalism Landing Page (Section 22)
 * Ministry of Earth Sciences (MoES) | India Meteorological Department (IMD)
 */
const LandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [certQuery, setCertQuery] = useState('');
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [publicStats, setPublicStats] = useState(null);

  // Smooth scroll to targeted section when navigating with hash (e.g. /#courses, /#about)
  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace('#', '');
      const timer = setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [location.hash]);

  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        setLoadingCourses(true);
        const [courseRes, statsRes] = await Promise.allSettled([
          api.getCourses(),
          api.getPublicStats ? api.getPublicStats() : Promise.resolve({ success: false })
        ]);

        if (courseRes.status === 'fulfilled' && courseRes.value?.courses) {
          setCourses(courseRes.value.courses.slice(0, 3));
        }

        if (statsRes.status === 'fulfilled' && statsRes.value?.stats) {
          setPublicStats(statsRes.value.stats);
        }
      } catch (err) {
        console.error('Failed to load landing page dynamic data:', err);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchLandingData();
  }, []);

  // 100% Dynamic Platform statistics from MongoDB
  const stats = [
    { title: 'Affiliated Institutes', value: String(publicStats?.totalInstitutes ?? 0), subtitle: 'Accredited Centers', icon: Building2 },
    { title: 'Certified Trainers', value: String(publicStats?.totalTrainers ?? 0), subtitle: 'Active Faculty', icon: Users },
    { title: 'Enrolled Trainees', value: String(publicStats?.totalTrainees ?? 0), subtitle: 'Forecasters & Students', icon: GraduationCap },
    { title: 'Active Courses', value: String(publicStats?.totalCourses ?? courses.length), subtitle: 'WMO-1083 Standard', icon: BookOpen },
    { title: 'Certificates Issued', value: String(publicStats?.certificatesIssued ?? 0), subtitle: 'QR-Verifiable Credentials', icon: Award },
  ];

  // Workflow steps: Institute -> Trainer -> Course -> Student -> Assessment -> Certificate
  const workflowSteps = [
    { step: '01', title: 'Institute', desc: 'Accredited university or research center registers on the national portal.' },
    { step: '02', title: 'Trainer', desc: 'Subject matter expert or faculty assigned to curriculum departments.' },
    { step: '03', title: 'Course', desc: 'Competency-aligned learning modules, multimedia, and session resources published.' },
    { step: '04', title: 'Student', desc: 'Learners enrolled through bulk onboarding or institutional batch assignment.' },
    { step: '05', title: 'Assessment', desc: 'Rigorous 80% passing standard exams and skill gap diagnostic evaluations.' },
    { step: '06', title: 'Certificate', desc: 'Tamper-evident, cryptographically signed QR certificate issued.' },
  ];

  const announcements = [
    {
      date: '20 Sep 2026',
      tag: 'Circular',
      title: 'Mandatory Radar Meteorology Refreshers for Monsoon Forecasters',
      desc: 'All regional meteorological centers to complete Doppler Radar competencies by Q4.'
    },
    {
      date: '15 Sep 2026',
      tag: 'Framework',
      title: 'Release of Revised WMO-1083 Competency Mapping Module',
      desc: 'Standardized curriculum framework now active across affiliated academic universities.'
    },
    {
      date: '02 Sep 2026',
      tag: 'Accreditation',
      title: 'Institutional Onboarding Window Open for Central Universities',
      desc: 'New institutions may submit accreditation documentation for the upcoming academic cycle.'
    },
  ];

  const handleVerifySubmit = (e) => {
    e.preventDefault();
    if (certQuery.trim()) {
      navigate(`/verify/${encodeURIComponent(certQuery.trim())}`);
    } else {
      navigate('/verify');
    }
  };

  return (
    <div className="w-full bg-[#F7F8FA] text-[#17202A]">

      {/* 1. HERO SECTION (Section 22 - Minimalism + Government Digital Product) */}
      <section className="border-b border-[#E5E7EB] bg-white py-12 sm:py-16 lg:py-20 relative overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* LEFT COLUMN: Authority, Value Proposition & Actions */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Government Authority Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[4px] bg-[#EAF2F8] border border-[#D0E1F0] text-xs font-semibold text-[#1F4E79]">
                <svg className="w-4 h-2.5 rounded-[1px] shadow-xs flex-shrink-0" viewBox="0 0 900 600">
                  <rect width="900" height="200" fill="#FF9933" />
                  <rect y="200" width="900" height="200" fill="#FFFFFF" />
                  <rect y="400" width="900" height="200" fill="#138808" />
                  <circle cx="450" cy="300" r="80" fill="none" stroke="#000080" strokeWidth="12" />
                  <circle cx="450" cy="300" r="16" fill="#000080" />
                </svg>
                <span>भारत सरकार · Ministry of Earth Sciences (MoES) · IMD</span>
              </div>

              {/* Main Headline (Section 22) */}
              <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-tight text-[#17202A] leading-[1.18]">
                Smart Learning.<br />
                <span className="text-[#1F4E79]">Better Competencies.</span><br />
                Connected Institutions.
              </h1>

              {/* Institutional Description */}
              <p className="text-sm sm:text-base text-[#5F6B76] leading-relaxed max-w-2xl">
                CAPACITY CONNECT is the centralized educational and competency governance platform for the India Meteorological Department and partner research centers. Standardized meteorological curricula, mandatory 80% passing assessments, and cryptographically verifiable credentials.
              </p>

              {/* Call-to-Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  size="lg"
                  variant="primary"
                  onClick={() => navigate('/login')}
                  iconRight={ArrowRight}
                >
                  Explore Courses
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => navigate('/login')}
                >
                  Sign In to Workspace
                </Button>
                <Button
                  size="lg"
                  variant="tertiary"
                  onClick={() => navigate('/verify')}
                  icon={FileCheck}
                >
                  Verify Certificate
                </Button>
              </div>

              {/* Government Trust & Compliance Bar */}
              <div className="pt-6 border-t border-[#E5E7EB] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#5F6B76]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1F7A4D] flex-shrink-0" />
                  <span>WMO-1083 Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1F7A4D] flex-shrink-0" />
                  <span>80% Mastery Standard</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1F7A4D] flex-shrink-0" />
                  <span>Tamper-Proof QR Ledger</span>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: National Institutional Credential & Registry Console */}
            <div className="lg:col-span-5">
              <div className="bg-[#F8FAFC] rounded-[8px] border border-[#E5E7EB] p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] space-y-4">
                
                {/* Console Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#1F7A4D] animate-pulse" />
                    <span className="font-semibold text-[#17202A]">Central Registry Active</span>
                  </div>
                  <span className="font-mono text-[11px] text-[#5F6B76]">TLS 1.3 256-Bit</span>
                </div>

                {/* Instant Certificate Lookup in Hero */}
                <div className="p-3.5 bg-white rounded-[6px] border border-[#E5E7EB] space-y-2">
                  <div className="text-xs font-semibold text-[#17202A] flex items-center justify-between">
                    <span>Instant Certificate Verification</span>
                    <Badge variant="primary" size="sm">No Login</Badge>
                  </div>
                  <form onSubmit={handleVerifySubmit} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. CC-IMD-2026-000412"
                      value={certQuery}
                      onChange={(e) => setCertQuery(e.target.value)}
                      className="flex-1 text-xs font-mono px-3 py-2 rounded-[4px] border border-[#E5E7EB] focus:border-[#1F4E79] focus:outline-none"
                    />
                    <Button type="submit" size="sm" variant="primary">
                      Verify
                    </Button>
                  </form>
                </div>

                {/* Dynamic Verified Credential Preview */}
                {publicStats?.sampleCertificate ? (
                  <div className="p-3.5 bg-white rounded-[6px] border border-[#C8E6C9] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-[#1F7A4D]" />
                        <span className="text-xs font-bold text-[#145A32]">Official Verified Credential</span>
                      </div>
                      <Badge variant="approved" size="sm">Verified Authentic</Badge>
                    </div>

                    <div className="space-y-1 text-xs text-[#5F6B76]">
                      <div className="flex justify-between">
                        <span>Recipient:</span>
                        <strong className="text-[#17202A]">{publicStats.sampleCertificate.recipientName} ({publicStats.sampleCertificate.recipientRole})</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Curriculum:</span>
                        <span className="text-[#17202A] font-medium">{publicStats.sampleCertificate.courseTitle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Accredited Grade:</span>
                        <span className="font-mono font-bold text-[#1F7A4D]">{publicStats.sampleCertificate.grade} (PASSED)</span>
                      </div>
                      <div className="flex justify-between font-mono text-[11px] pt-1 border-t border-[#E5E7EB]">
                        <span>Certificate ID:</span>
                        <span className="text-[#1F4E79]">{publicStats.sampleCertificate.certificateNumber}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-white rounded-[6px] border border-[#E5E7EB] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-[#1F4E79]">
                        <ShieldCheck className="w-4 h-4 text-[#1F4E79]" />
                        <span>Central Verification Ledger</span>
                      </div>
                      <Badge variant="neutral" size="sm">Live Node</Badge>
                    </div>
                    <p className="text-[#5F6B76] text-[11px] leading-relaxed">
                      All educational certificates issued under MoES / IMD are cryptographically hashed and instantly verifiable without requiring login.
                    </p>
                  </div>
                )}

                {/* Quick Platform Metrics Chips - 100% Dynamic */}
                <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
                  <div className="p-2 bg-white rounded-[4px] border border-[#E5E7EB]">
                    <div className="font-bold text-[#17202A]">{publicStats?.totalInstitutes ?? 0}</div>
                    <div className="text-[10px] text-[#5F6B76]">Institutes</div>
                  </div>
                  <div className="p-2 bg-white rounded-[4px] border border-[#E5E7EB]">
                    <div className="font-bold text-[#17202A]">{publicStats?.totalTrainers ?? 0}</div>
                    <div className="text-[10px] text-[#5F6B76]">Officers</div>
                  </div>
                  <div className="p-2 bg-white rounded-[4px] border border-[#E5E7EB]">
                    <div className="font-bold text-[#17202A]">{publicStats?.certificatesIssued ?? 0}</div>
                    <div className="text-[10px] text-[#5F6B76]">Certificates</div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. PLATFORM STATISTICS (Section 22) */}
      <section className="py-12 bg-[#F7F8FA] border-b border-[#E5E7EB]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#5F6B76]">
              Platform Statistics
            </h2>
            <p className="text-sm text-[#17202A] font-medium mt-0.5">
              Nationwide educational impact across atmospheric science centers.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {stats.map((item, idx) => (
              <StatCard
                key={idx}
                title={item.title}
                value={item.value}
                subtitle={item.subtitle}
                icon={item.icon}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 3. HOW CAPACITY CONNECT WORKS & INSTITUTES (Section 22) */}
      <section id="about" className="py-16 bg-white border-b border-[#E5E7EB]">
        <div id="institutes" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <h2 className="text-2xl font-bold tracking-tight text-[#17202A]">
              How CAPACITY CONNECT Works
            </h2>
            <p className="text-sm text-[#5F6B76] mt-1.5">
              A transparent, auditable educational lifecycle ensuring high institutional rigor from course design to national credentialing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workflowSteps.map((ws) => (
              <div
                key={ws.step}
                className="p-5 bg-[#F8FAFC] rounded-[8px] border border-[#E5E7EB] flex flex-col justify-between"
              >
                <div>
                  <div className="text-xs font-mono font-bold text-[#1F4E79] mb-2">
                    STEP {ws.step}
                  </div>
                  <h3 className="text-base font-bold text-[#17202A] mb-1.5">
                    {ws.title}
                  </h3>
                  <p className="text-xs text-[#5F6B76] leading-relaxed">
                    {ws.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURED COURSES (Section 22) */}
      <section id="courses" className="py-16 bg-[#F7F8FA] border-b border-[#E5E7EB]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-[#17202A]">
                Featured Courses
              </h2>
              <p className="text-sm text-[#5F6B76] mt-1">
                Curriculum mapped to national meteorological competency requirements.
              </p>
            </div>
            <Link
              to="/login"
              className="text-xs font-semibold text-[#1F4E79] hover:underline flex items-center gap-1"
            >
              <span>View Full Course Catalogue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {courses.map((course) => (
              <Card key={course._id} padding="default" className="flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Badge variant="primary" size="sm">
                      {course.category || 'Meteorology'}
                    </Badge>
                    <span className="text-xs font-mono text-[#87919B]">
                      {course.courseCode || 'CC-101'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#17202A] line-clamp-2 mb-2">
                    {course.title}
                  </h3>

                  {/* Origin Authority / Institute Identity */}
                  <div className="mb-3">
                    {course.isGovernmentCourse || !course.organizationId || course.organizationName?.toLowerCase().includes('imd') || course.organizationName?.toLowerCase().includes('moes') ? (
                      <div className="inline-flex items-center gap-1.5 text-xs text-[#1F4E79] font-bold bg-[#EAF2F8] px-2.5 py-1 rounded-[4px] border border-[#D0E1F0]">
                        <span>🏛️</span>
                        <span>Government of India · MoES / IMD</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 text-xs text-[#145A32] font-semibold bg-[#E8F5E9] px-2.5 py-1 rounded-[4px] border border-[#C8E6C9]">
                        <span>🏛️</span>
                        <span>{course.organizationName || course.instituteName || 'Affiliated Training Institute'}</span>
                      </div>
                    )}
                  </div>

                  {course.trainerName && (
                    <div className="text-[11px] text-[#5F6B76] mb-3 flex items-center gap-1.5">
                      <span>👨‍🏫 Lead Instructor:</span>
                      <span className="font-semibold text-[#17202A]">{course.trainerName}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-[#5F6B76] pt-3 border-t border-[#E5E7EB]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#87919B]" />
                      <span>{course.durationHours || 30} Hours</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-[#87919B]" />
                      <span>{course.level || 'Standard'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => navigate('/login')}
                  >
                    Enroll / Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 5. ANNOUNCEMENTS (Section 22) */}
      <section id="announcements" className="py-16 bg-white border-b border-[#E5E7EB]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-[#17202A]">
              Official Notices & Announcements
            </h2>
            <p className="text-sm text-[#5F6B76] mt-1">
              Directives from the Ministry of Earth Sciences and national training authorities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {announcements.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-[8px] border border-[#E5E7EB] bg-[#F8FAFC] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-[#87919B] mb-2">
                    <span className="font-mono">{item.date}</span>
                    <Badge variant="neutral" size="sm">{item.tag}</Badge>
                  </div>
                  <h3 className="text-sm font-bold text-[#17202A] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#5F6B76] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. PUBLIC CERTIFICATE VERIFICATION (Section 22 & 38) */}
      <section className="py-16 bg-[#F7F8FA] border-b border-[#E5E7EB]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto text-center">
            <div className="w-10 h-10 rounded-[8px] bg-[#EAF2F8] text-[#1F4E79] flex items-center justify-center mx-auto mb-3">
              <FileCheck className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-[#17202A]">
              Public Certificate Verification
            </h2>
            <p className="text-xs sm:text-sm text-[#5F6B76] mt-1.5 mb-6">
              Instant cryptographically verified validation for credentials issued under CAPACITY CONNECT.
            </p>

            <form onSubmit={handleVerifySubmit} className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                placeholder="Enter Certificate Number (e.g., CC-IMD-2026-000123)"
                value={certQuery}
                onChange={(e) => setCertQuery(e.target.value)}
                className="w-full bg-white text-sm text-[#17202A] placeholder-[#87919B] px-3.5 py-2.5 rounded-[6px] border border-[#E5E7EB] focus:border-[#1F4E79] focus:ring-2 focus:ring-[#EAF2F8] focus:outline-none"
              />
              <Button type="submit" variant="primary" size="md" className="w-full sm:w-auto flex-shrink-0">
                Verify
              </Button>
            </form>
            <p className="text-[11px] text-[#87919B] mt-2">
              No authentication required. Verifies signatory, date, and revocation status directly from the central ledger.
            </p>
          </div>
        </div>
      </section>

      {/* 7. INSTITUTIONAL FOOTER (Section 22 & 56) */}
      <footer className="bg-white py-12 text-xs text-[#5F6B76]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#E5E7EB]">
            
            <div className="md:col-span-2">
              <div className="text-sm font-bold text-[#17202A] tracking-tight uppercase mb-2">
                CAPACITY CONNECT
              </div>
              <p className="text-xs text-[#5F6B76] max-w-md leading-relaxed">
                National Smart Education & Learning Management Platform for the Ministry of Earth Sciences (MoES) and India Meteorological Department (IMD). Built for institutional excellence, rigorous training standards, and reliable credential governance.
              </p>
              <div className="mt-3 text-[11px] text-[#87919B]">
                Problem Statement ID: 26075 · Theme: Smart Education
              </div>
            </div>

            <div>
              <div className="font-semibold text-[#17202A] mb-3 uppercase tracking-wider text-[11px]">
                Portals & Access
              </div>
              <ul className="space-y-2">
                <li><Link to="/login" className="hover:text-[#1F4E79]">Officer / Learner Sign In</Link></li>
                <li><Link to="/register-institute" className="hover:text-[#1F4E79]">Register Institute</Link></li>
                <li><Link to="/verify" className="hover:text-[#1F4E79]">Public Certificate Verification</Link></li>
                <li><Link to="/about" className="hover:text-[#1F4E79]">WMO-1083 Framework</Link></li>
              </ul>
            </div>

            <div>
              <div className="font-semibold text-[#17202A] mb-3 uppercase tracking-wider text-[11px]">
                Governance
              </div>
              <p className="text-xs text-[#5F6B76] leading-relaxed">
                India Meteorological Department<br />
                Mausam Bhavan, Lodhi Road<br />
                New Delhi - 110003, India
              </p>
              <div className="mt-3 text-[11px] text-[#87919B]">
                Complies with Government Digital Service Standards
              </div>
            </div>

          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#87919B]">
            <div>
              © 2026 Ministry of Earth Sciences (MoES), Government of India. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <span>Privacy Policy</span>
              <span>·</span>
              <span>Terms of Service</span>
              <span>·</span>
              <span>Hyperlinking Policy</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
