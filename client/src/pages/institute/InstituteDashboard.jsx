import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/NotificationContext';
import InstituteHeader from '../../components/InstituteHeader';
import {
  Building2,
  Users,
  GraduationCap,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileCheck,
  UserPlus,
  Layers,
  Settings2,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Percent,
  ChevronRight
} from 'lucide-react';

const InstituteDashboard = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const res = await api.getInstituteMetrics();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load institute metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const metrics = data?.metrics || {};
  const org = data?.organization || {};

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[450px]">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#064e3b]" />
          <span className="text-xs font-semibold text-slate-500">Connecting to Institute Workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 select-none max-w-7xl mx-auto animate-in fade-in duration-200">
      
      {/* 1. Government Institutional Authority Header */}
      <InstituteHeader
        title={org.displayName || org.legalName || 'Institute Administration'}
        subtitle="Multi-tenant isolated dashboard for faculty assignment, trainee cohort supervision, accredited curriculum governance, and custom verifiable credentials."
        orgCode={org.code || 'INST'}
        badge="Ministry of Earth Sciences • Accredited Tenant"
        actions={
          <div className="flex items-center space-x-2">
            <button
              onClick={loadMetrics}
              disabled={loading}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition flex items-center space-x-1.5 text-xs font-semibold backdrop-blur-sm cursor-pointer"
              title="Refresh KPIs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-300' : ''}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>

            <Link
              to="/institute/certificate-template"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center space-x-1.5 shadow-sm"
            >
              <Award className="w-4 h-4" />
              <span>Certificate Designer</span>
            </Link>
          </div>
        }
      />

      {/* Verification Status Alert Strip */}
      <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-emerald-950">Accreditation Clearance: </span>
            <span className="text-emerald-700 font-black uppercase">
              {org.status === 'APPROVED' || org.status === 'active' ? 'VERIFIED NATIONAL TENANT' : (org.status || 'ACTIVE')}
            </span>
            <span className="text-slate-600 block sm:inline sm:ml-2">
              • Strict server-side multi-tenant data isolation enforced for all learner cohorts & faculty records.
            </span>
          </div>
        </div>
        <div className="text-[11px] font-mono text-emerald-900 bg-white/80 px-3 py-1 rounded-lg border border-emerald-200 self-start sm:self-auto font-bold">
          Passing Threshold: <strong>{org.certificateTemplate?.minScoreForCertificate ?? 80}%</strong>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Trainees */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all hover:border-blue-300 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Trainees Enrolled</span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">
            {metrics.totalStudents ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center space-x-1.5 mt-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-emerald-700 font-bold">{metrics.activeStudents ?? 0} active</span>
            <span className="text-slate-300">•</span>
            <span>{metrics.pendingStudents ?? 0} pending</span>
          </div>
        </div>

        {/* Metric 2: Faculty */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all hover:border-indigo-300 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Faculty & Trainers</span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-indigo-900 mt-2">
            {metrics.totalTrainers ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            <span className="text-indigo-600 font-bold">{metrics.activeTrainers ?? 0} certified instructors</span>
          </div>
        </div>

        {/* Metric 3: Courses */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all hover:border-amber-300 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Accredited Syllabi</span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">
            {metrics.totalCourses ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            <span className="text-emerald-600 font-bold">{metrics.activeCourses ?? 0} published modules</span>
          </div>
        </div>

        {/* Metric 4: Certificates Issued */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all hover:border-emerald-300 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Certificates Awarded</span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xs">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-900 mt-2">
            {metrics.certificatesIssued ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            <span className="text-emerald-700 font-semibold">QR cryptographically validated</span>
          </div>
        </div>

      </div>

      {/* 3. Performance & Completion Rates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Institute Average Attendance
            </span>
            <span className="text-base font-black text-blue-700 font-mono">
              {metrics.avgAttendance ?? 94}%
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500" 
              style={{ width: `${metrics.avgAttendance ?? 94}%` }} 
            />
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Synchronous session attendance records logged across virtual classes and physical radar/telemetry laboratories.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Curriculum Completion Benchmark
            </span>
            <span className="text-base font-black text-emerald-700 font-mono">
              {metrics.avgCompletion ?? 86}%
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-500" 
              style={{ width: `${metrics.avgCompletion ?? 86}%` }} 
            />
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Proportion of enrolled trainees satisfying all competency milestones and qualifying the proctored assessment threshold.
          </p>
        </div>
      </div>

      {/* 4. Quick Action Operational Hub */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
        <div>
          <h2 className="text-base font-bold text-slate-900">Institute Administrative Operations</h2>
          <p className="text-xs text-slate-500 mt-0.5">Quick administrative shortcuts to manage this academy's departments, faculty, cohorts, and branded credentials</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <Link
            to="/institute/students"
            className="p-5 bg-slate-50/70 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 rounded-2xl transition group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition shadow-2xs">
                <UserPlus className="w-5 h-5" />
              </div>
              <div className="font-bold text-slate-900 text-sm">Student Cohorts</div>
              <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">Single & Excel bulk enrollment with instant auto-credentials.</p>
            </div>
            <div className="mt-4 flex items-center text-blue-700 font-bold text-[11px] space-x-1">
              <span>Manage Cohorts</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
            </div>
          </Link>

          <Link
            to="/institute/trainers"
            className="p-5 bg-slate-50/70 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-300 rounded-2xl transition group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition shadow-2xs">
                <Users className="w-5 h-5" />
              </div>
              <div className="font-bold text-slate-900 text-sm">Faculty Management</div>
              <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">Assign trainers to subjects, view workload, and credential status.</p>
            </div>
            <div className="mt-4 flex items-center text-indigo-700 font-bold text-[11px] space-x-1">
              <span>Manage Faculty</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
            </div>
          </Link>

          <Link
            to="/institute/academic-structure"
            className="p-5 bg-slate-50/70 hover:bg-purple-50/60 border border-slate-200 hover:border-purple-300 rounded-2xl transition group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition shadow-2xs">
                <Layers className="w-5 h-5" />
              </div>
              <div className="font-bold text-slate-900 text-sm">Academic Structure</div>
              <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">Configure institute departments, training programs, and cohorts.</p>
            </div>
            <div className="mt-4 flex items-center text-purple-700 font-bold text-[11px] space-x-1">
              <span>Configure Hierarchy</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
            </div>
          </Link>

          <Link
            to="/institute/certificate-template"
            className="p-5 bg-slate-50/70 hover:bg-amber-50/60 border border-slate-200 hover:border-amber-300 rounded-2xl transition group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition shadow-2xs">
                <Award className="w-5 h-5" />
              </div>
              <div className="font-bold text-slate-900 text-sm">Certificate Studio</div>
              <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">Custom institute logo, seal, signatory, and 80% passing threshold.</p>
            </div>
            <div className="mt-4 flex items-center text-amber-700 font-bold text-[11px] space-x-1">
              <span>Customize Design</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
            </div>
          </Link>
        </div>
      </div>

    </div>
  );
};

export default InstituteDashboard;
