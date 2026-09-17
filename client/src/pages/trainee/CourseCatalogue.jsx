import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import TraineeHeader from '../../components/TraineeHeader';
import CoursePaymentModal from '../../components/CoursePaymentModal';
import {
  Search,
  BookOpen,
  Clock,
  Award,
  Filter,
  CheckCircle,
  User,
  Star,
  ChevronRight,
  GraduationCap,
  Sparkles,
  Layers,
  RotateCcw,
  CreditCard
} from 'lucide-react';
import { useToast } from '../../context/NotificationContext';

const CATEGORIES = [
  'All',
  'Radar Meteorology',
  'NWP & High Performance Computing',
  'Early Warning & Disaster Mitigation',
  'Satellite Data Assimilation'
];

const LEVELS = ['All', 'Foundational', 'Intermediate', 'Advanced'];

const CourseCatalogue = () => {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [instituteCourses, setInstituteCourses] = useState([]);
  const [instituteName, setInstituteName] = useState('');
  const [onlyInstitute, setOnlyInstitute] = useState(false);
  const [category, setCategory] = useState('All');
  const toast = useToast();
  const [level, setLevel] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState(null);
  const [selectedPaymentCourse, setSelectedPaymentCourse] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== 'All') params.append('category', category);
      if (level !== 'All') params.append('level', level);
      if (search) params.append('search', search);

      const [courseRes, enrRes] = await Promise.all([
        api.getCourses(params.toString()),
        api.getMyEnrollments()
      ]);

      if (courseRes.success) setCourses(courseRes.courses || []);
      if (enrRes.success) {
        setEnrollments(enrRes.enrollments || []);
        setInstituteCourses(enrRes.instituteCourses || []);
        if (enrRes.instituteName) setInstituteName(enrRes.instituteName);
      }
    } catch (err) {
      console.error('Error fetching catalogue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [category, level]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCourses();
  };

  const handleEnroll = async (courseId) => {
    setEnrollingId(courseId);
    try {
      const res = await api.enrollCourse(courseId);
      if (res.success) {
        toast.success(res.enrollmentType === 'INSTITUTE_SPONSORED_FREE' 
          ? 'Enrolled for Free (Covered by Campus Membership)!' 
          : 'Successfully enrolled in course!');
        navigate(`/trainee/course/${courseId}`);
      }
    } catch (err) {
      if (err.status === 402 || err.paymentRequired || err.response?.status === 402) {
        const targetCourse = courses.find(c => c._id === courseId);
        setSelectedPaymentCourse(targetCourse);
        setIsPaymentModalOpen(true);
      } else {
        toast.error(err.message || 'Enrollment error', 'Enrollment Notice');
      }
    } finally {
      setEnrollingId(null);
    }
  };

  const isEnrolled = (courseId) => {
    return enrollments.some(e => (e.courseId?._id || e.courseId) === courseId);
  };

  // Compute dynamic category list from fetched courses
  const dynamicCategories = [
    'All',
    ...Array.from(
      new Set([
        ...CATEGORIES.slice(1),
        ...courses.map(c => c.category).filter(Boolean)
      ])
    )
  ];

  // Filter courses by institute if active
  const displayedCourses = onlyInstitute
    ? courses.filter(c => {
        const isFromInst = (c.organizationName && instituteName && c.organizationName.toLowerCase().trim() === instituteName.toLowerCase().trim()) ||
          instituteCourses.some(ic => ic._id?.toString() === c._id?.toString());
        return isFromInst;
      })
    : courses;

  return (
    <div className="space-y-6">
      {/* Trainee Executive Header */}
      <TraineeHeader
        title="National Course Catalogue & Capacity Framework"
        subtitle="Accredited MoES / IMD capacity building modules aligned with NDEAR competency standards and atmospheric forecasting benchmarks."
        badge="Accredited Forecaster Curriculum"
        actions={
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 text-sky-200">
              {displayedCourses.length} Programs Available
            </span>
          </div>
        }
      />

      {/* Search & Dynamic Filter Hub */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4">
        {/* Filter Source Tabs (All vs My Institute) */}
        {instituteName && (
          <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setOnlyInstitute(false)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                !onlyInstitute
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-sky-600" />
              <span>All Courses ({courses.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setOnlyInstitute(true)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                onlyInstitute
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>🏛️ {instituteName} ({instituteCourses.length})</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by title, syllabus code (e.g. RAD-201), trainer or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center space-x-1.5"
          >
            <span>Search</span>
          </button>
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                fetchCourses();
              }}
              className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition cursor-pointer"
              title="Clear Search"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* Domain Category Filter Badges */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-2 flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Specialization:</span>
          </span>
          {dynamicCategories.map((cat) => {
            const isSelected = category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  isSelected
                    ? 'bg-[#0c4a6e] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Difficulty Level Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-2">Level:</span>
          {LEVELS.map((lvl) => {
            const isSelected = level === lvl;
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => setLevel(lvl)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  isSelected
                    ? 'bg-sky-100 text-sky-900 font-bold border border-sky-300 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {lvl}
              </button>
            );
          })}
        </div>
      </div>

      {/* Courses Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[320px]">
          <div className="relative">
            <div className="w-10 h-10 rounded-full border-4 border-sky-200 border-t-sky-600 animate-spin" />
          </div>
        </div>
      ) : displayedCourses.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No courses match your criteria</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try resetting the domain category, difficulty level, or clearing your institute filter.
          </p>
          <button
            onClick={() => {
              setCategory('All');
              setLevel('All');
              setSearch('');
              setOnlyInstitute(false);
            }}
            className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold hover:bg-sky-700 transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedCourses.map((course) => {
            const enrolled = isEnrolled(course._id);
            const isMyInstitute = instituteName && course.organizationName && course.organizationName.toLowerCase().trim() === instituteName.toLowerCase().trim();

            return (
              <div
                key={course._id}
                className={`bg-white rounded-2xl border shadow-xs hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden group ${
                  isMyInstitute ? 'border-emerald-200 hover:border-emerald-400 ring-1 ring-emerald-100' : 'border-slate-200/90 hover:border-sky-300'
                }`}
              >
                <div>
                  {/* Top Bar with Category & Code */}
                  <div className={`p-3.5 sm:p-4 border-b flex items-center justify-between gap-3 ${
                    isMyInstitute ? 'bg-emerald-50/40 border-emerald-100' : 'bg-slate-50/70 border-slate-100'
                  }`}>
                    <div className="min-w-0 flex-1 flex items-center gap-1.5 flex-wrap">
                      <span
                        title={course.category}
                        className="inline-block max-w-full truncate text-[10px] font-extrabold uppercase tracking-wider bg-sky-100 text-sky-800 px-2.5 py-1 rounded-md border border-sky-200/60"
                      >
                        {course.category}
                      </span>
                      {isMyInstitute && (
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 flex items-center space-x-1">
                          <span>🏛️ Institute Course</span>
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs whitespace-nowrap flex-shrink-0">
                      {course.code}
                    </span>
                  </div>

                  {/* Card Main Body */}
                  <div className="p-5 space-y-3">
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-sky-700 transition leading-snug">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {course.description}
                    </p>

                    {/* Metadata Badges */}
                    <div className="flex items-center space-x-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-sky-600" />
                        <span>{course.durationWeeks || 4} Wks ({course.durationHours || 40} hrs)</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span className="font-bold text-slate-700">
                          {course.rating && Number(course.rating) > 0 ? Number(course.rating).toFixed(1) : 'New'}
                        </span>
                      </div>
                    </div>

                    {/* Instructor & Institute Info */}
                    <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-[10px]">
                          👨‍🏫
                        </div>
                        <div className="truncate text-slate-600">
                          <span className="font-semibold text-slate-800">{course.trainerName}</span>
                        </div>
                      </div>
                      {course.organizationName && (
                        <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                          <span className="text-slate-400">🏛️</span>
                          <span className="truncate font-medium text-slate-600">{course.organizationName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card CTA Footer */}
                <div className="p-4 bg-slate-50/90 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Access Fee:</span>
                    {course.isGovernmentFree ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        100% Free (Gov. Initiative)
                      </span>
                    ) : instituteName ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Included in Campus Plan (FREE)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] font-black bg-blue-100 text-blue-900 border border-blue-200">
                        ₹{(course.individualPrice || 999).toLocaleString('en-IN')} (Direct Certification)
                      </span>
                    )}
                  </div>

                  {enrolled ? (
                    <Link
                      to={`/trainee/course/${course._id}`}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center space-x-1.5 transition"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Enrolled • Continue Learning</span>
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleEnroll(course._id)}
                      disabled={enrollingId === course._id}
                      className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center space-x-1.5 transition disabled:opacity-50 cursor-pointer"
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>
                        {enrollingId === course._id
                          ? 'Enrolling...'
                          : (!course.isGovernmentFree && !instituteName
                              ? `Pay ₹${(course.individualPrice || 999).toLocaleString('en-IN')} & Enroll`
                              : '1-Click Free Enrollment')}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* External Student Payment Checkout Modal */}
      <CoursePaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        course={selectedPaymentCourse}
        onSuccess={() => {
          toast.success('Payment verified! Course successfully unlocked.');
          fetchCourses();
          if (selectedPaymentCourse) {
            navigate(`/trainee/course/${selectedPaymentCourse._id}`);
          }
        }}
      />
    </div>
  );
};

export default CourseCatalogue;
