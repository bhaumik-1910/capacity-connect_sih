import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/NotificationContext';
import InstituteHeader from '../../components/InstituteHeader';
import {
  BookOpen,
  Users,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  Sliders,
  Award,
  Clock,
  ExternalLink,
  GraduationCap
} from 'lucide-react';

const InstituteCourses = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const loadCourses = async () => {
    setLoading(true);
    try {
      const res = await api.getCourses();
      if (res.success) {
        setCourses(res.courses || []);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load institute courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const categories = Array.from(new Set(courses.map(c => c.category).filter(Boolean)));

  const filtered = courses.filter(c => {
    const matchesSearch = !search ||
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.code?.toLowerCase().includes(search.toLowerCase()) ||
      c.category?.toLowerCase().includes(search.toLowerCase()) ||
      c.trainerName?.toLowerCase().includes(search.toLowerCase());

    const matchesCat = selectedCategory === 'all' || c.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const totalModules = courses.reduce((acc, c) => acc + (c.modules?.length || 0), 0);

  return (
    <div className="space-y-6 pb-12 select-none max-w-7xl mx-auto">
      
      {/* Executive Institutional Header */}
      <InstituteHeader
        title="Institute Courses & Faculty Allocation"
        subtitle="Monitor accredited curriculum tracks, assigned faculty instructors, module syllabus benchmarks, and completion metrics."
        orgCode={user?.organizationCode || user?.organizationId?.code || 'INST'}
        badge="Accredited Training Framework"
        actions={
          <div className="flex items-center space-x-2">
            <Link
              to="/admin/trainer-matching"
              className="px-3.5 py-2 bg-emerald-400/20 hover:bg-emerald-400/30 text-emerald-100 border border-emerald-300/30 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 backdrop-blur-sm"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-300" />
              <span>Matching Matrix</span>
            </Link>

            <Link
              to="/trainer/course-builder"
              className="px-4 py-2 bg-white text-emerald-950 hover:bg-emerald-50 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-700" />
              <span>Create Course</span>
            </Link>
          </div>
        }
      />

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Accredited Courses</div>
            <div className="text-2xl font-black text-slate-900">{courses.length}</div>
            <div className="text-[10px] text-emerald-600 font-semibold flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Curriculum Active</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Syllabus Units</div>
            <div className="text-2xl font-black text-slate-900">{totalModules} Modules</div>
            <div className="text-[10px] text-blue-600 font-semibold flex items-center space-x-1">
              <Layers className="w-3 h-3" />
              <span>Structured Lessons</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Disciplinary Tracks</div>
            <div className="text-2xl font-black text-slate-900">{categories.length || 1} Specializations</div>
            <div className="text-[10px] text-purple-600 font-semibold flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>National Alignment</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search courses by title, code, category or faculty instructor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          {categories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none cursor-pointer focus:bg-white"
            >
              <option value="all">All Categories ({courses.length})</option>
              {categories.map((cat, i) => (
                <option key={i} value={cat}>{cat}</option>
              ))}
            </select>
          )}

          <button
            onClick={loadCourses}
            disabled={loading}
            className="p-2.5 text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 cursor-pointer transition"
            title="Refresh Courses"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3 bg-white rounded-3xl border border-slate-200">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
          <div className="text-slate-600 font-bold text-xs tracking-wide">Loading accredited curriculum catalogue...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-dashed border-slate-200 space-y-3 text-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
            <BookOpen className="w-7 h-7" />
          </div>
          <div className="font-bold text-slate-800 text-sm">No Courses Available</div>
          <p className="text-slate-500 max-w-sm mx-auto">
            {search || selectedCategory !== 'all'
              ? 'No courses match your query. Try clearing your search or category filter.'
              : 'Create an accredited training course using the button above to begin cohort instruction.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {filtered.map((course) => (
            <div
              key={course._id}
              className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between hover:border-emerald-400 hover:shadow-md transition group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                    {course.code || 'CRS-SPEC'}
                  </span>
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {course.status || 'PUBLISHED'}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-emerald-800 transition line-clamp-2">
                    {course.title}
                  </h3>
                  {course.category && (
                    <span className="inline-block mt-1 text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {course.category}
                    </span>
                  )}
                </div>

                <p className="text-slate-500 line-clamp-2 text-[11px] leading-relaxed">
                  {course.description || 'Comprehensive professional training curriculum tailored for meteorology and operational research.'}
                </p>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 border border-slate-100 text-slate-600 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Assigned Faculty:</span>
                    <strong className="text-slate-800 font-semibold">{course.trainerName || 'Department Faculty'}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Curriculum Units:</span>
                    <strong className="text-slate-800 font-semibold">{course.modules?.length || 4} modules</strong>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <Link
                  to="/admin/trainer-matching"
                  className="text-emerald-700 hover:text-emerald-900 font-bold hover:underline flex items-center space-x-1"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Assign Trainer</span>
                </Link>

                <Link
                  to={`/trainee/course/${course._id}`}
                  className="font-bold text-slate-700 hover:text-slate-900 flex items-center space-x-1 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1 rounded-lg transition"
                >
                  <span>View Course</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default InstituteCourses;
