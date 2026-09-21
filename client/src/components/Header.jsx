import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Search,
  LogOut,
  Menu,
  X,
  Bell,
  User,
  Shield,
  FileCheck,
  Building2,
  ArrowLeft,
} from 'lucide-react';
import Badge from './design-system/Badge';

/**
 * Government Minimalism Topbar (Section 11)
 * Height: 64px
 * Breadcrumb / Identity, Subtle Search, Notifications, Profile
 */
const Header = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user, logout, loggingOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobilePublicMenuOpen, setMobilePublicMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Smooth scroll or navigate to public landing page sections
  const handlePublicNav = (sectionId) => {
    setMobilePublicMenuOpen(false);
    if (location.pathname !== '/') {
      navigate(`/#${sectionId}`);
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleHomeClick = (e) => {
    setMobilePublicMenuOpen(false);
    if (location.pathname === '/') {
      e.preventDefault();
      const mainEl = document.getElementById('main-content');
      if (mainEl) {
        mainEl.scrollTo({ top: 0, behavior: 'smooth' });
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setProfileDropdownOpen(false);
      navigate('/login');
    } catch (e) {
      console.error(e);
    }
  };

  // Derive route title or breadcrumb context
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard';
    if (path.includes('/institutes')) return 'Institutional Directory';
    if (path.includes('/students') || path.includes('/student-onboarding')) return 'Students';
    if (path.includes('/trainers')) return 'Trainers';
    if (path.includes('/courses') || path.includes('/catalogue') || path.includes('/course-builder')) return 'Courses';
    if (path.includes('/assessments') || path.includes('/question-bank')) return 'Assessments';
    if (path.includes('/certificates')) return 'Certificates';
    if (path.includes('/audit-logs')) return 'Audit Logs';
    if (path.includes('/competency')) return 'Competency Framework';
    if (path.includes('/verify')) return 'Certificate Verification';
    if (path === '/') return 'Overview';
    return 'Capacity Connect';
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E5E7EB] select-none">
      {/* 1. Official Government Tricolor Ribbon Accent (Subtle 2px) */}
      <div className="gov-tricolor-accent" />

      {/* 2. Topbar Content: Exactly 64px Height */}
      <div className="h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Official Government of India & IMD Identity */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-shrink-0">
          {user && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="p-1.5 text-[#5F6B76] hover:text-[#17202A] hover:bg-[#F1F3F6] rounded-[6px] lg:hidden cursor-pointer flex-shrink-0"
              aria-label="Toggle navigation drawer"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to="/" onClick={handleHomeClick} className="flex items-center gap-2.5 sm:gap-3.5 group flex-shrink-0">
            {/* 1. National Emblem of India (Ashoka Lion Capital) */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <img
                src="/emblem-india.svg"
                alt="State Emblem of India"
                className="h-9 sm:h-10 w-auto object-contain flex-shrink-0"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/emblem-india.png';
                }}
              />
              <div className="hidden xl:flex flex-col text-left leading-none justify-center">
                <span className="text-[10px] font-bold text-[#17202A] tracking-tight">भारत सरकार</span>
                <span className="text-[9px] text-[#5F6B76] font-medium">Govt. of India</span>
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="h-7 w-px bg-[#E5E7EB] hidden sm:block flex-shrink-0" />

            {/* 3. Portal Identity */}
            <div className="flex flex-col text-left justify-center min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-bold text-[#1F4E79] tracking-tight uppercase truncate">
                  CAPACITY CONNECT
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.2 rounded-[3px] bg-[#EAF2F8] text-[#1F4E79] text-[9px] font-semibold border border-[#D0E1F0]">
                  MoES
                </span>
              </div>
              <span className="text-[10px] text-[#5F6B76] leading-tight truncate hidden sm:block">
                Smart Education & Competency Platform
              </span>
            </div>
          </Link>

          {/* Current Page Context Breadcrumb (when in app) */}
          {user && (
            <div className="hidden lg:flex items-center gap-1.5 pl-2 border-l border-[#E5E7EB] text-xs">
              <span className="text-[#87919B]">/</span>
              <span className="font-semibold text-[#17202A] truncate">
                {getPageTitle()}
              </span>
            </div>
          )}
        </div>

        {/* Center: Minimal subtle search (Only when user logged in) */}
        {user && (
          <div className="hidden md:flex items-center flex-1 max-w-xs mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-[#87919B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search resources, records..."
                className="w-full bg-[#F8FAFC] hover:bg-white focus:bg-white text-xs text-[#17202A] placeholder-[#87919B] rounded-[6px] border border-[#E5E7EB] focus:border-[#1F4E79] focus:ring-1 focus:ring-[#1F4E79] pl-9 pr-3 py-1.5 transition-colors focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Center/Right: Public Navigation Menu (when not logged in) */}
        {!user && (
          <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-xs font-medium text-[#5F6B76]">
            <Link
              to="/"
              onClick={handleHomeClick}
              className={`hover:text-[#1F4E79] transition-colors py-1 cursor-pointer ${
                location.pathname === '/' && !location.hash
                  ? 'text-[#1F4E79] border-b-2 border-[#1F4E79] font-bold'
                  : 'text-[#5F6B76] font-medium'
              }`}
            >
              Home
            </Link>
            <button
              type="button"
              onClick={() => handlePublicNav('about')}
              className="hover:text-[#1F4E79] transition-colors cursor-pointer py-1"
            >
              About
            </button>
            <button
              type="button"
              onClick={() => handlePublicNav('courses')}
              className="hover:text-[#1F4E79] transition-colors cursor-pointer py-1"
            >
              Courses
            </button>
            <button
              type="button"
              onClick={() => handlePublicNav('institutes')}
              className="hover:text-[#1F4E79] transition-colors cursor-pointer py-1"
            >
              Institutes
            </button>
            <button
              type="button"
              onClick={() => handlePublicNav('announcements')}
              className="hover:text-[#1F4E79] transition-colors cursor-pointer py-1"
            >
              Announcements
            </button>
            <Link
              to="/register-institute"
              className={`hover:text-[#1F4E79] transition-colors flex items-center gap-1.5 py-1 ${
                location.pathname === '/register-institute'
                  ? 'text-[#1F4E79] border-b-2 border-[#1F4E79] font-bold'
                  : 'text-[#5F6B76] font-medium'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-[#1F4E79]" />
              <span>Register Institute</span>
            </Link>
            <Link
              to="/verify"
              className={`hover:text-[#1F4E79] transition-colors flex items-center gap-1.5 font-semibold py-1 ${
                location.pathname.startsWith('/verify')
                  ? 'text-[#1F4E79] border-b-2 border-[#1F4E79]'
                  : 'text-[#1F4E79]'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Verify Certificate</span>
            </Link>
          </nav>
        )}

        {/* Right Section: Notifications & User Profile OR Public Actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {/* Notification Center Popover */}
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2 text-[#5F6B76] hover:text-[#17202A] hover:bg-[#F1F3F6] rounded-[6px] transition-colors relative cursor-pointer"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  <span className="w-2 h-2 rounded-full bg-[#1F4E79] absolute top-2 right-2 ring-2 ring-white" />
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-[8px] border border-[#E5E7EB] shadow-[0_4px_16px_rgba(0,0,0,0.08)] py-2 z-50">
                    <div className="px-3.5 py-2 border-b border-[#E5E7EB] flex items-center justify-between">
                      <span className="text-xs font-bold text-[#17202A]">Notifications</span>
                      <span className="text-[11px] text-[#1F4E79] font-medium cursor-pointer">Mark read</span>
                    </div>
                    <div className="divide-y divide-[#E5E7EB] max-h-64 overflow-y-auto">
                      <div className="p-3 hover:bg-[#F8FAFC] transition-colors">
                        <p className="text-xs font-semibold text-[#17202A]">Course Enrollment Confirmed</p>
                        <p className="text-[11px] text-[#5F6B76] mt-0.5">Atmospheric Modeling & Doppler Radar analysis module ready.</p>
                        <span className="text-[10px] text-[#87919B] mt-1 block">10 mins ago</span>
                      </div>
                      <div className="p-3 hover:bg-[#F8FAFC] transition-colors">
                        <p className="text-xs font-semibold text-[#17202A]">Institute Verification Approved</p>
                        <p className="text-[11px] text-[#5F6B76] mt-0.5">National Meteorological Training Center accreditation valid.</p>
                        <span className="text-[10px] text-[#87919B] mt-1 block">1 hour ago</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-[6px] hover:bg-[#F1F3F6] transition-colors cursor-pointer"
                  aria-label="User menu"
                >
                  <div className="w-7 h-7 rounded-[6px] bg-[#EAF2F8] text-[#1F4E79] font-bold text-xs flex items-center justify-center border border-[#D0E1F0]">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-xs font-semibold text-[#17202A] hidden sm:inline max-w-[120px] truncate">
                    {user.name}
                  </span>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-[8px] border border-[#E5E7EB] shadow-[0_4px_16px_rgba(0,0,0,0.08)] py-1.5 z-50">
                    <div className="px-3 py-2 border-b border-[#E5E7EB]">
                      <div className="text-xs font-bold text-[#17202A] truncate">{user.name}</div>
                      <div className="text-[11px] text-[#5F6B76] truncate">{user.email}</div>
                      <div className="mt-1">
                        <Badge variant="neutral" size="sm">
                          {user.role}
                        </Badge>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/verify"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#5F6B76] hover:text-[#17202A] hover:bg-[#F8FAFC]"
                      >
                        <Shield className="w-3.5 h-3.5 text-[#87919B]" />
                        Verify Certificate
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-[#E5E7EB]">
                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#B42318] hover:bg-[#FEE4E2]/30 transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            // Public Header Actions
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs font-semibold bg-[#1F4E79] text-white hover:bg-[#163A5C] px-3.5 py-1.5 rounded-[6px] transition-colors shadow-xs"
              >
                Sign In
              </Link>
              {/* Mobile Public Navigation Toggle */}
              <button
                type="button"
                onClick={() => setMobilePublicMenuOpen(!mobilePublicMenuOpen)}
                className="p-1.5 text-[#5F6B76] hover:text-[#17202A] hover:bg-[#F1F3F6] rounded-[6px] md:hidden cursor-pointer"
                aria-label="Toggle Public Menu"
              >
                {mobilePublicMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Public Navigation Dropdown */}
      {!user && mobilePublicMenuOpen && (
        <div className="md:hidden border-t border-[#E5E7EB] bg-white px-4 py-3 space-y-2.5 shadow-md">
          <Link
            to="/"
            onClick={handleHomeClick}
            className={`w-full block py-1.5 text-xs transition-colors ${
              location.pathname === '/' && !location.hash
                ? 'text-[#1F4E79] font-bold'
                : 'text-[#5F6B76] font-medium'
            }`}
          >
            Home
          </Link>
          <button
            type="button"
            onClick={() => handlePublicNav('about')}
            className="w-full text-left py-1.5 text-xs font-medium text-[#5F6B76] hover:text-[#1F4E79] transition-colors"
          >
            About
          </button>
          <button
            type="button"
            onClick={() => handlePublicNav('courses')}
            className="w-full text-left py-1.5 text-xs font-medium text-[#5F6B76] hover:text-[#1F4E79] transition-colors"
          >
            Courses
          </button>
          <button
            type="button"
            onClick={() => handlePublicNav('institutes')}
            className="w-full text-left py-1.5 text-xs font-medium text-[#5F6B76] hover:text-[#1F4E79] transition-colors"
          >
            Institutes
          </button>
          <button
            type="button"
            onClick={() => handlePublicNav('announcements')}
            className="w-full text-left py-1.5 text-xs font-medium text-[#5F6B76] hover:text-[#1F4E79] transition-colors"
          >
            Announcements
          </button>
          <Link
            to="/register-institute"
            onClick={() => setMobilePublicMenuOpen(false)}
            className="w-full flex items-center gap-1.5 py-1.5 text-xs font-medium text-[#5F6B76] hover:text-[#1F4E79]"
          >
            <Building2 className="w-3.5 h-3.5 text-[#1F4E79]" />
            <span>Register New Institute</span>
          </Link>
          <Link
            to="/verify"
            onClick={() => setMobilePublicMenuOpen(false)}
            className="w-full flex items-center gap-1.5 py-1.5 text-xs font-semibold text-[#1F4E79]"
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Verify Certificate</span>
          </Link>
          <div className="pt-2 border-t border-[#E5E7EB]">
            <Link
              to="/login"
              onClick={() => setMobilePublicMenuOpen(false)}
              className="w-full block text-center py-2 text-xs font-semibold bg-[#1F4E79] text-white rounded-[6px]"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
