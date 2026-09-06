import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Search, CheckCircle2, XCircle, ShieldCheck, Award, Lock, ExternalLink } from 'lucide-react';

const CertificateVerification = () => {
  const { certificateNumber } = useParams();
  const navigate = useNavigate();

  const [inputNumber, setInputNumber] = useState(certificateNumber || '');
  const [certData, setCertData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const runVerification = async (certNum) => {
    if (!certNum || !certNum.trim()) return;
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const res = await api.verifyCertificate(certNum.trim().toUpperCase());
      if (res.success) {
        setCertData(res);
      } else {
        setCertData(null);
        setError(res.message || 'Certificate record not found');
      }
    } catch (err) {
      setCertData(null);
      setError(err.message || 'No certificate matching this record was found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (certificateNumber) {
      setInputNumber(certificateNumber);
      runVerification(certificateNumber);
    }
  }, [certificateNumber]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputNumber.trim()) {
      navigate(`/verify/${inputNumber.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-1.5 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>National Capacity Credential Registry</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Public Certificate Verification Portal
        </h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          Verify the authenticity of digital certificates issued by the Ministry of Earth Sciences (MoES) and India Meteorological Department (IMD).
        </p>
      </div>

      {/* Verification Input Box */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md space-y-4">
        <label className="block font-bold text-xs text-slate-700 uppercase tracking-wider">
          Enter Certificate ID or Scan QR Code
        </label>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Award className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              required
              placeholder="e.g., CC-IMD-RAD-GVYV9-2026"
              value={inputNumber}
              onChange={(e) => setInputNumber(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono uppercase focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[#0B2545] hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? 'Verifying...' : 'Verify Now'}</span>
          </button>
        </div>

        <div className="flex items-center space-x-2 text-[11px] text-slate-500">
          <Lock className="w-3.5 h-3.5 text-slate-400" />
          <span>Privacy Assured: Private personal data, contact information, and test scores are strictly masked.</span>
        </div>
      </form>

      {/* Verification Result Card */}
      {searched && (
        <div className="animate-in fade-in zoom-in-95 duration-200">
          {certData && certData.valid ? (
            <div className="bg-white rounded-2xl border-2 border-emerald-500/80 shadow-xl overflow-hidden">
              
              {/* Card Banner */}
              <div className="bg-emerald-600 px-6 py-4 text-white flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base">AUTHENTIC GOVERNMENT CREDENTIAL</h3>
                    <p className="text-[11px] text-emerald-100">Verified in official MoES / IMD Central Registry</p>
                  </div>
                </div>
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-bold font-mono">
                  STATUS: VALID
                </span>
              </div>

              {/* Verified Metadata Body */}
              <div className="p-6 sm:p-8 space-y-6 text-xs sm:text-sm bg-[#FCFDFD]">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
                      Certified Recipient
                    </span>
                    <span className="text-base font-bold text-slate-900 mt-0.5 block">
                      {certData.studentName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
                      Issuing Department / Ministry
                    </span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">
                      {certData.organizationName}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
                      Course / Capacity Program
                    </span>
                    <span className="font-bold text-slate-900 mt-0.5 block text-sm">
                      {certData.courseTitle}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Code: {certData.courseCode}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
                      Official Grade Attained
                    </span>
                    <span className="font-extrabold text-emerald-700 mt-0.5 block">
                      {certData.grade}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
                      Date of Official Issuance
                    </span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">
                      {new Date(certData.issueDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
                      Authorized Signatory
                    </span>
                    <span className="font-bold text-slate-800 mt-0.5 block">
                      {certData.signatoryName}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {certData.signatoryDesignation}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-500 font-mono">
                  Immutable Certificate Number: <strong>{certData.certificateNumber}</strong>
                </div>

              </div>

            </div>
          ) : (
            <div className="bg-white rounded-2xl border-2 border-rose-200 p-8 text-center space-y-3 shadow-lg">
              <XCircle className="w-12 h-12 text-rose-500 mx-auto" />
              <h3 className="font-bold text-slate-900 text-lg">Verification Failed</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                {error || 'No matching record was found in the Ministry of Earth Sciences National Registry. Please verify that the certificate ID was entered accurately.'}
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default CertificateVerification;
