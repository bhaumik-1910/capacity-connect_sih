import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  X,
  Users,
  Search,
  CheckCircle,
  Clock,
  Award,
  Download,
  Mail,
  Building,
  GraduationCap,
  Calendar,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import TraineeProgressModal from './TraineeProgressModal';

const CourseEnrollmentsModal = ({ courseId, courseTitle, isOpen, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'completed' | 'in_progress' | 'enrolled'
  const [selectedLearner, setSelectedLearner] = useState(null); // { id, name }

  useEffect(() => {
    if (!isOpen || !courseId) return;

    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await api.getCourseEnrollments(courseId);
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error('Failed to load course enrollments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [isOpen, courseId]);

  if (!isOpen) return null;

  const enrollments = data?.enrollments || [];
  const summary = data?.summary || {
    totalEnrollments: 0,
    completedCount: 0,
    inProgressCount: 0,
    notStartedCount: 0,
    avgProgress: 0
  };

  const filteredEnrollments = enrollments.filter((item) => {
    const q = search.toLowerCase();
    const u = item.user || {};
    const matchesSearch =
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.organizationName || '').toLowerCase().includes(q) ||
      (u.department || '').toLowerCase().includes(q) ||
      (u.designation || '').toLowerCase().includes(q);

    if (statusFilter === 'completed') return matchesSearch && item.status === 'completed';
    if (statusFilter === 'in_progress') return matchesSearch && item.status === 'in_progress';
    if (statusFilter === 'enrolled') return matchesSearch && item.status === 'enrolled';
    return matchesSearch;
  });

  const exportCSV = () => {
    if (!enrollments.length) return;
    const headers = ['Learner Name', 'Email', 'Organization', 'Department', 'Designation', 'Enrolled Date', 'Progress %', 'Status', 'Assessment Score'];
    const rows = enrollments.map(e => [
      `"${e.user?.name || ''}"`,
      `"${e.user?.email || ''}"`,
      `"${e.user?.organizationName || 'Independent'}"`,
      `"${e.user?.department || ''}"`,
      `"${e.user?.designation || ''}"`,
      `"${e.enrolledAt ? new Date(e.enrolledAt).toLocaleDateString() : ''}"`,
      `"${e.progressPercentage || 0}%"`,
      `"${e.status || ''}"`,
      `"${e.bestAssessmentScore ? e.bestAssessmentScore + '%' : 'N/A'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${(courseTitle || 'course').replace(/\s+/g, '_')}_enrollments.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-[#0B2545] text-white flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-mono">
                {data?.course?.code || 'COURSE'}
              </span>
              <span className="text-[11px] text-slate-300">
                Author: {data?.course?.trainerName || 'Government Administrator'}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold truncate max-w-xl">
              {courseTitle || data?.course?.title || 'Course Enrollment & Progress Registry'}
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={exportCSV}
              disabled={enrollments.length === 0}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 border border-white/20 disabled:opacity-40 cursor-pointer"
              title="Download Learner Progress Report as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Real-time Summary KPI Cards */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center justify-between">
              <span>Total Enrolled</span>
              <Users className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="text-xl font-black text-slate-900 mt-1">
              {summary.totalEnrollments}
              <span className="text-[11px] font-normal text-slate-500 ml-1">Learners</span>
            </div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center justify-between">
              <span>Active In Progress</span>
              <Clock className="w-3.5 h-3.5 text-sky-600" />
            </div>
            <div className="text-xl font-black text-sky-700 mt-1">
              {summary.inProgressCount}
              <span className="text-[11px] font-normal text-slate-500 ml-1">Learners</span>
            </div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center justify-between">
              <span>Completed / Certified</span>
              <Award className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-xl font-black text-emerald-700 mt-1">
              {summary.completedCount}
              <span className="text-[11px] font-normal text-slate-500 ml-1">Graduates</span>
            </div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center justify-between">
              <span>Cohort Avg Progress</span>
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <div className="text-xl font-black text-indigo-700 mt-1">
              {summary.avgProgress}%
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by learner name, email, institute..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 transition"
            />
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold w-full sm:w-auto justify-between sm:justify-start">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({enrollments.length})
            </button>
            <button
              onClick={() => setStatusFilter('in_progress')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                statusFilter === 'in_progress' ? 'bg-sky-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              In Progress ({summary.inProgressCount})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                statusFilter === 'completed' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Completed ({summary.completedCount})
            </button>
            <button
              onClick={() => setStatusFilter('enrolled')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                statusFilter === 'enrolled' ? 'bg-amber-500 text-slate-950 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Not Started ({summary.notStartedCount})
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] space-y-3">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-slate-500 font-semibold">Loading enrolled trainees & progress records...</span>
            </div>
          ) : filteredEnrollments.length === 0 ? (
            <div className="text-center py-16 space-y-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="w-12 h-12 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                {search ? 'No enrolled trainees match your search' : 'No trainees have enrolled in this course yet'}
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {search
                  ? 'Try searching with different keywords like learner name or email address.'
                  : 'Once trainees enroll from the national catalogue, their live progress and scores will automatically appear here.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredEnrollments.map((enr) => {
                const u = enr.user || {};
                const isCompleted = enr.status === 'completed' || enr.progressPercentage >= 100;
                const isIndependent = !u.organizationName || u.organizationName.toLowerCase().includes('independent') || u.organizationName.toLowerCase().includes('public');
                const progressPct = Math.min(100, Math.max(0, enr.progressPercentage || 0));

                return (
                  <div
                    key={enr.id}
                    className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:border-blue-300 hover:shadow-xs transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
                  >
                    {/* Trainee Identity */}
                    <div className="flex items-start space-x-3 min-w-0 flex-1">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white flex-shrink-0 shadow-2xs ${
                        isCompleted ? 'bg-emerald-600' : 'bg-gradient-to-tr from-blue-700 to-indigo-600'
                      }`}>
                        {(u.name || 'T').charAt(0).toUpperCase()}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-slate-900 text-sm">{u.name || 'Anonymous Learner'}</h4>
                          <span className={`text-[9px] font-bold px-2 py-0.2 rounded-full border ${
                            isIndependent
                              ? 'bg-sky-50 text-sky-800 border-sky-200'
                              : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                          }`}>
                            {isIndependent ? '🌐 Open / Independent' : '🏛️ Institute Trainee'}
                          </span>
                        </div>

                        <div className="flex items-center space-x-3 text-slate-500 text-[11px]">
                          <a
                            href={`mailto:${u.email}`}
                            className="flex items-center space-x-1 hover:text-blue-600 transition"
                          >
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{u.email}</span>
                          </a>

                          {u.mobile && (
                            <span className="text-slate-400">• {u.mobile}</span>
                          )}
                        </div>

                        <div className="text-[10px] text-slate-400">
                          {u.organizationName || 'Independent Public Learner'} {u.department ? `• ${u.department}` : ''}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar & Details */}
                    <div className="flex-1 w-full md:max-w-xs space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-700">Course Syllabus Progress</span>
                        <span className={`font-mono font-bold ${
                          isCompleted ? 'text-emerald-700' : 'text-blue-700'
                        }`}>
                          {progressPct}% ({enr.completedItemsCount || 0} Lessons)
                        </span>
                      </div>

                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCompleted
                              ? 'bg-emerald-500'
                              : progressPct > 40
                              ? 'bg-blue-600'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>Enrolled: {enr.enrolledAt ? new Date(enr.enrolledAt).toLocaleDateString() : 'N/A'}</span>
                        <span>Active: {enr.lastAccessedAt ? new Date(enr.lastAccessedAt).toLocaleDateString() : 'Recent'}</span>
                      </div>
                    </div>

                    {/* Status & Assessment Grade */}
                    <div className="flex items-center space-x-3 flex-shrink-0 self-end md:self-center">
                      <div className="text-right space-y-0.5">
                        <span className={`inline-flex items-center space-x-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                          isCompleted
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : enr.status === 'in_progress'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}>
                          {isCompleted ? <CheckCircle className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-blue-600" />}
                          <span>{isCompleted ? 'Completed' : (enr.status === 'in_progress' ? 'In Progress' : 'Enrolled')}</span>
                        </span>

                        {enr.bestAssessmentScore > 0 && (
                          <div className="text-[10px] text-slate-600 font-mono">
                            Quiz: <strong className="text-slate-900">{enr.bestAssessmentScore}%</strong>
                          </div>
                        )}
                      </div>

                      {enr.certificate?.certificateNumber && (
                        <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-mono font-bold flex items-center space-x-1" title="Certificate Issued">
                          <Award className="w-3.5 h-3.5 text-amber-600" />
                          <span>#{enr.certificate.certificateNumber.slice(-6)}</span>
                        </div>
                      )}

                      {(u._id || u.id) && (
                        <button
                          type="button"
                          onClick={() => setSelectedLearner({ id: u._id || u.id, name: u.name })}
                          title="View all courses and overall learning progress for this student"
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[10px] font-bold transition flex items-center space-x-1 cursor-pointer flex-shrink-0"
                        >
                          <GraduationCap className="w-3.5 h-3.5" />
                          <span>Learner Dossier</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Displaying {filteredEnrollments.length} of {enrollments.length} enrolled trainees</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Trainee Progress Dossier Modal */}
      <TraineeProgressModal
        traineeId={selectedLearner?.id}
        traineeName={selectedLearner?.name}
        isOpen={!!selectedLearner}
        onClose={() => setSelectedLearner(null)}
      />
    </div>
  );
};

export default CourseEnrollmentsModal;
