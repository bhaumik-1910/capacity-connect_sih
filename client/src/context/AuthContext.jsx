import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from './NotificationContext';
import { Loader2 } from 'lucide-react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      // Purge any legacy persistent localStorage tokens
      try {
        localStorage.removeItem('cc_token');
      } catch (e) {}

      // sessionStorage is bound to the current tab/window lifetime only.
      // When the user closes the tab or browser, it is automatically wiped out.
      // Re-opening the site in a new tab will have no token and show the login page!
      const token = sessionStorage.getItem('cc_token');
      if (token) {
        try {
          const res = await api.getMe();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            sessionStorage.removeItem('cc_token');
            setUser(null);
          }
        } catch (err) {
          console.error('[Auth Error]', err.message);
          sessionStorage.removeItem('cc_token');
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  // Extra security: Purge any lingering tokens on window unload
  useEffect(() => {
    const handleUnload = () => {
      try {
        localStorage.removeItem('cc_token');
      } catch (e) {}
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    if (res.success && res.token) {
      sessionStorage.setItem('cc_token', res.token);
      localStorage.removeItem('cc_token');
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const logout = async () => {
    setLoggingOut(true);
    await new Promise((r) => setTimeout(r, 650));
    sessionStorage.removeItem('cc_token');
    localStorage.removeItem('cc_token');
    setUser(null);
    setLoggingOut(false);
  };

  // Instant switch between pre-seeded demo personas
  const switchDemoRole = async (targetRole) => {
    setLoading(true);
    try {
      let credentials = { email: 'admin@imd.gov.in', password: 'Admin@123' };
      if (targetRole === 'trainer') {
        credentials = { email: 'trainer.sharma@imd.gov.in', password: 'Trainer@123' };
      } else if (targetRole === 'trainee') {
        credentials = { email: 'trainee.verma@imd.gov.in', password: 'Trainee@123' };
      }
      const res = await api.login(credentials.email, credentials.password);
      if (res.success && res.token) {
        sessionStorage.setItem('cc_token', res.token);
        localStorage.removeItem('cc_token');
        setUser(res.user);
      }
    } catch (err) {
      toast.error(err.message, 'Role Switch Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loggingOut, login, logout, switchDemoRole }}>
      {children}

      {/* Seamless Logout Loading Overlay */}
      {loggingOut && (
        <div className="fixed inset-0 z-[99999] bg-slate-950/65 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-7 shadow-2xl flex flex-col items-center space-y-4 max-w-xs text-center border border-slate-100 mx-4 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shadow-inner">
              <Loader2 className="w-7 h-7 animate-spin text-rose-600" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Signing Out...</h3>
              <p className="text-xs text-slate-500 max-w-[220px] leading-relaxed">
                Clearing session security credentials and tokens safely
              </p>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
