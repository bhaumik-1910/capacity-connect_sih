import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  CheckSquare,
  Award,
  BarChart3,
  FileCheck,
  History,
  Settings,
  Search,
  LogOut,
  X,
  Layers,
  Calendar,
  Compass,
  Cpu,
  Sliders,
  UserCheck,
  UserPlus,
  ShieldCheck,
  PlusCircle,
  Bell,
} from 'lucide-react';

/**
 * Government Minimalism Sidebar (Section 10)
 * Width: 240px
 * Outline Lucide icons (18px)
 * Subtle active states (#EAF2F8 bg, #1F4E79 text), no saturated blocks
 */
const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, loggingOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const role = user.role;
  const isPlatformAdmin = role === 'platform_admin' || role === 'platform_super_admin' || role === 'admin';
  const isInstituteAdmin = role === 'institute_admin' || role === 'org_admin';
  const isTrainer = role === 'trainer';
  const isTrainee = role === 'trainee' || role === 'student';
  const isAdmin = isPlatformAdmin;

  // Trainee Navigation Links
  const traineeLinks = [
    { to: '/trainee/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/trainee/catalogue', label: 'Courses', icon: BookOpen },
    { to: '/trainee/my-courses', label: 'My Learning', icon: GraduationCap },
    { to: '/trainee/competency-passport', label: 'Competencies', icon: Compass },
    { to: '/trainee/certificates', label: 'Certificates', icon: Award },
    { to: '/trainee/sessions', label: 'Schedule', icon: Calendar },
  ];

  // Institute Admin Navigation Links
  const instituteLinks = [
    { to: '/institute/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/institute/academic-structure', label: 'Academic Structure', icon: Layers },
    { to: '/institute/trainers', label: 'Trainers', icon: Users },
    { to: '/institute/students', label: 'Students', icon: GraduationCap },
    { to: '/institute/courses', label: 'Courses', icon: BookOpen },
    { to: '/institute/attendance', label: 'Attendance', icon: Calendar },
    { to: '/institute/certificate-template', label: 'Certificate Builder', icon: Award },
    { to: '/institute/audit-logs', label: 'Audit Logs', icon: History },
    { to: '/institute/reports', label: 'Reports', icon: BarChart3 },
  ];

  // Trainer Navigation Links
  const trainerLinks = [
    { to: '/trainer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/trainer/student-onboarding', label: 'Student Management', icon: UserPlus },
    { to: '/trainer/course-builder', label: 'Course Builder', icon: Layers },
    { to: '/trainer/my-courses', label: 'My Courses', icon: BookOpen },
    { to: '/trainer/question-bank', label: 'Assessments', icon: CheckSquare },
    { to: '/trainer/trainee-analytics', label: 'Analytics & Reports', icon: BarChart3 },
    { to: '/trainer/attendance', label: 'Attendance', icon: Calendar },
    { to: '/trainer/certificates', label: 'Certificates', icon: Award },
  ];

  // Admin Navigation Links
  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/institutes', label: 'Institutes Directory', icon: Building2 },
    { to: '/admin/user-approvals', label: 'Verifications', icon: UserCheck },
    { to: '/admin/course-governance', label: 'Course Governance', icon: ShieldCheck },
    { to: '/admin/government-certificate', label: 'Certificate Studio', icon: Award },
    { to: '/admin/student-onboarding', label: 'Student Directory', icon: GraduationCap },
    { to: '/admin/competency-framework', label: 'Competency Framework', icon: Cpu },
    { to: '/admin/trainer-matching', label: 'Trainer Allocation', icon: Sliders },
    { to: '/admin/certificates', label: 'Certificate Registry', icon: FileCheck },
    { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
    { to: '/admin/audit-logs', label: 'Audit Logs', icon: History },
  ];

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  const getRoleLabel = () => {
    if (isPlatformAdmin) return 'Platform Admin';
    if (isInstituteAdmin) return 'Institute Admin';
    if (isTrainer) return 'Trainer';
    if (isTrainee) return 'Student';
    return 'Officer';
  };

  const navLinks = isInstituteAdmin
    ? instituteLinks
    : isTrainer
    ? trainerLinks
    : isTrainee
    ? traineeLinks
    : adminLinks;

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar 240px */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[240px] bg-white text-[#17202A] h-full overflow-y-auto no-scrollbar border-r border-[#E5E7EB] flex flex-col flex-shrink-0 select-none transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Institutional Branding Header */}
        <div className="p-3.5 border-b border-[#E5E7EB] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src="/emblem-india.svg"
              alt="State Emblem of India"
              className="w-8 h-8 object-contain flex-shrink-0"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/emblem-india.png';
              }}
            />
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#17202A] tracking-tight leading-tight uppercase truncate">
                CAPACITY CONNECT
              </div>
              <div className="text-[10px] text-[#5F6B76] leading-tight truncate">
                MoES · Govt. of India
              </div>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#87919B] hover:text-[#17202A] rounded-[4px] lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section Label */}
        <div className="px-4 pt-4 pb-2">
          <span className="text-[10px] font-semibold text-[#87919B] tracking-wider uppercase">
            Navigation
          </span>
        </div>

        {/* Main Nav Items */}
        <nav className="flex-1 px-3 space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={handleLinkClick}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-[#EAF2F8] text-[#1F4E79] font-semibold border-l-2 border-[#1F4E79]'
                    : 'text-[#5F6B76] hover:bg-[#F8FAFC] hover:text-[#17202A]'
                }`}
              >
                <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-[#1F4E79]' : 'text-[#87919B]'}`} />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}

          {/* Public Verification Link */}
          <div className="pt-3 mt-3 border-t border-[#E5E7EB]">
            <NavLink
              to="/verify"
              onClick={handleLinkClick}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-[#EAF2F8] text-[#1F4E79] font-semibold'
                    : 'text-[#5F6B76] hover:bg-[#F8FAFC] hover:text-[#17202A]'
                }`
              }
            >
              <Search className="w-[18px] h-[18px] text-[#87919B] flex-shrink-0" />
              <span className="truncate">Verify Certificate</span>
            </NavLink>
          </div>
        </nav>

        {/* User Profile & Sign Out Footer */}
        <div className="p-3 border-t border-[#E5E7EB] bg-[#F8FAFC]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-[6px] bg-[#EAF2F8] text-[#1F4E79] font-semibold text-xs flex items-center justify-center flex-shrink-0 border border-[#D0E1F0]">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-[#17202A] truncate">
                  {user.name}
                </div>
                <div className="text-[11px] text-[#5F6B76] truncate">
                  {getRoleLabel()}
                </div>
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
              className="p-1.5 rounded-[4px] text-[#87919B] hover:text-[#B42318] hover:bg-[#FEE4E2]/40 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
