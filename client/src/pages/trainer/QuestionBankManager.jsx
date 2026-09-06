import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import {
  CheckSquare,
  Plus,
  BookOpen,
  CheckCircle,
  Trash2,
  HelpCircle,
  Upload,
  Download,
  FileSpreadsheet,
  Eye,
  Users,
  Award,
  Clock,
  Settings2,
  Sparkles,
  AlertCircle,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Calendar,
  X,
  Trophy,
  BarChart3,
  RefreshCw,
  FileDown,
  Loader2
} from 'lucide-react';
import { useToast, useDialog } from '../../context/NotificationContext';
import TrainerHeader from '../../components/TrainerHeader';

const QuestionBankManager = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryCourseId = searchParams.get('courseId');
  const queryTab = searchParams.get('tab');

  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(searchParams.get('courseId') || '');
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deletingQIdx, setDeletingQIdx] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Active Tab: 'questions' | 'submissions'
  const [activeTab, setActiveTab] = useState(queryTab === 'submissions' ? 'submissions' : 'questions');

  // Submissions State
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [submissionSearch, setSubmissionSearch] = useState('');
  const [submissionFilter, setSubmissionFilter] = useState('all'); // 'all' | 'passed' | 'failed'
  const [selectedAttemptDetail, setSelectedAttemptDetail] = useState(null);

  // Settings State
  const [examTitle, setExamTitle] = useState('');
  const [examDuration, setExamDuration] = useState(20);
  const [examPassPercentage, setExamPassPercentage] = useState(60);

  const fileInputRef = useRef(null);
  const toast = useToast();
  const { showConfirm } = useDialog();

  // New Question Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    questionText: '',
    options: ['', '', '', ''],
    correctOptionIndex: 0,
    marks: 2,
    difficulty: 'Medium',
    explanation: ''
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.getTrainerCourses();
        if (res.success && res.courses?.length > 0) {
          setCourses(res.courses);
          const initialCourse = (queryCourseId && res.courses.some(c => c._id === queryCourseId))
            ? queryCourseId
            : res.courses[0]._id;
          setSelectedCourseId(initialCourse);
          if (queryTab === 'submissions') {
            setActiveTab('submissions');
          }
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [queryCourseId, queryTab]);

  const handleExportSubmissionsCSV = () => {
    if (!submissions || submissions.length === 0) {
      toast.info('No student submissions available to export yet.');
      return;
    }

    const headers = ['Enrollment Number', 'Trainee Name', 'Email', 'Department', 'Organization', 'Submission Timestamp', 'Marks Obtained', 'Total Marks', 'Score Percentage', 'Outcome', 'Time Spent'];
    const rows = submissions.map((s) => [
      `"${s.traineeId?.enrollmentNumber || 'N/A'}"`,
      `"${(s.traineeName || s.traineeId?.name || 'Trainee').replace(/"/g, '""')}"`,
      `"${(s.traineeId?.email || '').replace(/"/g, '""')}"`,
      `"${(s.traineeId?.department || 'Meteorological Operations').replace(/"/g, '""')}"`,
      `"${(s.traineeId?.organizationName || 'IMD').replace(/"/g, '""')}"`,
      `"${new Date(s.submittedAt || s.createdAt).toLocaleString('en-IN')}"`,
      s.scoreObtained,
      s.totalPossibleMarks,
      `${s.percentage}%`,
      s.passed ? 'PASSED' : 'RETAKE REQUIRED',
      `"${formatSeconds(s.timeSpentSeconds)}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedCourse?.code || 'Course'}_Exam_Submissions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Exam submissions roster exported to CSV successfully!');
  };

  useEffect(() => {
    if (selectedCourseId) {
      loadAssessment(selectedCourseId);
      loadSubmissions(selectedCourseId);
    }
  }, [selectedCourseId]);

  const loadAssessment = async (courseId) => {
    try {
      const res = await api.getCourseAssessment(courseId);
      if (res.success && res.assessment) {
        setCurrentAssessment(res.assessment);
        setExamTitle(res.assessment.title || 'Comprehensive Examination');
        setExamDuration(res.assessment.durationMinutes || 20);
        setExamPassPercentage(res.assessment.passPercentage || 60);
      } else {
        setCurrentAssessment(null);
      }
    } catch (err) {
      setCurrentAssessment(null);
    }
  };

  const loadSubmissions = async (courseId) => {
    setLoadingSubmissions(true);
    try {
      const res = await api.getCourseSubmissions(courseId);
      if (res.success) {
        setSubmissions(res.submissions || []);
      } else {
        setSubmissions([]);
      }
    } catch (err) {
      setSubmissions([]);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const selectedCourse = courses.find((c) => c._id === selectedCourseId);

  // -------------------------------------------------------------
  // Dynamic XLSX / CSV Loader & Parser
  // -------------------------------------------------------------
  const loadXLSXLib = () => {
    return new Promise((resolve, reject) => {
      if (window.XLSX) return resolve(window.XLSX);
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
      script.onload = () => resolve(window.XLSX);
      script.onerror = () => reject(new Error('Failed to load spreadsheet parser library'));
      document.head.appendChild(script);
    });
  };

  const parseCSVText = (text) => {
    const lines = text.split(/\r\n|\n/).filter((line) => line.trim().length > 0);
    if (lines.length < 2) return [];

    const parseRow = (line) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseRow(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseRow(lines[i]);
      if (values.length >= 5) {
        const rowObj = {};
        headers.forEach((h, idx) => {
          rowObj[h] = values[idx] || '';
        });
        rows.push(rowObj);
      }
    }
    return rows;
  };

  const normalizeQuestionsFromRows = (rawRows) => {
    const parsedQuestions = [];

    rawRows.forEach((row) => {
      const qText = row.question || row.questiontext || row.questionprompt || row.prompt || Object.values(row)[0];
      if (!qText || !qText.toString().trim()) return;

      const optA = row.optiona || row.a || row.option1 || row['1'] || '';
      const optB = row.optionb || row.b || row.option2 || row['2'] || '';
      const optC = row.optionc || row.c || row.option3 || row['3'] || '';
      const optD = row.optiond || row.d || row.option4 || row['4'] || '';

      const options = [optA, optB, optC, optD].map((o) => o.toString().trim());
      if (options.filter((o) => o.length > 0).length < 2) return;

      while (options.length < 4) {
        options.push('');
      }

      const rawAns = (row.correctoption || row.correctanswer || row.answer || row.ans || row.correct || 'A')
        .toString()
        .trim()
        .toUpperCase();

      let correctIdx = 0;
      if (rawAns === 'A' || rawAns === '1' || rawAns === '0') correctIdx = 0;
      else if (rawAns === 'B' || rawAns === '2') correctIdx = 1;
      else if (rawAns === 'C' || rawAns === '3') correctIdx = 2;
      else if (rawAns === 'D' || rawAns === '4') correctIdx = 3;
      else {
        const matchedIdx = options.findIndex((o) => o.toLowerCase() === rawAns.toLowerCase());
        if (matchedIdx !== -1) correctIdx = matchedIdx;
      }

      const difficulty = ['Easy', 'Medium', 'Hard'].includes(row.difficulty) ? row.difficulty : 'Medium';
      const marks = Number(row.marks) || 2;
      const explanation = (row.explanation || row.solution || row.notes || '').toString().trim();

      parsedQuestions.push({
        questionText: qText.toString().trim(),
        options,
        correctOptionIndex: correctIdx,
        marks,
        difficulty,
        explanation
      });
    });

    return parsedQuestions;
  };

  const handleDownloadTemplate = () => {
    const csvContent =
      'Question,Option A,Option B,Option C,Option D,Correct Option,Marks,Difficulty,Explanation\n' +
      '"What does DWR stand for in meteorology?","Doppler Weather Radar","Direct Wind Range","Digital Wave Receiver","Dynamic Water Radiometer","A",2,"Easy","DWR refers to Doppler Weather Radar deployed by IMD."\n' +
      '"Which radar moment is primarily used to track severe thunderstorm rotation?","Radar Reflectivity (Z)","Radial Velocity (V)","Spectrum Width (W)","Differential Reflectivity (ZDR)","B",2,"Medium","Radial velocity displays velocity couples indicating mesocyclone rotation."\n' +
      '"What is the standard frequency band for IMD coastal storm warning radars?","S-band","C-band","X-band","K-band","A",2,"Hard","S-band (2.7-3.0 GHz) penetrates severe tropical rain without major attenuation."\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'MCQ_Questions_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Sample Excel / CSV Question Template downloaded!');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setIsImporting(true);
    try {
      let rawRows = [];

      if (file.name.endsWith('.csv')) {
        const text = await file.text();
        rawRows = parseCSVText(text);
      } else {
        const XLSX = await loadXLSXLib();
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        rawRows = json.map((row) => {
          const clean = {};
          Object.keys(row).forEach((k) => {
            clean[k.toLowerCase().replace(/[^a-z0-9]/g, '')] = row[k];
          });
          return clean;
        });
      }

      const importedQuestions = normalizeQuestionsFromRows(rawRows);

      if (importedQuestions.length === 0) {
        toast.warning('No valid MCQ questions found in the file. Please use the Sample Template format.');
        return;
      }

      const existingQuestions = currentAssessment ? currentAssessment.questions : [];
      const mergedQuestions = [...existingQuestions, ...importedQuestions];

      const res = await api.createAssessment({
        courseId: selectedCourseId,
        title: examTitle || `${selectedCourse?.title || 'Course'} Comprehensive Examination`,
        durationMinutes: Number(examDuration) || 20,
        passPercentage: Number(examPassPercentage) || 60,
        questions: mergedQuestions
      });

      if (res.success) {
        setCurrentAssessment(res.assessment);
        toast.success(`Imported ${importedQuestions.length} MCQ questions! Exam is live for all enrolled students.`);
      }
    } catch (err) {
      console.error('Import error:', err);
      toast.error(err.message || 'Failed to parse Excel file', 'Import Failed');
    } finally {
      setIsImporting(false);
    }
  };

  // -------------------------------------------------------------
  // Manual Add Question
  // -------------------------------------------------------------
  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.questionText || newQuestion.options.some((o) => !o.trim())) {
      toast.warning('Please provide the question prompt and all four options.');
      return;
    }

    try {
      const existingQuestions = currentAssessment ? currentAssessment.questions : [];
      const updatedQuestions = [
        ...existingQuestions,
        {
          questionText: newQuestion.questionText,
          options: newQuestion.options,
          correctOptionIndex: Number(newQuestion.correctOptionIndex),
          marks: Number(newQuestion.marks),
          difficulty: newQuestion.difficulty,
          explanation: newQuestion.explanation
        }
      ];

      const res = await api.createAssessment({
        courseId: selectedCourseId,
        title: examTitle || `${selectedCourse?.title || 'Course'} Comprehensive Examination`,
        durationMinutes: Number(examDuration) || 20,
        passPercentage: Number(examPassPercentage) || 60,
        questions: updatedQuestions
      });

      if (res.success) {
        toast.success('Question added successfully and published to live exam!');
        setCurrentAssessment(res.assessment);
        setShowAddForm(false);
        setNewQuestion({
          questionText: '',
          options: ['', '', '', ''],
          correctOptionIndex: 0,
          marks: 2,
          difficulty: 'Medium',
          explanation: ''
        });
      }
    } catch (err) {
      toast.error(err.message, 'Question Bank Error');
    }
  };

  // -------------------------------------------------------------
  // Delete Question
  // -------------------------------------------------------------
  const handleDeleteQuestion = async (indexToDelete) => {
    if (!currentAssessment) return;
    const confirmed = await showConfirm({
      title: 'Delete Question',
      message: `Are you sure you want to remove Question #${indexToDelete + 1} from this exam?`,
      confirmText: 'Delete Question',
      cancelText: 'Keep',
      type: 'danger'
    });
    if (!confirmed) return;

    setDeletingQIdx(indexToDelete);
    try {
      const updatedQuestions = currentAssessment.questions.filter((_, idx) => idx !== indexToDelete);
      const res = await api.createAssessment({
        courseId: selectedCourseId,
        title: currentAssessment.title,
        durationMinutes: currentAssessment.durationMinutes,
        passPercentage: currentAssessment.passPercentage,
        questions: updatedQuestions
      });

      if (res.success) {
        toast.success(`Question #${indexToDelete + 1} removed.`);
        setCurrentAssessment(res.assessment);
      }
    } catch (err) {
      toast.error(err.message || 'Error removing question');
    } finally {
      setDeletingQIdx(null);
    }
  };

  // -------------------------------------------------------------
  // Save Settings
  // -------------------------------------------------------------
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const existingQuestions = currentAssessment ? currentAssessment.questions : [];
      const res = await api.createAssessment({
        courseId: selectedCourseId,
        title: examTitle,
        durationMinutes: Number(examDuration),
        passPercentage: Number(examPassPercentage),
        questions: existingQuestions
      });

      if (res.success) {
        toast.success('Exam settings updated and synced for enrolled students!');
        setCurrentAssessment(res.assessment);
        setShowSettings(false);
      }
    } catch (err) {
      toast.error(err.message, 'Settings Error');
    }
  };

  // -------------------------------------------------------------
  // Filtered Submissions Logic & Stats
  // -------------------------------------------------------------
  const filteredSubmissions = submissions.filter((sub) => {
    const studentName = sub.traineeName || sub.traineeId?.name || '';
    const studentEmail = sub.traineeId?.email || '';
    const enrollmentNo = sub.traineeId?.enrollmentNumber || '';
    const dept = sub.traineeId?.department || '';

    const matchesSearch =
      studentName.toLowerCase().includes(submissionSearch.toLowerCase()) ||
      studentEmail.toLowerCase().includes(submissionSearch.toLowerCase()) ||
      enrollmentNo.toLowerCase().includes(submissionSearch.toLowerCase()) ||
      dept.toLowerCase().includes(submissionSearch.toLowerCase());

    if (!matchesSearch) return false;
    if (submissionFilter === 'passed') return sub.passed;
    if (submissionFilter === 'failed') return !sub.passed;
    return true;
  });

  const passedSubmissions = submissions.filter((s) => s.passed);
  const passRate = submissions.length > 0 ? Math.round((passedSubmissions.length / submissions.length) * 100) : 0;
  const avgScore =
    submissions.length > 0
      ? Math.round(submissions.reduce((acc, s) => acc + (s.percentage || 0), 0) / submissions.length)
      : 0;
  const highestScore =
    submissions.length > 0 ? Math.max(...submissions.map((s) => s.percentage || 0)) : 0;

  const formatSeconds = (sec) => {
    if (!sec && sec !== 0) return 'N/A';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 select-none max-w-7xl mx-auto">
      {/* Executive Trainer Header */}
      <TrainerHeader
        title="Exam Assessment & Question Bank Studio"
        subtitle="Formulate multiple-choice questions, calibrate pass criteria & durations, import Excel item banks, and monitor cohort test attempts."
        badge="Assessment Governance"
        actions={
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-white text-xs">
            <span className="font-semibold text-indigo-200">Active Course:</span>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="bg-slate-900/80 text-white font-bold text-xs rounded-lg px-2.5 py-1 border border-white/15 outline-none cursor-pointer"
            >
              {courses.map((c) => (
                <option key={c._id} value={c._id} className="bg-slate-900 text-white">
                  {c.code} - {c.title}
                </option>
              ))}
            </select>
          </div>
        }
      />

      {/* Live Trainee Enrolled Status Banner */}
      <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start sm:items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse mt-1 sm:mt-0 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-emerald-950 flex flex-wrap items-center gap-2">
              <span>Examination Published & Live for Enrolled Students</span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                {selectedCourse?.enrolledCount || 0} Trainees Enrolled
              </span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-indigo-100 text-indigo-800 font-bold border border-indigo-200">
                {submissions.length} Submissions Received
              </span>
            </h4>
            <p className="text-[11px] text-emerald-800 mt-0.5">
              All students enrolled in this course can immediately take this exam from their <strong>My Enrolled Courses & Exams</strong> portal or Course Player.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <Link
            to={`/trainee/assessment/${selectedCourseId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs rounded-xl shadow-2xs transition flex items-center space-x-1.5 cursor-pointer"
            title="Open Exam Player as a Student in New Tab"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-700" />
            <span>Preview Exam as Student</span>
          </Link>
        </div>
      </div>

      {/* Assessment Overview Bar with Action Buttons */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
              Official Examination
            </span>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs font-semibold text-slate-600">Passing: {examPassPercentage}%</span>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs font-semibold text-slate-600">Duration: {examDuration} Mins</span>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs font-bold text-slate-800">
              Total Marks: {currentAssessment?.questions?.reduce((acc, q) => acc + (Number(q.marks) || 2), 0) || 0}
            </span>
          </div>

          <h3 className="font-extrabold text-base text-slate-900 mt-1.5">
            {currentAssessment?.title || examTitle}
          </h3>
        </div>

        {/* Action Buttons: Template, Excel Import, Add Question, Settings */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Settings Button */}
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
            title="Configure Exam Settings (Duration, Pass %)"
          >
            <Settings2 className="w-4 h-4" />
          </button>

          {/* Download Template */}
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center space-x-1.5 cursor-pointer"
            title="Download formatted Excel/CSV template with sample MCQs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Sample Template</span>
          </button>

          {/* Import Excel / CSV Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 transition cursor-pointer disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{isImporting ? 'Importing Excel...' : 'Import Excel / CSV'}</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />

          {/* Manual Add Question Button */}
          <button
            type="button"
            onClick={() => {
              setShowAddForm(!showAddForm);
              setActiveTab('questions');
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? 'Cancel' : 'Add New Question'}</span>
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <form onSubmit={handleSaveSettings} className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4 text-xs animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Settings2 className="w-4 h-4 text-indigo-600" />
              <span>Exam Configuration & Governance</span>
            </h4>
            <span className="text-[11px] text-slate-500">Applies to all trainees taking this exam</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1 sm:col-span-1">
              <label className="font-semibold text-slate-700">Examination Title</label>
              <input
                type="text"
                placeholder="e.g. Comprehensive Final Examination"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Duration (Minutes)</label>
              <input
                type="number"
                min="5"
                max="180"
                value={examDuration}
                onChange={(e) => setExamDuration(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Passing Score (%)</label>
              <input
                type="number"
                min="30"
                max="100"
                value={examPassPercentage}
                onChange={(e) => setExamPassPercentage(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm"
            >
              Save & Sync Settings
            </button>
          </div>
        </form>
      )}

      {/* Manual Add Question Form */}
      {showAddForm && (
        <form onSubmit={handleAddQuestion} className="bg-white rounded-2xl border-2 border-indigo-200 p-6 shadow-md space-y-4 text-xs animate-in fade-in">
          <h3 className="font-bold text-sm text-slate-900 pb-2 border-b">Add Question to Examination Bank</h3>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Question Prompt *</label>
            <textarea
              rows={2}
              required
              placeholder="e.g., Which radar moment is primarily used to estimate severe rain rate precipitation (mm/hr)?"
              value={newQuestion.questionText}
              onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {newQuestion.options.map((opt, optIdx) => (
              <div key={optIdx} className="space-y-1">
                <label className="font-semibold text-slate-600 flex items-center justify-between">
                  <span>Option {String.fromCharCode(65 + optIdx)}</span>
                  <input
                    type="radio"
                    name="correctOption"
                    checked={newQuestion.correctOptionIndex === optIdx}
                    onChange={() => setNewQuestion({ ...newQuestion, correctOptionIndex: optIdx })}
                    title="Mark as correct answer"
                  />
                </label>
                <input
                  type="text"
                  required
                  placeholder={`Option ${String.fromCharCode(65 + optIdx)} text`}
                  value={opt}
                  onChange={(e) => {
                    const updated = [...newQuestion.options];
                    updated[optIdx] = e.target.value;
                    setNewQuestion({ ...newQuestion, options: updated });
                  }}
                  className="w-full p-2 bg-slate-50 border rounded-lg text-xs"
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Difficulty</label>
              <select
                value={newQuestion.difficulty}
                onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: e.target.value })}
                className="w-full p-2 bg-slate-50 border rounded-lg text-xs"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Marks</label>
              <input
                type="number"
                value={newQuestion.marks}
                onChange={(e) => setNewQuestion({ ...newQuestion, marks: Number(e.target.value) })}
                className="w-full p-2 bg-slate-50 border rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Official Solution Explanation</label>
            <input
              type="text"
              placeholder="Explain why this answer is scientifically correct according to IMD guidelines..."
              value={newQuestion.explanation}
              onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
              className="w-full p-2 bg-slate-50 border rounded-lg text-xs"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow cursor-pointer"
            >
              Save & Publish Question
            </button>
          </div>
        </form>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TWO TABS: 1. Active Question Bank | 2. Student Submissions    */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center space-x-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('questions')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition flex items-center space-x-2 cursor-pointer ${
            activeTab === 'questions'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Active Questions ({currentAssessment?.questions?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('submissions')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition flex items-center space-x-2 cursor-pointer ${
            activeTab === 'submissions'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Student Exam Submissions</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              submissions.length > 0 ? 'bg-emerald-100 text-emerald-800 font-bold' : 'bg-slate-100 text-slate-500'
            }`}
          >
            {submissions.length}
          </span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: ACTIVE QUESTIONS                                       */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'questions' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800 flex items-center space-x-2">
              <CheckSquare className="w-4 h-4 text-indigo-600" />
              <span>Questions in this Examination ({currentAssessment?.questions?.length || 0})</span>
            </h3>

            {currentAssessment?.questions?.length > 0 && (
              <span className="text-xs text-slate-500 font-medium">
                Live for all {selectedCourse?.enrolledCount || 0} enrolled trainees
              </span>
            )}
          </div>

          {!currentAssessment?.questions || currentAssessment.questions.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 text-slate-500 text-xs space-y-3 shadow-xs">
              <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="font-bold text-slate-700 text-sm">No Questions in Examination Bank Yet</div>
              <p className="max-w-md mx-auto text-slate-500">
                Upload an Excel (.xlsx / .csv) file containing your MCQs or click "Add New Question" to begin authoring.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition inline-flex items-center space-x-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample Template</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition inline-flex items-center space-x-1.5 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Import from Excel</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {currentAssessment.questions.map((q, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3 text-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div className="font-bold text-slate-900 text-sm flex-1">
                      Q{idx + 1}. {q.questionText}
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-md font-mono font-semibold text-[10px]">
                        {q.difficulty}
                      </span>
                      <span className="bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-md font-mono font-bold text-[10px] border border-indigo-100">
                        {q.marks} Marks
                      </span>
                      <button
                        type="button"
                        disabled={deletingQIdx === idx}
                        onClick={() => handleDeleteQuestion(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete Question"
                      >
                        {deletingQIdx === idx ? (
                          <Loader2 className="w-3.5 h-3.5 text-rose-500 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options.map((opt, optIdx) => (
                      <div
                        key={optIdx}
                        className={`p-2.5 rounded-xl border flex items-center space-x-2 ${
                          optIdx === q.correctOptionIndex
                            ? 'bg-emerald-50/90 border-emerald-300 text-emerald-900 font-semibold ring-1 ring-emerald-400/30'
                            : 'bg-slate-50/80 border-slate-200 text-slate-600'
                        }`}
                      >
                        <span className="font-bold text-slate-700">{String.fromCharCode(65 + optIdx)}.</span>
                        <span className="flex-1">{opt}</span>
                        {optIdx === q.correctOptionIndex && (
                          <span className="text-[10px] ml-auto text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200">
                            ✓ CORRECT
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {q.explanation && (
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
                      <strong className="text-slate-700">Official Solution: </strong> {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: STUDENT EXAM SUBMISSIONS & RESULTS                     */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'submissions' && (
        <div className="space-y-5 animate-in fade-in">
          {/* Submissions KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs">
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-semibold">Submissions</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1">{submissions.length}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Enrolled: {selectedCourse?.enrolledCount || 0}</div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-semibold">Pass Rate</span>
                <Trophy className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-600 mt-1">{passRate}%</div>
              <div className="text-[11px] text-emerald-700 font-medium mt-0.5">{passedSubmissions.length} Passed</div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-semibold">Average Score</span>
                <BarChart3 className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-black text-indigo-600 mt-1">{avgScore}%</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Cutoff: {examPassPercentage}%</div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-semibold">Top Score</span>
                <Award className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-amber-600 mt-1">{highestScore}%</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Highest Mark</div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search student by name, email, or dept..."
                  value={submissionSearch}
                  onChange={(e) => setSubmissionSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="font-semibold text-slate-500 mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filter:</span>
                </span>
                <button
                  type="button"
                  onClick={() => setSubmissionFilter('all')}
                  className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                    submissionFilter === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  All ({submissions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSubmissionFilter('passed')}
                  className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                    submissionFilter === 'passed'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  Passed ({passedSubmissions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSubmissionFilter('failed')}
                  className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                    submissionFilter === 'failed'
                      ? 'bg-rose-600 text-white'
                      : 'bg-white border border-slate-200 text-rose-700 hover:bg-rose-50'
                  }`}
                >
                  Failed ({submissions.length - passedSubmissions.length})
                </button>

                <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

                <button
                  type="button"
                  onClick={handleExportSubmissionsCSV}
                  className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                  title="Download CSV report of all student exam submissions"
                >
                  <FileDown className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Export CSV</span>
                </button>

                <button
                  type="button"
                  onClick={() => loadSubmissions(selectedCourseId)}
                  disabled={loadingSubmissions}
                  className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs disabled:opacity-50"
                  title="Refresh student submission list"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${loadingSubmissions ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Scroll Indicator Info Banner */}
            {filteredSubmissions.length > 0 && (
              <div className="px-4 py-2 bg-indigo-50/70 border-b border-indigo-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-indigo-950">
                <div className="font-semibold flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Showing <strong>{filteredSubmissions.length}</strong> of <strong>{submissions.length}</strong> trainee examination records</span>
                </div>
                <div className="text-indigo-600 font-medium">
                  Official course examination grade roster and submitted trainee answer records.
                </div>
              </div>
            )}

            {/* Scrollable Submissions Table Container */}
            <div className="overflow-x-auto max-h-[520px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 hover:scrollbar-thumb-slate-400">
              <table className="w-full text-left text-xs text-slate-700 divide-y divide-slate-200">
                <thead className="bg-slate-100/80 text-slate-700 font-bold text-[11px] uppercase tracking-wider sticky top-0 z-10 backdrop-blur-sm">
                  <tr>
                    <th className="py-2.5 px-3">Trainee / Forecaster</th>
                    <th className="py-2.5 px-2.5 text-center whitespace-nowrap">Enrollment No</th>
                    <th className="py-2.5 px-2.5">Unit / Dept</th>
                    <th className="py-2.5 px-2.5 whitespace-nowrap">Submission Date</th>
                    <th className="py-2.5 px-2.5 text-center whitespace-nowrap">Marks</th>
                    <th className="py-2.5 px-2.5 text-center whitespace-nowrap">Percentage</th>
                    <th className="py-2.5 px-2.5 text-center whitespace-nowrap">Outcome</th>
                    <th className="py-2.5 px-2 text-center whitespace-nowrap">Time</th>
                    <th className="py-2.5 px-3 text-center whitespace-nowrap w-28">Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingSubmissions ? (
                    <tr>
                      <td colSpan="9" className="py-12 text-center text-slate-400">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto mb-2" />
                        <span>Loading student exam submissions...</span>
                      </td>
                    </tr>
                  ) : filteredSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="py-12 text-center text-slate-400">
                        <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                        <div className="font-bold text-slate-700 text-sm">No Exam Submissions Yet</div>
                        <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                          When enrolled trainees take and submit this course examination, their full score sheets, answers, and time logs will appear in this registry.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredSubmissions.map((sub) => {
                      const studentName = sub.traineeName || sub.traineeId?.name || 'Unknown Trainee';
                      const studentEmail = sub.traineeId?.email || '';
                      const studentEnrollment = sub.traineeId?.enrollmentNumber || 'N/A';
                      const studentDept = sub.traineeId?.department || 'Meteorological Operations';
                      const dateStr = sub.submittedAt || sub.createdAt;
                      const formattedDate = dateStr
                        ? new Date(dateStr).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Just now';

                      const initials = studentName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase();

                      return (
                        <tr key={sub._id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-3">
                            <div className="flex items-center space-x-2.5">
                              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-200 shrink-0">
                                {initials}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 truncate max-w-[140px]" title={studentName}>{studentName}</div>
                                {studentEmail && <div className="text-[10px] text-slate-400 truncate max-w-[140px]" title={studentEmail}>{studentEmail}</div>}
                              </div>
                            </div>
                          </td>

                          <td className="py-2.5 px-2.5 text-center whitespace-nowrap">
                            <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                              {studentEnrollment}
                            </span>
                          </td>

                          <td className="py-2.5 px-2.5">
                            <span className="font-medium text-slate-600 truncate max-w-[110px] block" title={studentDept}>{studentDept}</span>
                          </td>

                          <td className="py-2.5 px-2.5 whitespace-nowrap text-slate-600 text-[11px]">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>{formattedDate}</span>
                            </div>
                          </td>

                          <td className="py-2.5 px-2.5 font-mono font-bold text-slate-800 text-center whitespace-nowrap">
                            {sub.scoreObtained} / {sub.totalPossibleMarks}
                          </td>

                          <td className="py-2.5 px-2.5 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center space-x-1.5">
                              <div className="w-10 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full ${sub.passed ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                  style={{ width: `${Math.min(100, sub.percentage)}%` }}
                                />
                              </div>
                              <span className={`font-mono font-bold text-xs ${sub.passed ? 'text-emerald-700' : 'text-rose-700'}`}>
                                {sub.percentage}%
                              </span>
                            </div>
                          </td>

                          <td className="py-2.5 px-2.5 text-center whitespace-nowrap">
                            {sub.passed ? (
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

                          <td className="py-2.5 px-2 text-center text-slate-500 font-mono text-[11px] whitespace-nowrap">
                            {formatSeconds(sub.timeSpentSeconds)}
                          </td>

                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setSelectedAttemptDetail(sub)}
                              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg border border-indigo-200 transition inline-flex items-center space-x-1 cursor-pointer text-xs"
                              title="Inspect Detailed Question Responses"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Answers</span>
                            </button>
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
              <span>Showing {filteredSubmissions.length} of {submissions.length} total exam records</span>
              <button
                type="button"
                onClick={() => loadSubmissions(selectedCourseId)}
                className="text-indigo-600 font-semibold hover:underline cursor-pointer"
              >
                ↻ Refresh Submissions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* STUDENT DETAILED ANSWER SHEET MODAL                           */}
      {/* ------------------------------------------------------------- */}
      {selectedAttemptDetail && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
          onClick={() => setSelectedAttemptDetail(null)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] flex flex-col relative animate-in zoom-in-95"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedAttemptDetail.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {selectedAttemptDetail.passed ? 'PASSED EXAMINATION' : 'FAILED / RETAKE'}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-mono text-slate-600">
                    Score: <strong>{selectedAttemptDetail.scoreObtained} / {selectedAttemptDetail.totalPossibleMarks} ({selectedAttemptDetail.percentage}%)</strong>
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">
                  Response Sheet: {selectedAttemptDetail.traineeName || selectedAttemptDetail.traineeId?.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedAttemptDetail.traineeId?.email || 'N/A'} • Submitted on{' '}
                  {new Date(selectedAttemptDetail.submittedAt || selectedAttemptDetail.createdAt).toLocaleString('en-IN')}
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
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs max-h-[60vh] scrollbar-thin scrollbar-thumb-slate-300 hover:scrollbar-thumb-slate-400">
              {(() => {
                const qList = (currentAssessment?.questions?.length ? currentAssessment.questions : null)
                  || (selectedAttemptDetail.assessmentId?.questions?.length ? selectedAttemptDetail.assessmentId.questions : null)
                  || selectedAttemptDetail.answers?.map((a, i) => ({
                      questionText: a.questionText || `Question ${a.questionIndex !== undefined ? a.questionIndex + 1 : i + 1}`,
                      options: a.options?.length ? a.options : ['Option A', 'Option B', 'Option C', 'Option D'],
                      correctOptionIndex: a.correctOptionIndex,
                      marks: a.marksAwarded || 2,
                      explanation: a.explanation
                    }))
                  || [];

                return qList.map((q, qIdx) => {
                  const studentAnswer = (selectedAttemptDetail.answers || []).find((a) => a.questionIndex === qIdx)
                    || selectedAttemptDetail.answers?.[qIdx];
                  const selectedOptionIdx = studentAnswer?.selectedOption;
                  const isCorrect = studentAnswer?.isCorrect;
                  const correctIdx = q.correctOptionIndex !== undefined ? q.correctOptionIndex : studentAnswer?.correctOptionIndex;

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

                      <div className="space-y-1 pt-1">
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
                            className={`p-2 rounded-lg border flex items-center justify-between text-[11px] ${optClass}`}
                          >
                            <div className="flex items-center space-x-2">
                              <span className="font-mono font-bold">{String.fromCharCode(65 + optIdx)}.</span>
                              <span>{opt}</span>
                            </div>
                            {isStudentChoice && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-white">
                                Student Choice
                              </span>
                            )}
                            {!isStudentChoice && isTheCorrectChoice && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900">
                                Correct Answer
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <p className="text-[11px] text-slate-500 pt-1">
                        <strong>Explanation:</strong> {q.explanation}
                      </p>
                    )}
                    </div>
                  );
                });
              })()}
            </div>

            {/* Modal Footer */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
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

export default QuestionBankManager;
