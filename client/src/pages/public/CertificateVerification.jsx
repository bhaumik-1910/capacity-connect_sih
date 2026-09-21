import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Search, CheckCircle2, XCircle, FileCheck, Shield, Award, ArrowLeft } from 'lucide-react';
import { Button, Card, Badge } from '../../components/design-system';

/**
 * Public Certificate Verification (Section 38)
 * Clean, minimal, reliable, no login required
 */
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
        setError(res.message || 'Certificate record not found.');
      }
    } catch (err) {
      setCertData(null);
      setError(err.message || 'No matching certificate found in the central ledger.');
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
    <div className="max-w-2xl mx-auto py-8 sm:py-12 px-4">
      
      {/* Back to Home Button */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => {
            const mainEl = document.getElementById('main-content');
            if (mainEl) mainEl.scrollTop = 0;
            window.scrollTo(0, 0);
            navigate('/');
          }}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#1F4E79] hover:text-[#163A5C] bg-white px-3 py-1.5 rounded-[6px] border border-[#E5E7EB] hover:border-[#1F4E79] shadow-xs cursor-pointer transition-all group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Page Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1F4E79] mb-2">
          <Shield className="w-3.5 h-3.5" />
          <span>MoES · IMD Public Ledger</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#17202A] tracking-tight">
          Certificate Verification
        </h1>
        <p className="text-xs sm:text-sm text-[#5F6B76] mt-1 max-w-md mx-auto">
          Verify digital credentials issued under the CAPACITY CONNECT national education framework.
        </p>
      </div>

      {/* Verification Search Form */}
      <Card padding="default" className="mb-6">
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block text-xs font-semibold text-[#17202A] uppercase tracking-wider">
            Certificate Number
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              required
              placeholder="e.g. CC-IMD-RAD-GVYV9-2026"
              value={inputNumber}
              onChange={(e) => setInputNumber(e.target.value)}
              className="flex-1 bg-white text-[#17202A] text-sm font-mono uppercase px-3 py-2 rounded-[6px] border border-[#E5E7EB] focus:border-[#1F4E79] focus:ring-2 focus:ring-[#EAF2F8] focus:outline-none"
            />
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              icon={Search}
              className="flex-shrink-0"
            >
              Verify
            </Button>
          </div>
          <p className="text-[11px] text-[#87919B]">
            You can verify by entering the unique certificate ID found on the certificate or QR code.
          </p>
        </form>
      </Card>

      {/* Result Section (Section 38) */}
      {searched && (
        <div>
          {certData && certData.valid ? (
            <div className="bg-white rounded-[8px] border border-[#C8E6C9] shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
              {/* Header Status */}
              <div className="px-5 py-3.5 bg-[#E8F5E9] border-b border-[#C8E6C9] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#1F7A4D]" />
                  <span className="text-sm font-bold text-[#145A32]">
                    Certificate Valid
                  </span>
                </div>
                <Badge variant="approved" size="sm">
                  Active in Registry
                </Badge>
              </div>

              {/* Data Table / Fields */}
              <div className="p-5 sm:p-6 divide-y divide-[#E5E7EB] text-xs sm:text-sm">
                
                <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-[#5F6B76] font-medium">Certificate Number</span>
                  <span className="font-mono font-bold text-[#17202A]">{certData.certificateNumber}</span>
                </div>

                <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-[#5F6B76] font-medium">Student Name</span>
                  <span className="font-bold text-[#17202A]">{certData.studentName}</span>
                </div>

                <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-[#5F6B76] font-medium">Institute</span>
                  <span className="text-[#17202A]">{certData.organizationName}</span>
                </div>

                <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-[#5F6B76] font-medium">Course</span>
                  <span className="font-semibold text-[#17202A]">{certData.courseTitle}</span>
                </div>

                <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-[#5F6B76] font-medium">Issue Date</span>
                  <span className="text-[#17202A]">
                    {new Date(certData.issueDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-[#5F6B76] font-medium">Authorized Signatory</span>
                  <span className="text-[#17202A]">
                    {certData.signatoryName} {certData.signatoryDesignation ? `(${certData.signatoryDesignation})` : ''}
                  </span>
                </div>

                <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-[#5F6B76] font-medium">Status</span>
                  <span className="font-semibold text-[#1F7A4D]">Verified Authentic</span>
                </div>

              </div>
            </div>
          ) : (
            <Card padding="default" className="border-[#FEE4E2] text-center py-8">
              <XCircle className="w-8 h-8 text-[#B42318] mx-auto mb-2" />
              <h3 className="text-base font-bold text-[#17202A]">Verification Failed</h3>
              <p className="text-xs text-[#5F6B76] mt-1 max-w-sm mx-auto">
                {error || 'No matching certificate record was found in the Ministry registry. Please verify the entered ID.'}
              </p>
            </Card>
          )}
        </div>
      )}

    </div>
  );
};

export default CertificateVerification;
