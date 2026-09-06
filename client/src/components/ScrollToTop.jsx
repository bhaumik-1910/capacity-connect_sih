import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';

/**
 * ScrollToTop Component
 * 1. Automatically scrolls to top on route change (both window and main scroll container).
 * 2. Displays a floating "Back to Top" button when user scrolls down > 300px.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);

  // 1. Reset scroll to top on page / route transition
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const mainEl = document.getElementById('main-content');
    if (mainEl) {
      mainEl.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [pathname]);

  // 2. Track scroll position to show/hide floating button
  useEffect(() => {
    const toggleVisibility = () => {
      const mainEl = document.getElementById('main-content');
      const scrollPos = Math.max(window.scrollY || 0, mainEl ? mainEl.scrollTop : 0);
      if (scrollPos > 280) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    const mainEl = document.getElementById('main-content');
    if (mainEl) {
      mainEl.addEventListener('scroll', toggleVisibility, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
      if (mainEl) {
        mainEl.removeEventListener('scroll', toggleVisibility);
      }
    };
  }, []);

  // 3. Smooth scroll back to top handler
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const mainEl = document.getElementById('main-content');
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      title="Scroll to Top"
      aria-label="Scroll to top of page"
      className="fixed bottom-6 right-6 z-50 p-3 bg-[#0B2545] hover:bg-amber-500 text-white hover:text-slate-950 rounded-2xl shadow-2xl border border-slate-700/60 transition-all duration-300 transform hover:scale-110 flex items-center justify-center group focus:outline-none focus:ring-2 focus:ring-amber-400"
    >
      <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform duration-200" />
      <span className="sr-only">Scroll to top</span>
    </button>
  );
};

export default ScrollToTop;
