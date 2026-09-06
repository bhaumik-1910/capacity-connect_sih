import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/NotificationContext';
import TraineeHeader from '../../components/TraineeHeader';
import {
  BookOpen,
  CheckCircle,
  Clock,
  ArrowRight,
  Award,
  PlayCircle,
  CheckCircle2,
  XCircle,
  Eye,
  Calendar,
  Search,
  Filter,
  Trophy,
  BarChart3,
  RotateCcw,
  X,
  FileCheck,
  Layers,
  Sparkles,
  Building2,
  PlusCircle,
  Loader2
} from 'lucide-react';

const MyEnrolledCourses = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('courses'); // 'courses' | 'institute-courses' | 'exams'
  const [enrollments, setEnrollments] = useState([]);
  const [instituteCourses, setInstituteCourses] = useState([]);
  const [instituteName, setInstituteName] = useState('');
  const [enrollingCourseId, setEnrollingCourseId] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Submissions search & filter
  const [examSearch, setExamSearch] = useState('');
  const [examFilter, setExamFilter] = useState('all'); // 'all' | 'passed' | 'failed'
  const [selectedAttemptDetail, setSelectedAttemptDetail] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [enrRes, attRes] = await Promise.all([
        api.getMyEnrollments(),
        api.getMyAttempts()
      ]);
      if (enrRes.success) {
        setEnrollments(enrRes.enrollments || []);
        setInstituteCourses(enrRes.instituteCourses || []);
        setInstituteName(enrRes.instituteName || user?.organizationName || 'My Institute');
      }
      if (attRes.success) setAttempts(attRes.attempts || []);
    } catch (err) {
      console.error('Error fetching trainee enrollments or attempts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollInstituteCourse = async (courseId) => {
    setEnrollingCourseId(courseId);
    try {
      const res = await api.enrollCourse(courseId);
      if (res.success) {
        toast.success('Successfully enrolled in course! Starting learning player...');
        navigate(`/trainee/course/${courseId}`);
      } else {
        toast.error(res.message || 'Failed to enroll');
      }
    } catch (err) {
      toast.error(err.message || 'Error enrolling in course');
    } finally {
      setEnrollingCourseId(null);
    }
  };

  const formatSeconds = (sec) => {
    if (!sec && sec !== 0) return 'N/A';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  const filteredAttempts = attempts.filter((att) => {
    const courseTitle = att.courseId?.title || '';
    const examTitle = att.assessmentId?.title || 'Examination';
    const matchesSearch =
      courseTitle.toLowerCase().includes(examSearch.toLowerCase()) ||
      examTitle.toLowerCase().includes(examSearch.toLowerCase());

    if (!matchesSearch) return false;
    if (examFilter === 'passed') return att.passed;
    if (examFilter === 'failed') return !att.passed;
    return true;
  });

  const passedCount = attempts.filter((a) => a.passed).length;
  const bestScore = attempts.length > 0 ? Math.max(...attempts.map((a) => a.percentage || 0)) : 0;
  const avgScore =
    attempts.length > 0
      ? Math.round(attempts.reduce((acc, a) => acc + (a.percentage || 0), 0) / attempts.length)
      : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[420px]">
        <div className="relative">
          <div className="w-10 h-10 rounded-full border-4 border-sky-200 border-t-sky-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Trainee Executive Header */}
      <TraineeHeader
        title="Learning Progress & Examination Records"
        subtitle="Resume your ongoing capacity building modules, track curriculum progress, and review your submitted official examination scorecards."
        badge="Active Learner Hub"
        actions={
          <div className="flex items-center space-x-2">
            <Link
              to="/trainee/catalogue"
              className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5"
            >
              <BookOpen className="w-4 h-4" />
              <span>Explore New Courses</span>
            </Link>
          </div>
        }
      />

      {/* Tabs Navigation */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200/90 shadow-xs flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => setActiveTab('courses')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer ${
            activeTab === 'courses'
              ? 'bg-[#0c4a6e] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className={`w-4 h-4 ${activeTab === 'courses' ? 'text-sky-300' : 'text-slate-400'}`} />
          <span>Active Enrolled Courses</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
            activeTab === 'courses' ? 'bg-sky-900/60 text-sky-200 border border-sky-400/30' : 'bg-slate-200 text-slate-700'
          }`}>
            {enrollments.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('institute-courses')}
          className={`flex-1 min-w-[170px] py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer ${
            activeTab === 'institute-courses'
              ? 'bg-indigo-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className={`w-4 h-4 ${activeTab === 'institute-courses' ? 'text-indigo-200' : 'text-indigo-600'}`} />
          <span className="truncate max-w-[180px]" title={`Courses by ${instituteName || 'My Institute'}`}>
            {instituteName || 'My Institute'} Courses
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
            activeTab === 'institute-courses' ? 'bg-indigo-950/60 text-indigo-100 border border-indigo-400/40' : 'bg-indigo-100 text-indigo-800'
          }`}>
            {instituteCourses.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('exams')}
          className={`flex-1 min-w-[160px] py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer ${
            activeTab === 'exams'
              ? 'bg-[#0c4a6e] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Award className={`w-4 h-4 ${activeTab === 'exams' ? 'text-amber-400' : 'text-slate-400'}`} />
          <span>My Exam Submissions & Results</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              activeTab === 'exams'
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            {attempts.length}
          </span>
        </button>
      </div>

      {/* TAB 1: ENROLLED COURSES */}
      {activeTab === 'courses' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {enrollments.length === 0 ? (
            <div className="space-y-4">
              {instituteCourses.length > 0 && (
                <div className="p-4.5 bg-indigo-50/90 border border-indigo-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-indigo-950 shadow-2xs">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0 shadow-md shadow-indigo-200">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-indigo-900">
                        {instituteName || 'Your Institute'} has published {instituteCourses.length} accredited courses!
                      </div>
                      <div className="text-xs text-indigo-700 mt-0.5">
                        Enroll with 1-click to start learning your institute's assigned curriculum.
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('institute-courses')}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition shrink-0 cursor-pointer flex items-center gap-1.5"
                  >
                    <span>View Institute Courses</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
                <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center mx-auto">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 text-base">No active course enrollments yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Enroll in courses offered by your institute or explore the national capacity building catalogue.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                  {instituteCourses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('institute-courses')}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-indigo-700 transition"
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Browse {instituteName || 'Institute'} Courses</span>
                    </button>
                  )}
                  <Link
                    to="/trainee/catalogue"
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-sky-700 transition"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>National Catalogue</span>
                  </Link>
                </div>
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
                    className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs hover:border-sky-300 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group"
                  >
                    <div className="space-y-2.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold uppercase bg-sky-50 text-sky-800 px-2.5 py-0.5 rounded-md border border-sky-200/60">
                          {course.category}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200 whitespace-nowrap flex-shrink-0">
                          {course.code}
                        </span>
                        {course.organizationName && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-indigo-600" />
                            {course.organizationName}
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isCompleted ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-sky-100 text-sky-800 border border-sky-300'
                          }`}
                        >
                          {isCompleted ? '100% COMPLETED' : 'IN PROGRESS'}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-700 transition leading-snug">
                        {course.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                        <div>
                          Trainer: <span className="font-semibold text-slate-700">{course.trainerName}</span>
                        </div>
                        <div>
                          Level: <span className="font-semibold text-slate-700">{course.level || 'Intermediate'}</span>
                        </div>
                        <div>
                          Duration: <span className="font-semibold text-slate-700">{course.durationWeeks || 4} Weeks</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="pt-2 max-w-md">
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-medium">
                          <span>Syllabus Completion</span>
                          <span className="font-mono font-bold text-slate-700">
                            {enr.progressPercentage || 0}%
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

                    {/* Actions CTA */}
                    <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 flex-shrink-0">
                      <Link
                        to={`/trainee/course/${course._id}`}
                        className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center space-x-1.5 transition cursor-pointer"
                      >
                        <PlayCircle className="w-4 h-4" />
                        <span>Open Learning Player</span>
                      </Link>
                      <Link
                        to={`/trainee/assessment/${course._id}`}
                        className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-xs flex items-center justify-center space-x-1.5 transition cursor-pointer"
                      >
                        <Award className="w-4 h-4 text-slate-950" />
                        <span>Take Assessment Exam</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INSTITUTE COURSES */}
      {activeTab === 'institute-courses' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-indigo-950">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm">
                  {instituteName || 'Your Institute'} Accredited Curriculum
                </h4>
                <p className="text-xs text-indigo-700">
                  Courses authored and assigned by your faculty trainers for your university cohort.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-lg border border-indigo-200 shrink-0">
              {instituteCourses.length} Courses Available
            </span>
          </div>

          {instituteCourses.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">No courses published yet by your institute</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Your faculty trainers have not published courses yet. Browse the national catalogue to find courses.
              </p>
              <Link
                to="/trainee/catalogue"
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-indigo-700 transition"
              >
                <BookOpen className="w-4 h-4" />
                <span>Browse Course Catalogue</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {instituteCourses.map((c) => {
                const enrolled = c.isEnrolled;
                const isEnrolling = enrollingCourseId === c._id;

                return (
                  <div
                    key={c._id}
                    className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between gap-4 group"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase bg-indigo-50 text-indigo-800 px-2.5 py-0.5 rounded-md border border-indigo-200/60">
                          {c.category || 'Curriculum'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                            {c.code}
                          </span>
                          {enrolled ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Enrolled
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 border border-indigo-200">
                              Offered by Institute
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-700 transition leading-snug">
                        {c.title}
                      </h3>
                      {c.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {c.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-2 border-t border-slate-100">
                        <div className="flex items-center space-x-1">
                          <span className="font-semibold text-slate-700">Trainer:</span>
                          <span>{c.trainerName || c.trainerId?.name || 'Faculty'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{c.durationWeeks || 4} Weeks</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Layers className="w-3.5 h-3.5 text-slate-400" />
                          <span>{c.modules?.length || 0} Modules</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      {enrolled ? (
                        <Link
                          to={`/trainee/course/${c._id}`}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center space-x-1.5 transition cursor-pointer"
                        >
                          <PlayCircle className="w-4 h-4" />
                          <span>Resume Learning Player ➔</span>
                        </Link>
                      ) : (
                        <button
                          type="button"
                          disabled={isEnrolling}
                          onClick={() => handleEnrollInstituteCourse(c._id)}
                          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center space-x-1.5 transition cursor-pointer disabled:opacity-50"
                        >
                          {isEnrolling ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Enrolling...</span>
                            </>
                          ) : (
                            <>
                              <PlusCircle className="w-4 h-4" />
                              <span>⚡ Enroll in Institute Course</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: EXAM SUBMISSIONS & SCORES */}
      {activeTab === 'exams' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs">
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-bold uppercase tracking-wider text-[10px]">Exams Taken</span>
                <Award className="w-4 h-4 text-sky-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1">{attempts.length}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Submitted Attempts</div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-bold uppercase tracking-wider text-[10px]">Exams Cleared</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-600 mt-1">{passedCount}</div>
              <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">Qualified Threshold</div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-bold uppercase tracking-wider text-[10px]">Highest Score</span>
                <Trophy className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-amber-600 mt-1">{bestScore}%</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Personal Highest</div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-bold uppercase tracking-wider text-[10px]">Average Score</span>
                <BarChart3 className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-black text-indigo-600 mt-1">{avgScore}%</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Across All Exams</div>
            </div>
          </div>

          {/* Search, Filter and Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search exam by course title..."
                  value={examSearch}
                  onChange={(e) => setExamSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center space-x-1.5 text-xs">
                <span className="font-bold text-slate-400 text-[11px] uppercase tracking-wider mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filter:</span>
                </span>
                <button
                  type="button"
                  onClick={() => setExamFilter('all')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer text-xs ${
                    examFilter === 'all'
                      ? 'bg-[#0c4a6e] text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  All ({attempts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setExamFilter('passed')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer text-xs ${
                    examFilter === 'passed'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  Passed ({passedCount})
                </button>
                <button
                  type="button"
                  onClick={() => setExamFilter('failed')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer text-xs ${
                    examFilter === 'failed'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-rose-700 hover:bg-rose-50'
                  }`}
                >
                  Retake Needed ({attempts.length - passedCount})
                </button>
              </div>
            </div>

            {/* Scrollable Submissions Table */}
            <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
              <table className="w-full text-left text-xs text-slate-700 divide-y divide-slate-200">
                <thead className="bg-slate-100/90 text-slate-700 font-bold text-[11px] uppercase tracking-wider sticky top-0 z-10 backdrop-blur-sm">
                  <tr>
                    <th className="py-2.5 px-3">Course & Examination</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Submission Date</th>
                    <th className="py-2.5 px-3 text-center whitespace-nowrap">Marks</th>
                    <th className="py-2.5 px-3 text-center whitespace-nowrap">Percentage</th>
                    <th className="py-2.5 px-3 text-center whitespace-nowrap">Outcome</th>
                    <th className="py-2.5 px-3 text-center whitespace-nowrap">Time</th>
                    <th className="py-2.5 px-3 text-center whitespace-nowrap w-28">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAttempts.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-slate-400">
                        <Award className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                        <div className="font-bold text-slate-700 text-sm">No Examination Submissions Found</div>
                        <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                          When you complete and submit course examinations, your scores, percentage, pass/fail status, and question-by-question response breakdown will appear here.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredAttempts.map((att) => {
                      const courseTitle = att.courseId?.title || 'Course Examination';
                      const courseCode = att.courseId?.code || 'EXAM';
                      const examTitle = att.assessmentId?.title || 'Comprehensive Examination';
                      const dateStr = att.submittedAt || att.createdAt;
                      const formattedDate = dateStr
                        ? new Date(dateStr).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Just now';

                      return (
                        <tr key={att._id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-3">
                            <div>
                              <div className="font-bold text-slate-900 text-xs truncate max-w-[200px]" title={courseTitle}>{courseTitle}</div>
                              <div className="flex items-center space-x-1.5 text-[10px] text-slate-500 mt-0.5">
                                <span className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded border border-slate-200">
                                  {courseCode}
                                </span>
                                <span>•</span>
                                <span className="truncate max-w-[140px]" title={examTitle}>{examTitle}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-2.5 px-3 whitespace-nowrap text-slate-600 text-[11px]">
                            <div className="flex items-center space-x-1.5">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>{formattedDate}</span>
                            </div>
                          </td>

                          <td className="py-2.5 px-3 font-mono font-bold text-slate-800 text-center whitespace-nowrap">
                            {att.scoreObtained} / {att.totalPossibleMarks}
                          </td>

                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center space-x-1.5">
                              <div className="w-12 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full ${att.passed ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                  style={{ width: `${Math.min(100, att.percentage)}%` }}
                                />
                              </div>
                              <span className={`font-mono font-bold text-xs ${att.passed ? 'text-emerald-700' : 'text-rose-700'}`}>
                                {att.percentage}%
                              </span>
                            </div>
                          </td>

                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            {att.passed ? (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>PASSED</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                <XCircle className="w-3 h-3 text-rose-600" />
                                <span>RETAKE</span>
                              </span>
                            )}
                          </td>

                          <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px] text-center whitespace-nowrap">
                            {formatSeconds(att.timeSpentSeconds)}
                          </td>

                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center space-x-1.5">
                              <button
                                type="button"
                                onClick={() => setSelectedAttemptDetail(att)}
                                className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold rounded-lg border border-sky-200 transition inline-flex items-center space-x-1 cursor-pointer text-xs"
                                title="Inspect Answer Sheet & Explanations"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Review</span>
                              </button>

                              {!att.passed && att.courseId?._id && (
                                <Link
                                  to={`/trainee/assessment/${att.courseId._id}`}
                                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-lg border border-amber-200 transition inline-flex items-center space-x-1 cursor-pointer text-xs"
                                >
                                  <span>Retake</span>
                                </Link>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Showing {filteredAttempts.length} of {attempts.length} total exam records</span>
              <span className="text-[11px] text-slate-400">All submissions cryptographically verified</span>
            </div>
          </div>
        </div>
      )}

      {/* Answer Sheet Review Modal */}
      {selectedAttemptDetail && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setSelectedAttemptDetail(null)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col p-6 shadow-2xl space-y-4 border border-slate-200 animate-in zoom-in-95 relative"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                      selectedAttemptDetail.passed ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {selectedAttemptDetail.passed ? 'PASSED EXAMINATION' : 'RETAKE REQUIRED'}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-mono text-slate-600">
                    Score:{' '}
                    <strong>
                      {selectedAttemptDetail.scoreObtained} / {selectedAttemptDetail.totalPossibleMarks} (
                      {selectedAttemptDetail.percentage}%)
                    </strong>
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">
                  Examination Response Sheet: {selectedAttemptDetail.courseId?.title || 'Course Exam'}
                </h3>
                <p className="text-xs text-slate-500">
                  Submitted on{' '}
                  {new Date(selectedAttemptDetail.submittedAt || selectedAttemptDetail.createdAt).toLocaleString(
                    'en-IN'
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAttemptDetail(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Questions Breakdown */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs max-h-[60vh]">
              {(() => {
                const qList =
                  (selectedAttemptDetail.assessmentId?.questions?.length
                    ? selectedAttemptDetail.assessmentId.questions
                    : null) ||
                  selectedAttemptDetail.answers?.map((a, i) => ({
                    questionText: a.questionText || `Question ${a.questionIndex !== undefined ? a.questionIndex + 1 : i + 1}`,
                    options: a.options?.length ? a.options : ['Option A', 'Option B', 'Option C', 'Option D'],
                    correctOptionIndex: a.correctOptionIndex,
                    marks: a.marksAwarded || 2,
                    explanation: a.explanation
                  })) ||
                  [];

                return qList.map((q, qIdx) => {
                  const studentAnswer =
                    (selectedAttemptDetail.answers || []).find((a) => a.questionIndex === qIdx) ||
                    selectedAttemptDetail.answers?.[qIdx];
                  const selectedOptionIdx = studentAnswer?.selectedOption;
                  const isCorrect = studentAnswer?.isCorrect;
                  const correctIdx =
                    q.correctOptionIndex !== undefined ? q.correctOptionIndex : studentAnswer?.correctOptionIndex;

                  return (
                    <div
                      key={qIdx}
                      className={`p-4 rounded-xl border ${
                        isCorrect ? 'bg-emerald-50/40 border-emerald-200' : 'bg-rose-50/40 border-rose-200'
                      } space-y-2`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-bold text-slate-900">
                          Q{qIdx + 1}. {q.questionText}
                        </div>
                        <div className="flex items-center space-x-1.5 shrink-0 font-bold text-[11px]">
                          {isCorrect ? (
                            <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                              ✓ +{studentAnswer?.marksAwarded || q.marks || 2} Marks
                            </span>
                          ) : (
                            <span className="text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
                              ✕ 0 Marks
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        {(q.options || []).map((opt, optIdx) => {
                          const isStudentChoice = selectedOptionIdx === optIdx;
                          const isTheCorrectChoice = correctIdx === optIdx;

                          let optClass = 'border-slate-200 bg-white text-slate-600';
                          if (isStudentChoice && isCorrect) {
                            optClass = 'border-emerald-500 bg-emerald-100/70 text-emerald-950 font-bold';
                          } else if (isStudentChoice && !isCorrect) {
                            optClass = 'border-rose-400 bg-rose-100/70 text-rose-950 font-bold';
                          } else if (isTheCorrectChoice) {
                            optClass = 'border-emerald-300 bg-emerald-50 text-emerald-800 font-semibold';
                          }

                          return (
                            <div
                              key={optIdx}
                              className={`p-2.5 rounded-xl border flex items-center justify-between text-[11px] ${optClass}`}
                            >
                              <div className="flex items-center space-x-2">
                                <span className="font-mono font-bold">{String.fromCharCode(65 + optIdx)}.</span>
                                <span>{opt}</span>
                              </div>
                              {isStudentChoice && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                                  Your Choice
                                </span>
                              )}
                              {!isStudentChoice && isTheCorrectChoice && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                                  Correct Answer
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {q.explanation && (
                        <p className="text-[11px] text-slate-500 pt-1">
                          <strong>Official Solution:</strong> {q.explanation}
                        </p>
                      )}
                    </div>
                  );
                });
              })()}
            </div>

            {/* Modal Footer */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              {!selectedAttemptDetail.passed && selectedAttemptDetail.courseId?._id ? (
                <Link
                  to={`/trainee/assessment/${selectedAttemptDetail.courseId._id}`}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake Examination Now</span>
                </Link>
              ) : (
                <div />
              )}
              <button
                type="button"
                onClick={() => setSelectedAttemptDetail(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                Close Response Sheet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyEnrolledCourses;
