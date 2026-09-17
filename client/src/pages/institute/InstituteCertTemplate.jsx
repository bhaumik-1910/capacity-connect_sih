import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/NotificationContext';
import InstituteHeader from '../../components/InstituteHeader';
import {
  Award,
  Save,
  RefreshCw,
  Image,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Building2,
  QrCode,
  Sparkles,
  SlidersHorizontal,
  Lock
} from 'lucide-react';

const InstituteCertTemplate = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orgId, setOrgId] = useState(null);
  const [org, setOrg] = useState(null);

  const [template, setTemplate] = useState({
    orgDisplayName: '',
    logoUrl: '',
    signatoryName: '',
    signatoryDesignation: '',
    headerLine: 'National Digital Education Architecture (NDEAR) • MoES / IMD Accredited',
    minScoreForCertificate: 80,
    footerNote: 'Valid across all participating national meteorological & climate institutes.'
  });

  const loadTemplate = async () => {
    setLoading(true);
    try {
      const res = await api.getInstituteMetrics();
      if (res.success && res.organization) {
        setOrgId(res.organization._id);
        setOrg(res.organization);
        const cert = res.organization.certificateTemplate || {};
        setTemplate({
          orgDisplayName: cert.orgDisplayName || res.organization.displayName || res.organization.legalName || '',
          logoUrl: cert.logoUrl || '',
          signatoryName: cert.signatoryName || '',
          signatoryDesignation: cert.signatoryDesignation || '',
          headerLine: cert.headerLine || 'National Digital Education Architecture (NDEAR) • MoES / IMD Accredited',
          minScoreForCertificate: cert.minScoreForCertificate ?? 80,
          footerNote: cert.footerNote || 'Valid across all participating national meteorological & climate institutes.'
        });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load certificate template');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplate();
  }, []);

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!orgId) return;
    setSaving(true);
    try {
      const res = await api.updateCertificateTemplate(orgId, template);
      if (res.success) {
        toast.success(
          `Certificate template saved! New template version active. Past certificates remain immutable.`,
          'Branding Updated'
        );
        loadTemplate();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save certificate template');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 select-none max-w-7xl mx-auto">
      
      {/* Executive Institutional Header */}
      <InstituteHeader
        title="Official Certificate Design & Accreditation Studio"
        subtitle="Configure institutional identity, authorized signatories, passing standards, and immutable template snapshots issued to graduated trainees."
        orgCode={org?.code || 'INST'}
        badge="Immutable Certificate Studio"
        actions={
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="px-4 py-2 bg-white text-emerald-950 hover:bg-emerald-50 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <Save className={`w-4 h-4 ${saving ? 'animate-spin text-emerald-700' : 'text-emerald-700'}`} />
            <span>{saving ? 'Publishing Version...' : 'Save & Publish Template'}</span>
          </button>
        }
      />

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3 bg-white rounded-3xl border border-slate-200">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
          <div className="text-slate-600 font-bold text-xs tracking-wide">Loading certificate template studio...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Editor Form (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4 text-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Template Parameters</h3>
                    <span className="text-[10px] text-slate-400">Snapshot freezes on issuance</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase flex items-center space-x-1">
                  <Lock className="w-3 h-3 text-amber-600" />
                  <span>Immutable</span>
                </span>
              </div>

              <form onSubmit={handleSave} className="space-y-3.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Institute Display Name on Certificate *
                  </label>
                  <input
                    type="text"
                    required
                    value={template.orgDisplayName}
                    onChange={(e) => setTemplate({ ...template, orgDisplayName: e.target.value })}
                    placeholder="e.g. Indian Institute of Tropical Meteorology (IITM)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Institute Official Logo URL
                  </label>
                  <input
                    type="url"
                    value={template.logoUrl}
                    onChange={(e) => setTemplate({ ...template, logoUrl: e.target.value })}
                    placeholder="https://example.gov.in/logo.png"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Signatory Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={template.signatoryName}
                      onChange={(e) => setTemplate({ ...template, signatoryName: e.target.value })}
                      placeholder="Enter signatory authority full name"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Signatory Designation *
                    </label>
                    <input
                      type="text"
                      required
                      value={template.signatoryDesignation}
                      onChange={(e) => setTemplate({ ...template, signatoryDesignation: e.target.value })}
                      placeholder="Enter official designation (e.g. Director / Registrar)"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Certificate Header Subtitle
                  </label>
                  <input
                    type="text"
                    value={template.headerLine}
                    onChange={(e) => setTemplate({ ...template, headerLine: e.target.value })}
                    placeholder="Ministry of Earth Sciences Accreditation"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                  />
                </div>

                <div className="p-4 bg-gradient-to-br from-emerald-50/70 to-teal-50/50 border border-emerald-200/80 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-950 flex items-center space-x-1.5">
                      <Award className="w-4 h-4 text-emerald-700" />
                      <span>Minimum Passing Score for Certificate</span>
                    </span>
                    <span className="px-2.5 py-0.5 bg-emerald-700 text-white rounded-md text-xs font-mono font-black">
                      {template.minScoreForCertificate}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    step="5"
                    value={template.minScoreForCertificate}
                    onChange={(e) => setTemplate({ ...template, minScoreForCertificate: Number(e.target.value) })}
                    className="w-full accent-emerald-700 cursor-pointer"
                  />
                  <p className="text-[11px] text-emerald-800 leading-snug">
                    Standard compliance: <strong>80% minimum</strong>. Trainees scoring below this threshold will not receive certificate credentials.
                  </p>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Footer Compliance Note
                  </label>
                  <textarea
                    rows="2"
                    value={template.footerNote}
                    onChange={(e) => setTemplate({ ...template, footerNote: e.target.value })}
                    placeholder="Official validation notes..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                  />
                </div>
              </form>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl transition flex items-center justify-center space-x-2 shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Publishing Snapshot...' : 'Save & Publish Template'}</span>
              </button>
            </div>
          </div>

          {/* Live Dynamic Certificate Preview (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Live Certificate Rendering Preview</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                A4 Landscape Ratio
              </span>
            </div>

            {/* Certificate Preview Card */}
            <div className="bg-gradient-to-br from-[#fffdfa] via-white to-[#fefcf8] p-8 sm:p-10 rounded-3xl border-8 border-double border-amber-900/30 shadow-2xl relative overflow-hidden select-none">
              
              {/* Subtle Guilloche Watermark Effect */}
              <div className="absolute inset-0 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.03] pointer-events-none" />

              {/* Corner Embellishments */}
              <div className="absolute top-2.5 left-2.5 text-amber-900/40 font-serif text-2xl font-black">❖</div>
              <div className="absolute top-2.5 right-2.5 text-amber-900/40 font-serif text-2xl font-black">❖</div>
              <div className="absolute bottom-2.5 left-2.5 text-amber-900/40 font-serif text-2xl font-black">❖</div>
              <div className="absolute bottom-2.5 right-2.5 text-amber-900/40 font-serif text-2xl font-black">❖</div>

              <div className="text-center space-y-3 max-w-lg mx-auto relative z-10">
                {/* Logo or Emblem */}
                <div className="mx-auto flex items-center justify-center">
                  {template.logoUrl ? (
                    <img
                      src={template.logoUrl}
                      alt="Institute Logo"
                      className="h-14 object-contain"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-800 to-amber-950 text-amber-100 flex items-center justify-center font-bold text-2xl shadow-md border border-amber-700/50">
                      🏛️
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-[10px] font-bold text-amber-900/80 tracking-widest uppercase font-mono">
                    {template.headerLine || 'Government of India • Ministry of Earth Sciences'}
                  </div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mt-1 font-serif">
                    {template.orgDisplayName || 'National Meteorological Training Institute'}
                  </h3>
                </div>

                <div className="pt-1">
                  <div className="text-[11px] uppercase tracking-widest font-black text-amber-900 border-y-2 border-amber-900/20 py-1.5 inline-block px-5 bg-amber-50/50 rounded-xs">
                    CERTIFICATE OF ACCREDITATION & EXCELLENCE
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 italic pt-1">
                  This is to officially certify that
                </div>

                <div className="text-2xl font-black text-slate-900 tracking-wide border-b-2 border-slate-300 pb-1.5 inline-block px-8 font-serif">
                  Bhaumik Kothiya
                </div>

                <div className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                  has successfully passed the comprehensive assessment for
                  <br />
                  <strong className="text-slate-900 font-bold">Advanced Doppler Radar Meteorology & Severe Storm Forecasting</strong>
                  <br />
                  scoring <span className="font-black text-emerald-800 font-mono">92%</span> (Passing threshold: {template.minScoreForCertificate}%)
                </div>

                {/* Footer Signatures & QR */}
                <div className="pt-6 flex items-end justify-between border-t border-amber-900/20 text-left text-[10px]">
                  <div>
                    <div className="font-bold text-slate-900 font-serif">{template.signatoryName || 'Dr. Authorized Signatory'}</div>
                    <div className="text-slate-500 text-[10px]">{template.signatoryDesignation || 'Director General'}</div>
                    <div className="text-[9px] text-slate-400 mt-1 font-mono">Date: {new Date().toLocaleDateString()}</div>
                  </div>

                  <div className="text-center">
                    <div className="w-13 h-13 bg-white p-1 rounded-xl border border-slate-200 shadow-sm mx-auto flex items-center justify-center">
                      <QrCode className="w-10 h-10 text-slate-800" />
                    </div>
                    <div className="text-[8px] font-mono text-slate-500 mt-0.5">Scan to Verify</div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono text-[9px] text-slate-500">Cert No: CC-INST-2026-000412</div>
                    <div className="font-bold text-emerald-700 flex items-center justify-end space-x-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>VERIFIED VALID</span>
                    </div>
                  </div>
                </div>

                {/* Footer compliance note */}
                <div className="text-[9px] text-slate-400 text-center pt-2 italic">
                  {template.footerNote}
                </div>

              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default InstituteCertTemplate;
