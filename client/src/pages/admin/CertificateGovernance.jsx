import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import AdminHeader from '../../components/AdminHeader';
import {
  Award,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  Shield,
  Filter,
  X,
  FileCheck,
  ExternalLink,
  Lock,
  Calendar,
  BookOpen
} from 'lucide-react';
import { useToast, useDialog } from '../../context/NotificationContext';
import CertificateModal from '../../components/CertificateModal';

const CertificateGovernance = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCert, setSelectedCert] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'valid' | 'revoked'
  const toast = useToast();
  const { showPrompt } = useDialog();

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const res = await api.getAllCertificates();
      if (res.success) {
        setCertificates(res.certificates || []);
      }
    } catch (err) {
      console.error('Error fetching certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleRevoke = async (certId, certNumber) => {
    const reason = await showPrompt({
      title: 'Revoke National Credential',
      message: `Enter official justification for revoking certificate ${certNumber}:`,
      defaultValue: '',
      placeholder: 'Enter official revocation justification...',
      confirmText: 'Revoke Certificate',
      type: 'danger',
      required: true
    });

    if (!reason) return;

    try {
      const res = await api.revokeCertificate(certId, reason);
      if (res.success) {
        toast.success(`Certificate ${certNumber} has been revoked and logged to the National Audit Registry.`, 'Credential Revoked');
        fetchCertificates();
      }
    } catch (err) {
      toast.error(err.message, 'Revocation Error');
    }
  };

  const filtered = certificates.filter(c => {
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch = (
      (c.certificateNumber || '').toLowerCase().includes(q) ||
      (c.studentName || '').toLowerCase().includes(q) ||
      (c.courseTitle || '').toLowerCase().includes(q) ||
      (c.studentDepartment || '').toLowerCase().includes(q)
    );
    return matchesStatus && matchesSearch;
  });

  const validCount = certificates.filter(c => c.status === 'valid').length;
  const revokedCount = certificates.filter(c => c.status === 'revoked').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0B2545]" />
          <span className="text-xs font-semibold text-slate-500">Connecting to National Certificate Ledger...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* MoES Executive Authority Header */}
      <AdminHeader
        title="National Certificate Registry & Cryptographic Ledger"
        subtitle="Central repository of all issued, accredited, and revoked meteorological credentials with tamper-evident cryptographic QR verification."
        badge="Cryptographic Audit & Credential Governance"
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/admin/government-certificate"
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold rounded-xl text-xs shadow-sm transition flex items-center space-x-1.5"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Govt Certificate Studio</span>
            </Link>

            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm p-1 rounded-xl border border-white/20 text-xs font-bold">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  statusFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-white hover:bg-white/10'
                }`}
              >
                All ({certificates.length})
              </button>
              <button
                onClick={() => setStatusFilter('valid')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 cursor-pointer ${
                  statusFilter === 'valid' ? 'bg-emerald-600 text-white shadow-sm' : 'text-white hover:bg-white/10'
                }`}
              >
                <span>Valid ({validCount})</span>
              </button>
              <button
                onClick={() => setStatusFilter('revoked')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 cursor-pointer ${
                  statusFilter === 'revoked' ? 'bg-rose-600 text-white shadow-sm' : 'text-white hover:bg-white/10'
                }`}
              >
                <span>Revoked ({revokedCount})</span>
              </button>
            </div>
          </div>
        }
      />

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search certificate ID, recipient, syllabus..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-9 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-medium text-slate-800 transition shadow-2xs"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 text-xs transition"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span>Registered Credentials:</span>
          <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/80 font-mono">
            {filtered.length} Records
          </span>
        </div>
      </div>

      {/* Certificates Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 divide-y divide-slate-200/80">
            <thead className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3 whitespace-nowrap">Ledger ID</th>
                <th className="py-3 px-3 whitespace-nowrap">Certified Forecaster</th>
                <th className="py-3 px-3">Syllabus Title</th>
                <th className="py-3 px-3 text-center whitespace-nowrap">Score</th>
                <th className="py-3 px-3 whitespace-nowrap">Issue Date</th>
                <th className="py-3 px-3 text-center whitespace-nowrap">Status</th>
                <th className="py-3 px-3 text-center whitespace-nowrap w-36">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-2 border border-slate-200">
                      <Award className="w-7 h-7" />
                    </div>
                    <p className="font-bold text-slate-800 text-sm">
                      {search ? 'No matching certificates found' : 'No Certificates Issued Yet'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                      {search ? 'Try modifying your search query or status filter.' : 'Tamper-evident digital certificates will appear here dynamically as trainees complete accredited courses and qualify proctored assessments.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((cert) => (
                  <tr key={cert._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                      <div className="bg-slate-100/90 text-slate-800 px-2 py-1 rounded-lg border border-slate-200 inline-flex items-center gap-1 font-mono text-[11px] font-bold shadow-2xs">
                        <Lock className="w-3 h-3 text-indigo-600 shrink-0" />
                        <span className="tracking-tight select-all">{cert.certificateNumber}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-xs uppercase shadow-2xs">
                          {cert.studentName?.charAt(0) || 'F'}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 text-xs truncate max-w-[130px] md:max-w-[160px]">{cert.studentName}</div>
                          <div className="text-[10px] text-slate-500 font-medium truncate max-w-[130px] md:max-w-[160px]">
                            {cert.studentDepartment || cert.organizationName || 'Meteorology Unit'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800 leading-snug">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="truncate max-w-[130px] md:max-w-[180px] lg:max-w-[220px]" title={cert.courseTitle}>
                          {cert.courseTitle}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className="font-bold text-emerald-700 bg-emerald-50/80 px-2 py-0.5 rounded-lg border border-emerald-200/90 inline-flex items-center gap-1 text-[11px] shadow-2xs">
                        <Award className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{cert.scorePercentage}%</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-700 whitespace-nowrap font-medium text-[11px]">
                      <div className="flex items-center gap-1 font-sans">
                        <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{new Date(cert.issueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase inline-flex items-center gap-1 shadow-2xs ${
                        cert.status === 'valid'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cert.status === 'valid' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                        <span>{cert.status}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="inline-flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedCert(cert)}
                          className="h-7 px-2.5 bg-white hover:bg-indigo-50 text-indigo-700 font-bold rounded-lg text-xs border border-indigo-200 hover:border-indigo-300 shadow-2xs transition inline-flex items-center gap-1 cursor-pointer active:scale-95"
                          title="Inspect Certificate"
                        >
                          <Eye className="w-3 h-3 text-indigo-600" />
                          <span>Inspect</span>
                        </button>
                        {cert.status === 'valid' && (
                          <button
                            type="button"
                            onClick={() => handleRevoke(cert._id, cert.certificateNumber)}
                            className="h-7 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-xs border border-rose-200 shadow-2xs transition inline-flex items-center gap-1 cursor-pointer active:scale-95"
                            title="Revoke Certificate"
                          >
                            <XCircle className="w-3 h-3 text-rose-600" />
                            <span>Revoke</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Certificate Modal */}
      {selectedCert && (
        <CertificateModal
          certificate={selectedCert}
          onClose={() => setSelectedCert(null)}
        />
      )}

    </div>
  );
};

export default CertificateGovernance;
