import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Award, Search, Download, Eye, CheckCircle, XCircle,
  GraduationCap, BookOpen, Filter, RefreshCw, FileText,
  User, Hash, Calendar, BarChart3, Shield, Palette,
  Image as ImageIcon, Sparkles, Check, Upload, Sliders, ExternalLink
} from 'lucide-react';
import CertificateModal from '../../components/CertificateModal';
import { useToast } from '../../context/NotificationContext';
import TrainerHeader from '../../components/TrainerHeader';

const gradeColor = (grade) => {
  if (!grade) return 'text-slate-500 bg-slate-50 border-slate-200';
  if (grade === 'Distinction') return 'text-purple-800 bg-purple-50 border-purple-200';
  if (grade === 'First Class with Merit') return 'text-blue-800 bg-blue-50 border-blue-200';
  if (grade === 'First Class') return 'text-indigo-800 bg-indigo-50 border-indigo-200';
  return 'text-emerald-800 bg-emerald-50 border-emerald-200';
};

const statusDot = (status) => {
  if (status === 'valid') return 'bg-emerald-500';
  if (status === 'revoked') return 'bg-rose-500';
  return 'bg-amber-500';
};

// Preset certificate templates for quick selection
const PRESET_TEMPLATES = [
  {
    id: 'gov_gold',
    name: 'Government Classic Gold Crest',
    accentColor: '#b45309',
    url: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=1200&q=80',
    description: 'Traditional parchment with golden crest framing'
  },
  {
    id: 'imd_blue',
    name: 'MoES / IMD Maritime Blue',
    accentColor: '#0369a1',
    url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80',
    description: 'Clean scientific gradient border with deep marine tones'
  },
  {
    id: 'executive_navy',
    name: 'Executive Dark Navy & Bronze',
    accentColor: '#0f172a',
    url: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1200&q=80',
    description: 'Modern high-contrast certificate background'
  },
  {
    id: 'emerald_honor',
    name: 'Academic Emerald Border',
    accentColor: '#047857',
    url: 'https://images.unsplash.com/photo-1518655048521-f130df041f66?auto=format&fit=crop&w=1200&q=80',
    description: 'Subtle clean geometric texture with forest emerald accents'
  }
];

