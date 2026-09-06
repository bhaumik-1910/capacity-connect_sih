import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/NotificationContext';
import TraineeHeader from '../../components/TraineeHeader';
import {
  BookOpen,
  Award,
  Clock,
  Compass,
  CheckCircle,
  PlayCircle,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Bell,
  Sparkles,
  CheckCircle2,
  XCircle,
  Layers,
  Calendar,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';

const TraineeDashboard = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [instituteCourses, setInstituteCourses] = useState([]);
  const [instituteName, setInstituteName] = useState('');
  const [enrollingId, setEnrollingId] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [enrRes, annRes, certRes, attRes] = await Promise.all([
          api.getMyEnrollments(),
          api.getAnnouncements(),
          api.getMyCertificates(),
          api.getMyAttempts()
        ]);
        if (enrRes.success) {
          setEnrollments(enrRes.enrollments || []);
          setInstituteCourses(enrRes.instituteCourses || []);
          if (enrRes.instituteName) setInstituteName(enrRes.instituteName);
        }
        if (annRes.success) setAnnouncements(annRes.announcements || []);
        if (certRes.success) setCertificates(certRes.certificates || []);
        if (attRes.success) setRecentAttempts(attRes.attempts || []);
      } catch (err) {
        console.error('Error fetching trainee dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleEnrollInstituteCourse = async (courseId) => {
    setEnrollingId(courseId);
    try {
      const res = await api.enrollCourse(courseId);
      if (res.success) {
        toast.success('Successfully enrolled in institute course!');
        navigate(`/trainee/course/${courseId}`);
      }
    } catch (err) {
      toast.error(err.message, 'Enrollment Failed');
    } finally {
      setEnrollingId(null);
    }
  };

  const inProgressCourses = enrollments.filter(e => e.status !== 'completed');
  const completedCourses = enrollments.filter(e => e.status === 'completed');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-sky-200 border-t-sky-600 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Compass className="w-5 h-5 text-sky-600 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Executive Trainee Header */}
      <TraineeHeader
        title={`Welcome back, ${user?.name || 'Cadet Forecaster'}!`}
        subtitle="Strengthen operational forecasting capabilities, track verified training pathways, and prepare for NDEAR-aligned national certifications."
        badge="Cadet & Operational Forecaster Portal"
        department={user?.department || 'Atmospheric Sciences'}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/trainee/catalogue"
              className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-1.5"
            >
              <BookOpen className="w-4 h-4" />
              <span>Browse Catalogue</span>
            </Link>
            <Link
              to="/trainee/competency-passport"
              className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white font-semibold text-xs rounded-xl border border-white/25 backdrop-blur-sm transition flex items-center space-x-1.5"
            >
              <Compass className="w-4 h-4 text-sky-300" />
              <span>Skill-Gap Radar</span>
            </Link>
          </div>
        }
      />

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Enrollments */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-blue-600" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Enrolled Courses</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{enrollments.length}</h3>
              <p className="text-[11px] text-sky-600 font-semibold mt-1 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping inline-block" />
                <span>{inProgressCourses.length} actively ongoing</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 group-hover:scale-105 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Completed Courses */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Completed Courses</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">{completedCourses.length}</h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">100% syllabus verified</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Verified Credentials */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Official Credentials</p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">{certificates.length}</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1">QR verifiable certificates</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 group-hover:scale-105 transition-transform">
              <Award className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Verified Competencies */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Passport Competencies</p>
              <h3 className="text-2xl font-black text-indigo-700 mt-1">{user?.competencies?.length || 0}</h3>
              <p className="text-[11px] text-indigo-600 font-semibold mt-1">In National Registry</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Active Training Programs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <PlayCircle className="w-5 h-5 text-sky-600" />
              <span>Active Training Programs</span>
            </h2>
            <Link to="/trainee/my-courses" className="text-xs text-sky-600 hover:text-sky-700 font-bold hover:underline flex items-center space-x-1">
              <span>View All ({enrollments.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {enrollments.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-xs space-y-3">
              <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mx-auto">
                <BookOpen className="w-7 h-7 text-sky-500" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">No Active Enrollments Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {instituteCourses.length > 0
                  ? `Your institute (${instituteName}) has ${instituteCourses.length} training program(s) ready for you below. Click Enroll to start learning immediately!`
                  : 'Enroll in capacity building modules to commence your operational training and certification pathway.'}
              </p>
              <div className="flex items-center justify-center gap-3 pt-1">
                <Link
                  to="/trainee/catalogue"
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Explore Course Catalogue</span>
                </Link>
                {instituteCourses.length > 0 && (
                  <Link
                    to="/trainee/my-courses"
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>View Institute Courses ({instituteCourses.length})</span>
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              {enrollments.map((enr) => {
                const course = enr.courseId;
                if (!course) return null;
                const isCompleted = enr.status === 'completed';

                return (
                  <div
                    key={enr._id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-sky-300 hover:shadow-md transition-all group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold uppercase bg-sky-50 text-sky-700 px-2.5 py-0.5 rounded-md border border-sky-200">
                            {course.category}
                          </span>
                          <span className="text-xs font-mono text-slate-500 font-semibold">
                            {course.code}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-base group-hover:text-sky-700 transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-xs text-slate-500">
                          Trainer: <span className="font-medium text-slate-700">{course.trainerName}</span> • Duration: {course.durationWeeks || 4} Weeks ({course.durationHours || 40} hrs)
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                        {isCompleted ? (
                          <Link
                            to={`/trainee/course/${course._id}`}
                            className="px-3.5 py-2 bg-emerald-50 text-emerald-700 border border-emerald-300 text-xs font-bold rounded-xl hover:bg-emerald-100 flex items-center space-x-1.5 transition"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Review Syllabus</span>
                          </Link>
                        ) : (
                          <Link
                            to={`/trainee/course/${course._id}`}
                            className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1.5 transition"
                          >
                            <span>Resume Learning</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                        <Link
                          to={`/trainee/assessment/${course._id}`}
                          className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1.5 transition"
                          title="Take Course Online Examination"
                        >
                          <Award className="w-3.5 h-3.5 text-slate-950" />
                          <span>Take Exam</span>
                        </Link>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-500 font-medium">Curriculum Completion</span>
                        <span className={`font-bold ${isCompleted ? 'text-emerald-600' : 'text-sky-600'}`}>
                          {enr.progressPercentage}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-sky-500 to-blue-600'
                          }`}
                          style={{ width: `${Math.min(enr.progressPercentage || 0, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Dedicated Institute Courses Section */}
          {instituteCourses.length > 0 && (
            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <GraduationCap className="w-5 h-5 text-emerald-600" />
                  <span>Offered by {instituteName || 'My Institute'}</span>
                  <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                    {instituteCourses.length} Programs
                  </span>
                </h2>
                <Link
                  to="/trainee/my-courses"
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-bold hover:underline flex items-center space-x-1"
                >
                  <span>Institute Hub</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {instituteCourses.map((c) => (
                  <div
                    key={c._id}
                    className="bg-white rounded-2xl p-5 border border-emerald-100 ring-1 ring-emerald-50 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                          {c.code}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {c.durationWeeks || 4} Weeks
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition">
                        {c.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {c.description}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Instructor: <span className="font-semibold text-slate-600">{c.trainerName}</span>
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                      {c.isEnrolled ? (
                        <Link
                          to={`/trainee/course/${c._id}`}
                          className="w-full py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold hover:bg-emerald-100 flex items-center justify-center space-x-1.5 transition"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Enrolled • Continue</span>
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleEnrollInstituteCourse(c._id)}
                          disabled={enrollingId === c._id}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center space-x-1.5 transition disabled:opacity-50 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{enrollingId === c._id ? 'Enrolling...' : '⚡ Enroll Now'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Announcements & Recent Attempts */}
        <div className="space-y-6">
          {/* Announcements Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Bell className="w-4 h-4 text-amber-500" />
                <span>Department Circulars</span>
              </h3>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>

            {announcements.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                No active announcements at this time.
              </div>
            ) : (
              <div className="space-y-2.5">
                {announcements.slice(0, 3).map((ann, i) => (
                  <div key={i} className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 hover:border-slate-300 transition">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                      <span className="text-sky-700">{ann.category || 'Notification'}</span>
                      <span>{ann.date || 'Recent'}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 mt-1">{ann.title}</p>
                    {ann.message && (
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{ann.message}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Exam Attempts Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Award className="w-4 h-4 text-indigo-600" />
                <span>Recent Exam Attempts</span>
              </h3>
              <Link to="/trainee/my-courses" className="text-[11px] font-bold text-sky-600 hover:underline">
                History
              </Link>
            </div>

            {recentAttempts.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                No exam attempts logged yet. Complete course modules to qualify for online examination.
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentAttempts.slice(0, 3).map((att) => (
                  <div
                    key={att._id}
                    className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {att.courseId?.title || 'Certification Exam'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Score: <span className="font-bold text-slate-700">{att.score || 0}/{att.totalQuestions || 0}</span> ({att.percentage || 0}%)
                      </p>
                    </div>
                    <div>
                      {att.passed ? (
                        <span className="inline-flex items-center space-x-1 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Passed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 bg-rose-100 text-rose-800 px-2 py-0.5 rounded text-[10px] font-bold">
                          <XCircle className="w-3 h-3" />
                          <span>Failed</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TraineeDashboard;
