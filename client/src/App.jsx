import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ScrollToTop from './components/ScrollToTop';
import RouteSEO from './components/RouteSEO';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import CertificateVerification from './pages/public/CertificateVerification';
import AboutFramework from './pages/public/AboutFramework';
import InstituteRegister from './pages/public/InstituteRegister';

// Trainee Pages
import TraineeDashboard from './pages/trainee/TraineeDashboard';
import CourseCatalogue from './pages/trainee/CourseCatalogue';
import MyEnrolledCourses from './pages/trainee/MyEnrolledCourses';
import CoursePlayer from './pages/trainee/CoursePlayer';
import AssessmentArena from './pages/trainee/AssessmentArena';
import CompetencyPassport from './pages/trainee/CompetencyPassport';
import MyCertificates from './pages/trainee/MyCertificates';
import TrainingSessions from './pages/trainee/TrainingSessions';

// Trainer Pages
import TrainerDashboard from './pages/trainer/TrainerDashboard';
import CourseBuilderWizard from './pages/trainer/CourseBuilderWizard';
import MyCreatedCourses from './pages/trainer/MyCreatedCourses';
import QuestionBankManager from './pages/trainer/QuestionBankManager';
import TraineeAnalytics from './pages/trainer/TraineeAnalytics';
import AttendanceManager from './pages/trainer/AttendanceManager';
import StudentOnboardingManager from './pages/trainer/StudentOnboardingManager';
import TrainerCertificatesView from './pages/trainer/TrainerCertificatesView';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserApprovals from './pages/admin/UserApprovals';
import CourseGovernance from './pages/admin/CourseGovernance';
import CompetencyFramework from './pages/admin/CompetencyFramework';
import TrainerMatching from './pages/admin/TrainerMatching';
import CertificateGovernance from './pages/admin/CertificateGovernance';
import AuditLogsCenter from './pages/admin/AuditLogsCenter';
import InstitutionalDirectory from './pages/admin/InstitutionalDirectory';
import GovernmentCertificateStudio from './pages/admin/GovernmentCertificateStudio';

// Institute Admin Pages
import InstituteDashboard from './pages/institute/InstituteDashboard';
import InstituteAcademicStructure from './pages/institute/InstituteAcademicStructure';
import InstituteTrainers from './pages/institute/InstituteTrainers';
import InstituteStudents from './pages/institute/InstituteStudents';
import InstituteCourses from './pages/institute/InstituteCourses';
import InstituteCertTemplate from './pages/institute/InstituteCertTemplate';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0) {
    const userRole = user.role;
    const isAllowed = allowedRoles.includes(userRole) || 
      (allowedRoles.includes('admin') && (userRole === 'platform_admin' || userRole === 'platform_super_admin' || userRole === 'admin')) ||
      (allowedRoles.includes('institute_admin') && (userRole === 'institute_admin' || userRole === 'org_admin' || userRole === 'platform_admin' || userRole === 'admin')) ||
      (allowedRoles.includes('org_admin') && (userRole === 'institute_admin' || userRole === 'org_admin' || userRole === 'platform_admin' || userRole === 'admin')) ||
      (allowedRoles.includes('trainee') && (userRole === 'trainee' || userRole === 'student')) ||
      (allowedRoles.includes('student') && (userRole === 'trainee' || userRole === 'student'));
    if (!isAllowed) {
      return (
        <div className="p-8 text-center bg-white rounded-xl border border-rose-200 m-6">
          <h2 className="text-xl font-bold text-rose-700">Access Restricted</h2>
          <p className="text-xs text-slate-600 mt-1">
            Your current assigned role ({user.role}) is not authorized to access this administrative module.
          </p>
        </div>
      );
    }
  }

  return children;
};

