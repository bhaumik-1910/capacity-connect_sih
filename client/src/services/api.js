const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

// Session-bound token retrieval: destroyed automatically when tab or browser closes
export const getSessionToken = () => {
  return sessionStorage.getItem('cc_token');
};

export const apiFetch = async (endpoint, options = {}) => {
  const token = getSessionToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.message || 'An error occurred during request execution');
    error.status = response.status;
    error.response = { status: response.status, data };
    error.data = data;
    error.paymentRequired = data.paymentRequired || response.status === 402;
    throw error;
  }

  // Ensure both direct access (res.success) and axios-like access (res.data.success) work
  if (data && typeof data === 'object') {
    if (!('data' in data)) {
      data.data = data;
    }
  }
  return data;
};

export const api = {
  // File Upload
  uploadFile: async (file) => {
    const token = getSessionToken();
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'File upload failed');
    }
    return data;
  },

  // Auth
  login: (email, password) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (userData) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => apiFetch('/auth/me'),

  // Courses
  getCourses: (params = '') => apiFetch(`/courses${params ? `?${params}` : ''}`),
  getCourse: (id) => apiFetch(`/courses/${id}`),
  createCourse: (data) => apiFetch('/courses', { method: 'POST', body: JSON.stringify(data) }),
  updateCourse: (id, data) => apiFetch(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCourse: (id) => apiFetch(`/courses/${id}`, { method: 'DELETE' }),
  enrollCourse: (id) => apiFetch(`/courses/${id}/enroll`, { method: 'POST' }),
  updateProgress: (id, itemKey) => apiFetch(`/courses/${id}/progress`, { method: 'POST', body: JSON.stringify({ itemKey }) }),
  getMyEnrollments: () => apiFetch('/courses/trainee/my-enrollments'),
  getTrainerCourses: () => apiFetch('/courses/trainer/my-courses'),
  getTraineeAnalytics: () => apiFetch('/courses/trainer/trainee-analytics'),
  getCourseEnrollments: (courseId) => apiFetch(`/courses/${courseId}/enrollments`),
  updateCourseCertTemplate: (courseId, data) => apiFetch(`/courses/${courseId}/certificate-template`, { method: 'PUT', body: JSON.stringify(data) }),

  // Assessments
  getCourseAssessment: (courseId) => apiFetch(`/assessments/course/${courseId}`),
  getCourseSubmissions: (courseId) => apiFetch(`/assessments/course/${courseId}/submissions`),
  submitAssessment: (assessmentId, payload) => apiFetch(`/assessments/${assessmentId}/submit`, { method: 'POST', body: JSON.stringify(payload) }),
  getMyAttempts: () => apiFetch('/assessments/my-attempts'),
  createAssessment: (data) => apiFetch('/assessments', { method: 'POST', body: JSON.stringify(data) }),

  // Certificates
  claimCertificate: (courseId) => apiFetch(`/certificates/claim/${courseId}`, { method: 'POST' }),
  getMyCertificates: () => apiFetch('/certificates/my-certificates'),
  verifyCertificate: (certNumber) => apiFetch(`/certificates/verify/${certNumber}`),
  getAllCertificates: () => apiFetch('/certificates/admin/all'),
  revokeCertificate: (id, reason) => apiFetch(`/certificates/${id}/revoke`, { method: 'PUT', body: JSON.stringify({ reason }) }),
  getTrainerCourseCerts: () => apiFetch('/certificates/trainer/my-course-certs'),
  getGovernmentCertTemplate: () => apiFetch('/certificates/government-template'),
  updateGovernmentCertTemplate: (data) => apiFetch('/certificates/government-template', { method: 'PUT', body: JSON.stringify(data) }),

  // Competency & Skill Gap
  getCompetencies: () => apiFetch('/competencies'),
  getTargetRoles: () => apiFetch('/competencies/target-roles'),
  getSkillGap: (roleId) => apiFetch(`/competencies/skill-gap${roleId ? `?roleId=${roleId}` : ''}`),
  createCompetency: (data) => apiFetch('/competencies', { method: 'POST', body: JSON.stringify(data) }),
  deleteCompetency: (id) => apiFetch(`/competencies/${id}`, { method: 'DELETE' }),

  // Trainer Matching
  matchTrainers: (payload) => apiFetch('/trainer-matching/match', { method: 'POST', body: JSON.stringify(payload) }),

  // Sessions & Attendance
  getSessions: (params = '') => {
    if (!params) return apiFetch('/sessions');
    if (typeof params === 'string' && params.includes('=')) {
      return apiFetch(`/sessions?${params.replace(/^\?/, '')}`);
    }
    return apiFetch(`/sessions?courseId=${params}`);
  },
  createSession: (data) => apiFetch('/sessions', { method: 'POST', body: JSON.stringify(data) }),
  markAttendance: (sessionId, attendanceList) => apiFetch(`/sessions/${sessionId}/attendance`, { method: 'PUT', body: JSON.stringify({ attendanceList }) }),

  // Admin Governance
  getAdminMetrics: () => apiFetch('/admin/dashboard-metrics'),
  getUsers: (params = '') => apiFetch(`/admin/users${params ? `?${params}` : ''}`),
  getPendingUsers: () => apiFetch('/admin/pending-users'),
  approveUser: (id) => apiFetch(`/admin/users/${id}/approve`, { method: 'PUT' }),
  rejectUser: (id, reason) => apiFetch(`/admin/users/${id}/reject`, { method: 'PUT', body: JSON.stringify({ reason }) }),
  deleteUser: (id) => apiFetch(`/admin/users/${id}`, { method: 'DELETE' }),
  getUserLearningProgress: (id) => apiFetch(`/admin/users/${id}/progress`),
  updateCourseStatus: (id, status, feedback = '') => apiFetch(`/admin/courses/${id}/status`, { method: 'PUT', body: JSON.stringify({ status, reviewFeedback: feedback }) }),
  getAuditLogs: (params = '') => apiFetch(`/admin/audit-logs${params ? `?${params}` : ''}`),
  clearAuditLogs: () => apiFetch('/admin/audit-logs', { method: 'DELETE' }),
  deleteAuditLog: (id) => apiFetch(`/admin/audit-logs/${id}`, { method: 'DELETE' }),
  getAnnouncements: () => apiFetch('/admin/announcements'),
  createAnnouncement: (data) => apiFetch('/admin/announcements', { method: 'POST', body: JSON.stringify(data) }),
  getPublicStats: () => apiFetch('/admin/public-stats'),

  // Organizations & Institute Tenants ("Institute Check" & Multi-Tenant Management)
  registerOrganization: (data) => apiFetch('/organizations/register', { method: 'POST', body: JSON.stringify(data) }),
  getOrganizations: () => apiFetch('/organizations'),
  getAllOrganizations: () => apiFetch('/organizations/admin/all'),
  getInstituteVerificationDossier: (id) => apiFetch(`/organizations/${id}/verification-dossier`),
  reviewOrganization: (id, payload) => apiFetch(`/organizations/${id}/review`, { method: 'PUT', body: JSON.stringify(payload) }),
  approveOrganization: (id) => apiFetch(`/organizations/${id}/approve`, { method: 'PUT' }),
  updateCertificateTemplate: (id, data) => apiFetch(`/organizations/${id}/certificate-template`, { method: 'PUT', body: JSON.stringify(data) }),
  getInstituteMetrics: () => apiFetch('/organizations/institute/metrics'),
  getAcademicStructure: (id) => apiFetch(`/organizations/${id}/academic-structure`),
  updateAcademicStructure: (id, data) => apiFetch(`/organizations/${id}/academic-structure`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteOrganization: (id) => apiFetch(`/organizations/${id}`, { method: 'DELETE' }),

  // Student Onboarding & Credential Generation (Excel Bulk Import)
  bulkImportStudents: (data) => apiFetch('/students/bulk-import', { method: 'POST', body: JSON.stringify(data) }),
  createSingleStudent: (data) => apiFetch('/students/single', { method: 'POST', body: JSON.stringify(data) }),
  getStudents: () => apiFetch('/students'),
  getStudentExamSubmissions: (params = '') => apiFetch(`/students/exam-submissions${params ? `?${params}` : ''}`),
  // Generic HTTP helpers
  get: (url) => apiFetch(url),
  post: (url, data) => apiFetch(url, { method: 'POST', body: data ? JSON.stringify(data) : undefined }),
  put: (url, data) => apiFetch(url, { method: 'PUT', body: data ? JSON.stringify(data) : undefined }),
  delete: (url) => apiFetch(url, { method: 'DELETE' }),
};

export default api;

