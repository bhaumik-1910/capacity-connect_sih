import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  X,
  User,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Clock,
  Award,
  Calendar,
  Mail,
  Phone,
  Building,
  Globe,
  TrendingUp,
  Search,
  ExternalLink,
  ShieldCheck,
  FileCheck,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Printer
} from 'lucide-react';

const TraineeProgressModal = ({ traineeId, traineeName, isOpen, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'in_progress' | 'completed' | 'not_started'
  const [searchCourse, setSearchCourse] = useState('');

  useEffect(() => {
    if (!isOpen || !traineeId) return;

    const fetchProgress = async () => {
      setLoading(true);
      try {
        const res = await api.getUserLearningProgress(traineeId);
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error('Failed to load user progress:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [isOpen, traineeId]);

  if (!isOpen) return null;

  const user = data?.user || {};
  const summary = data?.summary || {
    totalEnrolled: 0,
    completedCount: 0,
    inProgressCount: 0,
    notStartedCount: 0,
    avgProgress: 0,
    avgScore: 0,
    certificatesEarned: 0
  };
  const enrollments = data?.enrollments || [];
  const certificates = data?.certificates || [];
  const isIndependent = data?.isIndependentLearner || false;

  const filteredEnrollments = enrollments.filter((item) => {
    const c = item.courseId || {};
    const titleMatch = (c.title || '').toLowerCase().includes(searchCourse.toLowerCase()) ||
      (c.code || '').toLowerCase().includes(searchCourse.toLowerCase()) ||
      (c.category || '').toLowerCase().includes(searchCourse.toLowerCase());

    if (!titleMatch) return false;

    if (activeFilter === 'completed') return item.status === 'completed' || item.progressPercentage >= 100;
    if (activeFilter === 'in_progress') return (item.status === 'in_progress' || (item.status === 'enrolled' && item.progressPercentage > 0)) && item.progressPercentage < 100;
    if (activeFilter === 'not_started') return item.status === 'enrolled' && (!item.progressPercentage || item.progressPercentage === 0);
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-slate-50 border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto">
        
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-6 sm:p-8 flex-shrink-0 relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-8 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-lg flex-shrink-0">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center font-black text-2xl text-cyan-300">
                  {user.name ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'U'}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    {user.name || traineeName || 'Learner Profile'}
                  </h2>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    user.approvalStatus === 'approved'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    {user.approvalStatus?.toUpperCase() || 'ACTIVE'}
                  </span>
                  <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded-full">
                    {user.role?.toUpperCase() || 'TRAINEE'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
                  <span className="flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{user.email}</span>
                  </span>
                  {user.mobile && (
                    <span className="flex items-center space-x-1.5">
                      <Phone className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{user.mobile}</span>
                    </span>
                  )}
                  <span className="flex items-center space-x-1.5 text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
                  </span>
                </div>

                {/* Institute vs Independent Learner Tag */}
                <div className="pt-1">
                  {isIndependent ? (
                    <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border border-emerald-500/30 rounded-xl text-emerald-300 font-semibold text-xs shadow-inner">
                      <Globe className="w-3.5 h-3.5 text-emerald-400" />
                      <span>🌐 Direct Open Learner — Independent Public Registration (No Institute Affiliated)</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-slate-800/80 border border-slate-700/80 rounded-xl text-slate-300 font-semibold text-xs">
                      <Building className="w-3.5 h-3.5 text-indigo-400" />
                      <span>🏛️ Affiliated Institute: <strong className="text-white ml-1">{user.organizationName || user.organizationId?.displayName || 'Registered Institute'}</strong></span>
                      {user.department && <span className="text-slate-400 ml-1">({user.department})</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => window.print()}
                title="Print Learner Transcript"
                className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition cursor-pointer hidden sm:flex items-center space-x-1 text-xs"
              >
                <Printer className="w-4 h-4" />
                <span className="text-[11px] font-medium">Print Transcript</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <div className="text-slate-600 font-bold text-sm">Loading comprehensive learning dossier...</div>
            </div>
          ) : (
            <>
              {/* SUMMARY KPI CARDS */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                    <span>Enrolled Courses</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900">{summary.totalEnrolled}</div>
                  <div className="text-[10px] text-slate-400 font-medium">All registered courses</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Completed</span>
                  </div>
                  <div className="text-2xl font-black text-emerald-600">{summary.completedCount}</div>
                  <div className="text-[10px] text-slate-400 font-medium">100% syllabus cleared</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>In Progress</span>
                  </div>
                  <div className="text-2xl font-black text-amber-600">{summary.inProgressCount}</div>
                  <div className="text-[10px] text-slate-400 font-medium">Active ongoing study</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Avg. Progress</span>
                  </div>
                  <div className="text-2xl font-black text-indigo-600">{summary.avgProgress}%</div>
                  <div className="text-[10px] text-slate-400 font-medium">Across all courses</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1 col-span-2 sm:col-span-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>Certificates</span>
                  </div>
                  <div className="text-2xl font-black text-amber-600">{summary.certificatesEarned}</div>
                  <div className="text-[10px] text-slate-400 font-medium">Verified credentials</div>
                </div>
              </div>

              {/* INDEPENDENT LEARNER NOTICE BANNER */}
              {isIndependent && (
                <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200/80 rounded-2xl p-4 flex items-start space-x-3.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-emerald-950 text-sm">
                      Open Public Citizen / Independent Learner
                    </h4>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      This user is not affiliated with any formal institute or college. They access government capacity-building courses directly via the open national portal, can enroll in any published government program, take assessments, and earn digitally verifiable national certificates.
                    </p>
                  </div>
                </div>
              )}

              {/* FILTER & SEARCH BAR */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center space-x-1.5 bg-slate-200/80 p-1 rounded-xl">
                  <button
                    onClick={() => setActiveFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      activeFilter === 'all'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All Courses ({enrollments.length})
                  </button>
                  <button
                    onClick={() => setActiveFilter('in_progress')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      activeFilter === 'in_progress'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    In Progress ({summary.inProgressCount})
                  </button>
                  <button
                    onClick={() => setActiveFilter('completed')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      activeFilter === 'completed'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Completed ({summary.completedCount})
                  </button>
                  <button
                    onClick={() => setActiveFilter('not_started')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      activeFilter === 'not_started'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Not Started ({summary.notStartedCount})
                  </button>
                </div>

                <div className="relative flex-1 sm:max-w-xs">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchCourse}
                    onChange={(e) => setSearchCourse(e.target.value)}
                    placeholder="Search enrolled courses..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                  />
                </div>
              </div>

              {/* ENROLLED COURSES LIST */}
              {filteredEnrollments.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-xs space-y-2">
                  <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
                  <div className="font-bold text-slate-800 text-sm">
                    {enrollments.length === 0 ? 'No Enrolled Courses Found' : 'No Matching Courses'}
                  </div>
                  <div className="text-slate-500 max-w-sm mx-auto">
                    {enrollments.length === 0
                      ? 'This user has registered but has not yet enrolled in any government or institutional course.'
                      : 'No enrolled courses match the current filter or search criteria.'}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEnrollments.map((enr) => {
                    const course = enr.courseId || {};
                    const totalModules = (course.modules || []).length;
                    const completedItems = (enr.completedModuleItems || []).length;
                    const progress = enr.progressPercentage || 0;
                    const cert = enr.certificateId;

                    return (
                      <div
                        key={enr._id}
                        className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                                {course.code || 'COURSE'}
                              </span>
                              {course.isGovernmentCourse && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                                  🏛️ Government Official Course
                                </span>
                              )}
                              <span className="text-[10px] font-semibold text-slate-500">
                                {course.category || 'General'} • {course.level || 'Intermediate'}
                              </span>
                            </div>

                            <h3 className="font-bold text-slate-900 text-base leading-snug">
                              {course.title || 'Untitled Course'}
                            </h3>

                            <div className="flex flex-wrap items-center gap-x-4 text-[11px] text-slate-500 pt-0.5">
                              <span>Enrolled: <strong>{new Date(enr.enrolledAt || enr.createdAt).toLocaleDateString()}</strong></span>
                              {enr.completedAt && (
                                <span className="text-emerald-700 font-semibold">
                                  Completed: {new Date(enr.completedAt).toLocaleDateString()}
                                </span>
                              )}
                              <span>Last Active: <strong>{new Date(enr.lastAccessedAt || enr.updatedAt).toLocaleDateString()}</strong></span>
                            </div>
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 flex-shrink-0">
                            <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                              enr.status === 'completed' || progress >= 100
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : progress > 0
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}>
                              {enr.status === 'completed' || progress >= 100 ? 'COMPLETED' : progress > 0 ? 'IN PROGRESS' : 'ENROLLED'}
                            </span>

                            {cert && (
                              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md flex items-center space-x-1">
                                <Award className="w-3 h-3 text-amber-500" />
                                <span>Cert: {cert.certificateNumber?.substring(0, 14)}...</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* PROGRESS BAR & SYLLABUS STATS */}
                        <div className="space-y-2 bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                          <div className="flex items-center justify-between text-xs">
                            <div className="font-bold text-slate-700 flex items-center space-x-2">
                              <span>Syllabus Completion</span>
                              <span className="text-[11px] font-normal text-slate-500">
                                ({completedItems} modules/items finished)
                              </span>
                            </div>
                            <div className="font-black text-slate-900 text-sm">
                              {progress}%
                            </div>
                          </div>

                          {/* Linear progress bar */}
                          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                progress >= 100
                                  ? 'bg-emerald-500'
                                  : progress > 50
                                  ? 'bg-blue-600'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                            />
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px] text-slate-600">
                            <div>
                              Assessment:{' '}
                              <strong className={enr.assessmentPassed ? 'text-emerald-700' : 'text-slate-800'}>
                                {enr.assessmentPassed
                                  ? `Passed (${enr.bestAssessmentScore || 85}%)`
                                  : enr.bestAssessmentScore > 0
                                  ? `Attempted (${enr.bestAssessmentScore}%)`
                                  : 'Not Attempted'}
                              </strong>
                            </div>
                            <div>
                              Attendance: <strong>{enr.attendancePercentage || 95}%</strong>
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                              Certificate:{' '}
                              <strong className={cert ? 'text-emerald-700' : 'text-slate-500'}>
                                {cert ? 'Issued & Verified' : progress >= 100 ? 'Eligible to Claim' : 'Incomplete'}
                              </strong>
                            </div>
                          </div>
                        </div>

                        {/* CERTIFICATE DETAILS IF AVAILABLE */}
                        {cert && (
                          <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                            <div className="flex items-center space-x-2.5 text-xs text-emerald-900">
                              <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                              <div>
                                <div className="font-bold">Official Digital Credential Issued</div>
                                <div className="text-[11px] text-emerald-700 font-mono">
                                  ID: {cert.certificateNumber} • Issued on {cert.issuedAt ? new Date(cert.issuedAt).toLocaleDateString() : 'N/A'}
                                </div>
                              </div>
                            </div>
                            <a
                              href={`/verify?number=${cert.certificateNumber}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 shadow-2xs flex-shrink-0"
                            >
                              <span>Verify</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="bg-white border-t border-slate-200 p-4 px-6 sm:px-8 flex items-center justify-between text-xs text-slate-500 flex-shrink-0">
          <div>
            Showing complete learning records for <strong>{user.name || traineeName}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition cursor-pointer"
          >
            Close Dossier
          </button>
        </div>

      </div>
    </div>
  );
};

export default TraineeProgressModal;
