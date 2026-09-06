import React from 'react';
import { Shield } from 'lucide-react';

/**
 * MoES Central Governance Executive Header
 */
const AdminHeader = ({
  title,
  subtitle,
  badge = 'Ministry of Earth Sciences • Central Governance Cell',
  actions
}) => {
  return (
    <div className="mb-6">
      {/* Executive Hero Banner */}
      <div className="bg-gradient-to-r from-[#0B2545] via-[#134074] to-[#1D2D44] rounded-2xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden border border-slate-700/40">
        {/* Subtle Background Geometry */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-20 w-56 h-56 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl space-y-1.5">
            <div className="inline-flex items-center space-x-2 bg-amber-500/15 px-2.5 py-0.5 rounded-full text-[11px] font-bold backdrop-blur-sm border border-amber-400/30 text-amber-300">
              <Shield className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{badge}</span>
            </div>
            
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white leading-tight font-sans">
              {title}
            </h1>
            
            {subtitle && (
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl font-normal">
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

export default AdminHeader;
