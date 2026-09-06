import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import AdminHeader from '../../components/AdminHeader';
import {
  Layers,
  CheckCircle,
  AlertCircle,
  Archive,
  ExternalLink,
  Search,
  Filter,
  BookOpen,
  Building,
  User,
  Clock,
  ChevronRight,
  ShieldCheck,
  X,
  PlusCircle,
  Edit,
  TrendingUp,
  Users
} from 'lucide-react';
import { useToast, useDialog } from '../../context/NotificationContext';
import CourseEnrollmentsModal from '../../components/CourseEnrollmentsModal';

const CourseGovernance = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'review' | 'published' | 'archived'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseForEnrollments, setSelectedCourseForEnrollments] = useState(null);
  const toast = useToast();
  const { showPrompt } = useDialog();

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.getCourses();
      if (res.success) {
        setCourses(res.courses || []);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleUpdateStatus = async (courseId, status) => {
    const feedback = await showPrompt({
      title: 'Governance Audit Remark',
      message: `Enter governance audit remark for changing course status to ${status.toUpperCase()}:`,
      defaultValue: '',
      placeholder: 'Enter detailed governance remark...',
      confirmText: `Set to ${status.toUpperCase()}`,
      type: status === 'archived' ? 'warning' : 'info'
    });

    if (feedback === null) return;

    try {
      const res = await api.updateCourseStatus(courseId, status, feedback);
      if (res.success) {
        toast.success(`Course successfully updated to ${status.toUpperCase()}!`, 'Governance Updated');
        fetchCourses();
      }
    } catch (err) {
      toast.error(err.message, 'Governance Error');
    }
  };

  const categories = Array.from(new Set(courses.map(c => c.category).filter(Boolean)));

  const filteredCourses = courses.filter(c => {
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch = (
      (c.title || '').toLowerCase().includes(q) ||
      (c.code || '').toLowerCase().includes(q) ||
      (c.trainerName || '').toLowerCase().includes(q) ||
      (c.organizationName || '').toLowerCase().includes(q) ||
      (c.category || '').toLowerCase().includes(q)
    );
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const reviewCount = courses.filter(c => c.status === 'review').length;
  const publishedCount = courses.filter(c => c.status === 'published').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0B2545]" />
          <span className="text-xs font-semibold text-slate-500">Loading curriculum governance pipeline...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* MoES Executive Authority Header */}
      <AdminHeader
        title="Curriculum & Course Governance"
        subtitle="Review syllabus submissions, verify WMO-1083 competency alignments, enforce quality thresholds, and publish approved courses to the national catalogue."
        badge="Curriculum Quality Moderation"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/admin/course-builder"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-1.5 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-slate-950" />
              <span>+ Create Government Course</span>
            </Link>

            <div className="flex items-center space-x-1.5 bg-white/10 backdrop-blur-sm p-1 rounded-xl border border-white/20 text-xs font-bold">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  statusFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-white hover:bg-white/10'
                }`}
              >
                All ({courses.length})
              </button>
              <button
                onClick={() => setStatusFilter('review')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 cursor-pointer ${
                  statusFilter === 'review' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-white hover:bg-white/10'
                }`}
              >
                <span>Under Review</span>
                <span className="px-1.5 py-0.2 text-[10px] bg-slate-900/30 rounded-full font-mono">{reviewCount}</span>
              </button>
              <button
                onClick={() => setStatusFilter('published')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 cursor-pointer ${
                  statusFilter === 'published' ? 'bg-emerald-600 text-white shadow-sm' : 'text-white hover:bg-white/10'
                }`}
              >
                <span>Published</span>
                <span className="px-1.5 py-0.2 text-[10px] bg-white/20 rounded-full font-mono">{publishedCount}</span>
              </button>
            </div>
          </div>
        }
      />

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by code, title, author, institution..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 transition"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-semibold focus:outline-none focus:bg-white"
          >
            <option value="all">All Domains ({categories.length})</option>
            {categories.map((cat, i) => (
              <option key={i} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
          <span>Active Catalogue:</span>
          <strong className="text-slate-900">{filteredCourses.length} Syllabi</strong>
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-3 border border-slate-200">
            <Layers className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">No Syllabi Match Active Criteria</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Try adjusting your search query, scientific domain filter, or review status.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredCourses.map((course) => {
            const isPublished = course.status === 'published';
            const isReview = course.status === 'review';

            return (
              <div
                key={course._id}
                className={`bg-white rounded-2xl border p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative overflow-hidden ${
                  isReview 
                    ? 'border-amber-300 bg-gradient-to-r from-white via-amber-50/20 to-white' 
                    : 'border-slate-200'
                }`}
              >
                {isReview && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-amber-400" />
                )}

                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-200 whitespace-nowrap flex-shrink-0">
                      {course.code}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200">
                      {course.category}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border inline-flex items-center space-x-1 ${
                      isPublished 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : (isReview ? 'bg-amber-50 text-amber-800 border-amber-300' : 'bg-slate-100 text-slate-700 border-slate-200')
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        isPublished ? 'bg-emerald-500' : (isReview ? 'bg-amber-500 animate-pulse' : 'bg-slate-400')
                      }`} />
                      <span>{course.status}</span>
                    </span>
                    {course.level && (
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                        {course.level} Level
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-base leading-snug">{course.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mt-1">{course.description}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1 border-t border-slate-100">
                    <div className="flex items-center space-x-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Faculty: <strong className="text-slate-800 font-semibold">{course.trainerName}</strong></span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span>Institute: <strong className="text-slate-800 font-semibold">{course.organizationName}</strong></span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      <span>Modules: <strong className="text-slate-800 font-semibold">{course.modules?.length || 0}</strong></span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      <span>Enrolled: <strong className="text-blue-900 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{course.enrolledCount || 0} Learners</strong></span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Avg Progress: <strong className="text-emerald-900 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{course.avgProgress || 0}%</strong></span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 flex-shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedCourseForEnrollments(course)}
                    className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                    title="View all enrolled trainees, individual progress and scores"
                  >
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Enrolled ({course.enrolledCount || 0})</span>
                  </button>

                  <Link
                    to={`/trainer/course-builder?courseId=${course._id}`}
                    className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition flex items-center space-x-1 cursor-pointer"
                    title="Edit syllabus modules, PDF/DOC materials, and configuration"
                  >
                    <Edit className="w-3 h-3 text-blue-600" />
                    <span>Edit Syllabus</span>
                  </Link>

                  <Link
                    to={`/trainee/course/${course._id}`}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Inspect</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </Link>

                  {!isPublished ? (
                    <button
                      onClick={() => handleUpdateStatus(course._id, 'published')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1.5 transition cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve & Publish</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateStatus(course._id, 'archived')}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 font-bold text-xs rounded-xl border border-slate-200 hover:border-rose-200 transition flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      <span>Archive Syllabus</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Course Enrollments & Progress Detail Modal */}
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

export default CourseGovernance;
