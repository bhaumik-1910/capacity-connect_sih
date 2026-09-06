import React from 'react';
import { ShieldCheck } from 'lucide-react';

/**
 * Accredited Institute Tenant Authority Header
 */
const InstituteHeader = ({
  title,
  subtitle,
  orgCode = 'INST',
  badge = 'Accredited Autonomous Institute Tenant',
  actions
}) => {
  return (
    <div className="mb-6">
      {/* Executive Institutional Hero Banner */}
      <div className="bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#0f172a] rounded-2xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden border border-emerald-700/40">
        {/* Subtle Ambient Glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-emerald-400/15 blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-20 w-56 h-56 rounded-full bg-teal-300/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1.5 bg-emerald-400/20 px-2.5 py-0.5 rounded-full text-[11px] font-bold backdrop-blur-sm border border-emerald-300/30 text-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{badge}</span>
              </span>
              <span className="bg-slate-900/40 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold text-amber-300 border border-white/10">
                CODE: {orgCode}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white leading-tight font-sans">
              {title}
            </h1>

            {subtitle && (
              <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed max-w-xl font-normal">
                {subtitle}
              </p>
            )}
          </div>

          {actions && (
            <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstituteHeader;
