import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Shield,
  BookOpen,
  Building2,
  Search,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  User,
  Info,
  CheckCircle2,
  Bell,
  Sparkles,
  LayoutDashboard,
  Compass,
  Award,
  UserCheck,
  GraduationCap,
  Users,
  Loader2,
  CreditCard
} from 'lucide-react';

const Header = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user, logout, loggingOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setProfileDropdownOpen(false);
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  // Derive initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Format clean role label without raw technical strings like 'platform_admin'
  const formatRoleLabel = (role) => {
    if (!role) return 'OFFICER';
    if (role === 'platform_admin' || role === 'admin') return 'ADMIN';
    if (role === 'org_admin') return 'INSTITUTE ADMIN';
    if (role === 'trainer') return 'TRAINER';
    if (role === 'trainee') return 'TRAINEE';
    return role.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] select-none transition-all">
      {/* 1. Official Government of India Tricolor Ribbon Accent */}
      <div className="w-full h-1 bg-gradient-to-r from-[#FF9933] via-[#FFFFFF] to-[#138808]" />

      {/* 2. Primary White-Theme Navigation Bar */}
      <div className="bg-white text-slate-800 px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
        
        {/* Left Section: Mobile Sidebar Toggle + Brand & Government Identity */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Mobile Sidebar Hamburger Toggle for logged-in user */}
          {user && (
            <button
              type="button"
              id="mobile-sidebar-toggle-btn"
              onClick={onToggleSidebar}
              className="p-2 lg:hidden text-slate-700 hover:text-blue-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-all cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 flex items-center justify-center"
              aria-label="Toggle Sidebar Menu"
              title="Open Navigation Menu"
            >
              {isSidebarOpen ? (
                <X className="w-5 h-5 text-blue-700" />
              ) : (
                <Menu className="w-5 h-5 text-slate-700" />
              )}
            </button>
          )}

          {/* Brand & Government Identity */}
          <Link to="/" className="flex items-center space-x-2.5 sm:space-x-3 group flex-shrink-0">
            <div className="flex items-center space-x-2">
              {/* National Emblem */}
              <div className="h-10 sm:h-11 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <img
                  src="/emblem-india.png"
                  alt="National Emblem of India"
                  className="h-10 sm:h-11 w-auto object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/logo-moes.png';
                  }}
                />
              </div>

              {/* Subtle Divider */}
              <div className="h-7 w-px bg-slate-200 hidden sm:block"></div>

              {/* MoES Official Round Seal */}
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white shadow-xs group-hover:scale-105 transition-transform duration-200 flex items-center justify-center flex-shrink-0 border border-slate-200/90 overflow-hidden">
                <img
                  src="/logo-moes.png"
                  alt="Ministry of Earth Sciences Official Seal"
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/emblem-india.png';
                  }}
                />
              </div>
            </div>

            <div>
              <span className="font-extrabold tracking-tight text-[#0B2545] text-base sm:text-lg lg:text-xl block leading-tight">
                CAPACITY CONNECT
              </span>
              <p className="text-[10px] sm:text-[11px] text-slate-500 hidden sm:block font-medium">
                Ministry of Earth Sciences • Government of India
              </p>
            </div>
          </Link>
        </div>

        {/* Public Desktop Navigation Links - Modern Crisp White Pills */}
        <nav className="hidden lg:flex items-center space-x-1 text-xs font-semibold">
          <Link
            to="/"
            className={`px-3.5 py-2 rounded-xl transition-all duration-150 ${
              isActive('/')
                ? 'bg-slate-100 text-[#0B2545] font-bold shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-[#0B2545] hover:bg-slate-50'
            }`}
          >
            Home
          </Link>

          <Link
            to="/trainee/catalogue"
            className={`px-3.5 py-2 rounded-xl transition-all duration-150 flex items-center space-x-1.5 ${
              isActive('/trainee/catalogue')
                ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200 shadow-xs'
                : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span>Course Catalogue</span>
          </Link>

          <Link
            to="/register-institute"
            className={`px-3.5 py-2 rounded-xl transition-all duration-150 flex items-center space-x-1.5 ${
              isActive('/register-institute')
                ? 'bg-amber-50 text-amber-900 font-bold border border-amber-300 shadow-xs'
                : 'text-amber-800 bg-amber-50/40 hover:bg-amber-100/60 border border-amber-200/60'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-amber-600" />
            <span>Register Institute</span>
          </Link>

          <Link
            to="/verify"
            className={`px-3.5 py-2 rounded-xl transition-all duration-150 flex items-center space-x-1.5 ${
              isActive('/verify')
                ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-300 shadow-xs'
                : 'text-emerald-800 bg-emerald-50/40 hover:bg-emerald-100/60 border border-emerald-200/60'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verify Certificate</span>
          </Link>

          <Link
            to="/pricing"
            className={`px-3.5 py-2 rounded-xl transition-all duration-150 flex items-center space-x-1.5 ${
              isActive('/pricing')
                ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200 shadow-xs'
                : 'text-slate-600 hover:text-[#0B2545] hover:bg-slate-50'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-blue-600" />
            <span>Plans & Pricing</span>
          </Link>

          <Link
            to="/about"
            className={`px-3.5 py-2 rounded-xl transition-all duration-150 flex items-center space-x-1.5 ${
              isActive('/about')
                ? 'bg-slate-100 text-[#0B2545] font-bold border border-slate-200'
                : 'text-slate-600 hover:text-[#0B2545] hover:bg-slate-50'
            }`}
          >
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>MoES Framework</span>
          </Link>
        </nav>

        {/* Right Section: User Profile or Sign In */}
        <div className="flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-3 pl-2 sm:pl-3 border-l border-slate-200">
              
              {/* User Avatar Dropdown Trigger */}
              <div ref={profileRef} className="relative">
                <button
                  type="button"
                  id="user-profile-menu-button"
                  onClick={() => setProfileDropdownOpen((prev) => !prev)}
                  className={`relative flex items-center justify-center p-0.5 rounded-2xl transition-all duration-200 cursor-pointer focus:outline-none ${
                    profileDropdownOpen
                      ? 'ring-4 ring-blue-500/30 scale-105 shadow-md'
                      : 'hover:ring-4 hover:ring-blue-500/20 hover:scale-105 shadow-xs'
                  }`}
                  aria-expanded={profileDropdownOpen}
                  aria-haspopup="true"
                  title={`${user.name} (${formatRoleLabel(user.role)}) - Click to open menu`}
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs text-white shadow-sm ${
                    user.role === 'trainee'
                      ? 'bg-gradient-to-br from-blue-600 to-cyan-600'
                      : user.role === 'trainer'
                      ? 'bg-gradient-to-br from-indigo-600 to-purple-600'
                      : 'bg-gradient-to-br from-slate-900 to-[#0B2545]'
                  }`}>
                    {getInitials(user.name)}
                  </div>
                  {/* Verified Online Active Indicator */}
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-2xs" />
                </button>

                {/* Dropdown Menu Modal */}
                {profileDropdownOpen && (
                  <div 
                    id="user-profile-dropdown-menu"
                    className="absolute right-0 top-full mt-2.5 w-[calc(100vw-28px)] max-w-sm sm:w-96 bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(11,37,69,0.22)] border border-slate-200 p-4 space-y-3.5 z-50 transition-all animate-in fade-in"
                  >
                    {/* User Identity Header Card */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/50 border border-slate-200/90 space-y-2.5">
                      <div className="flex items-center space-x-3">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm text-white shadow-xs flex-shrink-0 ${
                          user.role === 'trainee'
                            ? 'bg-gradient-to-br from-blue-600 to-cyan-600'
                            : user.role === 'trainer'
                            ? 'bg-gradient-to-br from-indigo-600 to-purple-600'
                            : 'bg-gradient-to-br from-slate-900 to-[#0B2545]'
                        }`}>
                          {getInitials(user.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">
                              {user.name?.replace(/\s*\(DG Admin\)/i, '').trim()}
                            </h4>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded-md font-mono uppercase font-bold tracking-wider border ${
                              user.role === 'trainee'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : user.role === 'trainer'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                : 'bg-amber-50 text-amber-900 border-amber-300'
                            }`}>
                              {formatRoleLabel(user.role)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-mono truncate mt-0.5">{user.email}</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/70 text-[11px] text-slate-600 space-y-1">
                        <div className="flex items-center space-x-1.5">
                          <Building2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                          <span className="font-semibold text-slate-800 truncate">
                            {user.organizationName || 'India Meteorological Department (IMD)'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <Shield className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate text-slate-500">
                            {user.designation || 'Scientific Officer'} • {user.department || 'Governance'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-1 font-mono text-[10px] text-emerald-600">
                          <span className="flex items-center space-x-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Active MoES Session</span>
                          </span>
                          <span className="text-slate-400">Gov Cloud Secure</span>
                        </div>
                      </div>
                    </div>

                    {/* Role-Specific Quick Navigation Links */}
                    <div className="space-y-0.5 text-xs">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                        Workspace Navigation
                      </div>

                      {user.role?.toLowerCase().includes('admin') ? (
                        <>
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-blue-700 transition font-medium"
                          >
                            <span className="flex items-center space-x-2.5">
                              <LayoutDashboard className="w-4 h-4 text-blue-600" />
                              <span>Executive Dashboard</span>
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          </Link>
                          <Link
                            to="/admin/institutes"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-blue-700 transition font-medium"
                          >
                            <span className="flex items-center space-x-2.5">
                              <Building2 className="w-4 h-4 text-indigo-600" />
                              <span>Institutional Directory</span>
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          </Link>
                          <Link
                            to="/admin/user-approvals"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-blue-700 transition font-medium"
                          >
                            <span className="flex items-center space-x-2.5">
                              <UserCheck className="w-4 h-4 text-amber-600" />
                              <span>User Verification Queue</span>
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          </Link>
                        </>
                      ) : user.role === 'trainer' ? (
                        <>
                          <Link
                            to="/trainer/dashboard"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-indigo-700 transition font-medium"
                          >
                            <span className="flex items-center space-x-2.5">
                              <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                              <span>Trainer Studio</span>
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          </Link>
                          <Link
                            to="/trainer/course-builder"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-indigo-700 transition font-medium"
                          >
                            <span className="flex items-center space-x-2.5">
                              <BookOpen className="w-4 h-4 text-blue-600" />
                              <span>Course Builder Wizard</span>
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          </Link>
                          <Link
                            to="/trainer/my-courses"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-indigo-700 transition font-medium"
                          >
                            <span className="flex items-center space-x-2.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>My Authored Courses</span>
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            to="/trainee/dashboard"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-blue-700 transition font-medium"
                          >
                            <span className="flex items-center space-x-2.5">
                              <LayoutDashboard className="w-4 h-4 text-blue-600" />
                              <span>Trainee Dashboard</span>
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          </Link>
                          <Link
                            to="/trainee/catalogue"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-blue-700 transition font-medium"
                          >
                            <span className="flex items-center space-x-2.5">
                              <BookOpen className="w-4 h-4 text-sky-600" />
                              <span>Course Catalogue</span>
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          </Link>
                          <Link
                            to="/trainee/competency-passport"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-blue-700 transition font-medium"
                          >
                            <span className="flex items-center space-x-2.5">
                              <Compass className="w-4 h-4 text-indigo-600" />
                              <span>Competency Passport</span>
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          </Link>
                          <Link
                            to="/trainee/certificates"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-blue-700 transition font-medium"
                          >
                            <span className="flex items-center space-x-2.5">
                              <Award className="w-4 h-4 text-amber-600" />
                              <span>My Certificates</span>
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          </Link>
                        </>
                      )}
                    </div>

                    {/* Dropdown Footer: Sign Out Button */}
                    <div className="pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        disabled={isLoggingOut || loggingOut}
                        onClick={handleLogout}
                        className="w-full py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-2 shadow-2xs cursor-pointer border border-rose-200 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isLoggingOut || loggingOut ? (
                          <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                        ) : (
                          <LogOut className="w-4 h-4" />
                        )}
                        <span>{isLoggingOut || loggingOut ? 'Signing Out...' : 'Sign Out / Log Out'}</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/register"
                className="text-xs font-semibold text-slate-700 hover:text-[#0B2545] px-3.5 py-2 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition shadow-xs"
              >
                Register
              </Link>
              <Link
                to="/login"
                className="text-xs bg-[#0B2545] hover:bg-slate-900 text-white font-bold px-4 py-2 rounded-xl shadow-sm hover:shadow transition flex items-center space-x-1.5 group"
              >
                <span>Sign In</span>
                <ChevronRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          )}

          {/* Public Mobile Navigation Menu Toggle (For guest visitors) */}
          {!user && (
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-2 lg:hidden text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
              aria-label="Toggle Public Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>

      </div>

      {/* Mobile Menu Drawer - White Theme */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white text-slate-800 p-4 space-y-2 border-t border-slate-200 text-xs font-semibold shadow-xl animate-in slide-in-from-top-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2.5 px-3 rounded-xl hover:bg-slate-100"
          >
            Home
          </Link>
          <Link
            to="/trainee/catalogue"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2.5 px-3 rounded-xl hover:bg-slate-100 flex items-center space-x-2"
          >
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Course Catalogue</span>
          </Link>
          <Link
            to="/register-institute"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2.5 px-3 rounded-xl text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200"
          >
            Register Institute / Academy
          </Link>
          <Link
            to="/verify"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2.5 px-3 rounded-xl text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
          >
            Verify Certificate (QR)
          </Link>
          <Link
            to="/pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2.5 px-3 rounded-xl text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 flex items-center space-x-2"
          >
            <CreditCard className="w-4 h-4 text-blue-600" />
            <span>Plans & Pricing</span>
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2.5 px-3 rounded-xl hover:bg-slate-100"
          >
            About MoES Framework
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;
