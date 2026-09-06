import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../../services/api';
import TrainerHeader from '../../components/TrainerHeader';
import {
  Users,
  UserPlus,
  Upload,
  Download,
  FileSpreadsheet,
  Key,
  Shield,
  Search,
  Filter,
  Copy,
  Check,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  FileDown,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  BookOpen,
  GraduationCap,
  Award,
  Trophy,
  BarChart3,
  Clock,
  Calendar,
  CheckSquare,
  Loader2,
  Building2,
  Printer,
  QrCode,
  TrendingUp,
  ExternalLink
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useToast, useDialog } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import CustomDropdown from '../../components/CustomDropdown';

const StudentOnboardingManager = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isPlatformAdmin = user && (user.role === 'platform_super_admin' || user.role === 'platform_admin' || user.role === 'admin');
  const isScopedToOrg = !isPlatformAdmin && Boolean(user?.organizationName || user?.organizationId || user?.role === 'institute_admin' || user?.role === 'org_admin' || user?.role === 'trainer');
  const userOrgName = user?.organizationName || '';
  // Navigation Tab: 'roster' | 'exams'
  const [activeTab, setActiveTab] = useState('roster');

  // Students & Courses State
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [organizationsList, setOrganizationsList] = useState([]);
  const [deletingStudentId, setDeletingStudentId] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [instituteFilter, setInstituteFilter] = useState('all');

  // Exam Submissions State
  const [examSubmissions, setExamSubmissions] = useState([]);
  const [loadingExams, setLoadingExams] = useState(false);
  const [examSearch, setExamSearch] = useState('');
  const [examFilter, setExamFilter] = useState('all'); // 'all' | 'passed' | 'failed'
  const [examCourseFilter, setExamCourseFilter] = useState('all');
  const [selectedAttemptDetail, setSelectedAttemptDetail] = useState(null);

  // Feature 1: Printable ID & Credential Slips Modal State
  const [showSlipsModal, setShowSlipsModal] = useState(false);
  const [slipInstituteTarget, setSlipInstituteTarget] = useState('all');
  const [slipSingleStudent, setSlipSingleStudent] = useState(null);

  // Feature 2: Institute Performance & Analytics Modal State
  const [selectedInstituteModal, setSelectedInstituteModal] = useState(null);

  // Excel Import Preview Modal State
  const [parsedPreview, setParsedPreview] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [showPasswordMap, setShowPasswordMap] = useState({});

  // Single Manual Student Form Modal
  const [showSingleForm, setShowSingleForm] = useState(false);
  const [singleStudent, setSingleStudent] = useState({
    name: '',
    enrollmentNumber: '',
    email: '',
    organizationName: user?.organizationName || '',
    department: '',
    designation: '',
    mobile: ''
  });
  const [savingSingle, setSavingSingle] = useState(false);

  // Sync user's organization name if loaded asynchronously
  useEffect(() => {
    if (user?.organizationName && !singleStudent.organizationName) {
      setSingleStudent(prev => ({ ...prev, organizationName: user.organizationName }));
    }
  }, [user?.organizationName]);

  const fileInputRef = useRef(null);
  const toast = useToast();
  const { showConfirm } = useDialog();

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        api.getStudents(),
        api.getTrainerCourses ? api.getTrainerCourses() : Promise.resolve({ success: true, courses: [] }),
        api.getStudentExamSubmissions ? api.getStudentExamSubmissions() : Promise.resolve({ success: true, submissions: [] }),
        api.getOrganizations ? api.getOrganizations() : Promise.resolve({ success: true, organizations: [] })
      ]);

      const [stuRes, courseRes, examRes, orgRes] = results.map(r => r.status === 'fulfilled' ? r.value : null);

      if (stuRes?.success) setStudents(stuRes.students || []);
      if (courseRes?.success) setCourses(courseRes.courses || []);
      if (examRes?.success) setExamSubmissions(examRes.submissions || []);
      if (orgRes?.success) setOrganizationsList(orgRes.organizations || []);
    } catch (err) {
      console.error('Error loading student roster and exam submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshStudents = async () => {
    try {
      const res = await api.getStudents();
      if (res.success) {
        setStudents(res.students || []);
        toast.success('Trainee roster refreshed successfully.');
      }
    } catch (err) {
      toast.error('Failed to refresh students roster.');
    }
  };

  const refreshExamSubmissions = async () => {
    setLoadingExams(true);
    try {
      const res = await api.getStudentExamSubmissions();
      if (res.success) {
        setExamSubmissions(res.submissions || []);
        toast.success('Student exam submissions refreshed.');
      }
    } catch (err) {
      toast.error('Failed to refresh exam submissions.');
    } finally {
      setLoadingExams(false);
    }
  };

  // Helper to extract password as last 6 digits of enrollment
  const extractLast6Digits = (enrollment) => {
    if (!enrollment) return '123456';
    const clean = String(enrollment).trim();
    const digitsOnly = clean.replace(/\D/g, '');
    if (digitsOnly.length >= 6) return digitsOnly.slice(-6);
    if (clean.length >= 6) return clean.slice(-6);
    return clean.padStart(6, '0');
  };

  const formatSeconds = (sec) => {
    if (!sec && sec !== 0) return 'N/A';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  const copyToClipboard = (text, message = 'Copied to clipboard!') => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  // Toggle password visibility for specific student row
  const toggleRowPassword = (id) => {
    setShowPasswordMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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
          inQuotes = !inQuotes;
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
      const cells = parseRow(lines[i]);
      if (cells.length > 0 && cells.some((c) => c.length > 0)) {
        const rowObj = {};
        headers.forEach((h, idx) => {
          rowObj[h] = cells[idx] || '';
        });
        rows.push(rowObj);
      }
    }
    return rows;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const fileName = file.name.toLowerCase();
      let rawData = [];

      if (fileName.endsWith('.csv')) {
        const text = await file.text();
        rawData = parseCSVText(text);
      } else {
        const XLSX = await loadXLSXLib();
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // 1. Read sheet as 2D array to automatically detect header row even if there are top blank/title rows
        const sheetRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '', raw: false });

        if (sheetRows && sheetRows.length > 0) {
          let headerRowIdx = -1;
          for (let r = 0; r < Math.min(sheetRows.length, 10); r++) {
            const rowCells = (sheetRows[r] || []).map((c) =>
              String(c || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '')
            );
            const hasId = rowCells.some(
              (v) => v.includes('enroll') || v.includes('roll') || v.includes('studentid') || v === 'id' || v === 'enr'
            );
            const hasName = rowCells.some((v) => v.includes('name'));
            if (hasId || hasName) {
              headerRowIdx = r;
              break;
            }
          }

          if (headerRowIdx !== -1) {
            const rawHeaders = sheetRows[headerRowIdx];
            for (let r = headerRowIdx + 1; r < sheetRows.length; r++) {
              const cells = sheetRows[r];
              if (!cells || cells.length === 0 || !cells.some((c) => String(c || '').trim().length > 0)) continue;
              const rowObj = {};
              rawHeaders.forEach((h, idx) => {
                const normKey = String(h || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
                if (normKey) {
                  rowObj[normKey] = cells[idx] !== undefined ? cells[idx] : '';
                }
              });
              rawData.push(rowObj);
            }
          } else {
            // Fallback: standard sheet_to_json with normalized keys
            const rawObjs = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: false });
            rawData = rawObjs.map((obj) => {
              const normObj = {};
              Object.keys(obj || {}).forEach((k) => {
                const normKey = String(k).trim().toLowerCase().replace(/[^a-z0-9]/g, '');
                normObj[normKey] = obj[k];
              });
              return normObj;
            });
          }
        }
      }

      if (!rawData || rawData.length === 0) {
        toast.error('The selected file appears to be empty or has no data rows.', 'Import Notice');
        return;
      }

      // Map raw rows into standardized student objects
      const parsedStudents = [];
      rawData.forEach((row) => {
        // Ensure all keys in row are normalized to lowercase alphanumeric
        const norm = {};
        Object.keys(row || {}).forEach((k) => {
          norm[String(k).trim().toLowerCase().replace(/[^a-z0-9]/g, '')] = row[k];
        });

        // 1. Enrollment Number (check common synonyms)
        const rawEnrollment =
          norm.enrollmentnumber ??
          norm.enrollmentno ??
          norm.enrollment ??
          norm.enrollno ??
          norm.rollnumber ??
          norm.rollno ??
          norm.roll ??
          norm.studentid ??
          norm.studentno ??
          norm.traineeid ??
          norm.registrationno ??
          norm.regno ??
          norm.idnumber ??
          norm.id ??
          '';

        // 2. Full Name (check common synonyms)
        const rawName =
          norm.fullname ??
          norm.name ??
          norm.studentname ??
          norm.traineename ??
          norm.candidate ??
          norm.candidatename ??
          norm.student ??
          '';

        if (rawEnrollment && rawName) {
          // Format enrollment number (handle scientific notation e.g. 2.50044E+13 and trailing .0)
          let cleanEnrollment = String(rawEnrollment).trim();
          if (/[eE][+-]?\d+/.test(cleanEnrollment)) {
            const num = Number(cleanEnrollment);
            if (!isNaN(num)) {
              cleanEnrollment = num.toLocaleString('fullwide', { useGrouping: false });
            }
          }
          if (cleanEnrollment.endsWith('.0')) {
            cleanEnrollment = cleanEnrollment.slice(0, -2);
          }

          const plainPassword = extractLast6Digits(cleanEnrollment);

          // Email
          const rawEmail =
            norm.email ||
            norm.officialemail ||
            norm.emailid ||
            norm.emailaddress ||
            norm.studentemail ||
            norm.mail ||
            '';
          const cleanEmail = (
            rawEmail || `${cleanEnrollment.toLowerCase().replace(/[^a-z0-9]/g, '')}@imd.gov.in`
          )
            .trim()
            .toLowerCase();

          // Department
          const department =
            norm.department ||
            norm.dept ||
            norm.branch ||
            norm.batch ||
            norm.stream ||
            norm.class ||
            'Meteorological Operations';

          // Institute / Organization
          const rawOrg =
            norm.organizationname ||
            norm.organization ||
            norm.org ||
            norm.institute ||
            norm.institutename ||
            norm.institution ||
            norm.college ||
            norm.collegename ||
            norm.university ||
            norm.universityname ||
            norm.center ||
            norm.centre ||
            '';

          // Designation
          const designation =
            norm.designation ||
            norm.role ||
            norm.post ||
            norm.occupation ||
            norm.status ||
            'Student';

          // Mobile (handle scientific notation e.g. 9.88E+09)
          let rawMobile = norm.mobile ?? norm.phone ?? norm.contact ?? norm.contactnumber ?? norm.mobilenumber ?? '';
          let cleanMobile = String(rawMobile).trim();
          if (/[eE][+-]?\d+/.test(cleanMobile)) {
            const num = Number(cleanMobile);
            if (!isNaN(num)) {
              cleanMobile = num.toLocaleString('fullwide', { useGrouping: false });
            }
          }
          if (cleanMobile.endsWith('.0')) {
            cleanMobile = cleanMobile.slice(0, -2);
          }

          parsedStudents.push({
            enrollmentNumber: cleanEnrollment,
            name: String(rawName).trim(),
            email: cleanEmail,
            plainPassword,
            organizationName: isScopedToOrg
              ? (userOrgName || String(rawOrg).trim() || 'India Meteorological Department (IMD)')
              : (String(rawOrg).trim() || user?.organizationName || 'India Meteorological Department (IMD)'),
            department: String(department).trim(),
            designation: String(designation).trim(),
            mobile: cleanMobile
          });
        }
      });

      if (parsedStudents.length === 0) {
        toast.error(
          'Could not find valid columns. Please ensure columns include "EnrollmentNumber" and "FullName".',
          'Import Error'
        );
        return;
      }

      setParsedPreview(parsedStudents);
    } catch (err) {
      console.error('File parsing error:', err);
      toast.error(err.message || 'Failed to parse spreadsheet file', 'File Error');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleConfirmImport = async () => {
    if (!parsedPreview || parsedPreview.length === 0) return;

    setIsImporting(true);
    try {
      const res = await api.bulkImportStudents({
        students: parsedPreview,
        courseId: selectedCourseId || undefined
      });

      if (res.success) {
        toast.success(
          `Successfully onboarded ${res.count} trainees! Student IDs & 6-digit passwords are ready for login.`,
          'Import Complete'
        );
        setParsedPreview(null);
        refreshStudents();
      } else {
        toast.error(res.message || 'Failed to import trainees');
      }
    } catch (err) {
      toast.error(err.message || 'Bulk onboarding failed', 'Server Error');
    } finally {
      setIsImporting(false);
    }
  };

  // Download Sample Excel/CSV Template
  const handleDownloadTemplate = () => {
    const csvContent =
      'EnrollmentNumber,FullName,Email,Institute,Department,Designation,Mobile\n' +
      'IMD2026101101,Aarav Patel,aarav.patel@imd.gov.in,Lok Jagruti Kendra University,Radar Meteorology Division,Junior Forecaster,9876543210\n' +
      'IMD2026101102,Pooja Sharma,pooja.sharma@imd.gov.in,Lok Jagruti Kendra University,Satellite Nowcasting Section,Scientist B,9876543211\n' +
      'IMD2026101103,Rohan Verma,rohan.verma@imd.gov.in,India Meteorological Department (IMD),NWP Modeling Unit,Scientific Officer,9876543212\n' +
      'IMD2026101104,Sneha Joshi,sneha.joshi@imd.gov.in,IITM Pune,Cyclone Warning Centre,Operational Trainee,9876543213\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Trainee_Student_Import_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Sample spreadsheet template downloaded.');
  };

  // Export full credentials roster to CSV
  const handleExportCredentialsCSV = () => {
    if (students.length === 0) {
      toast.info('No students available to export.');
      return;
    }

    const headers = [
      'Enrollment Number (Login ID)',
      'Full Name',
      'Official Email',
      'Default Password (Last 6 Digits)',
      'Institute / Organization',
      'Department / Unit',
      'Designation',
      'Exams Taken',
      'Best Score %',
      'Created Date'
    ];

    const rows = students.map((s) => [
      `"${s.enrollmentNumber}"`,
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.email.replace(/"/g, '""')}"`,
      `"${s.defaultPassword}"`,
      `"${(s.organizationName || 'Independent Learner').replace(/"/g, '""')}"`,
      `"${(s.department || '').replace(/"/g, '""')}"`,
      `"${(s.designation || '').replace(/"/g, '""')}"`,
      s.examStats?.totalAttempts || 0,
      `${s.examStats?.bestScore || 0}%`,
      `"${new Date(s.createdAt).toLocaleDateString('en-IN')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Trainee_Student_Credentials_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Student credentials roster exported to CSV successfully!');
  };

  // Export full Exam Submissions roster to CSV
  const handleExportExamResultsCSV = () => {
    if (examSubmissions.length === 0) {
      toast.info('No exam submissions to export.');
      return;
    }

    const headers = [
      'Enrollment Number',
      'Student Name',
      'Official Email',
      'Institute / Organization',
      'Department',
      'Course Title',
      'Course Code',
      'Examination Title',
      'Submission Timestamp',
      'Marks Obtained',
      'Total Marks',
      'Score Percentage',
      'Outcome',
      'Time Taken'
    ];

    const rows = examSubmissions.map((s) => [
      `"${s.traineeId?.enrollmentNumber || 'N/A'}"`,
      `"${(s.traineeName || s.traineeId?.name || 'Trainee').replace(/"/g, '""')}"`,
      `"${(s.traineeId?.email || '').replace(/"/g, '""')}"`,
      `"${(s.traineeId?.organizationName || 'Independent Learner').replace(/"/g, '""')}"`,
      `"${(s.traineeId?.department || 'Operations').replace(/"/g, '""')}"`,
      `"${(s.courseId?.title || 'Course').replace(/"/g, '""')}"`,
      `"${s.courseId?.code || ''}"`,
      `"${(s.assessmentId?.title || 'Examination').replace(/"/g, '""')}"`,
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
    link.setAttribute('download', `Student_Exam_Results_Roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Student exam results roster exported to CSV successfully!');
  };

  // Single Student Creation
  const handleCreateSingleStudent = async (e) => {
    e.preventDefault();
    if (!singleStudent.enrollmentNumber || !singleStudent.name) {
      toast.error('Enrollment Number and Full Name are required.');
      return;
    }

    setSavingSingle(true);
    try {
      const res = await api.createSingleStudent({
        ...singleStudent,
        organizationName: singleStudent.organizationName?.trim() || user?.organizationName || undefined,
        organizationId: user?.organizationId?._id || user?.organizationId || undefined,
        courseId: selectedCourseId || undefined
      });

      if (res.success) {
        toast.success(
          `Student ${singleStudent.name} created! ID: ${singleStudent.enrollmentNumber}, Password: ${res.student.plainPassword}`,
          'Student Created'
        );
        setShowSingleForm(false);
        setActiveTab('roster');
        setSingleStudent({
          name: '',
          enrollmentNumber: '',
          email: '',
          organizationName: '',
          department: '',
          designation: '',
          mobile: ''
        });
        await refreshStudents();
      } else {
        toast.error(res.message || 'Failed to create student');
      }
    } catch (err) {
      toast.error(err.message || 'Error creating student');
    } finally {
      setSavingSingle(false);
    }
  };

  // Delete Student
  const handleDeleteStudent = async (studentId, studentName) => {
    const confirmed = await showConfirm({
      title: 'Remove Trainee Account',
      message: `Are you sure you want to remove ${studentName}? Their enrollments and examination records will also be erased.`,
      confirmText: 'Yes, Delete Student',
      cancelText: 'Keep Account',
      type: 'danger'
    });

    if (!confirmed) return;

    setDeletingStudentId(studentId);
    try {
      const res = await api.deleteStudent(studentId);
      if (res.success) {
        toast.success(`Trainee ${studentName} removed successfully.`);
        setStudents((prev) => prev.filter((s) => s._id !== studentId));
        setExamSubmissions((prev) => prev.filter((sub) => String(sub.traineeId?._id || sub.traineeId) !== String(studentId)));
      } else {
        toast.error(res.message || 'Failed to delete student');
      }
    } catch (err) {
      toast.error(err.message || 'Error deleting student');
    } finally {
      setDeletingStudentId(null);
    }
  };

  // Extract unique institutes dynamically across student roster, submissions & registered organizations
  const uniqueInstitutes = isScopedToOrg
    ? Array.from(new Set([userOrgName, ...students.map((s) => (s.organizationName || '').trim())].filter(Boolean)))
    : Array.from(
        new Set(
          students
            .map((s) => (s.organizationName || '').trim())
            .concat(examSubmissions.map((sub) => (sub.traineeId?.organizationName || sub.organizationName || '').trim()))
            .concat(organizationsList.map((o) => (o.legalName || o.displayName || '').trim()))
            .filter(Boolean)
        )
      ).sort();

  // Filter students roster
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.enrollmentNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.department && s.department.toLowerCase().includes(search.toLowerCase())) ||
      (s.organizationName && s.organizationName.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    if (departmentFilter !== 'all' && s.department !== departmentFilter) {
      return false;
    }
    if (instituteFilter !== 'all') {
      const org = (s.organizationName || '').trim();
      if (instituteFilter === '__unassigned__') {
        if (org) return false;
      } else if (org !== instituteFilter) {
        return false;
      }
    }
    return true;
  });

  // Filter exam submissions
  const filteredExamSubmissions = examSubmissions.filter((sub) => {
    const studentName = sub.traineeName || sub.traineeId?.name || '';
    const enrollment = sub.traineeId?.enrollmentNumber || '';
    const email = sub.traineeId?.email || '';
    const courseTitle = sub.courseId?.title || '';
    const courseCode = sub.courseId?.code || '';
    const orgName = (sub.traineeId?.organizationName || sub.organizationName || '').trim();

    const matchesSearch =
      studentName.toLowerCase().includes(examSearch.toLowerCase()) ||
      enrollment.toLowerCase().includes(examSearch.toLowerCase()) ||
      email.toLowerCase().includes(examSearch.toLowerCase()) ||
      courseTitle.toLowerCase().includes(examSearch.toLowerCase()) ||
      courseCode.toLowerCase().includes(examSearch.toLowerCase()) ||
      orgName.toLowerCase().includes(examSearch.toLowerCase());

    if (!matchesSearch) return false;
    if (examFilter === 'passed') return sub.passed;
    if (examFilter === 'failed') return !sub.passed;
    if (examCourseFilter !== 'all') return sub.courseId?._id === examCourseFilter;
    if (instituteFilter !== 'all') {
      if (instituteFilter === '__unassigned__') {
        if (orgName) return false;
      } else if (orgName !== instituteFilter) {
        return false;
      }
    }
    return true;
  });

  const uniqueDepts = Array.from(new Set(students.map((s) => s.department).filter(Boolean)));
  const uniqueCourses = Array.from(
    new Map(
      examSubmissions
        .filter((s) => s.courseId)
        .map((s) => [s.courseId._id, { id: s.courseId._id, title: s.courseId.title, code: s.courseId.code }])
    ).values()
  );

  const passedSubmissionsCount = examSubmissions.filter((s) => s.passed).length;
  const uniqueTraineesCount = new Set(examSubmissions.map((s) => s.traineeId?._id || s.traineeName)).size;
  const examPassRate =
    examSubmissions.length > 0 ? Math.round((passedSubmissionsCount / examSubmissions.length) * 100) : 0;
  const examAvgScore =
    examSubmissions.length > 0
      ? Math.round(examSubmissions.reduce((acc, s) => acc + (s.percentage || 0), 0) / examSubmissions.length)
      : 0;

  // Analytics computation for the selected institute modal
  const instituteAnalytics = React.useMemo(() => {
    if (!selectedInstituteModal) return null;
    const instName = selectedInstituteModal.trim();

    const instStudents = students.filter(
      (s) => (s.organizationName || 'Independent / Central').trim() === instName
    );

    const instSubmissions = examSubmissions.filter((sub) => {
      const org = (sub.traineeId?.organizationName || sub.organizationName || 'Independent / Central').trim();
      return org === instName;
    });

    const passedSubs = instSubmissions.filter((s) => s.passed);
    const passRate = instSubmissions.length > 0
      ? Math.round((passedSubs.length / instSubmissions.length) * 100)
      : 0;

    const avgScore = instSubmissions.length > 0
      ? Math.round(instSubmissions.reduce((acc, s) => acc + (s.percentage || 0), 0) / instSubmissions.length)
      : 0;

    let topPerformer = null;
    instStudents.forEach((stu) => {
      const score = stu.examStats?.bestScore || 0;
      if (!topPerformer || score > (topPerformer.score || 0)) {
        topPerformer = {
          name: stu.name,
          enrollmentNumber: stu.enrollmentNumber,
          department: stu.department,
          score,
          attempts: stu.examStats?.totalAttempts || 0
        };
      }
    });

    const deptMap = {};
    instStudents.forEach((s) => {
      const dept = s.department || 'Operations';
      deptMap[dept] = (deptMap[dept] || 0) + 1;
    });

    const orgMeta = organizationsList.find(
      (o) => (o.legalName || '').trim() === instName || (o.displayName || '').trim() === instName
    );

    return {
      instituteName: instName,
      code: orgMeta?.code || 'INST-' + instName.slice(0, 4).toUpperCase(),
      type: orgMeta?.type || 'Higher Education & Research Institute',
      totalStudents: instStudents.length,
      totalExams: instSubmissions.length,
      passRate,
      passedCount: passedSubs.length,
      avgScore,
      topPerformer: topPerformer && topPerformer.score > 0 ? topPerformer : null,
      deptBreakdown: deptMap,
      students: instStudents,
      submissions: instSubmissions
    };
  }, [selectedInstituteModal, students, examSubmissions, organizationsList]);

  // Students targeted for printing credential slips
  const targetSlipStudents = React.useMemo(() => {
    if (slipSingleStudent) return [slipSingleStudent];
    if (slipInstituteTarget === 'all') return filteredStudents;
    return students.filter(
      (s) => (s.organizationName || 'Independent / Central').trim() === slipInstituteTarget.trim()
    );
  }, [slipSingleStudent, slipInstituteTarget, filteredStudents, students]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 select-none max-w-7xl mx-auto">
      {location.pathname.startsWith('/trainer') && (
        <TrainerHeader
          title="Student Cohorts & Examination Management"
          subtitle="Import student Excel records, auto-generate login IDs & 6-digit passwords, and track real-time examination performance."
          department={user?.department || 'Cohort Operations'}
          badge="Cohort Administration"
        />
      )}
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full text-xs font-semibold text-indigo-800">
              <Shield className="w-3.5 h-3.5 text-indigo-600" />
              <span>National Forecaster Capacity Standard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Student Onboarding & Examination Management
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              Import student Excel records, auto-generate login IDs & 6-digit passwords, and track real-time examination results of all students.
            </p>
          </div>

          {/* Action Buttons Toolbar - Unified & Responsive */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition flex items-center space-x-2 cursor-pointer shadow-xs whitespace-nowrap"
              title="Download formatted sample Excel/CSV template"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Sample Excel Template</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs hover:shadow transition flex items-center space-x-2 cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{isImporting ? 'Parsing Excel...' : 'Import Excel / CSV'}</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xlsx, .xls, .csv"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => {
                setShowSingleForm(!showSingleForm);
                setActiveTab('roster');
              }}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs hover:shadow transition flex items-center space-x-2 cursor-pointer whitespace-nowrap"
            >
              <UserPlus className="w-4 h-4" />
              <span>{showSingleForm ? 'Close Form' : 'Add Single Trainee'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Official Rule Callout Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-5 border border-indigo-700 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
              <Key className="w-4 h-4 text-amber-400" />
              <span>Automated Login Credential Formula</span>
            </div>
            <h3 className="text-base font-extrabold text-white">
              Login ID = <span className="text-amber-300">Enrollment Number</span> • Password ={' '}
              <span className="text-emerald-300">Last 6 Digits of Enrollment</span>
            </h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              When an Excel file is imported, each student account is instantly generated. Students can log in directly from the <strong>Login Portal</strong> using either their Enrollment Number or Email along with their 6-digit password. When they submit exams, their scores appear in the Examination Results tab below.
            </p>
          </div>

          {/* Optional Course Auto-Enrollment Selector */}
          {courses.length > 0 && (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-3 rounded-xl space-y-1.5 shrink-0 text-xs">
              <label className="text-[11px] font-bold text-slate-200 block">
                Auto-Enroll Imported Trainees into Course (Optional):
              </label>
              <CustomDropdown
                value={selectedCourseId}
                onChange={setSelectedCourseId}
                variant="dark"
                icon={BookOpen}
                placeholder="Do not auto-enroll (Account Only)"
                menuWidth="w-80"
                options={[
                  { value: '', label: 'Do not auto-enroll (Account Only)' },
                  ...courses.map((c) => ({
                    value: c._id,
                    label: `${c.code || ''} - ${c.title}`,
                    icon: BookOpen,
                  })),
                ]}
              />
            </div>
          )}
        </div>
      </div>

      {/* Manual Single Student Form */}
      {showSingleForm && (
        <form
          onSubmit={handleCreateSingleStudent}
          className="bg-white rounded-2xl border-2 border-indigo-200 p-6 shadow-md space-y-4 text-xs animate-in fade-in"
        >
          <div className="flex items-center justify-between pb-2 border-b">
            <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-1.5">
              <UserPlus className="w-4 h-4 text-indigo-600" />
              <span>Manual Trainee Registration</span>
            </h3>
            <span className="text-[11px] text-slate-500">
              Password will automatically be calculated from Enrollment Number's last 6 digits.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Enrollment Number (Login ID) *</label>
              <input
                type="text"
                required
                placeholder="e.g., IMD2026101105"
                value={singleStudent.enrollmentNumber}
                onChange={(e) => setSingleStudent({ ...singleStudent, enrollmentNumber: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border rounded-lg text-xs font-mono font-bold"
              />
              {singleStudent.enrollmentNumber && (
                <div className="text-[10px] text-emerald-700 font-mono">
                  Calculated Password: <strong>{extractLast6Digits(singleStudent.enrollmentNumber)}</strong>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Full Student Name *</label>
              <input
                type="text"
                required
                placeholder="Enter student's full name"
                value={singleStudent.name}
                onChange={(e) => setSingleStudent({ ...singleStudent, name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border rounded-lg text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Official Email (Optional)</label>
              <input
                type="email"
                placeholder="Enter official email address"
                value={singleStudent.email}
                onChange={(e) => setSingleStudent({ ...singleStudent, email: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border rounded-lg text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Institute / Organization</span>
              </label>
              {isScopedToOrg ? (
                <div className="w-full p-2.5 bg-slate-100/90 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 flex items-center justify-between">
                  <span className="truncate">{userOrgName || uniqueInstitutes[0] || 'My Institute'}</span>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 shrink-0">
                    Locked to your Institute
                  </span>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    list="institute-datalist"
                    placeholder="e.g. Lok Jagruti Kendra University"
                    value={singleStudent.organizationName}
                    onChange={(e) => setSingleStudent({ ...singleStudent, organizationName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-lg text-xs"
                  />
                  <datalist id="institute-datalist">
                    {uniqueInstitutes.map((inst) => (
                      <option key={inst} value={inst} />
                    ))}
                  </datalist>
                </>
              )}
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Department / Unit</label>
              <input
                type="text"
                placeholder="e.g. Radar Meteorology Division"
                value={singleStudent.department}
                onChange={(e) => setSingleStudent({ ...singleStudent, department: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border rounded-lg text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Designation / Role</label>
              <input
                type="text"
                placeholder="e.g. Officer Trainee / Scientist"
                value={singleStudent.designation}
                onChange={(e) => setSingleStudent({ ...singleStudent, designation: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border rounded-lg text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Mobile Phone</label>
              <input
                type="tel"
                placeholder="10-digit mobile"
                value={singleStudent.mobile}
                onChange={(e) => setSingleStudent({ ...singleStudent, mobile: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowSingleForm(false)}
              className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingSingle}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow cursor-pointer disabled:opacity-50"
            >
              {savingSingle ? 'Creating Trainee...' : 'Save & Onboard Trainee'}
            </button>
          </div>
        </form>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TWO PRIMARY TABS: 1. Onboarding Roster | 2. Exam Submissions */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center space-x-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('roster')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition flex items-center space-x-2 cursor-pointer ${
            activeTab === 'roster'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Student Onboarding & Credential Roster</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-50 text-indigo-700 font-bold">
            {students.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('exams')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition flex items-center space-x-2 cursor-pointer ${
            activeTab === 'exams'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Student Exam Submissions & Results</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              examSubmissions.length > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
            }`}
          >
            {examSubmissions.length}
          </span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: STUDENT ONBOARDING ROSTER                              */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'roster' && (
        <div className="space-y-5 animate-in fade-in">
          {/* KPI Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
            {/* 1. Registered Trainees */}
            <div className="bg-white hover:bg-slate-50/70 rounded-2xl p-4 border border-slate-200/80 shadow-xs transition-all duration-200 hover:shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-slate-500">Registered Trainees</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/80 shrink-0">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight flex items-baseline gap-1.5">
                <span>{students.length}</span>
                <span className="text-xs font-semibold text-slate-400">Trainees</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1.5 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                <span>Active Student Accounts</span>
              </div>
            </div>

            {/* 2. Institutes & Centers (Interactive Analytics Modal) */}
            <div
              onClick={() => {
                const target = isScopedToOrg
                  ? (userOrgName || uniqueInstitutes[0])
                  : (instituteFilter !== 'all' ? instituteFilter : uniqueInstitutes[0]);
                if (target) setSelectedInstituteModal(target);
              }}
              className="bg-white hover:bg-indigo-50/40 rounded-2xl p-4 border border-slate-200/80 hover:border-indigo-200 shadow-xs transition-all duration-200 hover:shadow-sm cursor-pointer group"
              title="Click to view Institute Performance & Analytics Dossier"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-slate-500 group-hover:text-indigo-700 transition">
                  {isScopedToOrg ? 'Affiliated Institute' : 'Institutes & Centers'}
                </span>
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100/80 group-hover:bg-indigo-600 group-hover:text-white transition shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 mt-2 tracking-tight flex items-baseline justify-between">
                {isScopedToOrg ? (
                  <div className="flex items-baseline gap-1.5 truncate max-w-[210px]" title={userOrgName || uniqueInstitutes[0] || 'Institute'}>
                    <span className="text-indigo-600 truncate text-sm sm:text-base font-black">{userOrgName || uniqueInstitutes[0] || 'My Institute'}</span>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-indigo-600">{uniqueInstitutes.length}</span>
                    <span className="text-xs font-semibold text-slate-400">{uniqueInstitutes.length === 1 ? 'Campus' : 'Campuses'}</span>
                  </div>
                )}
                <span className="text-[10px] font-bold text-indigo-600 group-hover:text-white group-hover:bg-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/80 flex items-center gap-1 transition-all shrink-0">
                  Analytics <ExternalLink className="w-2.5 h-2.5" />
                </span>
              </div>
              <div className="text-[11px] text-indigo-600/90 mt-1.5 font-medium flex items-center justify-between">
                <span className="truncate max-w-[170px]" title={isScopedToOrg ? 'Dedicated Institute Workspace' : (instituteFilter !== 'all' ? `Filtered: ${instituteFilter}` : 'Multi-Institute Scope')}>
                  {isScopedToOrg ? 'Dedicated Institute Workspace' : (instituteFilter !== 'all' ? `Filtered: ${instituteFilter}` : 'Multi-Institute Network')}
                </span>
                <span className="text-[10px] font-bold text-indigo-500 group-hover:text-indigo-700 group-hover:underline shrink-0 ml-1">
                  View dossier
                </span>
              </div>
            </div>

            {/* 3. Default Password Format */}
            <div className="bg-white hover:bg-slate-50/70 rounded-2xl p-4 border border-slate-200/80 shadow-xs transition-all duration-200 hover:shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-slate-500">Default Password</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/80 shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-2 font-mono tracking-wider flex items-baseline justify-between">
                <span>••••••</span>
                <span className="text-[10px] font-bold text-emerald-700 font-sans tracking-normal bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
                  Last 6 Digits
                </span>
              </div>
              <div className="text-[11px] text-emerald-700/90 mt-1.5 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                <span>Auto-derived from Student ID</span>
              </div>
            </div>

            {/* 4. Examination Submissions */}
            <div className="bg-white hover:bg-slate-50/70 rounded-2xl p-4 border border-slate-200/80 shadow-xs transition-all duration-200 hover:shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-slate-500">Exams Submitted</span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100/80 shrink-0">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight flex items-baseline gap-1.5">
                <span className="text-purple-600">{examSubmissions.length}</span>
                <span className="text-xs font-semibold text-slate-400">Attempts</span>
              </div>
              <div className="text-[11px] text-purple-700/90 mt-1.5 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0"></span>
                <span>Total Evaluation Records</span>
              </div>
            </div>
          </div>

          {/* Search, Filter and Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="p-4 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-slate-50/60 rounded-t-2xl">
              {/* Left Side: Search + Institute + Department Filters */}
              <div className="flex flex-1 flex-wrap items-center gap-2.5 min-w-0">
                {/* Search Input */}
                <div className="relative flex-1 min-w-[150px] sm:min-w-[180px] max-w-xs">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search students, IDs, institute..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full h-10 pl-10 pr-9 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 text-slate-800 font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition shadow-2xs"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-xs transition"
                      title="Clear search"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Institute / Organization Filter */}
                {isScopedToOrg ? (
                  <div className="h-10 px-3.5 bg-indigo-50/80 border border-indigo-200/80 text-indigo-950 rounded-xl flex items-center gap-2 text-xs font-semibold shadow-2xs shrink-0 max-w-[240px]">
                    <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="truncate" title={userOrgName || uniqueInstitutes[0] || 'My Institute'}>
                      {userOrgName || uniqueInstitutes[0] || 'My Institute'}
                    </span>
                    <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-indigo-200/60 text-indigo-800 rounded shrink-0">
                      Dedicated
                    </span>
                  </div>
                ) : (
                  <CustomDropdown
                    value={instituteFilter}
                    onChange={setInstituteFilter}
                    icon={Building2}
                    buttonWidth="w-44 sm:w-48"
                    menuWidth="w-80"
                    searchable={uniqueInstitutes.length > 5}
                    title="Filter by Institute / Organization"
                    options={[
                      {
                        value: 'all',
                        label: 'All Institutes',
                        count: students.length,
                        icon: Building2,
                      },
                      ...uniqueInstitutes.map((inst) => ({
                        value: inst,
                        label: inst,
                        count: students.filter((s) => (s.organizationName || '').trim() === inst).length,
                        icon: Building2,
                      })),
                    ]}
                  />
                )}

                {/* Department Filter */}
                {uniqueDepts.length > 0 && (
                  <CustomDropdown
                    value={departmentFilter}
                    onChange={setDepartmentFilter}
                    icon={Filter}
                    buttonWidth="w-36 sm:w-40"
                    menuWidth="w-64"
                    title="Filter by Department / Batch"
                    options={[
                      {
                        value: 'all',
                        label: 'All Departments',
                        count: students.length,
                        icon: Filter,
                      },
                      ...uniqueDepts.map((d) => ({
                        value: d,
                        label: d,
                        count: students.filter((s) => (s.department || '').trim() === d).length,
                        icon: Filter,
                      })),
                    ]}
                  />
                )}

                {/* Reset Filters */}
                {(instituteFilter !== 'all' || departmentFilter !== 'all' || search) && (
                  <button
                    type="button"
                    onClick={() => {
                      setInstituteFilter('all');
                      setDepartmentFilter('all');
                      setSearch('');
                    }}
                    className="h-10 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
                    title="Clear All Filters"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* Right Side: Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setSlipSingleStudent(null);
                    setSlipInstituteTarget(instituteFilter !== 'all' ? instituteFilter : 'all');
                    setShowSlipsModal(true);
                  }}
                  className="h-10 px-3.5 sm:px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition flex items-center gap-2 cursor-pointer shadow-xs text-xs active:scale-[0.98]"
                  title="Generate & Print Official Student ID / Credential Slips with QR Code"
                >
                  <Printer className="w-4 h-4 text-white" />
                  <span>Print ID Slips</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportCredentialsCSV}
                  className="h-10 px-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer shadow-2xs text-xs active:scale-[0.98]"
                  title="Download CSV file with Student IDs, Institutes & Passwords"
                >
                  <FileDown className="w-4 h-4 text-emerald-600" />
                  <span className="hidden sm:inline">Export Credentials CSV</span>
                  <span className="sm:hidden">Export CSV</span>
                </button>

                <button
                  type="button"
                  onClick={refreshStudents}
                  className="w-10 h-10 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold transition flex items-center justify-center cursor-pointer shadow-2xs active:scale-[0.98]"
                  title="Refresh Roster"
                >
                  <RefreshCw className="w-4 h-4 text-indigo-600" />
                </button>
              </div>
            </div>

            {/* Scrollable Roster Table */}
            <div className="overflow-x-auto max-h-[520px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 hover:scrollbar-thumb-slate-400">
              <table className="w-full text-left text-xs text-slate-700 divide-y divide-slate-200">
                <thead className="bg-slate-100/80 text-slate-700 font-bold text-[11px] uppercase tracking-wider sticky top-0 z-10 backdrop-blur-sm">
                  <tr>
                    <th className="py-3 px-3">Trainee</th>
                    <th className="py-3 px-3">Institute / Organization</th>
                    <th className="py-3 px-3 whitespace-nowrap">Enrollment ID</th>
                    <th className="py-3 px-3 whitespace-nowrap">Default Password</th>
                    <th className="py-3 px-3">Department</th>
                    <th className="py-3 px-3 whitespace-nowrap">Exam Status</th>
                    <th className="py-3 px-3 whitespace-nowrap">Onboarded</th>
                    <th className="py-3 px-3 text-center whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-slate-400">
                        <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                        <div className="font-bold text-slate-700 text-sm">No Trainees Found</div>
                        <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                          Upload an Excel/CSV file or click "Add Single Trainee" to onboard students and generate their login IDs and 6-digit passwords.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((stu) => {
                      const initials = stu.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase();

                      const isPasswordVisible = !!showPasswordMap[stu._id];
                      const password = stu.defaultPassword || extractLast6Digits(stu.enrollmentNumber);
                      const examAttemptsCount = stu.examStats?.totalAttempts || 0;

                      return (
                        <tr key={stu._id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Name & Email */}
                          <td className="py-3 px-3">
                            <div className="flex items-center space-x-2.5">
                              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-200 shrink-0">
                                {initials}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 truncate max-w-[130px] lg:max-w-[160px]">{stu.name}</div>
                                <div className="text-[11px] text-slate-400 truncate max-w-[130px] lg:max-w-[160px]">{stu.email}</div>
                              </div>
                            </div>
                          </td>

                          {/* Institute / Organization */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setSelectedInstituteModal(stu.organizationName || 'Independent / Central')}
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-950 border border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 shadow-2xs max-w-[180px] text-left transition cursor-pointer group"
                              title="Click to view Institute Performance & Analytics"
                            >
                              <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 group-hover:scale-110 transition" />
                              <span className="truncate" title={stu.organizationName || 'Independent / Central'}>
                                {stu.organizationName || 'Independent / Central'}
                              </span>
                              <BarChart3 className="w-3 h-3 text-indigo-400 group-hover:text-indigo-700 shrink-0 ml-0.5" />
                            </button>
                          </td>

                          {/* Enrollment Number (Login ID) with Copy button */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <div className="inline-flex items-center space-x-1.5 bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md font-mono font-bold text-xs border border-slate-200">
                              <span>{stu.enrollmentNumber}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  copyToClipboard(stu.enrollmentNumber, `Copied ID: ${stu.enrollmentNumber}`)
                                }
                                className="text-slate-400 hover:text-indigo-600 transition"
                                title="Copy Enrollment Number"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </td>

                          {/* Password (Last 6 digits) with Eye toggle and Copy button */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <div className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-900 px-2 py-0.5 rounded-md font-mono font-bold text-xs border border-emerald-200">
                              <span>{isPasswordVisible ? password : '••••••'}</span>
                              <button
                                type="button"
                                onClick={() => toggleRowPassword(stu._id)}
                                className="text-emerald-600 hover:text-emerald-800 transition"
                                title={isPasswordVisible ? 'Hide Password' : 'Show Password'}
                              >
                                {isPasswordVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(password, `Copied Password: ${password}`)}
                                className="text-emerald-600 hover:text-emerald-800 transition ml-1"
                                title="Copy Password"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </td>

                          {/* Department */}
                          <td className="py-3 px-3">
                            <span className="font-semibold text-slate-600 text-xs truncate max-w-[120px] block">{stu.department || 'Operations'}</span>
                          </td>

                          {/* Examination Status */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            {examAttemptsCount > 0 ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setExamSearch(stu.enrollmentNumber || stu.name);
                                  setActiveTab('exams');
                                }}
                                className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition cursor-pointer"
                                title="Click to view exam submissions for this student"
                              >
                                <Award className="w-3 h-3 text-indigo-600" />
                                <span>{examAttemptsCount} Exam(s) • Best: {stu.examStats?.bestScore || 0}%</span>
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">No exams taken</span>
                            )}
                          </td>

                          {/* Onboarded Date */}
                          <td className="py-3 px-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                            {new Date(stu.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  copyToClipboard(
                                    `Login ID: ${stu.enrollmentNumber}\nPassword: ${password}\nURL: http://localhost:5173/login`,
                                    `Copied full credentials for ${stu.name}!`
                                  )
                                }
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition inline-flex items-center space-x-1 cursor-pointer"
                                title="Copy full Login ID & Password details"
                              >
                                <Copy className="w-3 h-3 text-slate-500" />
                                <span>Copy Info</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setSlipSingleStudent(stu);
                                  setShowSlipsModal(true);
                                }}
                                className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg transition inline-flex items-center space-x-1 cursor-pointer text-xs"
                                title={`Print ID & Credential Slip for ${stu.name}`}
                              >
                                <Printer className="w-3 h-3 text-indigo-600" />
                                <span>Slip</span>
                              </button>

                              <button
                                type="button"
                                disabled={deletingStudentId === stu._id}
                                onClick={() => handleDeleteStudent(stu._id, stu.name)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Remove Trainee Account"
                              >
                                {deletingStudentId === stu._id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                              </button>
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
              <span>
                Showing <strong>{filteredStudents.length}</strong> of <strong>{students.length}</strong> onboarded trainees
              </span>
              <span className="text-[11px] text-slate-400">
                Trainees can sign in anytime using their Enrollment ID & last 6 digits password
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: STUDENT EXAMINATION SUBMISSIONS & RESULTS              */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'exams' && (
        <div className="space-y-5 animate-in fade-in">
          {/* Submissions KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs">
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-semibold">Exams Submitted</span>
                <Award className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1">{examSubmissions.length}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Total Attempt Records</div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-semibold">Students Appeared</span>
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-black text-indigo-600 mt-1">{uniqueTraineesCount}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Unique Candidates</div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-semibold">Pass Rate</span>
                <Trophy className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-600 mt-1">{examPassRate}%</div>
              <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
                {passedSubmissionsCount} Passed Threshold
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-semibold">Average Score</span>
                <BarChart3 className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-amber-600 mt-1">{examAvgScore}%</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Across All Submissions</div>
            </div>
          </div>

          {/* Search, Filter and Submissions Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="p-4 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-slate-50/60 rounded-t-2xl">
              {/* Search Input */}
              <div className="relative flex-1 min-w-[240px] max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search student, ID, or course..."
                  value={examSearch}
                  onChange={(e) => setExamSearch(e.target.value)}
                  className="w-full h-10 pl-10 pr-9 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 text-slate-800 font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition shadow-2xs"
                />
                {examSearch && (
                  <button
                    type="button"
                    onClick={() => setExamSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-xs transition"
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Filters Group */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Status Toggle Pills */}
                <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 h-10">
                  <button
                    type="button"
                    onClick={() => setExamFilter('all')}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                      examFilter === 'all'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All ({examSubmissions.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setExamFilter('passed')}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                      examFilter === 'passed'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-emerald-700 hover:text-emerald-800'
                    }`}
                  >
                    Passed ({passedSubmissionsCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setExamFilter('failed')}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                      examFilter === 'failed'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-rose-700 hover:text-rose-800'
                    }`}
                  >
                    Retake Needed ({examSubmissions.length - passedSubmissionsCount})
                  </button>
                </div>

                {uniqueCourses.length > 0 && (
                  <CustomDropdown
                    value={examCourseFilter}
                    onChange={setExamCourseFilter}
                    icon={BookOpen}
                    buttonWidth="w-36 sm:w-40"
                    menuWidth="w-64"
                    title="Filter by Exam Course"
                    options={[
                      { value: 'all', label: 'All Courses', count: examSubmissions.length, icon: BookOpen },
                      ...uniqueCourses.map((c) => ({
                        value: c.id,
                        label: c.code || c.title,
                        count: examSubmissions.filter((s) => (s.course?._id || s.course) === c.id).length,
                        icon: BookOpen,
                      })),
                    ]}
                  />
                )}

                {/* Institute Filter */}
                {isScopedToOrg ? (
                  <div className="h-10 px-3.5 bg-indigo-50/80 border border-indigo-200/80 text-indigo-950 rounded-xl flex items-center gap-2 text-xs font-semibold shadow-2xs shrink-0 max-w-[240px]">
                    <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="truncate" title={userOrgName || uniqueInstitutes[0] || 'My Institute'}>
                      {userOrgName || uniqueInstitutes[0] || 'My Institute'}
                    </span>
                    <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-indigo-200/60 text-indigo-800 rounded shrink-0">
                      Dedicated
                    </span>
                  </div>
                ) : (
                  <CustomDropdown
                    value={instituteFilter}
                    onChange={setInstituteFilter}
                    icon={Building2}
                    buttonWidth="w-44 sm:w-48"
                    menuWidth="w-80"
                    searchable={uniqueInstitutes.length > 5}
                    title="Filter by Institute / Organization"
                    options={[
                      {
                        value: 'all',
                        label: 'All Institutes',
                        count: examSubmissions.length,
                        icon: Building2,
                      },
                      ...uniqueInstitutes.map((inst) => ({
                        value: inst,
                        label: inst,
                        count: examSubmissions.filter((s) => (s.organizationName || '').trim() === inst).length,
                        icon: Building2,
                      })),
                    ]}
                  />
                )}

                {(instituteFilter !== 'all' || examFilter !== 'all' || examCourseFilter !== 'all' || examSearch) && (
                  <button
                    type="button"
                    onClick={() => {
                      setInstituteFilter('all');
                      setExamFilter('all');
                      setExamCourseFilter('all');
                      setExamSearch('');
                    }}
                    className="h-10 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
                    title="Clear All Filters"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleExportExamResultsCSV}
                  className="h-10 px-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer shadow-2xs text-xs active:scale-[0.98] shrink-0"
                  title="Download CSV report of student exam submissions"
                >
                  <FileDown className="w-4 h-4 text-emerald-600" />
                  <span>Export CSV</span>
                </button>

                <button
                  type="button"
                  onClick={refreshExamSubmissions}
                  disabled={loadingExams}
                  className="w-10 h-10 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold transition flex items-center justify-center cursor-pointer shadow-2xs disabled:opacity-50 active:scale-[0.98]"
                  title="Refresh Exam Submissions"
                >
                  <RefreshCw className={`w-4 h-4 text-indigo-600 ${loadingExams ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Scroll Indicator Info Banner */}
            {filteredExamSubmissions.length > 0 && (
              <div className="px-4 py-2 bg-indigo-50/70 border-b border-indigo-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-indigo-950">
                <div className="font-semibold flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-indigo-600" />
                  <span>
                    Showing <strong>{filteredExamSubmissions.length}</strong> of <strong>{examSubmissions.length}</strong> student examination records
                    {instituteFilter !== 'all' && (
                      <span className="ml-1 text-indigo-700 font-semibold">• Filtered by: {instituteFilter}</span>
                    )}
                  </span>
                </div>
                <div className="text-indigo-600 font-medium">
                  ↕ Scroll table vertically & ↔ horizontally to review marks, outcome & response sheets
                </div>
              </div>
            )}

            {/* Scrollable Submissions Table */}
            <div className="overflow-x-auto max-h-[520px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 hover:scrollbar-thumb-slate-400">
              <table className="w-full text-left text-xs text-slate-700 divide-y divide-slate-200">
                <thead className="bg-slate-100/80 text-slate-700 font-bold text-[11px] uppercase tracking-wider sticky top-0 z-10 backdrop-blur-sm">
                  <tr>
                    <th className="py-2.5 px-3">Trainee</th>
                    <th className="py-2.5 px-3">Institute</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Enrollment ID</th>
                    <th className="py-2.5 px-3">Course</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Submitted</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Marks</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Score</th>
                    <th className="py-2.5 px-3 text-center whitespace-nowrap">Outcome</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Duration</th>
                    <th className="py-2.5 px-3 text-center whitespace-nowrap">Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredExamSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="py-12 text-center text-slate-400">
                        <Award className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                        <div className="font-bold text-slate-700 text-sm">No Examination Submissions Found</div>
                        <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                          When students take course examinations, their score sheets, marks, timestamps, and answer sheets will immediately list out here.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredExamSubmissions.map((sub) => {
                      const studentName = sub.traineeName || sub.traineeId?.name || 'Unknown Student';
                      const studentEmail = sub.traineeId?.email || '';
                      const enrollmentNo = sub.traineeId?.enrollmentNumber || 'N/A';
                      const courseTitle = sub.courseId?.title || 'Examination';
                      const courseCode = sub.courseId?.code || 'EXAM';
                      const dateStr = sub.submittedAt || sub.createdAt;
                      const formattedDate = dateStr
                        ? new Date(dateStr).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
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
                          {/* Student */}
                          <td className="py-2.5 px-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-200 shrink-0">
                                {initials}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 truncate max-w-[120px] lg:max-w-[150px]">{studentName}</div>
                                {studentEmail && <div className="text-[10px] text-slate-400 truncate max-w-[120px] lg:max-w-[150px]">{studentEmail}</div>}
                              </div>
                            </div>
                          </td>

                          {/* Institute / Organization */}
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setSelectedInstituteModal(sub.traineeId?.organizationName || 'Independent Learner')}
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-950 border border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 shadow-2xs max-w-[180px] text-left transition cursor-pointer group"
                              title="Click to view Institute Performance & Analytics"
                            >
                              <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 group-hover:scale-110 transition" />
                              <span className="truncate" title={sub.traineeId?.organizationName || 'Independent Learner'}>
                                {sub.traineeId?.organizationName || 'Independent Learner'}
                              </span>
                              <BarChart3 className="w-3 h-3 text-indigo-400 group-hover:text-indigo-700 shrink-0 ml-0.5" />
                            </button>
                          </td>

                          {/* Enrollment Number */}
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="font-mono font-bold text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                              {enrollmentNo}
                            </span>
                          </td>

                          {/* Course */}
                          <td className="py-2.5 px-3">
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 truncate max-w-[120px] lg:max-w-[160px]" title={courseTitle}>{courseTitle}</div>
                              <div className="text-[10px] text-slate-500 font-mono">{courseCode}</div>
                            </div>
                          </td>

                          {/* Submission Date */}
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <div className="flex items-center space-x-1 text-slate-600 text-[11px]">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>{formattedDate}</span>
                            </div>
                          </td>

                          {/* Marks */}
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-800 whitespace-nowrap text-xs">
                            {sub.scoreObtained} / {sub.totalPossibleMarks}
                          </td>

                          {/* Percentage */}
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <div className="flex items-center space-x-1.5">
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

                          {/* Outcome */}
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            {sub.passed ? (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>PASSED</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                <XCircle className="w-3 h-3 text-rose-600" />
                                <span>RETAKE</span>
                              </span>
                            )}
                          </td>

                          {/* Time Taken */}
                          <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                            {formatSeconds(sub.timeSpentSeconds)}
                          </td>

                          {/* Review Answers */}
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setSelectedAttemptDetail(sub)}
                              className="h-7 px-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg border border-indigo-200 transition inline-flex items-center space-x-1 cursor-pointer active:scale-95 text-xs"
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
              <span>
                Showing <strong>{filteredExamSubmissions.length}</strong> of <strong>{examSubmissions.length}</strong> total examination submissions
              </span>
              <span className="text-[11px] text-slate-400">
                All records stored securely in MoES examination repository
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Answer Sheet Review Modal */}
      {selectedAttemptDetail && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
          onClick={() => setSelectedAttemptDetail(null)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col p-6 shadow-2xl space-y-4 border border-slate-200 animate-in zoom-in-95 relative"
          >
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      selectedAttemptDetail.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {selectedAttemptDetail.passed ? 'PASSED EXAMINATION' : 'FAILED / RETAKE'}
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
                  Response Sheet: {selectedAttemptDetail.traineeName || selectedAttemptDetail.traineeId?.name}
                </h3>
                <p className="text-xs text-slate-500">
                  ID: {selectedAttemptDetail.traineeId?.enrollmentNumber || 'N/A'} • Submitted on{' '}
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
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs max-h-[60vh] scrollbar-thin scrollbar-thumb-slate-300 hover:scrollbar-thumb-slate-400">
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
                          <strong>Official Solution:</strong> {q.explanation}
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

      {/* Excel Import Preview Modal */}
      {parsedPreview && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
          onClick={() => setParsedPreview(null)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col p-6 shadow-2xl space-y-4 border border-slate-200 animate-in zoom-in-95 relative"
          >
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    EXCEL PARSING VALIDATED
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-mono text-slate-600">
                    {parsedPreview.length} Trainees Detected
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">
                  Preview Trainees & Auto-Calculated 6-Digit Passwords
                </h3>
                <p className="text-xs text-slate-500">
                  Review the parsed student accounts below before saving to MongoDB Atlas database.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setParsedPreview(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Preview Table */}
            <div className="flex-1 overflow-x-auto overflow-y-auto space-y-2 pr-1 text-xs max-h-[50vh] scrollbar-thin scrollbar-thumb-slate-300">
              <table className="w-full text-left divide-y divide-slate-200">
                <thead className="bg-slate-100 sticky top-0 text-[10px] uppercase font-bold text-slate-600">
                  <tr>
                    <th className="p-2">#</th>
                    <th className="p-2">Name</th>
                    <th className="p-2">Institute / Org</th>
                    <th className="p-2 whitespace-nowrap">Enrollment No (Login ID)</th>
                    <th className="p-2 whitespace-nowrap">Password (Last 6 Digits)</th>
                    <th className="p-2">Department</th>
                    <th className="p-2">Generated Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {parsedPreview.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2 text-slate-400 font-sans">{idx + 1}</td>
                      <td className="p-2 font-sans font-bold text-slate-800 truncate max-w-[130px]" title={p.name}>{p.name}</td>
                      <td className="p-2 font-sans font-semibold text-indigo-900 text-[11px] truncate max-w-[140px]" title={p.organizationName || 'Default Institute'}>
                        {p.organizationName || 'Default Institute'}
                      </td>
                      <td className="p-2 font-bold text-indigo-700 whitespace-nowrap">{p.enrollmentNumber}</td>
                      <td className="p-2 font-bold text-emerald-700 bg-emerald-50/60 rounded whitespace-nowrap">
                        {p.plainPassword}
                      </td>
                      <td className="p-2 font-sans text-slate-600 truncate max-w-[120px]" title={p.department}>{p.department}</td>
                      <td className="p-2 font-sans text-slate-500 text-[11px] truncate max-w-[160px]" title={p.email}>{p.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-600 font-semibold">Auto-enroll in course:</span>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="">-- None (Account Roster Only) --</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setParsedPreview(null)}
                  className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  disabled={isImporting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  {isImporting ? 'Saving to Database...' : `Confirm & Onboard All ${parsedPreview.length} Students`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* FEATURE 2: INSTITUTE PERFORMANCE & ANALYTICS MODAL           */}
      {/* ------------------------------------------------------------- */}
      {selectedInstituteModal && instituteAnalytics && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
          onClick={() => setSelectedInstituteModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col p-6 sm:p-7 shadow-2xl space-y-5 border border-slate-200 animate-in zoom-in-95 relative"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {instituteAnalytics.code}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-semibold text-slate-500">
                      {instituteAnalytics.type}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mt-1">
                    {instituteAnalytics.instituteName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Institutional Cohort Performance, Examination Outcomes & Candidate Roster
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedInstituteModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 4 Performance KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="font-semibold">Enrolled Candidates</span>
                  <Users className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {instituteAnalytics.totalStudents}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Active Student Accounts</div>
              </div>

              <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200/80">
                <div className="flex items-center justify-between text-emerald-800">
                  <span className="font-semibold">Exam Pass Rate</span>
                  <Trophy className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-emerald-700 mt-1">
                  {instituteAnalytics.passRate}%
                </div>
                <div className="text-[11px] text-emerald-700/80 mt-0.5 font-medium">
                  {instituteAnalytics.passedCount} of {instituteAnalytics.totalExams} Passed
                </div>
              </div>

              <div className="bg-blue-50/70 rounded-2xl p-4 border border-blue-200/80">
                <div className="flex items-center justify-between text-blue-800">
                  <span className="font-semibold">Average Score</span>
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-black text-blue-700 mt-1">
                  {instituteAnalytics.avgScore}%
                </div>
                <div className="text-[11px] text-blue-700/80 mt-0.5 font-medium">Across All Assessments</div>
              </div>

              <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200/80">
                <div className="flex items-center justify-between text-amber-800">
                  <span className="font-semibold">Top Ranker Score</span>
                  <Award className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl font-black text-amber-700 mt-1">
                  {instituteAnalytics.topPerformer ? `${instituteAnalytics.topPerformer.score}%` : 'N/A'}
                </div>
                <div className="text-[11px] text-amber-800/80 mt-0.5 truncate font-medium" title={instituteAnalytics.topPerformer?.name}>
                  {instituteAnalytics.topPerformer?.name || 'No submissions yet'}
                </div>
              </div>
            </div>

            {/* Department Breakdown Pills */}
            <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Department / Academic Unit Distribution</span>
                <span className="text-[11px] text-slate-400 font-normal font-mono">
                  {Object.keys(instituteAnalytics.deptBreakdown).length} Academic Units
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(instituteAnalytics.deptBreakdown).map(([dept, cnt]) => (
                  <span
                    key={dept}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs"
                  >
                    <span>{dept}</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-700 font-bold font-mono text-[10px]">
                      {cnt}
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* Top Students Roster Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Registered Candidates in {instituteAnalytics.instituteName}</span>
                <span className="text-slate-400 font-normal">
                  Showing all {instituteAnalytics.students.length} candidates
                </span>
              </div>
              <div className="max-h-[220px] overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs scrollbar-thin scrollbar-thumb-slate-300">
                {instituteAnalytics.students.map((st, i) => (
                  <div key={st._id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition">
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {i + 1}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{st.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          ID: {st.enrollmentNumber} • {st.department || 'Operations'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-mono font-bold text-[11px] rounded border">
                        Pwd: {st.defaultPassword}
                      </span>
                      {st.examStats?.bestScore > 0 && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[11px] rounded">
                          Best: {st.examStats.bestScore}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setInstituteFilter(instituteAnalytics.instituteName);
                    setSelectedInstituteModal(null);
                    setActiveTab('roster');
                  }}
                  className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-200 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filter Main Roster by this Institute</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSlipSingleStudent(null);
                    setSlipInstituteTarget(instituteAnalytics.instituteName);
                    setSelectedInstituteModal(null);
                    setShowSlipsModal(true);
                  }}
                  className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Print ID Slips for this Institute</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedInstituteModal(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* FEATURE 1: PRINTABLE STUDENT ID & CREDENTIAL SLIPS MODAL     */}
      {/* ------------------------------------------------------------- */}
      {showSlipsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
          onClick={() => setShowSlipsModal(false)}
        >
          {/* Print specific CSS styles */}
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              body * {
                visibility: hidden !important;
              }
              #printable-slips-container, #printable-slips-container * {
                visibility: visible !important;
              }
              #printable-slips-container {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                background: white !important;
                padding: 0 !important;
                margin: 0 !important;
              }
              .no-print {
                display: none !important;
              }
              .slip-card {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                border: 1px dashed #64748b !important;
                box-shadow: none !important;
              }
            }
          `}} />

          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col p-6 shadow-2xl space-y-4 border border-slate-200 animate-in zoom-in-95 relative"
          >
            {/* Modal Header & Controls (Hidden on physical print) */}
            <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 shrink-0">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      OFFICIAL ADMIT & CREDENTIAL SLIPS
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-bold text-slate-600 font-mono">
                      {targetSlipStudents.length} Slips Generated
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mt-0.5">
                    Print Student ID Cards & Examination Credential Slips
                  </h3>
                  <p className="text-xs text-slate-500">
                    A4-optimized slips with official Government seal, live QR Code login, enrollment ID & 6-digit password.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                {!slipSingleStudent && !isScopedToOrg && (
                  <CustomDropdown
                    value={slipInstituteTarget}
                    onChange={setSlipInstituteTarget}
                    icon={Building2}
                    buttonWidth="w-48 sm:w-52"
                    menuWidth="w-80"
                    align="right"
                    title="Filter Slips by Institute"
                    options={[
                      {
                        value: 'all',
                        label: 'All Institutes',
                        count: students.length,
                        icon: Building2,
                      },
                      ...uniqueInstitutes.map((inst) => ({
                        value: inst,
                        label: inst,
                        count: students.filter((s) => (s.organizationName || '').trim() === inst).length,
                        icon: Building2,
                      })),
                    ]}
                  />
                )}

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print All / Save PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowSlipsModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Slips Sheet Container */}
            <div
              id="printable-slips-container"
              className="flex-1 overflow-y-auto pr-1 space-y-4 max-h-[70vh] scrollbar-thin scrollbar-thumb-slate-300 p-2"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-3">
                {targetSlipStudents.map((st) => {
                  const plainPass = st.defaultPassword || extractLast6Digits(st.enrollmentNumber);
                  const qrUrl = `${window.location.origin}/login?id=${encodeURIComponent(st.enrollmentNumber)}`;

                  return (
                    <div
                      key={st._id}
                      className="slip-card bg-white border-2 border-dashed border-slate-300 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3 relative shadow-2xs hover:border-indigo-400 transition"
                    >
                      {/* Top Government Header Strip */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <div className="flex items-center space-x-2.5">
                          <img
                            src="/logo-moes.png"
                            alt="MoES Seal"
                            className="w-8 h-8 rounded-full object-contain shrink-0"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                          <div>
                            <div className="text-[10px] font-black uppercase tracking-wider text-slate-900 leading-tight">
                              Ministry of Earth Sciences (MoES)
                            </div>
                            <div className="text-[9px] font-semibold text-slate-500 leading-none">
                              National Forecaster Examination & Portal Pass
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                            CANDIDATE SLIP
                          </span>
                        </div>
                      </div>

                      {/* Candidate Identity */}
                      <div className="space-y-1">
                        <div className="text-sm font-black text-slate-900">{st.name}</div>
                        <div className="text-[11px] font-semibold text-indigo-700 flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-indigo-600 shrink-0" />
                          <span className="truncate">{st.organizationName || 'Independent Learner'}</span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Department: <strong>{st.department || 'Operations'}</strong> • Role: {st.designation || 'Trainee'}
                        </div>
                      </div>

                      {/* Credentials Box */}
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 grid grid-cols-2 gap-2 text-xs">
                        <div className="space-y-0.5">
                          <div className="text-[10px] font-bold uppercase text-slate-400">Login ID / Enrollment</div>
                          <div className="font-mono font-black text-slate-900 text-xs select-all">
                            {st.enrollmentNumber}
                          </div>
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-[10px] font-bold uppercase text-emerald-700">6-Digit Password</div>
                          <div className="font-mono font-black text-emerald-700 text-xs bg-emerald-100/70 px-1.5 py-0.5 rounded inline-block select-all">
                            {plainPass}
                          </div>
                        </div>
                      </div>

                      {/* QR Code & Portal URL Footer */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                        <div className="space-y-0.5 max-w-[200px]">
                          <div className="text-slate-600 font-bold">Portal Access:</div>
                          <div className="font-mono text-indigo-600 truncate text-[10px]">
                            {window.location.origin}/login
                          </div>
                          <div className="text-[9px] text-slate-400">
                            Scan QR code to auto-populate login ID on mobile
                          </div>
                        </div>

                        <div className="p-1 bg-white border border-slate-200 rounded-lg shadow-2xs shrink-0">
                          <QRCodeSVG value={qrUrl} size={48} level="M" />
                        </div>
                      </div>

                      {/* Cut-out hint */}
                      <div className="no-print absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2 bg-white text-[9px] text-slate-400 font-mono">
                        ✂ Tear along dashed line
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="no-print pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Ready for printing on standard A4 sheets (2 slips per row, 4-6 per page).
              </span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowSlipsModal(false)}
                  className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50 text-xs font-semibold"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print {targetSlipStudents.length} Slips Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentOnboardingManager;