const TrainerCertificatesView = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('roster'); // 'roster' | 'design'
  const [certificates, setCertificates] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCert, setSelectedCert] = useState(null);

  // Template Design Studio State
  const [selectedCourseForDesign, setSelectedCourseForDesign] = useState(null);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templateForm, setTemplateForm] = useState({
    useCustomBackground: false,
    backgroundUrl: '',
    titleText: '',
    accentColor: '#b45309',
    trainerSignatureName: '',
    trainerSignatureDesignation: ''
  });

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [certsRes, coursesRes] = await Promise.all([
        api.getTrainerCourseCerts(),
        api.getTrainerCourses()
      ]);
      if (certsRes.success) setCertificates(certsRes.certificates || []);
      if (coursesRes.success) {
        const courses = coursesRes.courses || [];
        setMyCourses(courses);
        if (courses.length > 0) {
          selectCourseForEditing(courses[0]);
        }
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const selectCourseForEditing = (course) => {
    setSelectedCourseForDesign(course);
    const tmpl = course.certificateTemplate || {};
    setTemplateForm({
      useCustomBackground: Boolean(tmpl.useCustomBackground),
      backgroundUrl: tmpl.backgroundUrl || '',
      titleText: tmpl.titleText || '',
      accentColor: tmpl.accentColor || '#b45309',
      trainerSignatureName: tmpl.trainerSignatureName || course.trainerName || '',
      trainerSignatureDesignation: tmpl.trainerSignatureDesignation || ''
    });
  };

  const handleSaveDesign = async () => {
    if (!selectedCourseForDesign) return;
    setSavingTemplate(true);
    try {
      const res = await api.updateCourseCertTemplate(selectedCourseForDesign._id, templateForm);
      if (res.success) {
        toast.showSuccess('Certificate design template saved successfully!');
        // Update local courses state
        setMyCourses((prev) =>
          prev.map((c) =>
            c._id === selectedCourseForDesign._id
              ? { ...c, certificateTemplate: res.certificateTemplate }
              : c
          )
        );
        setSelectedCourseForDesign((prev) => ({
          ...prev,
          certificateTemplate: res.certificateTemplate
        }));
      } else {
        toast.showError(res.message || 'Failed to save certificate design');
      }
    } catch (err) {
      toast.showError(err.message || 'Error updating template');
    } finally {
      setSavingTemplate(false);
    }
  };

  // Unique course names for filter
  const uniqueCourses = [...new Map(
    certificates.map((c) => [c.courseId?._id, { id: c.courseId?._id, title: c.courseTitle, code: c.courseCode }])
  ).values()];

  // Filtered list
  const filtered = certificates.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      c.studentName?.toLowerCase().includes(q) ||
      c.certificateNumber?.toLowerCase().includes(q) ||
      c.courseTitle?.toLowerCase().includes(q) ||
      c.courseCode?.toLowerCase().includes(q) ||
      c.enrollmentNumber?.toLowerCase().includes(q) ||
      c.studentEmail?.toLowerCase().includes(q);

    const matchCourse = courseFilter === 'all' || c.courseId?._id === courseFilter;
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;

    return matchSearch && matchCourse && matchStatus;
  });

  // Stats
  const validCount = certificates.filter((c) => c.status === 'valid').length;
  const distinctions = certificates.filter((c) => c.grade === 'Distinction').length;
  const avgScore = certificates.length > 0
    ? Math.round(certificates.reduce((acc, c) => acc + (c.scorePercentage || 0), 0) / certificates.length)
    : 0;

  // CSV Export
  const exportCSV = () => {
    const headers = ['Certificate No', 'Student Name', 'Enrollment No', 'Email', 'Course', 'Code', 'Grade', 'Score %', 'Status', 'Issue Date'];
    const rows = filtered.map((c) => [
      c.certificateNumber,
      c.studentName,
      c.enrollmentNumber || '',
      c.studentEmail || '',
      `"${c.courseTitle}"`,
      c.courseCode || '',
      c.grade || '',
      c.scorePercentage || 0,
      c.status,
      new Date(c.issueDate).toLocaleDateString('en-IN')
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `Certificates_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 select-none max-w-7xl mx-auto">
      {/* Executive Trainer Header */}
      <TrainerHeader
        title="Course Certificate & Design Studio"
        subtitle="Track student credentials, verify 80%+ pass criteria compliance, and customize certificate visual templates with real-time overlay previews."
        badge="Credentials Governance"
        actions={
          <div className="flex bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/20 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('roster')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'roster'
                  ? 'bg-white text-indigo-950 shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Issued ({certificates.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('design')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'design'
                  ? 'bg-white text-indigo-950 shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-indigo-700" />
              <span>Design Studio</span>
            </button>
          </div>
        }
      />

      {/* TAB 1: ISSUED CERTIFICATES */}
      {activeTab === 'roster' && (
        <>
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-700 rounded-xl border border-blue-100">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-black text-slate-800">{certificates.length}</div>
                <div className="text-xs text-slate-500 font-medium">Total Issued</div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-black text-slate-800">{validCount}</div>
                <div className="text-xs text-slate-500 font-medium">Active & Valid</div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="p-3 bg-purple-50 text-purple-700 rounded-xl border border-purple-100">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-black text-slate-800">{distinctions}</div>
                <div className="text-xs text-slate-500 font-medium">Distinctions (90%+)</div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="p-3 bg-amber-50 text-amber-700 rounded-xl border border-amber-100">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-black text-slate-800">{avgScore}%</div>
                <div className="text-xs text-slate-500 font-medium">Avg Score</div>
              </div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search student, cert no, course..."
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-700 focus:outline-none"
              >
                <option value="all">All My Courses</option>
                {uniqueCourses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-700 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="valid">Valid</option>
                <option value="revoked">Revoked</option>
              </select>

              <button
                onClick={fetchInitialData}
                className="p-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 transition"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                onClick={exportCSV}
                disabled={filtered.length === 0}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500">Loading issued certificates...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-slate-200 space-y-3">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-200">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-700 text-sm">No Certificates Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {search ? 'Try adjusting your search criteria.' : 'When students pass exams with 80%+ marks, their issued certificates will automatically appear here.'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold text-[11px]">
                    <tr>
                      <th className="px-2.5 py-2.5">Student</th>
                      <th className="px-2.5 py-2.5 text-center whitespace-nowrap">Enrollment No</th>
                      <th className="px-2.5 py-2.5">Course</th>
                      <th className="px-2.5 py-2.5 text-center whitespace-nowrap">Certificate No</th>
                      <th className="px-2.5 py-2.5 text-center whitespace-nowrap">Grade</th>
                      <th className="px-2.5 py-2.5 text-center whitespace-nowrap">Score</th>
                      <th className="px-2.5 py-2.5 text-center whitespace-nowrap">Status</th>
                      <th className="px-2.5 py-2.5 text-center whitespace-nowrap">Issue Date</th>
                      <th className="px-2.5 py-2.5 text-center whitespace-nowrap w-20">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((cert) => (
                      <tr key={cert._id} className="hover:bg-slate-50/80 transition">
                        <td className="px-2.5 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                              {cert.studentName?.charAt(0) || 'S'}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-800 truncate max-w-[130px]" title={cert.studentName}>{cert.studentName}</div>
                              <div className="text-[10px] text-slate-400 font-mono truncate max-w-[130px]" title={cert.studentEmail}>{cert.studentEmail}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-2.5 py-2.5 text-center whitespace-nowrap">
                          <span className="font-mono font-bold text-[#0B2545] bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded text-[11px]">
                            {cert.enrollmentNumber || cert.traineeId?.enrollmentNumber || '—'}
                          </span>
                        </td>
                        <td className="px-2.5 py-2.5">
                          <div className="font-semibold text-slate-800 leading-tight max-w-[150px] truncate" title={cert.courseTitle}>{cert.courseTitle}</div>
                          <div className="font-mono text-[10px] text-slate-400">{cert.courseCode}</div>
                        </td>
                        <td className="px-2.5 py-2.5 text-center whitespace-nowrap">
                          <span className="font-mono text-[10px] bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-700">
                            {cert.certificateNumber}
                          </span>
                        </td>
                        <td className="px-2.5 py-2.5 text-center whitespace-nowrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${gradeColor(cert.grade)}`}>
                            {cert.grade || '—'}
                          </span>
                        </td>
                        <td className="px-2.5 py-2.5 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${cert.scorePercentage >= 90 ? 'bg-purple-500' : cert.scorePercentage >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                style={{ width: `${cert.scorePercentage}%` }}
                              />
                            </div>
                            <span className="font-bold text-slate-700 text-xs">{cert.scorePercentage}%</span>
                          </div>
                        </td>
                        <td className="px-2.5 py-2.5 text-center whitespace-nowrap">
                          <div className="inline-flex items-center gap-1">
                            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusDot(cert.status)}`} />
                            <span className={`font-bold uppercase text-[10px] ${cert.status === 'valid' ? 'text-emerald-700' : 'text-rose-700'}`}>
                              {cert.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-2.5 py-2.5 text-slate-500 text-center whitespace-nowrap text-[11px]">
                          {new Date(cert.issueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-2.5 py-2.5 text-center whitespace-nowrap">
                          <button
                            onClick={() => setSelectedCert(cert)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[10px] font-bold transition cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* TAB 2: CERTIFICATE DESIGN STUDIO */}
      {activeTab === 'design' && (
        <div className="space-y-6">
          {/* Top Course Selector */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Select Course to Customize Certificate Design</h3>
                <p className="text-xs text-slate-400">Choose a course you teach to configure its unique certificate template</p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={selectedCourseForDesign?._id || ''}
                onChange={(e) => {
                  const found = myCourses.find((c) => c._id === e.target.value);
                  if (found) selectCourseForEditing(found);
                }}
                className="w-full md:w-80 text-xs font-semibold border border-slate-300 rounded-lg px-3 py-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {myCourses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.courseCode} — {c.title}
                  </option>
                ))}
              </select>

              <button
                onClick={handleSaveDesign}
                disabled={savingTemplate || !selectedCourseForDesign}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition shadow-sm flex-shrink-0"
              >
                <Check className="w-4 h-4" />
                <span>{savingTemplate ? 'Saving...' : 'Save Certificate Design'}</span>
              </button>
            </div>
          </div>

          {selectedCourseForDesign ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controls Column */}
              <div className="lg:col-span-5 space-y-5">
                {/* Mode Toggle */}
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Custom Background Design Mode</h4>
                      <p className="text-[11px] text-slate-500">Overlay student details directly on top of your imported design image</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={templateForm.useCustomBackground}
                        onChange={(e) => setTemplateForm((p) => ({ ...p, useCustomBackground: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Preset Background Chooser */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Choose From Standard Government Templates
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {PRESET_TEMPLATES.map((tmpl) => (
                        <button
                          key={tmpl.id}
                          type="button"
                          onClick={() => {
                            setTemplateForm((p) => ({
                              ...p,
                              useCustomBackground: true,
                              backgroundUrl: tmpl.url,
                              accentColor: tmpl.accentColor
                            }));
                          }}
                          className={`p-2.5 rounded-lg border text-left transition flex flex-col justify-between h-20 ${
                            templateForm.backgroundUrl === tmpl.url && templateForm.useCustomBackground
                              ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                              : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                          }`}
                        >
                          <span className="text-[11px] font-bold text-slate-800 line-clamp-1">{tmpl.name}</span>
                          <div className="flex items-center justify-between">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: tmpl.accentColor }} />
                            <span className="text-[9px] text-slate-400">Select Preset</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom URL or Image Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Custom Certificate Background Image URL
                    </label>
                    <div className="relative">
                      <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        value={templateForm.backgroundUrl}
                        onChange={(e) => setTemplateForm((p) => ({
                          ...p,
                          backgroundUrl: e.target.value,
                          useCustomBackground: true
                        }))}
                        placeholder="https://example.com/certificate-frame.jpg or PNG"
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Recommended: High resolution landscape image (1200×800 or 1600×1100 px).
                    </p>
                  </div>
                </div>

                {/* Typography & Accent Controls */}
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-600" />
                    <span>Certificate Text & Authority Branding</span>
                  </h4>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Certificate Heading / Title
                    </label>
                    <input
                      type="text"
                      value={templateForm.titleText}
                      onChange={(e) => setTemplateForm((p) => ({ ...p, titleText: e.target.value }))}
                      placeholder="e.g. Certificate of Competency"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold"
                    />
                  </div>

                  {/* Accent Color */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Theme Accent Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={templateForm.accentColor}
                        onChange={(e) => setTemplateForm((p) => ({ ...p, accentColor: e.target.value }))}
                        className="w-10 h-10 p-0.5 border border-slate-300 rounded-lg cursor-pointer"
                      />
                      <div className="flex items-center gap-1.5">
                        {['#b45309', '#0369a1', '#0f172a', '#047857', '#b91c1c'].map((col) => (
                          <button
                            key={col}
                            type="button"
                            onClick={() => setTemplateForm((p) => ({ ...p, accentColor: col }))}
                            className="w-6 h-6 rounded-full border border-white shadow-sm transition hover:scale-110"
                            style={{ backgroundColor: col }}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-600">{templateForm.accentColor}</span>
                    </div>
                  </div>

                  {/* Signatory Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Signatory Authority Name
                    </label>
                    <input
                      type="text"
                      value={templateForm.trainerSignatureName}
                      onChange={(e) => setTemplateForm((p) => ({ ...p, trainerSignatureName: e.target.value }))}
                      placeholder="Enter signatory authority name"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Signatory Designation */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Signatory Designation
                    </label>
                    <input
                      type="text"
                      value={templateForm.trainerSignatureDesignation}
                      onChange={(e) => setTemplateForm((p) => ({ ...p, trainerSignatureDesignation: e.target.value }))}
                      placeholder="e.g. Lead Scientific Trainer, Radar Division"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Save CTA */}
                <button
                  onClick={handleSaveDesign}
                  disabled={savingTemplate}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{savingTemplate ? 'Saving Changes...' : 'Save & Publish Template For This Course'}</span>
                </button>
              </div>

              {/* Live Interactive Certificate Preview */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Live Certificate Preview</h4>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Dynamic Student Overlay</span>
                </div>

                {/* Preview Frame */}
                <div className="bg-slate-100 p-3 rounded-2xl border border-slate-300 shadow-inner overflow-hidden">
                  <div className="bg-white rounded-xl border border-slate-300/80 shadow-lg relative overflow-hidden">
                    {/* Background image if active */}
                    {templateForm.useCustomBackground && templateForm.backgroundUrl ? (
                      <div className="relative w-full aspect-[4/3] max-h-[500px] flex items-center justify-center overflow-hidden">
                        <img
                          src={templateForm.backgroundUrl}
                          alt="Certificate Frame"
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        {/* Overlay text */}
                        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center p-6 bg-white/70 backdrop-blur-[2px]">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2 shadow-sm"
                               style={{ backgroundColor: templateForm.accentColor }}>
                            <Award className="w-5 h-5 text-white" />
                          </div>

                          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-600">
                            Ministry of Earth Sciences (MoES) | IMD
                          </span>

                          <h3 className="text-xl font-bold font-serif my-1" style={{ color: templateForm.accentColor }}>
                            {templateForm.titleText || 'Certificate of Competency'}
                          </h3>

                          <p className="text-[10px] text-slate-500 uppercase tracking-widest my-1">This is to certify that</p>

                          <h2 className="text-2xl font-black font-serif text-slate-900 my-1">
                            DEEP PATEL
                          </h2>

                          <p className="text-[10px] font-mono font-bold text-slate-600">
                            Enrollment No: 2026-IMD-0042
                          </p>

                          <p className="text-[10px] text-slate-600 max-w-sm mt-2">
                            has demonstrated technical competence and successfully passed the examination for
                          </p>

                          <div className="my-2 px-4 py-1.5 rounded-lg font-bold text-xs bg-white/90 border shadow-sm"
                               style={{ borderColor: templateForm.accentColor + '50', color: templateForm.accentColor }}>
                            {selectedCourseForDesign.title}
                          </div>

                          <div className="flex items-center gap-4 text-[10px] text-slate-600 font-semibold my-1">
                            <span>Score: <strong className="text-emerald-700">86% (Distinction)</strong></span>
                            <span>•</span>
                            <span>Cert No: <strong className="font-mono">CC-IMD-2026-0001</strong></span>
                          </div>

                          {/* Signatures */}
                          <div className="w-full flex items-end justify-between px-6 mt-4 pt-2 border-t border-slate-300/60">
                            <div className="text-left">
                              <div className="font-serif italic font-bold text-xs text-slate-800">
                                {templateForm.trainerSignatureName || 'Lead Trainer'}
                              </div>
                              <div className="text-[9px] text-slate-500 font-medium">
                                {templateForm.trainerSignatureDesignation || 'Subject Matter Expert'}
                              </div>
                            </div>
                            <div className="w-12 h-12 bg-slate-100 border border-slate-300 rounded p-1 flex items-center justify-center">
                              <span className="text-[8px] font-mono font-bold text-slate-500 text-center">QR CODE VERIFIED</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Default Government Border Frame Preview */
                      <div className="p-6 border-8 border-double text-center space-y-3"
                           style={{ borderColor: templateForm.accentColor }}>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto shadow-sm"
                             style={{ backgroundColor: templateForm.accentColor }}>
                          <Award className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-600">
                          National Digital Capacity Building Registry
                        </span>
                        <h3 className="text-xl font-bold font-serif" style={{ color: templateForm.accentColor }}>
                          {templateForm.titleText || 'Certificate of Competency'}
                        </h3>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest">This certifies that</p>
                        <h2 className="text-2xl font-black font-serif text-slate-900">
                          DEEP PATEL
                        </h2>
                        <p className="text-[10px] font-mono text-slate-500">Enrollment No: 2026-IMD-0042</p>
                        <div className="px-4 py-2 bg-slate-50 rounded-lg border border-slate-200 inline-block text-xs font-bold text-slate-800">
                          {selectedCourseForDesign.title}
                        </div>
                        <div className="flex items-center justify-around pt-4 border-t border-slate-200 text-left">
                          <div>
                            <div className="font-serif italic font-bold text-xs text-slate-800">
                              {templateForm.trainerSignatureName || 'Authorized Trainer'}
                            </div>
                            <div className="text-[9px] text-slate-500">
                              {templateForm.trainerSignatureDesignation}
                            </div>
                          </div>
                          <div className="w-12 h-12 bg-slate-100 border border-slate-300 rounded p-1 flex items-center justify-center">
                            <span className="text-[8px] font-mono font-bold text-slate-500 text-center">QR VERIFY</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-blue-900">
                  <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">Automated Overlay Rule: </strong>
                    When any student enrolled in this course completes modules and scores 80%+ on the exam, this exact layout, background image, and typography will be snapshotted and issued with their unique certificate number and public tamper-proof QR code.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
              <p className="text-xs text-slate-500">Please select or create a course to configure its certificate template.</p>
            </div>
          )}
        </div>
      )}

      {/* Certificate Modal */}
      {selectedCert && (
        <CertificateModal
          certificate={selectedCert}
          onClose={() => setSelectedCert(null)}
        />
      )}
    </div>
  );
};

export default TrainerCertificatesView;