function App() {
  const { user } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  // Close mobile drawer on route navigation
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="h-screen flex flex-col bg-[#F8FAFC] overflow-hidden">
      <Header 
        onToggleSidebar={() => setMobileSidebarOpen((prev) => !prev)} 
        isSidebarOpen={mobileSidebarOpen} 
      />
      <ScrollToTop />
      <RouteSEO />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Render sidebar only when user logged in */}
        {user && (
          <Sidebar 
            isOpen={mobileSidebarOpen} 
            onClose={() => setMobileSidebarOpen(false)} 
          />
        )}

        <main
          id="main-content"
          className={`flex-1 h-full ${['/login', '/register', '/register-institute'].includes(location.pathname) ? 'overflow-y-auto lg:overflow-hidden' : 'overflow-y-auto'} w-full ${['/', '/about', '/login', '/register', '/register-institute'].includes(location.pathname) ? 'p-0' : 'p-3.5 sm:p-6 lg:p-8'}`}
        >
          <div className={['/login', '/register', '/register-institute'].includes(location.pathname) ? 'w-full h-full flex flex-col overflow-hidden' : ['/', '/about'].includes(location.pathname) ? 'w-full min-h-full flex flex-col' : 'max-w-7xl mx-auto pb-12'}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/register-institute" element={<InstituteRegister />} />
              <Route path="/verify" element={<CertificateVerification />} />
              <Route path="/verify/:certificateNumber" element={<CertificateVerification />} />
              <Route path="/about" element={<AboutFramework />} />

            {/* Trainee Routes */}
            <Route path="/trainee/dashboard" element={
              <ProtectedRoute allowedRoles={['trainee', 'student', 'admin']}>
                <TraineeDashboard />
              </ProtectedRoute>
            } />
            <Route path="/trainee/catalogue" element={
              <ProtectedRoute allowedRoles={['trainee', 'student', 'trainer', 'institute_admin', 'org_admin', 'admin']}>
                <CourseCatalogue />
              </ProtectedRoute>
            } />
            <Route path="/trainee/my-courses" element={
              <ProtectedRoute allowedRoles={['trainee', 'student', 'trainer', 'institute_admin', 'org_admin', 'admin']}>
                <MyEnrolledCourses />
              </ProtectedRoute>
            } />
            <Route path="/trainee/course/:id" element={
              <ProtectedRoute allowedRoles={['trainee', 'student', 'trainer', 'institute_admin', 'org_admin', 'admin']}>
                <CoursePlayer />
              </ProtectedRoute>
            } />
            <Route path="/trainee/assessment/:courseId" element={
              <ProtectedRoute allowedRoles={['trainee', 'student', 'trainer', 'institute_admin', 'org_admin', 'admin']}>
                <AssessmentArena />
              </ProtectedRoute>
            } />
            <Route path="/trainee/competency-passport" element={
              <ProtectedRoute allowedRoles={['trainee', 'student', 'admin']}>
                <CompetencyPassport />
              </ProtectedRoute>
            } />
            <Route path="/trainee/certificates" element={
              <ProtectedRoute allowedRoles={['trainee', 'student', 'admin']}>
                <MyCertificates />
              </ProtectedRoute>
            } />
            <Route path="/trainee/sessions" element={
              <ProtectedRoute allowedRoles={['trainee', 'student', 'admin']}>
                <TrainingSessions />
              </ProtectedRoute>
            } />

            {/* Trainer Routes */}
            <Route path="/trainer/dashboard" element={
              <ProtectedRoute allowedRoles={['trainer', 'admin']}>
                <TrainerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/trainer/course-builder" element={
              <ProtectedRoute allowedRoles={['trainer', 'admin']}>
                <CourseBuilderWizard />
              </ProtectedRoute>
            } />
            <Route path="/trainer/my-courses" element={
              <ProtectedRoute allowedRoles={['trainer', 'admin']}>
                <MyCreatedCourses />
              </ProtectedRoute>
            } />
            <Route path="/trainer/question-bank" element={
              <ProtectedRoute allowedRoles={['trainer', 'admin']}>
                <QuestionBankManager />
              </ProtectedRoute>
            } />
            <Route path="/trainer/trainee-analytics" element={
              <ProtectedRoute allowedRoles={['trainer', 'admin']}>
                <TraineeAnalytics />
              </ProtectedRoute>
            } />
            <Route path="/trainer/attendance" element={
              <ProtectedRoute allowedRoles={['trainer', 'admin', 'institute_admin', 'org_admin']}>
                <AttendanceManager />
              </ProtectedRoute>
            } />
            <Route path="/trainer/student-onboarding" element={
              <ProtectedRoute allowedRoles={['trainer', 'admin', 'institute_admin', 'org_admin']}>
                <StudentOnboardingManager />
              </ProtectedRoute>
            } />
            <Route path="/trainer/certificates" element={
              <ProtectedRoute allowedRoles={['trainer', 'admin', 'institute_admin', 'org_admin']}>
                <TrainerCertificatesView />
              </ProtectedRoute>
            } />
            <Route path="/admin/student-onboarding" element={
              <ProtectedRoute allowedRoles={['admin', 'institute_admin', 'org_admin']}>
                <StudentOnboardingManager />
              </ProtectedRoute>
            } />
            <Route path="/admin/course-builder" element={
              <ProtectedRoute allowedRoles={['admin', 'institute_admin', 'org_admin']}>
                <CourseBuilderWizard />
              </ProtectedRoute>
            } />

            {/* Institute Admin Workspace Routes */}
            <Route path="/institute/dashboard" element={
              <ProtectedRoute allowedRoles={['institute_admin', 'org_admin', 'admin']}>
                <InstituteDashboard />
              </ProtectedRoute>
            } />
            <Route path="/institute/academic-structure" element={
              <ProtectedRoute allowedRoles={['institute_admin', 'org_admin', 'admin']}>
                <InstituteAcademicStructure />
              </ProtectedRoute>
            } />
            <Route path="/institute/trainers" element={
              <ProtectedRoute allowedRoles={['institute_admin', 'org_admin', 'admin']}>
                <InstituteTrainers />
              </ProtectedRoute>
            } />
            <Route path="/institute/students" element={
              <ProtectedRoute allowedRoles={['institute_admin', 'org_admin', 'admin']}>
                <InstituteStudents />
              </ProtectedRoute>
            } />
            <Route path="/institute/courses" element={
              <ProtectedRoute allowedRoles={['institute_admin', 'org_admin', 'admin']}>
                <InstituteCourses />
              </ProtectedRoute>
            } />
            <Route path="/institute/attendance" element={
              <ProtectedRoute allowedRoles={['institute_admin', 'org_admin', 'admin']}>
                <AttendanceManager />
              </ProtectedRoute>
            } />
            <Route path="/institute/certificate-template" element={
              <ProtectedRoute allowedRoles={['institute_admin', 'org_admin', 'admin']}>
                <InstituteCertTemplate />
              </ProtectedRoute>
            } />
            <Route path="/institute/audit-logs" element={
              <ProtectedRoute allowedRoles={['institute_admin', 'org_admin', 'admin']}>
                <AuditLogsCenter />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/user-approvals" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserApprovals />
              </ProtectedRoute>
            } />
            <Route path="/admin/course-governance" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CourseGovernance />
              </ProtectedRoute>
            } />
            <Route path="/admin/competency-framework" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CompetencyFramework />
              </ProtectedRoute>
            } />
            <Route path="/admin/trainer-matching" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <TrainerMatching />
              </ProtectedRoute>
            } />
            <Route path="/admin/certificates" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CertificateGovernance />
              </ProtectedRoute>
            } />
            <Route path="/admin/government-certificate" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <GovernmentCertificateStudio />
              </ProtectedRoute>
            } />
            <Route path="/admin/audit-logs" element={
              <ProtectedRoute allowedRoles={['admin', 'institute_admin', 'org_admin']}>
                <AuditLogsCenter />
              </ProtectedRoute>
            } />
            <Route path="/admin/institutes" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <InstitutionalDirectory initialTab="institutes" />
              </ProtectedRoute>
            } />
            <Route path="/admin/trainers" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <InstitutionalDirectory initialTab="trainers" />
              </ProtectedRoute>
            } />
            <Route path="/admin/trainees" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <InstitutionalDirectory initialTab="trainees" />
              </ProtectedRoute>
            } />
            <Route path="/admin/directory" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <InstitutionalDirectory initialTab="institutes" />
              </ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  </div>
  );
}

export default App;
