import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/NotificationContext';
import AdminHeader from '../../components/AdminHeader';
import { QRCodeSVG } from 'qrcode.react';
import { downloadCertificateAsPDF } from '../../utils/certificateDownloader';
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
  Lock,
  Upload,
  Globe,
  Sliders,
  Printer,
  Check,
  RotateCcw,
  Download,
  Loader2
} from 'lucide-react';

const NATIONAL_PRESETS = {
  emblems: [
    {
      name: 'Ashoka Lion Capital (Emblem of India)',
      url: '/emblem-india.png'
    },
    {
      name: 'Ministry of Earth Sciences (MoES Logo)',
      url: '/logo-moes.png'
    }
  ],
  colors: [
    { label: 'Royal Navy', hex: '#1e3a8a' },
    { label: 'Sovereign Gold', hex: '#b45309' },
    { label: 'National Emerald', hex: '#065f46' },
    { label: 'Imperial Maroon', hex: '#881337' }
  ],
  borders: [
    { id: 'ornate-gold', label: 'Ornate Filigree (Sovereign Gold)' },
    { id: 'royal-navy', label: 'Double Line Sovereign Border' },
    { id: 'national-tri', label: 'National Security Micro-border' },
    { id: 'modern-geometric', label: 'Modern Executive Border' }
  ]
};

