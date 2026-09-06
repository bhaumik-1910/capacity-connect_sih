import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import TraineeHeader from '../../components/TraineeHeader';
import {
  Award,
  CheckCircle,
  ExternalLink,
  Download,
  Search,
  ShieldCheck,
  Eye,
  Sparkles,
  QrCode,
  Calendar,
  Building2,
  UserCheck
} from 'lucide-react';
import CertificateModal from '../../components/CertificateModal';

const MyCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);
  const [autoDownload, setAutoDownload] = useState(false);

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const res = await api.getMyCertificates();
        if (res.success) {
          setCertificates(res.certificates || []);
        }
      } catch (err) {
        console.error('Error fetching certificates:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCerts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[420px]">
        <div className="relative">
          <div className="w-10 h-10 rounded-full border-4 border-amber-200 border-t-amber-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Trainee Executive Header */}
      <TraineeHeader
        title="My Verified MoES / IMD Certificates"
        subtitle="Tamper-evident, cryptographically verifiable digital credentials with embedded QR verification, issued for successfully completed capacity building programs."
        badge="Official Government Credential Repository"
        actions={
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 text-amber-300 flex items-center space-x-1.5">
              <Award className="w-4 h-4 text-amber-300" />
              <span>{certificates.length} Verified Certificates</span>
            </span>
          </div>
        }
      />

      {/* Certificates Grid */}
      {certificates.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-100">
            <Award className="w-7 h-7 text-amber-500" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No Certificates Issued Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Complete 100% of your course learning syllabus and achieve ≥60% in the proctored examination to earn your official credential.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert._id}
              className="bg-white rounded-2xl border-2 border-amber-200/90 shadow-md p-6 relative overflow-hidden flex flex-col justify-between hover:border-amber-300 hover:shadow-xl transition-all group"
            >
              {/* Subtle Ambient Watermark */}
              <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />

              <div className="space-y-4 relative z-10">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-md border border-amber-300">
                      Official Verified Credential
                    </span>
                    <h3 className="font-bold text-slate-900 text-base mt-2 leading-snug group-hover:text-amber-800 transition">
                      {cert.courseTitle}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      Certificate ID: <strong className="text-slate-700">{cert.certificateNumber}</strong>
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 border border-amber-300 flex items-center justify-center text-slate-950 flex-shrink-0 shadow-xs">
                    <Award className="w-5 h-5 text-slate-950" />
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50/90 rounded-xl text-xs space-y-1.5 text-slate-600 border border-slate-200/80">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">Recipient:</span>
                    <span className="font-bold text-slate-900">{cert.studentName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">Issuing Organization:</span>
                    <span className="font-bold text-slate-800">{cert.organizationName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">Grade Attained:</span>
                    <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                      {cert.grade} ({cert.scorePercentage}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">Issue Date:</span>
                    <span className="text-slate-800">
                      {new Date(cert.issueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 relative z-10">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedCert(cert);
                      setAutoDownload(true);
                    }}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1.5 transition cursor-pointer"
                    title="Download Official Certificate PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedCert(cert);
                      setAutoDownload(false);
                    }}
                    className="px-3.5 py-2 bg-[#0c4a6e] hover:bg-[#07334d] text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1.5 transition cursor-pointer"
                    title="Inspect & Print Credential"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </button>
                </div>

                <a
                  href={`/verify/${cert.certificateNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-sky-700 font-bold hover:underline flex items-center space-x-1"
                >
                  <span>Verify Online</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCert && (
        <CertificateModal
          certificate={selectedCert}
          autoDownload={autoDownload}
          onClose={() => {
            setSelectedCert(null);
            setAutoDownload(false);
          }}
        />
      )}
    </div>
  );
};

export default MyCertificates;
