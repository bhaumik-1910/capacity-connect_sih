import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import TrainerHeader from '../../components/TrainerHeader';
import {
  Layers,
  Users,
  Award,
  AlertTriangle,
  PlusCircle,
  Plus,
  Clock,
  TrendingUp,
  CheckCircle,
  FileCheck,
  ChevronRight,
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Calendar,
  CheckSquare
} from 'lucide-react';

const TrainerDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrainerData = async () => {
      try {
        const [courseRes, analRes] = await Promise.all([
          api.getTrainerCourses(),
          api.getTraineeAnalytics()
        ]);
        if (courseRes.success) setCourses(courseRes.courses || []);
        if (analRes.success) setAnalytics(analRes.analytics || []);
      } catch (err) {
        console.error('Error fetching trainer dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrainerData();
  }, []);

  const totalEnrolled = courses.reduce((acc, c) => acc + (c.enrolledCount || 0), 0);
  const publishedCount = courses.filter(c => c.status === 'published').length;
  const reviewCount = courses.filter(c => c.status === 'review').length;

  // Dynamically derived from actual live enrollments in MongoDB
  const atRiskLearners = analytics.filter(a => a.isAtRisk);

  // Dynamically derived average rating across trainer's courses
  const ratedCourses = courses.filter(c => c.rating && Number(c.rating) > 0);
  const averageRating = ratedCourses.length > 0
    ? (ratedCourses.reduce((acc, c) => acc + Number(c.rating), 0) / ratedCourses.length).toFixed(1)
    : (courses.length > 0 ? '5.0' : '0.0');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
          <div className="text-slate-500 font-bold text-xs">Loading faculty studio...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 select-none max-w-7xl mx-auto">
      
      {/* Executive Trainer Header */}
      <TrainerHeader
        title={`Faculty Workspace: ${user?.name || 'Senior Instructor'}`}
        subtitle="Author accredited meteorological curricula, formulate question banks, monitor operational cohort velocity, and intervene for at-risk trainees."
        department={user?.department || 'Atmospheric & Climate Sciences'}
        badge="Accredited Senior Faculty"
        actions={
          <div className="flex items-center space-x-2">
            <Link
              to="/trainer/course-builder"
              className="px-4 py-2 bg-white text-indigo-950 hover:bg-indigo-50 font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-indigo-700" />
              <span>Launch Builder</span>
            </Link>
            <Link
              to="/trainer/question-bank"
              className="px-3.5 py-2 bg-indigo-400/20 hover:bg-indigo-400/30 text-indigo-100 font-bold text-xs rounded-xl border border-indigo-300/30 backdrop-blur-sm transition flex items-center space-x-1.5"
            >
              <CheckSquare className="w-3.5 h-3.5 text-amber-300" />
              <span>Exam Bank</span>
            </Link>
          </div>
        }
      />

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between hover:border-indigo-300 transition">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Authored Courses</p>
            <h3 className="text-2xl font-black text-slate-900">{courses.length}</h3>
            <p className="text-[10px] text-emerald-600 font-semibold flex items-center space-x-1">
              <CheckCircle className="w-3 h-3" />
              <span>{publishedCount} Active • {reviewCount} Review</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between hover:border-blue-300 transition">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Enrolled Trainees</p>
            <h3 className="text-2xl font-black text-blue-600">{totalEnrolled}</h3>
            <p className="text-[10px] text-blue-600 font-semibold flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>Across all cohort batches</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between hover:border-amber-300 transition">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Instruction Rating</p>
            <h3 className="text-2xl font-black text-amber-600">
              {Number(averageRating) > 0 ? `${averageRating} / 5.0` : '5.0 / 5.0'}
            </h3>
            <p className="text-[10px] text-amber-700 font-semibold flex items-center space-x-1">
              <Award className="w-3 h-3" />
              <span>Accredited Faculty Score</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between hover:border-rose-300 transition">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">At-Risk Learners</p>
            <h3 className={`text-2xl font-black ${atRiskLearners.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {atRiskLearners.length}
            </h3>
            <p className={`text-[10px] font-semibold flex items-center space-x-1 ${atRiskLearners.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {atRiskLearners.length > 0 ? (
                <>
                  <AlertTriangle className="w-3 h-3" />
                  <span>Intervention Recommended</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-3 h-3" />
                  <span>All Trainees on Target</span>
                </>
              )}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
            atRiskLearners.length > 0 ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: My Courses + At-Risk Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: My Courses */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">My Authored Curricula</h2>
                <p className="text-[10px] text-slate-500">Active meteorological lesson tracks and units</p>
              </div>
            </div>
            <Link
              to="/trainer/course-builder"
              className="text-xs font-bold text-indigo-700 hover:text-indigo-900 hover:underline flex items-center space-x-1"
            >
              <span>+ New Course</span>
            </Link>
          </div>

          <div className="space-y-3">
            {courses.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 border border-dashed border-slate-200 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-400 flex items-center justify-center mx-auto">
                  <Layers className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">No Courses Created Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Author and publish your first accredited curriculum track using the interactive 5-step wizard.
                </p>
                <Link
                  to="/trainer/course-builder"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition inline-flex items-center space-x-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Launch Course Builder</span>
                </Link>
              </div>
            ) : (
              courses.map((c) => (
                <div
                  key={c._id}
                  className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-indigo-400 hover:shadow-sm transition group"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                        {c.code || 'CRS-MET'}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        c.status === 'published'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {c.status === 'published' ? 'Published' : 'Under Review'}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-900 transition leading-snug">
                      {c.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span>Enrolled: <strong className="text-slate-800">{c.enrolledCount || 0}</strong></span>
                      <span>•</span>
                      <span>Avg Progress: <strong className="text-slate-800">{c.avgProgress || 0}%</strong></span>
                      <span>•</span>
                      <span>Syllabus: <strong className="text-slate-800">{c.modules?.length || 0} Modules</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <Link
                      to={`/trainee/course/${c._id}`}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition"
                    >
                      Preview
                    </Link>
                    <Link
                      to={`/trainer/question-bank?courseId=${c._id}&tab=questions`}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 transition"
                    >
                      Exam Bank
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 1 Col: At-Risk Trainee Alerts */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">At-Risk Learner Alerts</h3>
                <p className="text-[10px] text-slate-400">Velocity and attendance triggers</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {atRiskLearners.length === 0 ? (
                <div className="p-6 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs text-emerald-900 text-center font-medium space-y-1.5">
                  <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto" />
                  <p className="font-bold">Cohorts on Schedule</p>
                  <p className="text-[11px] text-emerald-700">All trainees are currently meeting pace & exam standards.</p>
                </div>
              ) : (
                atRiskLearners.map((learner, idx) => (
                  <div key={idx} className="p-3 bg-rose-50/70 border border-rose-200/80 rounded-xl text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-slate-900">{learner.name}</span>
                      <span className="text-rose-700 font-mono font-bold bg-white px-2 py-0.5 rounded border border-rose-200">
                        {learner.progress}% Progress
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      {learner.dept || learner.department} • Course: <strong className="text-slate-700">{learner.course}</strong>
                    </div>
                    <p className="text-rose-800 font-semibold text-[11px]">
                      ⚠️ {learner.reason}
                    </p>
                  </div>
                ))
              )}
            </div>

            <Link
              to="/trainer/trainee-analytics"
              className="block text-center py-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-bold text-xs rounded-xl transition"
            >
              View Full Cohort Gradebook
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TrainerDashboard;