const GovernmentCertificateStudio = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingSig, setUploadingSig] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const certPreviewRef = useRef(null);

  const sampleCertificateData = {
    certificateNumber: 'CC-GOV-IN-7X9P4A-2026',
    studentName: 'Bhaumik Kothiya',
    courseTitle: 'National Atmospheric Systems & Satellite Radar Forecasting (WMO-BIP-M)',
    courseCode: 'RAD-501',
    grade: 'Distinction',
    scorePercentage: 92,
    issueDate: new Date().toISOString()
  };

  const handleDownloadPdf = async () => {
    if (!certPreviewRef.current) return;
    setExportingPdf(true);
    try {
      const fileName = await downloadCertificateAsPDF(certPreviewRef.current, sampleCertificateData);
      toast.success(`Official sample certificate PDF downloaded: ${fileName}`);
    } catch (err) {
      console.error('PDF generation error:', err);
      toast.error('Failed to generate PDF. You can also click "Print Sample" -> "Save as PDF".');
    } finally {
      setExportingPdf(false);
    }
  };

  const [template, setTemplate] = useState({
    orgDisplayName: 'Ministry of Earth Sciences (MoES), Government of India',
    subHeader: 'National Digital Capacity Building & Competency Assurance Registry',
    logoUrl: '/logo-moes.png',
    nationalEmblemUrl: '/emblem-india.png',
    sealUrl: '',
    certTitleText: 'National Certificate of Competency & Professional Excellence',
    headerLine: 'National Skill Qualification Framework (NSQF) • Government of India Accredited',
    signatoryName: 'Dr. Mrutyunjay Mohapatra',
    signatoryDesignation: 'Director General of Meteorology, Govt. of India',
    signatorySignatureUrl: '',
    secondarySignatoryName: 'Dr. M. Ravichandran',
    secondarySignatoryDesignation: 'Secretary, Ministry of Earth Sciences',
    secondarySignatureUrl: '',
    minScoreForCertificate: 75,
    accentColor: '#1e3a8a',
    borderStyle: 'ornate-gold',
    footerNote: 'Issued to open public citizen learners upon successful verification of meteorological competencies. Valid nationwide and WMO compliant.'
  });

  const loadTemplate = async () => {
    setLoading(true);
    try {
      const res = await api.getGovernmentCertTemplate();
      if (res.success && res.template) {
        const rawEmblem = res.template.nationalEmblemUrl;
        const emblemUrl = (rawEmblem && !rawEmblem.includes('wikipedia') && rawEmblem !== '/emblem-india.svg') ? rawEmblem : '/emblem-india.png';
        const rawLogo = res.template.logoUrl;
        const logoUrl = (rawLogo && rawLogo !== '/logo-imd.png' && rawLogo !== '/logo-imd.svg' && !rawLogo.includes('wikipedia')) ? rawLogo : '/logo-moes.png';

        setTemplate({
          orgDisplayName: res.template.orgDisplayName || 'Ministry of Earth Sciences (MoES), Government of India',
          subHeader: res.template.subHeader || 'National Digital Capacity Building & Competency Assurance Registry',
          logoUrl: logoUrl,
          nationalEmblemUrl: emblemUrl,
          sealUrl: res.template.sealUrl || '',
          certTitleText: res.template.certTitleText || 'National Certificate of Competency & Professional Excellence',
          headerLine: res.template.headerLine || 'National Skill Qualification Framework (NSQF) • Government of India Accredited',
          signatoryName: res.template.signatoryName || 'Dr. Mrutyunjay Mohapatra',
          signatoryDesignation: res.template.signatoryDesignation || 'Director General of Meteorology, Govt. of India',
          signatorySignatureUrl: res.template.signatorySignatureUrl || '',
          secondarySignatoryName: res.template.secondarySignatoryName || 'Dr. M. Ravichandran',
          secondarySignatoryDesignation: res.template.secondarySignatoryDesignation || 'Secretary, Ministry of Earth Sciences',
          secondarySignatureUrl: res.template.secondarySignatureUrl || '',
          minScoreForCertificate: res.template.minScoreForCertificate ?? 75,
          accentColor: res.template.accentColor || '#1e3a8a',
          borderStyle: res.template.borderStyle || 'ornate-gold',
          footerNote: res.template.footerNote || 'Issued to open public citizen learners upon successful verification of meteorological competencies. Valid nationwide and WMO compliant.'
        });
      }
    } catch (error) {
      toast.error('Failed to load official government certificate template');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplate();
  }, []);

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSaving(true);
    try {
      const res = await api.updateGovernmentCertTemplate(template);
      if (res.success) {
        toast.success(
          'Official Government Certificate Template saved! All independent/external public learners will receive this customized sovereign certificate.',
          'Government Template Published'
        );
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update government certificate template');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (field === 'logo') setUploadingLogo(true);
    if (field === 'sig') setUploadingSig(true);

    try {
      const res = await api.uploadFile(file);
      if (res.fileUrl) {
        if (field === 'logo') setTemplate(prev => ({ ...prev, logoUrl: res.fileUrl }));
        if (field === 'sig') setTemplate(prev => ({ ...prev, signatorySignatureUrl: res.fileUrl }));
        toast.success('File uploaded and linked to template!', 'Upload Successful');
      }
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      if (field === 'logo') setUploadingLogo(false);
      if (field === 'sig') setUploadingSig(false);
    }
  };

  const resetToDefaults = () => {
    setTemplate({
      orgDisplayName: 'Ministry of Earth Sciences (MoES), Government of India',
      subHeader: 'National Digital Capacity Building & Competency Assurance Registry',
      logoUrl: '/logo-moes.png',
      nationalEmblemUrl: '/emblem-india.png',
      sealUrl: '',
      certTitleText: 'National Certificate of Competency & Professional Excellence',
      headerLine: 'National Skill Qualification Framework (NSQF) • Government of India Accredited',
      signatoryName: 'Dr. Mrutyunjay Mohapatra',
      signatoryDesignation: 'Director General of Meteorology, Govt. of India',
      signatorySignatureUrl: '',
      secondarySignatoryName: 'Dr. M. Ravichandran',
      secondarySignatoryDesignation: 'Secretary, Ministry of Earth Sciences',
      secondarySignatureUrl: '',
      minScoreForCertificate: 75,
      accentColor: '#1e3a8a',
      borderStyle: 'ornate-gold',
      footerNote: 'Issued to open public citizen learners upon successful verification of meteorological competencies. Valid nationwide and WMO compliant.'
    });
    toast.info('Template reset to official national defaults. Click "Save & Publish" to commit.');
  };

  return (
    <div className="space-y-6 pb-16 select-none max-w-7xl mx-auto">
      
      {/* Executive Admin Header */}
      <AdminHeader
        title="National Government Certificate Studio"
        subtitle="Design and configure the official sovereign credential issued to open citizens and independent public learners completing Government of India skilling programs."
        badge="Sovereign Public Credential Designer"
        actions={
          <div className="flex items-center space-x-2">
            <button
              onClick={resetToDefaults}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/20 transition flex items-center space-x-1.5 cursor-pointer backdrop-blur-sm"
              title="Reset to National Defaults"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Reset Defaults</span>
            </button>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold rounded-xl text-xs shadow-md transition flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save & Publish Sovereign Template</span>
                </>
              )}
            </button>
          </div>
        }
      />

      {/* NOTICE BANNER */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-950 text-white p-4 sm:p-5 rounded-3xl border border-blue-800/40 shadow-sm flex items-start space-x-4">
        <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center flex-shrink-0">
          <Globe className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs">
          <h4 className="font-bold text-amber-300 text-sm flex items-center space-x-2">
            <span>Direct Public Learner / External Candidate Issuance Engine</span>
          </h4>
          <p className="text-slate-300 leading-relaxed">
            While institutional students receive certificates with their specific college/institute branding, <strong>independent citizens and open learners</strong> who enroll in Government Courses directly from outside will be issued this official Sovereign National Certificate. Every modification made here applies in real-time to external graduates.
          </p>
        </div>
      </div>

      {/* 2-COLUMN LAYOUT: DESIGN CONTROLS (LEFT) & LIVE PREVIEW (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: DESIGN CONTROLS (5 COLS) */}
        <div className="lg:col-span-5 space-y-6">

          {/* CARD 1: MINISTRY & AUTHORITY BRANDING */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4 text-xs">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <h3 className="font-black text-slate-900 text-sm">Sovereign Authority Identity</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Government Body / Ministry Title
                </label>
                <input
                  type="text"
                  value={template.orgDisplayName}
                  onChange={(e) => setTemplate({ ...template, orgDisplayName: e.target.value })}
                  placeholder="e.g., Ministry of Earth Sciences (MoES), Government of India"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition text-xs font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Registry Subheader Line
                </label>
                <input
                  type="text"
                  value={template.subHeader}
                  onChange={(e) => setTemplate({ ...template, subHeader: e.target.value })}
                  placeholder="e.g., National Digital Capacity Building & Competency Assurance Registry"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Official National Emblem / Crest URL
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={template.nationalEmblemUrl}
                    onChange={(e) => setTemplate({ ...template, nationalEmblemUrl: e.target.value })}
                    placeholder="Emblem image URL"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-[11px]"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {NATIONAL_PRESETS.emblems.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setTemplate({ ...template, nationalEmblemUrl: p.url })}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 font-medium text-[10px] transition border border-slate-200 cursor-pointer"
                      >
                        Use {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Department / Organization Logo URL
                </label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={template.logoUrl}
                      onChange={(e) => setTemplate({ ...template, logoUrl: e.target.value })}
                      placeholder="/logo-moes.png or custom URL"
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-[11px]"
                    />
                    <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer font-bold text-[11px] border border-slate-300 flex items-center space-x-1 flex-shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingLogo ? '...' : 'Upload'}</span>
                      <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} className="hidden" />
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setTemplate({ ...template, logoUrl: '/logo-moes.png' })}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[10px] transition border border-blue-200 cursor-pointer"
                    >
                      Use MoES Official Logo
                    </button>
                    <button
                      type="button"
                      onClick={() => setTemplate({ ...template, logoUrl: '/emblem-india.png' })}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium text-[10px] transition border border-slate-200 cursor-pointer"
                    >
                      Use National Emblem
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: TYPOGRAPHY & CREDENTIAL HEADINGS */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4 text-xs">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
              <FileText className="w-4 h-4 text-indigo-600" />
              <h3 className="font-black text-slate-900 text-sm">Credential Title & Accreditations</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Certificate Header Title
                </label>
                <input
                  type="text"
                  value={template.certTitleText}
                  onChange={(e) => setTemplate({ ...template, certTitleText: e.target.value })}
                  placeholder="e.g., National Certificate of Competency & Professional Excellence"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Accreditation & Framework Line (Top Banner)
                </label>
                <input
                  type="text"
                  value={template.headerLine}
                  onChange={(e) => setTemplate({ ...template, headerLine: e.target.value })}
                  placeholder="e.g., National Skill Qualification Framework (NSQF) • Government of India Accredited"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Legal & Recognition Footer Note
                </label>
                <textarea
                  rows={2}
                  value={template.footerNote}
                  onChange={(e) => setTemplate({ ...template, footerNote: e.target.value })}
                  placeholder="Legal statement printed at the bottom of the certificate..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>

          {/* CARD 3: AUTHORIZED SIGNATORIES */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4 text-xs">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <h3 className="font-black text-slate-900 text-sm">Authorized National Signatories</h3>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2.5">
                <div className="font-bold text-indigo-900 text-[11px] uppercase tracking-wider">
                  Primary National Signatory
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-0.5">Signatory Full Name</label>
                  <input
                    type="text"
                    value={template.signatoryName}
                    onChange={(e) => setTemplate({ ...template, signatoryName: e.target.value })}
                    placeholder="Enter primary signatory full name"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-0.5">Official Designation</label>
                  <input
                    type="text"
                    value={template.signatoryDesignation}
                    onChange={(e) => setTemplate({ ...template, signatoryDesignation: e.target.value })}
                    placeholder="Enter official designation"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2.5">
                <div className="font-bold text-indigo-900 text-[11px] uppercase tracking-wider">
                  Secondary Executive Signatory (Optional)
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-0.5">Signatory Full Name</label>
                  <input
                    type="text"
                    value={template.secondarySignatoryName}
                    onChange={(e) => setTemplate({ ...template, secondarySignatoryName: e.target.value })}
                    placeholder="Enter secondary signatory full name"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-0.5">Official Designation</label>
                  <input
                    type="text"
                    value={template.secondarySignatoryDesignation}
                    onChange={(e) => setTemplate({ ...template, secondarySignatoryDesignation: e.target.value })}
                    placeholder="Enter secondary designation"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CARD 4: AESTHETICS & ELIGIBILITY THRESHOLD */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4 text-xs">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
              <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
              <h3 className="font-black text-slate-900 text-sm">Theme Styling & Qualifying Threshold</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Accent Sovereign Color
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1.5">
                    {NATIONAL_PRESETS.colors.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setTemplate({ ...template, accentColor: c.hex })}
                        style={{ backgroundColor: c.hex }}
                        className={`w-7 h-7 rounded-xl border-2 transition cursor-pointer flex items-center justify-center ${
                          template.accentColor === c.hex ? 'border-white ring-2 ring-indigo-600 scale-110' : 'border-transparent'
                        }`}
                        title={c.label}
                      >
                        {template.accentColor === c.hex && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={template.accentColor}
                    onChange={(e) => setTemplate({ ...template, accentColor: e.target.value })}
                    className="w-24 px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg font-mono text-[11px] text-center"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Border Architecture Style
                </label>
                <select
                  value={template.borderStyle}
                  onChange={(e) => setTemplate({ ...template, borderStyle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none"
                >
                  {NATIONAL_PRESETS.borders.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">
                    Minimum Assessment Score for Certificate
                  </label>
                  <span className="font-mono font-bold text-indigo-600 text-sm">
                    {template.minScoreForCertificate}%
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={template.minScoreForCertificate}
                  onChange={(e) => setTemplate({ ...template, minScoreForCertificate: parseInt(e.target.value) })}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>50% (Basic Pass)</span>
                  <span>75% (Merit Recommended)</span>
                  <span>90% (Distinction Only)</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: LIVE INTERACTIVE HIGH-FIDELITY PREVIEW (7 COLS) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="sticky top-6">
            {/* Print Styles for Sovereign Certificate */}
            <style>{`
              @media print {
                body * {
                  visibility: hidden !important;
                }
                #government-certificate-preview, #government-certificate-preview * {
                  visibility: visible !important;
                }
                #government-certificate-preview {
                  position: fixed !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100vw !important;
                  height: 100vh !important;
                  margin: 0 !important;
                  padding: 10mm 15mm !important;
                  box-shadow: none !important;
                  border-radius: 0 !important;
                  border-width: 8px !important;
                  background-color: #fcfbf7 !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                  display: flex !important;
                  flex-direction: column !important;
                  justify-content: space-between !important;
                  box-sizing: border-box !important;
                }
                @page {
                  size: A4 landscape;
                  margin: 0;
                }
              }
            `}</style>

            <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="font-black text-slate-900 text-sm">Live Sovereign Certificate Preview</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  External Learner Output
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={exportingPdf}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-2xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  title="Download Sample Certificate as official A4 PDF"
                >
                  {exportingPdf ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>{exportingPdf ? 'Exporting...' : 'Download PDF'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-950 font-bold rounded-xl text-xs transition border border-slate-200 shadow-2xs flex items-center space-x-1.5 cursor-pointer"
                  title="Print Sample Certificate (Full A4 Landscape)"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  <span>Print Sample</span>
                </button>
              </div>
            </div>

            {/* CERTIFICATE CONTAINER */}
            <div
              id="government-certificate-preview"
              ref={certPreviewRef}
              className="w-full bg-[#fcfbf7] rounded-2xl shadow-xl overflow-hidden border-8 relative transition-all duration-300 p-6 sm:p-8"
              style={{
                borderColor: template.accentColor,
                minHeight: '530px',
                fontFamily: 'serif'
              }}
            >
              {/* Inner Ornate Thin Border */}
              <div
                className="absolute inset-2 border-2 pointer-events-none rounded-lg opacity-80"
                style={{ borderColor: template.accentColor }}
              />

              {/* Watermark Emblem in Background */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                <img
                  src={template.nationalEmblemUrl || '/emblem-india.png'}
                  alt="Watermark"
                  className="w-80 h-80 object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/emblem-india.png';
                  }}
                />
              </div>

              {/* CONTENT CANVAS */}
              <div className="relative z-10 flex flex-col justify-between h-full space-y-5 text-center">

                {/* HEADER SECTION */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-center space-x-6">
                    <img
                      src={template.nationalEmblemUrl || '/emblem-india.png'}
                      alt="National Emblem"
                      className="h-16 w-auto object-contain drop-shadow-xs"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/emblem-india.png';
                      }}
                    />
                    <img
                      src={template.logoUrl || '/logo-moes.png'}
                      alt="Ministry of Earth Sciences Seal"
                      className="h-16 w-16 object-cover drop-shadow-xs rounded-full border border-slate-200/80 bg-white p-0.5 shadow-2xs"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/logo-moes.png';
                      }}
                    />
                  </div>

                  <h2
                    className="text-sm sm:text-base font-black tracking-wide uppercase mt-1"
                    style={{ color: template.accentColor }}
                  >
                    {template.orgDisplayName}
                  </h2>

                  <div className="text-[10px] sm:text-[11px] uppercase tracking-widest text-slate-600 font-sans font-bold">
                    {template.subHeader}
                  </div>

                  <div className="w-32 h-0.5 mx-auto my-1.5 opacity-40 rounded-full" style={{ backgroundColor: template.accentColor }} />

                  <div className="text-[10px] text-slate-500 font-sans tracking-wider uppercase font-semibold">
                    {template.headerLine}
                  </div>
                </div>

                {/* MAIN CERTIFICATE TITLE */}
                <div className="space-y-1 my-2">
                  <h1
                    className="text-lg sm:text-2xl font-bold tracking-tight uppercase"
                    style={{ color: template.accentColor }}
                  >
                    {template.certTitleText}
                  </h1>
                  <p className="text-[11px] text-slate-500 italic font-serif">
                    This official national credential is gratefully conferred upon
                  </p>
                </div>

                {/* STUDENT NAME */}
                <div className="space-y-1">
                  <div className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 border-b border-slate-300 pb-1 inline-block px-8">
                    Bhaumik Kothiya
                  </div>
                  <div className="text-[11px] font-sans font-bold text-emerald-800 flex items-center justify-center space-x-1">
                    <Globe className="w-3 h-3 text-emerald-600" />
                    <span>Independent Public Citizen Learner (Direct Open Enrollee)</span>
                  </div>
                </div>

                {/* COURSE & RECOGNITION STATEMENT */}
                <div className="space-y-1 px-4">
                  <p className="text-[11px] text-slate-600 font-serif leading-relaxed">
                    having demonstrated distinguished competency, fulfilled rigorous practical modules, and cleared the national examination for:
                  </p>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 font-sans tracking-wide">
                    National Atmospheric Systems & Satellite Radar Forecasting (WMO-BIP-M)
                  </h3>
                  <div className="inline-flex items-center space-x-2 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-800">
                    <span>COURSE CODE: RAD-501</span>
                    <span>•</span>
                    <span>GRADE: DISTINCTION (92%)</span>
                    <span>•</span>
                    <span>QUALIFIED</span>
                  </div>
                </div>

                {/* SIGNATORIES & QR FOOTER */}
                <div className="pt-4 border-t border-slate-200/80 grid grid-cols-3 items-end gap-2 text-center text-slate-700 font-sans">
                  
                  {/* Left Signatory */}
                  <div className="space-y-1">
                    <div className="h-8 flex items-end justify-center">
                      <div className="font-serif italic text-base font-bold text-slate-800">
                        {template.signatoryName}
                      </div>
                    </div>
                    <div className="border-t border-slate-400 pt-1">
                      <div className="font-bold text-[11px] text-slate-900">{template.signatoryName}</div>
                      <div className="text-[9px] text-slate-500 leading-tight">{template.signatoryDesignation}</div>
                    </div>
                  </div>

                  {/* Center QR & Seal */}
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <div className="w-14 h-14 bg-white p-1 rounded-lg border border-slate-300 shadow-2xs flex items-center justify-center">
                      <QRCodeSVG
                        value={`${window.location.origin}/verify/CC-GOV-IN-7X9P4A-2026`}
                        size={46}
                        level="M"
                      />
                    </div>
                    <div className="font-mono text-[8px] text-slate-500 font-bold">
                      CC-GOV-IN-7X9P4A-2026
                    </div>
                    <span className="text-[8px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      Digitally Verified
                    </span>
                  </div>

                  {/* Right Secondary Signatory */}
                  <div className="space-y-1">
                    <div className="h-8 flex items-end justify-center">
                      <div className="font-serif italic text-base font-bold text-slate-800">
                        {template.secondarySignatoryName || 'Authorized Secretary'}
                      </div>
                    </div>
                    <div className="border-t border-slate-400 pt-1">
                      <div className="font-bold text-[11px] text-slate-900">
                        {template.secondarySignatoryName || 'Authorized Signatory'}
                      </div>
                      <div className="text-[9px] text-slate-500 leading-tight">
                        {template.secondarySignatoryDesignation || 'Ministry of Earth Sciences'}
                      </div>
                    </div>
                  </div>

                </div>

                {/* LEGAL FOOTER NOTE */}
                <div className="pt-2 text-[8px] text-slate-400 font-sans leading-tight">
                  {template.footerNote}
                </div>

              </div>
            </div>

            {/* QUICK ACTIONS UNDER PREVIEW */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 mt-4 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Live Template Synchronized with National Registry</span>
              </span>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || loading}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition cursor-pointer shadow-xs disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Apply & Publish'}
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default GovernmentCertificateStudio;
