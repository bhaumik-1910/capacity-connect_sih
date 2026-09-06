import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AdminHeader from '../../components/AdminHeader';
import {
  Users,
  Layers,
  Award,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Cpu,
  Sliders,
  History,
  ArrowRight,
  Shield,
  Building2,
  GraduationCap,
  Sparkles,
  ExternalLink,
  ChevronRight,
  UserCheck,
  FileCheck,
  PlusCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await api.getAdminMetrics();
        if (res.success) {
          setMetrics(res.metrics);
        }
      } catch (err) {
        console.error('Error fetching admin metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0B2545]" />
          <span className="text-xs font-semibold text-slate-500">Loading Governance Command Center...</span>
        </div>
      </div>
    );
  }

  // Calculate total enrollments for percentage calculation
  const totalDomainEnrollments = (metrics?.categoryStats || []).reduce((acc, c) => acc + (c.enrollments || 0), 0) || 1;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* MoES Executive Authority Header */}
      <AdminHeader
        title="Central Governance Command Center"
        subtitle="National capacity oversight, curriculum quality moderation, forecaster accreditation, and AI-weighted competency assignments across all IMD Regional Meteorological Centres."
        badge="Ministry of Earth Sciences • Central Governance Cell"
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              to="/admin/course-builder"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5 text-slate-950" />
              <span>+ Create Government Course</span>
            </Link>
            <Link
              to="/admin/government-certificate"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 backdrop-blur-sm transition flex items-center space-x-1.5"
            >
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>Govt Certificate Studio</span>
            </Link>
            <Link
              to="/admin/user-approvals"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 backdrop-blur-sm transition flex items-center space-x-1.5"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Pending Queue ({metrics?.pendingApprovals || 0})</span>
            </Link>
            <Link
              to="/admin/trainer-matching"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 backdrop-blur-sm transition flex items-center space-x-1.5"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-300" />
              <span>Launch AI Matcher</span>
            </Link>
          </div>
        }
      />

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Personnel */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-300 hover:border-blue-300 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Personnel</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{metrics?.totalUsers || 0}</h3>
              <div className="flex items-center space-x-1.5 mt-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[11px] text-amber-700 font-bold">
                  {metrics?.pendingApprovals || 0} pending verification
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* KPI 2: Curriculum Catalogue */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-300 hover:border-emerald-300 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50/50 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Curriculum Syllabi</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{metrics?.totalCourses || 0}</h3>
              <div className="flex items-center space-x-1.5 mt-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[11px] text-emerald-700 font-bold">
                  {metrics?.activePublishedCourses || 0} published courses
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition">
              <Layers className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* KPI 3: Completion Velocity */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-300 hover:border-purple-300 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50/50 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Completion Velocity</p>
              <h3 className="text-3xl font-black text-purple-700 mt-1">{metrics?.completionRate || 0}%</h3>
              <div className="flex items-center space-x-1.5 mt-2">
                <span className="text-[11px] text-slate-500 font-semibold">
                  {metrics?.completedEnrollments || 0} / {metrics?.totalEnrollments || 0} enrolled
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20 group-hover:scale-105 transition">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* KPI 4: Issued Credentials */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-300 hover:border-amber-300 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50/50 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Issued Credentials</p>
              <h3 className="text-3xl font-black text-amber-600 mt-1">{metrics?.certificatesIssued || 0}</h3>
              <div className="flex items-center space-x-1.5 mt-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[11px] text-slate-600 font-semibold">QR cryptographically verified</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition">
              <Award className="w-6 h-6" />
            </div>
          </div>
        </div>

      </div>

      {/* Quick Governance Workflow Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Link
          to="/admin/institutes"
          className="p-4 bg-white hover:bg-blue-50/50 rounded-xl border border-slate-200 hover:border-blue-300 shadow-2xs transition group flex items-center space-x-3.5"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-slate-900 text-xs flex items-center space-x-1">
              <span>Affiliated Institutes</span>
              <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition" />
            </div>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">Directory, faculty & dossiers</p>
          </div>
        </Link>

        <Link
          to="/admin/course-governance"
          className="p-4 bg-white hover:bg-emerald-50/50 rounded-xl border border-slate-200 hover:border-emerald-300 shadow-2xs transition group flex items-center space-x-3.5"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-slate-900 text-xs flex items-center space-x-1">
              <span>Curriculum Moderation</span>
              <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition" />
            </div>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">Publish syllabus & audit reviews</p>
          </div>
        </Link>

        <Link
          to="/admin/competency-framework"
          className="p-4 bg-white hover:bg-purple-50/50 rounded-xl border border-slate-200 hover:border-purple-300 shadow-2xs transition group flex items-center space-x-3.5"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition">
            <Cpu className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-slate-900 text-xs flex items-center space-x-1">
              <span>Competency Matrix</span>
              <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition" />
            </div>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">WMO-1083 taxonomy standards</p>
          </div>
        </Link>

        <Link
          to="/admin/certificates"
          className="p-4 bg-white hover:bg-amber-50/50 rounded-xl border border-slate-200 hover:border-amber-300 shadow-2xs transition group flex items-center space-x-3.5"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition">
            <FileCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-slate-900 text-xs flex items-center space-x-1">
              <span>Credentials Registry</span>
              <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition" />
            </div>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">Audit trail & revocations</p>
          </div>
        </Link>
      </div>

      {/* Two Column Section: Category Distribution & Recent Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              <span>MoES Scientific Domain Distribution</span>
            </h3>
            <span className="text-[11px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-md border border-blue-200/80">
              {(metrics?.categoryStats || []).length} Disciplines
            </span>
          </div>

          <div className="space-y-3">
            {(metrics?.categoryStats || []).length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No domain streams recorded yet.</p>
            ) : (
              (metrics?.categoryStats || []).map((cat, idx) => {
                const percentage = Math.round(((cat.enrollments || 0) / totalDomainEnrollments) * 100);

                return (
                  <div key={idx} className="p-3.5 bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl text-xs space-y-2 transition">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-slate-900 font-semibold">{cat._id}</span>
                      <div className="flex items-center space-x-2 font-mono text-[11px]">
                        <span className="text-blue-700 font-bold">{cat.count} Courses</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-600">{cat.enrollments || 0} Trainees</span>
                      </div>
                    </div>
                    {/* Visual Capacity Meter Bar */}
                    <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percentage, 8)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Real-time Audit Trail Ticker */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-1.5">
                <History className="w-4 h-4 text-amber-600" />
                <span>Live Governance Audit Trail</span>
              </h3>
            </div>
            <Link
              to="/admin/audit-logs"
              className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center space-x-1"
            >
              <span>View All Logs</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {(metrics?.recentAuditLogs || []).length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No recent audit records logged.</p>
            ) : (
              (metrics?.recentAuditLogs || []).slice(0, 5).map((log) => (
                <div key={log._id} className="p-3 bg-slate-50/80 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 text-xs space-y-1.5 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-900 font-mono text-[11px] font-bold">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Actor: <strong className="text-slate-800">{log.actorName}</strong> ({log.actorRole})</span>
                    <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded-md border text-slate-600 shadow-2xs font-semibold">
                      {log.module}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
