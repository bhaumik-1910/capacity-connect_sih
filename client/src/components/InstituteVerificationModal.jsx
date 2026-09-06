import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/NotificationContext';
import {
  Building2,
  ShieldCheck,
  FileText,
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Mail,
  Phone,
  Calendar,
  Clock,
  Send,
  X,
  RefreshCw,
  Award,
  Lock
} from 'lucide-react';

const InstituteVerificationModal = ({ organizationId, isOpen, onClose, onUpdated }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [dossier, setDossier] = useState(null);

  // Rejection / Correction interactive dialog states
  const [activeAction, setActiveAction] = useState(null); // 'REJECT' | 'REQUEST_CORRECTION'
  const [actionReason, setActionReason] = useState('');

  const loadDossier = async () => {
    if (!organizationId) return;
    setLoading(true);
    try {
      const res = await api.getInstituteVerificationDossier(organizationId);
      if (res.success) {
        setDossier(res.dossier);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch institute verification dossier');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && organizationId) {
      loadDossier();
      setActiveAction(null);
      setActionReason('');
    }
  }, [isOpen, organizationId]);

  if (!isOpen) return null;

  const handleExecuteAction = async (actionType, customReason = '') => {
    setActionLoading(true);
    try {
      const payload = {
        action: actionType,
        reason: customReason || actionReason,
        correctionNotes: actionType === 'REQUEST_CORRECTION' ? (customReason || actionReason) : undefined
      };

      const res = await api.reviewOrganization(organizationId, payload);
      if (res.success) {
        toast.success(`Institute verification updated: ${actionType}`, 'Dossier Action Executed');
        setActiveAction(null);
        setActionReason('');
        loadDossier();
        if (onUpdated) onUpdated();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to execute review action');
    } finally {
      setActionLoading(false);
    }
  };

  const org = dossier?.organization;
  const adminUser = dossier?.adminUser;
  const stats = dossier?.stats;

  const isApproved = org?.status === 'APPROVED' || org?.status === 'active' || org?.verificationStatus === 'verified';
  const isPending = org?.status === 'PENDING_VERIFICATION' || org?.status === 'pending' || org?.verificationStatus === 'unverified';
  const isUnderReview = org?.status === 'UNDER_REVIEW' || org?.verificationStatus === 'under_review' || org?.verificationStatus === 'correction_requested';
  const isRejected = org?.status === 'REJECTED' || org?.verificationStatus === 'rejected';
  const isSuspended = org?.status === 'SUSPENDED';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl overflow-hidden my-auto flex flex-col max-h-[90vh] relative"
      >
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#0B2545] to-[#134074] text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-400 font-bold border border-white/10">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest">
                  MoES Central Accreditation Ledger
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  isApproved ? 'bg-emerald-500 text-white' :
                  isRejected ? 'bg-rose-500 text-white' :
                  isUnderReview ? 'bg-indigo-500 text-white' :
                  'bg-amber-400 text-slate-900'
                }`}>
                  {org?.status || 'PENDING_VERIFICATION'}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5">
                Institute Verification & Compliance Dossier
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
              <div className="text-slate-500 font-semibold">Loading verification dossier from database...</div>
            </div>
          ) : !org ? (
            <div className="p-8 text-center text-rose-600">Institute details not found</div>
          ) : (
            <>
              {/* Top Banner Status Bar */}
              <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isApproved ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
                isRejected ? 'bg-rose-50 border-rose-200 text-rose-900' :
                isUnderReview ? 'bg-indigo-50 border-indigo-200 text-indigo-900' :
                'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                <div className="flex items-start space-x-3">
                  <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-sm">
                      {isApproved ? 'Accredited & Activated MoES Tenant' :
                       isRejected ? 'Accreditation Rejected / Non-Compliant' :
                       isUnderReview ? 'Correction Required / Resubmission Pending' :
                       'Pending Platform Admin Verification Review'}
                    </div>
                    <div className="text-[11px] opacity-80 mt-0.5">
                      {isApproved 
                        ? 'This institute has fulfilled MoES compliance and can operate courses, faculty, and certified cohorts.'
                        : 'Institute features remain restricted until full administrative verification is completed.'}
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono text-[11px] opacity-75">
                  Code: <strong className="text-slate-900 font-bold">{org.code}</strong>
                </div>
              </div>

              {/* Rejection / Correction Note Alert if exists */}
              {(org.rejectionReason || org.correctionNotes) && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Previous Review Findings / Requirements:</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed font-mono">
                    {org.rejectionReason || org.correctionNotes}
                  </p>
                </div>
              )}

              {/* Grid Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Legal Entity & Campus */}
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2.5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Institutional Entity
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900 text-sm">{org.legalName}</div>
                    <div className="text-slate-500 font-medium">Display Name: {org.displayName}</div>
                  </div>
                  <div className="space-y-1 text-slate-600">
                    <div>Type: <strong className="text-slate-800">{org.type}</strong></div>
                    <div>Domain: <strong className="text-slate-800">{org.domain}</strong></div>
                    <div>Address: <span className="text-slate-700">{org.address}</span></div>
                    {org.website && (
                      <div>
                        Website:{' '}
                        <a href={org.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                          {org.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Authorized Representative & Admin */}
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2.5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Authorized Representative & Coordinator
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900 text-sm">
                      {org.authorizedRepresentative?.name || adminUser?.name || org.contactPerson?.name || 'Authorized Dean'}
                    </div>
                    <div className="text-slate-500 font-medium">
                      {org.authorizedRepresentative?.designation || adminUser?.designation || 'Institute Coordinator'}
                    </div>
                  </div>
                  <div className="space-y-1 text-slate-600">
                    <div className="flex items-center space-x-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{org.authorizedRepresentative?.email || adminUser?.email}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{org.authorizedRepresentative?.phone || adminUser?.mobile || 'Official Contact Provided'}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 pt-1">
                      <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>
                        Admin Account Status:{' '}
                        <strong className={adminUser?.approvalStatus === 'approved' ? 'text-emerald-700' : 'text-amber-700'}>
                          {adminUser?.approvalStatus?.toUpperCase() || 'PENDING'}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* 3. Verification Documents Ledger */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span>Accreditation Documents & Affiliation Dossier</span>
                  <span className="text-[10px] text-blue-600 font-mono">
                    {org.verificationDocuments?.length || 0} Documents Filed
                  </span>
                </div>

                {(!org.verificationDocuments || org.verificationDocuments.length === 0) ? (
                  <div className="p-4 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-400">
                    No physical verification documents uploaded. Default MoES institutional charter applies.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {org.verificationDocuments.map((doc, idx) => (
                      <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between hover:border-blue-300 transition">
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-800 truncate text-[11px]">{doc.name}</div>
                            <div className="text-[10px] text-slate-400">Format: {doc.type || 'PDF'}</div>
                          </div>
                        </div>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center space-x-1 transition"
                        >
                          <span>Inspect</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. Interactive Review Actions Box */}
              {activeAction && (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl space-y-3 animate-in fade-in">
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>
                      {activeAction === 'REJECT' ? 'Formal Rejection Justification' : 'Correction Request Directives'}
                    </span>
                    <button type="button" onClick={() => setActiveAction(null)} className="text-slate-400 hover:text-slate-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    rows="3"
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    placeholder={
                      activeAction === 'REJECT'
                        ? 'State the reason for rejecting this institute accreditation application...'
                        : 'Specify the amendments or supplementary documents required from the institute...'
                    }
                    className="w-full p-2.5 bg-white border border-amber-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setActiveAction(null)}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={actionLoading || !actionReason.trim()}
                      onClick={() => handleExecuteAction(activeAction)}
                      className="px-4 py-1.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-black disabled:opacity-50 flex items-center space-x-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{actionLoading ? 'Executing...' : 'Confirm Decision'}</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        {org && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="text-slate-500">
              Registered on: <strong>{new Date(org.createdAt).toLocaleDateString()}</strong>
            </div>

            <div className="flex items-center space-x-2">
              {!isApproved && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleExecuteAction('APPROVE')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition flex items-center space-x-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve & Grant Accreditation</span>
                </button>
              )}

              {isApproved && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleExecuteAction('SUSPEND')}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition flex items-center space-x-1.5"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Suspend Tenant</span>
                </button>
              )}

              {isSuspended && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleExecuteAction('REACTIVATE')}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Reactivate Institute</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => { setActiveAction('REQUEST_CORRECTION'); setActionReason(''); }}
                className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold rounded-xl transition flex items-center space-x-1.5"
              >
                <span>Request Correction</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveAction('REJECT'); setActionReason(''); }}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl transition flex items-center space-x-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default InstituteVerificationModal;
