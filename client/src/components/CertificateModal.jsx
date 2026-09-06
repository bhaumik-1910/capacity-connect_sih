import React, { useRef, useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Award, CheckCircle, Printer, X, Shield, ExternalLink, Building2, Download, Image as ImageIcon, FileText } from 'lucide-react';
import { downloadCertificateAsPDF, downloadCertificateAsImage } from '../utils/certificateDownloader';
import { useToast } from '../context/NotificationContext';

const CertificateModal = ({ certificate, onClose, autoDownload = false }) => {
  if (!certificate) return null;

  const certContentRef = useRef(null);
  const toast = useToast();
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);

  useEffect(() => {
    if (autoDownload && certContentRef.current) {
      const timer = setTimeout(() => {
        handleDownloadPdf();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [autoDownload]);

  const handleDownloadPdf = async () => {
    if (!certContentRef.current) return;
    setIsDownloadingPdf(true);
    try {
      const fileName = await downloadCertificateAsPDF(certContentRef.current, certificate);
      toast.success(`Official certificate PDF downloaded: ${fileName}`);
    } catch (err) {
      console.error('PDF generation error:', err);
      toast.error('Failed to generate PDF. You can also use the Print button to Save as PDF.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!certContentRef.current) return;
    setIsDownloadingImage(true);
    try {
      const fileName = await downloadCertificateAsImage(certContentRef.current, certificate);
      toast.success(`High-resolution certificate image downloaded: ${fileName}`);
    } catch (err) {
      console.error('Image export error:', err);
      toast.error('Failed to export certificate image.');
    } finally {
      setIsDownloadingImage(false);
    }
  };

  const handlePrint = () => window.print();

  const verificationUrl = `${window.location.origin}/verify/${certificate.certificateNumber}`;

  // Resolved branding
  const orgName = certificate.organizationName || 'India Meteorological Department (IMD)';
  const orgLogoUrl = certificate.organizationLogo || '';
  const signatoryName = certificate.signatoryName || 'Dr. M. Mohapatra';
  const signatoryDesignation = certificate.signatoryDesignation || 'Director General of Meteorology, MoES / IMD';
  const headerLine = certificate.headerLine || 'National Digital Capacity Building & Competency Assurance Registry';
  const footerNote = certificate.footerNote || '';
  const enrollmentNumber = certificate.enrollmentNumber || '';
  const certTitle = certificate.certTitleText || 'Certificate of Competency';
  const accentColor = certificate.accentColor || '#b45309';

  // Trainer custom design
  const hasCustomBg = certificate.useCustomBackground && certificate.backgroundUrl;
  const trainerSigName = certificate.trainerSignatureName || '';
  const trainerSigDesig = certificate.trainerSignatureDesignation || '';

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex justify-center items-start p-2 sm:p-4 md:p-6 animate-in fade-in duration-150"
      onClick={onClose}
    >
      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #certificate-render-frame, #certificate-render-frame * {
            visibility: visible !important;
          }
          #certificate-render-frame {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            margin: 0 !important;
            padding: 8mm !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          @page {
            size: A4 landscape;
            margin: 0;
          }
        }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-4xl w-full shadow-[0_25px_70px_-15px_rgba(0,0,0,0.5)] border border-slate-300 my-auto flex flex-col overflow-hidden max-h-[96vh] animate-in zoom-in-95 duration-150"
      >

        {/* Action Bar - Fixed Sticky Header */}
        <div className="bg-slate-900 px-4 sm:px-6 py-3 text-white flex flex-wrap items-center justify-between gap-2 shrink-0 sticky top-0 z-30 shadow-md">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="font-semibold text-xs sm:text-sm">Verified Credential — {orgName}</span>
            <span className="text-[10px] bg-emerald-900/80 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700/50">
              {hasCustomBg ? 'Custom Design' : 'Tamper-Evident'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition shadow-xs disabled:opacity-50 cursor-pointer"
              title="Download Certificate as official PDF"
            >
              <Download className={`w-3.5 h-3.5 ${isDownloadingPdf ? 'animate-bounce' : ''}`} />
              <span>{isDownloadingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>

            <button
              onClick={handleDownloadImage}
              disabled={isDownloadingImage}
              className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition cursor-pointer disabled:opacity-50"
              title="Download high-resolution image"
            >
              <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>{isDownloadingImage ? 'Exporting...' : 'PNG'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition cursor-pointer"
              title="Print Certificate"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Certificate Frame Container */}
        <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-300">
          <div ref={certContentRef} id="certificate-render-frame" className="bg-white overflow-hidden">
            {/* ── CUSTOM BACKGROUND MODE ── */}
            {hasCustomBg ? (
          <div className="relative w-full select-none" style={{ minHeight: '520px' }}>
            {/* Trainer's background image */}
            <img
              src={certificate.backgroundUrl}
              alt="Certificate Background"
              className="w-full object-cover"
              style={{ minHeight: '520px', maxHeight: '680px', objectFit: 'cover' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />

            {/* Student details overlay — centered absolutely */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center text-center px-12 pointer-events-none"
              style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.12) 100%)' }}
            >
              {/* Student Name */}
              <div className="space-y-4 max-w-2xl">
                <p className="text-xs font-bold tracking-widest uppercase"
                  style={{ color: accentColor, textShadow: '0 1px 3px rgba(255,255,255,0.8)' }}>
                  This is to certify that
                </p>
                <h2 className="text-4xl font-black font-serif"
                  style={{ color: '#1e293b', textShadow: '0 2px 8px rgba(255,255,255,0.9)', letterSpacing: '-0.5px' }}>
                  {certificate.studentName}
                </h2>
                {enrollmentNumber && (
                  <p className="font-mono text-sm font-bold"
                    style={{ color: '#475569', textShadow: '0 1px 4px rgba(255,255,255,0.8)' }}>
                    Enrollment No: {enrollmentNumber}
                  </p>
                )}
                <p className="text-sm font-medium"
                  style={{ color: '#334155', textShadow: '0 1px 4px rgba(255,255,255,0.8)' }}>
                  has successfully completed
                </p>
                <div className="bg-white/70 backdrop-blur-sm rounded-xl px-6 py-3 border"
                  style={{ borderColor: accentColor + '60' }}>
                  <div className="font-bold text-lg text-slate-900">{certificate.courseTitle}</div>
                  <div className="font-mono text-xs text-slate-500 mt-0.5">
                    {certificate.courseCode} &nbsp;·&nbsp; <span className="font-bold text-emerald-700">{certificate.grade} ({certificate.scorePercentage}%)</span>
                  </div>
                </div>

                {/* Footer row in overlay */}
                <div className="flex items-center justify-between w-full pt-4 gap-8">
                  {/* QR */}
                  <div className="bg-white/80 p-2 rounded-lg border border-white/60 flex-shrink-0">
                    <QRCodeSVG value={verificationUrl} size={52} level="M" />
                    <div className="text-[9px] font-mono text-slate-500 mt-0.5 text-center">{certificate.certificateNumber}</div>
                  </div>

                  {/* Date + org */}
                  <div className="text-center">
                    <div className="text-xs text-slate-500">Date of Issue</div>
                    <div className="font-bold text-slate-800 text-sm">
                      {new Date(certificate.issueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <div className="text-[10px] text-slate-400">{orgName}</div>
                  </div>

                  {/* Trainer Signatory */}
                  {trainerSigName && (
                    <div className="text-right">
                      <div className="font-serif italic text-base font-bold border-b pb-1 mb-0.5" style={{ color: '#1e293b', borderColor: accentColor }}>
                        {trainerSigName}
                      </div>
                      <div className="text-[11px] font-semibold text-slate-600">{trainerSigDesig}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ── DEFAULT CERTIFICATE FRAME ── */
          <div className="p-4 sm:p-7 bg-[#FFFDF9] relative select-none">
            <div
              className="p-5 sm:p-8 relative rounded-sm shadow-inner bg-gradient-to-b from-white via-[#FFFDF9] to-[#FDFBF7]"
              style={{ border: `4px double ${accentColor}` }}
            >
              {/* Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none">
                <span className="text-9xl font-black text-slate-900">MoES</span>
              </div>

              {/* Header */}
              <div className="text-center space-y-1 mb-4">
                <div className="flex items-center justify-center space-x-3 mb-2">
                  <svg className="w-8 h-5 rounded shadow-2xs border border-slate-200 flex-shrink-0" viewBox="0 0 900 600">
                    <rect width="900" height="200" fill="#FF9933" />
                    <rect y="200" width="900" height="200" fill="#FFFFFF" />
                    <rect y="400" width="900" height="200" fill="#138808" />
                    <circle cx="450" cy="300" r="80" fill="none" stroke="#000080" strokeWidth="12" />
                    <circle cx="450" cy="300" r="16" fill="#000080" />
                  </svg>
                  {orgLogoUrl && (
                    <img src={orgLogoUrl} alt={orgName + ' logo'} className="h-9 w-auto object-contain rounded"
                      onError={(e) => { e.target.style.display = 'none'; }} />
                  )}
                  {!orgLogoUrl && (
                    <div className="w-9 h-9 rounded-full bg-[#0B2545] flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <h4 className="text-[11px] tracking-widest font-bold uppercase text-slate-600">
                  GOVERNMENT OF INDIA • MINISTRY OF EARTH SCIENCES
                </h4>
                <h2 className="text-xl sm:text-2xl font-black text-[#0B2545] tracking-tight uppercase">
                  {orgName}
                </h2>
                <div className="text-[11px] font-semibold tracking-wider uppercase" style={{ color: accentColor }}>
                  {headerLine}
                </div>
              </div>

              {/* Certificate Title */}
              <div className="text-center my-6">
                <h1 className="text-2xl sm:text-3xl font-serif italic font-bold" style={{ color: accentColor }}>
                  {certTitle}
                </h1>
                <div className="w-24 h-0.5 mx-auto mt-2" style={{ backgroundColor: accentColor }} />
              </div>

              {/* Recipient */}
              <div className="text-center space-y-3 my-6 max-w-2xl mx-auto">
                <p className="text-xs text-slate-600 uppercase tracking-wide">This is to certify that</p>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif"
                  style={{ textDecoration: 'underline', textDecorationColor: accentColor + '60', textUnderlineOffset: '8px' }}>
                  {certificate.studentName}
                </h3>
                <p className="text-xs text-slate-600">
                  {[certificate.studentDesignation, certificate.studentDepartment].filter(Boolean).join(' • ')}
                  {enrollmentNumber && <span className="ml-2 font-mono font-bold text-[#0B2545]">• ID: {enrollmentNumber}</span>}
                </p>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-2">
                  has successfully completed the specialized capacity development program and satisfied all verified examination criteria for
                </p>
                <div className="py-2.5 px-4 rounded-lg my-3" style={{ background: accentColor + '12', border: `1px solid ${accentColor}40` }}>
                  <div className="font-bold text-sm sm:text-base text-[#0B2545]">{certificate.courseTitle}</div>
                  <div className="text-xs text-slate-600 font-mono mt-0.5">
                    Course Code: {certificate.courseCode} • Result: <span className="font-bold text-emerald-800">{certificate.grade} ({certificate.scorePercentage}%)</span>
                  </div>
                </div>
                <div className="text-[11px] text-emerald-700 font-semibold">
                  ✓ Achieved qualifying score of {certificate.scorePercentage}% — Eligible for institutional certification
                </div>
              </div>

              {/* Footer / Signatures */}
              <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs">
                <div className="flex items-center space-x-3 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                  <QRCodeSVG value={verificationUrl} size={64} level="M" />
                  <div className="text-[11px] text-slate-600 text-left">
                    <div className="font-bold text-slate-800">Scan to Verify</div>
                    <div className="font-mono text-[10px] text-slate-500">{certificate.certificateNumber}</div>
                    <div className="text-emerald-600 flex items-center space-x-1 mt-0.5">
                      <CheckCircle className="w-3 h-3" />
                      <span>Cryptographically Valid</span>
                    </div>
                  </div>
                </div>

                <div className="text-center sm:text-left">
                  <div className="text-slate-500 text-[11px]">Date of Issuance</div>
                  <div className="font-semibold text-slate-800">
                    {new Date(certificate.issueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <div className="text-[10px] text-slate-400">New Delhi, India</div>
                </div>

                {/* Signatories */}
                <div className="flex flex-col items-end gap-3">
                  {/* Org signatory */}
                  <div className="text-center sm:text-right">
                    <div className="font-serif italic text-base text-slate-700 font-bold border-b pb-1 mb-1" style={{ borderColor: accentColor }}>
                      {signatoryName}
                    </div>
                    <div className="font-semibold text-slate-600 text-[11px]">{signatoryDesignation}</div>
                  </div>
                  {/* Trainer signatory (if different) */}
                  {trainerSigName && trainerSigName !== signatoryName && (
                    <div className="text-center sm:text-right border-t border-dashed border-slate-200 pt-2">
                      <div className="font-serif italic text-sm text-indigo-800 font-bold border-b border-indigo-300 pb-0.5 mb-0.5">
                        {trainerSigName}
                      </div>
                      <div className="font-semibold text-indigo-600 text-[10px]">{trainerSigDesig}</div>
                    </div>
                  )}
                </div>
              </div>

              {footerNote && (
                <div className="mt-4 pt-3 border-t text-center text-[11px] font-medium italic" style={{ borderColor: accentColor + '40', color: accentColor }}>
                  {footerNote}
                </div>
              )}
            </div>
          </div>
        )}
          </div>
        </div>

        {/* Footer bar */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-1">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Verifiable via {orgName} · MoES National Registry</span>
          </div>
          <a href={`/verify/${certificate.certificateNumber}`} target="_blank" rel="noopener noreferrer"
            className="text-blue-600 hover:underline flex items-center space-x-1 font-medium">
            <span>Open Verification Page</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

      </div>
    </div>
  );
};

export default CertificateModal;
