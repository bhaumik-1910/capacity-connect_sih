import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import TrainerHeader from '../../components/TrainerHeader';
import {
  Layers,
  Plus,
  BookOpen,
  Clock,
  Users,
  ArrowRight,
  Trash2,
  Loader2,
  Search,
  CheckCircle2,
  Sparkles,
  Award,
  ExternalLink,
  Sliders,
  Edit
} from 'lucide-react';
import { useToast, useDialog } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import CourseEnrollmentsModal from '../../components/CourseEnrollmentsModal';

const MyCreatedCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [selectedCourseForEnrollments, setSelectedCourseForEnrollments] = useState(null);
  const toast = useToast();
  const { showConfirm } = useDialog();

  const fetchCourses = async () => {
    try {
      const res = await api.getTrainerCourses();
      if (res.success) setCourses(res.courses || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDeleteCourse = async (courseId, courseTitle) => {
    const confirmed = await showConfirm({
      title: 'Delete Authored Course',
      message: `Are you sure you want to delete "${courseTitle || 'this course'}"? This action will permanently remove all associated curriculum modules and lesson materials.`,
      confirmText: 'Delete Course',
      cancelText: 'Cancel',
      type: 'danger'
    });

    if (!confirmed) return;

    setDeletingId(courseId);
    try {
      const res = await api.deleteCourse(courseId);
      if (res.success) {
        toast.success('Course deleted successfully from the registry.');
        setCourses((prev) => prev.filter((c) => c._id !== courseId));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete course');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredCourses = courses.filter(c =>
    !search ||
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.code?.toLowerCase().includes(search.toLowerCase()) ||
    c.category?.toLowerCase().includes(search.toLowerCase())
  );

  const totalEnrolled = courses.reduce((acc, c) => acc + (c.enrolledCount || 0), 0);
  const totalPublished = courses.filter(c => c.status === 'published').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[450px]">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
          <div className="text-slate-500 font-bold text-xs">Loading course syllabus catalogue...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 select-none max-w-7xl mx-auto">
      
      {/* Executive Trainer Header */}
      <TrainerHeader
        title="My Authored Courses & Syllabus Registry"
        subtitle="Review syllabus versioning, learner enrollments, module blueprints, and exam question banks for all accredited programs."
        department={user?.department || 'Atmospheric & Climate Sciences'}
        badge="Curriculum Authoring"
        actions={
          <Link
            to="/trainer/course-builder"
            className="px-4 py-2 bg-white text-indigo-950 hover:bg-indigo-50 font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-indigo-700" />
            <span>Create Course</span>
          </Link>
        }
      />

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Authored</div>
            <div className="text-2xl font-black text-slate-900">{courses.length}</div>
            <div className="text-[10px] text-indigo-600 font-semibold flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>Curriculum Registry</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Published Status</div>
            <div className="text-2xl font-black text-slate-900">{totalPublished} Active</div>
            <div className="text-[10px] text-emerald-600 font-semibold flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Live for Cohorts</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Forecasters Enrolled</div>
            <div className="text-2xl font-black text-slate-900">{totalEnrolled}</div>
            <div className="text-[10px] text-blue-600 font-semibold flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>Active Trainees</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search authored courses by title, code or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          />
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-dashed border-slate-200 space-y-3 text-xs">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-400 flex items-center justify-center mx-auto">
            <Layers className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">
            {search ? 'No Matching Courses Found' : 'No Authored Courses Yet'}
          </h3>
          <p className="text-slate-500 max-w-sm mx-auto">
            {search
              ? 'Try modifying your search query to locate your course.'
              : 'Design accredited meteorological training programs with modular video lectures, slides, and quizzes.'}
          </p>
          {!search && (
            <Link
              to="/trainer/course-builder"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition inline-flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Course</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {filteredCourses.map((course) => (
            <div
              key={course._id}
              className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4 flex flex-col justify-between hover:border-indigo-400 hover:shadow-md transition group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 px-2.5 py-0.5 rounded-md">
                    {course.code || 'CRS-MET'}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    course.status === 'published'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {course.status === 'published' ? 'Published' : 'Under Review'}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-indigo-900 transition">
                  {course.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {course.description || 'Accredited meteorological training program designed for forecasters and operational researchers.'}
                </p>

                <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-slate-600 text-[11px] border border-slate-100">
                  <div className="flex items-center space-x-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Enrolled: <strong className="text-slate-800">{course.enrolledCount || 0}</strong></span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{course.durationWeeks || 4} Weeks ({course.durationHours || 20} hrs)</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px]">
                <Link
                  to={`/trainee/course/${course._id}`}
                  className="text-xs text-indigo-600 font-bold hover:underline flex items-center space-x-1"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Preview Modules</span>
                </Link>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedCourseForEnrollments(course)}
                    className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg border border-blue-200 transition flex items-center gap-1 cursor-pointer shadow-2xs"
                    title="View Enrolled Trainees & Individual Progress"
                  >
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    <span>Enrolled ({course.enrolledCount || 0})</span>
                  </button>
                  <Link
                    to={`/trainer/question-bank?courseId=${course._id}&tab=questions`}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition"
                  >
                    Questions
                  </Link>
                  <Link
                    to={`/trainer/question-bank?courseId=${course._id}&tab=submissions`}
                    className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg border border-indigo-200 transition flex items-center gap-1"
                    title="View Student Exam Submissions & Score Sheets"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Submissions</span>
                  </Link>
                  <Link
                    to={`/trainer/course-builder?courseId=${course._id}`}
                    className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg border border-blue-200 transition flex items-center gap-1 shadow-2xs hover:shadow-xs"
                    title="Edit Course Details & Curriculum"
                  >
                    <Edit className="w-3.5 h-3.5 text-blue-600" />
                    <span>Edit</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDeleteCourse(course._id, course.title)}
                    disabled={deletingId === course._id}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-rose-100 hover:border-rose-300 rounded-lg transition-colors cursor-pointer shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete Course"
                  >
                    {deletingId === course._id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Trainee Progress and Enrollments Modal */}
      {selectedCourseForEnrollments && (
        <CourseEnrollmentsModal
          isOpen={Boolean(selectedCourseForEnrollments)}
          courseId={selectedCourseForEnrollments._id}
          courseTitle={selectedCourseForEnrollments.title}
          onClose={() => setSelectedCourseForEnrollments(null)}
        />
      )}
    </div>
  );
};

export default MyCreatedCourses;
