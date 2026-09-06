import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Award,
  Compass,
  Calendar,
  Layers,
  Users,
  CheckSquare,
  ShieldCheck,
  FileCheck,
  TrendingUp,
  Cpu,
  Search,
  Sliders,
  History,
  Info,
  Building2,
  Sparkles,
  CheckCircle,
  ExternalLink,
  Shield,
  UserCheck,
  UserPlus,
  X,
  LogOut,
  Loader2,
  PlusCircle
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, loggingOut } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  const role = user.role;
  const isPlatformAdmin = role === 'platform_admin' || role === 'platform_super_admin' || role === 'admin';
  const isInstituteAdmin = role === 'institute_admin' || role === 'org_admin';
  const isTrainer = role === 'trainer';
  const isTrainee = role === 'trainee' || role === 'student';
  const isAdmin = isPlatformAdmin;

  const traineeLinks = [
    { to: '/trainee/dashboard', label: 'Trainee Dashboard', icon: LayoutDashboard },
    { to: '/trainee/catalogue', label: 'Course Catalogue', icon: BookOpen },
    { to: '/trainee/my-courses', label: 'My Enrolled Courses & Exams', icon: GraduationCap },
    { to: '/trainee/competency-passport', label: 'Competency Passport', icon: Compass },
    { to: '/trainee/certificates', label: 'My Certificates', icon: Award },
    { to: '/trainee/sessions', label: 'Training Calendar & Lab', icon: Calendar },
  ];

  const instituteLinks = [
    { to: '/institute/dashboard', label: 'Institute Overview', icon: LayoutDashboard },
    { to: '/institute/academic-structure', label: 'Academic Structure', icon: Layers },
    { to: '/institute/trainers', label: 'Faculty & Trainers', icon: Users },
    { to: '/institute/students', label: 'Student Cohorts (Excel)', icon: UserPlus },
    { to: '/institute/courses', label: 'Courses & Allocations', icon: BookOpen },
    { to: '/institute/attendance', label: 'Session Attendance', icon: Calendar },
    { to: '/institute/certificate-template', label: 'Certificate Designer', icon: Award },
    { to: '/institute/audit-logs', label: 'Security & Audit Logs', icon: History }
  ];

  const trainerLinks = [
    { to: '/trainer/dashboard', label: 'Trainer Studio', icon: LayoutDashboard },
    { to: '/trainer/student-onboarding', label: 'Student ID & Excel Onboard', icon: UserPlus },
    { to: '/trainer/course-builder', label: 'Course Builder Wizard', icon: Layers },
    { to: '/trainer/my-courses', label: 'My Authored Courses', icon: BookOpen },
    { to: '/trainer/question-bank', label: 'Question Bank & MCQs', icon: CheckSquare },
    { to: '/trainer/trainee-analytics', label: 'Trainee Analytics', icon: Users },
    { to: '/trainer/attendance', label: 'Session Attendance', icon: Calendar },
    { to: '/trainer/certificates', label: 'Student Certificates', icon: Award },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { to: '/admin/course-builder', label: 'Create Government Course', icon: PlusCircle },
    { to: '/admin/government-certificate', label: 'Govt Certificate Studio', icon: Award },
    { to: '/admin/student-onboarding', label: 'Student Onboarding & IDs', icon: UserPlus },
    { to: '/admin/institutes', label: 'Institutional Directory', icon: Building2 },
    { to: '/admin/user-approvals', label: 'User Verification Queue', icon: UserCheck },
    { to: '/admin/course-governance', label: 'Course Content Governance', icon: ShieldCheck },
    { to: '/trainer/trainee-analytics', label: 'Trainee Gradebook & Analytics', icon: Users },
    { to: '/admin/competency-framework', label: 'Competency Taxonomy', icon: Cpu },
    { to: '/admin/trainer-matching', label: 'AI Trainer Matcher', icon: Sliders },
    { to: '/admin/certificates', label: 'Certificate Registry', icon: FileCheck },
    { to: '/admin/audit-logs', label: 'Security & Audit Logs', icon: History },
  ];

  const commonLinks = [
    { to: '/register-institute', label: 'Register Institute / Academy', icon: Building2 },
    { to: '/verify', label: 'Verify Certificate (QR)', icon: Search },
    { to: '/about', label: 'MoES Capacity Framework', icon: Info },
  ];

  // Role-specific theme accents for active links
  const getActiveLinkClass = () => {
    if (isTrainee) return 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold';
    if (isTrainer) return 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 font-bold';
    if (isInstituteAdmin) return 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20 font-bold';
    return 'bg-[#0B2545] text-white shadow-md shadow-slate-900/20 font-bold';
  };

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Dark Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar: Off-canvas drawer on mobile/tablet (< lg), docked static on desktop (lg+) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white text-slate-700 h-full overflow-y-auto no-scrollbar border-r border-slate-200/90 shadow-2xl lg:shadow-[1px_0_8px_rgba(0,0,0,0.02)] flex flex-col p-3.5 flex-shrink-0 select-none transition-transform duration-300 ease-in-out lg:static lg:w-64 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="pb-6">
          
          {/* Mobile Drawer Header with Close Button */}
          <div className="flex items-center justify-between pb-3 mb-2.5 border-b border-slate-100 lg:hidden">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-[#0B2545] text-white flex items-center justify-center font-black text-xs">
                CC
              </div>
              <span className="font-extrabold text-xs text-[#0B2545] tracking-tight">
                Workspace Navigation
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              title="Close Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Dynamic Navigation Section */}
          <div className="mb-2 px-1 flex items-center justify-between">
            <span className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
              {isPlatformAdmin ? 'Platform Admin Suite' : isInstituteAdmin ? 'Institute Workspace' : isTrainer ? 'Trainer Tools' : 'Learner Hub'}
            </span>
            <span className="text-[9px] font-mono text-slate-400">
              {isTrainee ? '6 Tools' : isTrainer ? '8 Tools' : isInstituteAdmin ? `${instituteLinks.length} Modules` : `${adminLinks.length} Modules`}
            </span>
          </div>

          <nav className="space-y-1">
            {isInstituteAdmin && instituteLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                    `flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                      isActive
                        ? getActiveLinkClass()
                        : 'text-slate-600 hover:bg-emerald-50/70 hover:text-emerald-800'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className={`p-1 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-700'
                      }`}>
                        <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                      </div>
                      <span className="truncate">{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
            {isTrainee && traineeLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                    `flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                      isActive
                        ? getActiveLinkClass()
                        : 'text-slate-600 hover:bg-blue-50/60 hover:text-blue-700'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className={`p-1 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-700'
                      }`}>
                        <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                      </div>
                      <span className="truncate">{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}

            {isTrainer && trainerLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                    `flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                      isActive
                        ? getActiveLinkClass()
                        : 'text-slate-600 hover:bg-indigo-50/60 hover:text-indigo-700'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className={`p-1 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-700'
                      }`}>
                        <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                      </div>
                      <span className="truncate">{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}

            {isAdmin && adminLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                    `flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                      isActive
                        ? getActiveLinkClass()
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className={`p-1 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-800'
                      }`}>
                        <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                      </div>
                      <span className="truncate">{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}

            {/* Public & Registry Section - Admin Only */}
            {isAdmin && (
              <div className="pt-4 mt-4 border-t border-slate-100">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2 px-1">
                  National Services
                </span>
                {commonLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={handleLinkClick}
                      className={({ isActive }) =>
                        `flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 group ${
                          isActive
                            ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200 shadow-xs'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                        }`
                      }
                    >
                      <div className="p-1 rounded-lg bg-slate-50 group-hover:bg-white text-slate-400 group-hover:text-amber-600 transition-colors">
                        <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                      </div>
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            )}
          </nav>

          {/* User Profile & Logout Section at Bottom of Sidebar */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/80 mt-auto">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                  {user.name?.charAt(0) || 'U'}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-800 truncate">{user.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono truncate uppercase">{user.role}</div>
                </div>
              </div>
              <button
                type="button"
                disabled={loggingOut}
                onClick={async () => {
                  if (onClose) onClose();
                  await logout();
                  navigate('/login');
                }}
                title="Sign Out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition cursor-pointer disabled:opacity-50 flex-shrink-0"
              >
                {loggingOut ? (
                  <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
