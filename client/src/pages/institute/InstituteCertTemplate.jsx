import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/NotificationContext';
import {
  Award,
  Save,
  Building2,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
} from 'lucide-react';
import {
  Button,
  Card,
  PageHeader,
  Badge,
  Input,
  Textarea,
} from '../../components/design-system';

/**
 * Government Minimalism Certificate Template Builder & Live Preview (Sections 36 & 37)
 * Left: Clean Editor (Controls remain minimal, no Canva clutter)
 * Right: Live Preview showing exact institutional certificate with placeholders
 */
const InstituteCertTemplate = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orgId, setOrgId] = useState(null);
  const [org, setOrg] = useState(null);

  const [template, setTemplate] = useState({
    certTitle: 'CERTIFICATE OF COMPLETION',
    orgDisplayName: '',
    logoUrl: '',
    signatoryName: '',
    signatoryDesignation: 'Dean / Authorized Signatory',
    minScoreForCertificate: 80,
    footerNote: 'Ministry of Earth Sciences (MoES) & IMD Accredited Educational Program',
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
          certTitle: cert.certTitle || 'CERTIFICATE OF COMPLETION',
          orgDisplayName: cert.orgDisplayName || res.organization.displayName || res.organization.legalName || 'National Meteorological Training Institute',
          logoUrl: cert.logoUrl || '',
          signatoryName: cert.signatoryName || 'Dr. Alok Verma',
          signatoryDesignation: cert.signatoryDesignation || 'Director of Academic Affairs',
          minScoreForCertificate: cert.minScoreForCertificate ?? 80,
          footerNote: cert.footerNote || 'Accredited by India Meteorological Department under Problem Statement 26075.',
        });
      }
    } catch (err) {
      console.error('Failed to load certificate template:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplate();
  }, []);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!orgId) return;
    setSaving(true);
    try {
      const res = await api.updateCertificateTemplate(orgId, template);
      if (res.success) {
        toast.success('Certificate branding saved and activated for all future completions.', 'Template Updated');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Certificate Template Builder"
        description="Configure your institute's accredited certificate design and signatory details. Generated certificates are cryptographically linked to public QR verification."
        badge={<Badge variant="primary" size="sm">Template Governance</Badge>}
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            loading={saving}
            icon={Save}
          >
            Save Template
          </Button>
        }
      />

      {/* Two-Column Layout (Section 36 & 37) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Template Editor Controls (Section 36) */}
        <div className="lg:col-span-5 space-y-4">
          <Card padding="default">
            <h3 className="text-sm font-bold text-[#17202A] pb-2 mb-4 border-b border-[#E5E7EB]">
              Template Fields
            </h3>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <Input
                label="Certificate Title"
                required
                value={template.certTitle}
                onChange={(e) => setTemplate({ ...template, certTitle: e.target.value })}
              />

              <Input
                label="Institute Name"
                required
                value={template.orgDisplayName}
                onChange={(e) => setTemplate({ ...template, orgDisplayName: e.target.value })}
              />

              <Input
                label="Institute Logo URL (Optional)"
                placeholder="https://..."
                value={template.logoUrl}
                onChange={(e) => setTemplate({ ...template, logoUrl: e.target.value })}
                helperText="Leave empty to use official institutional text crest."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Signatory Name"
                  required
                  value={template.signatoryName}
                  onChange={(e) => setTemplate({ ...template, signatoryName: e.target.value })}
                />
                <Input
                  label="Signatory Designation"
                  required
                  value={template.signatoryDesignation}
                  onChange={(e) => setTemplate({ ...template, signatoryDesignation: e.target.value })}
                />
              </div>

              <Input
                label="Passing Score Threshold (%)"
                type="number"
                min="50"
                max="100"
                value={template.minScoreForCertificate}
                onChange={(e) => setTemplate({ ...template, minScoreForCertificate: Number(e.target.value) })}
                helperText="Government standard: 80% passing grade required."
              />

              <Textarea
                label="Footer Regulatory Note"
                rows={2}
                value={template.footerNote}
                onChange={(e) => setTemplate({ ...template, footerNote: e.target.value })}
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={saving}
                  className="w-full"
                >
                  Save & Publish Version
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* RIGHT COLUMN: Live Certificate Preview Canvas (Section 37) */}
        <div className="lg:col-span-7">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#5F6B76] uppercase tracking-wider">
              Live Preview (Institutional Template)
            </span>
            <span className="text-[11px] text-[#87919B]">
              Placeholders like &#123;&#123;studentName&#125;&#125; are populated at generation.
            </span>
          </div>

          {/* Certificate Canvas Frame (Minimalist Government Parchment) */}
          <div className="bg-white rounded-[8px] border-2 border-[#1F4E79] p-8 sm:p-10 shadow-[0_2px_8px_rgba(0,0,0,0.06)] text-center relative overflow-hidden">
            
            {/* Subtle Inner Double Border */}
            <div className="border border-[#E5E7EB] p-6 sm:p-8 rounded-[4px] relative">
              
              {/* National Emblem & Institute Header */}
              <div className="mb-4">
                {template.logoUrl ? (
                  <img
                    src={template.logoUrl}
                    alt="Institute Logo"
                    className="h-12 mx-auto object-contain mb-2"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-[6px] bg-[#1F4E79] text-white flex items-center justify-center font-bold text-sm mx-auto mb-2">
                    CC
                  </div>
                )}
                <div className="text-xs font-semibold text-[#5F6B76] uppercase tracking-wider">
                  {template.orgDisplayName || 'INSTITUTE NAME'}
                </div>
                <div className="text-[10px] text-[#87919B]">
                  Affiliated under MoES / IMD Framework
                </div>
              </div>

              {/* Certificate Title */}
              <div className="my-6">
                <h2 className="text-lg sm:text-xl font-bold tracking-widest text-[#1F4E79] uppercase">
                  {template.certTitle || 'CERTIFICATE OF COMPLETION'}
                </h2>
                <div className="w-16 h-0.5 bg-[#1F4E79] mx-auto mt-2" />
              </div>

              {/* Certificate Text Body (Section 37) */}
              <div className="space-y-3 text-xs sm:text-sm text-[#5F6B76]">
                <p>This is to certify that</p>
                <div className="text-lg sm:text-xl font-bold text-[#17202A] py-1 border-b border-dashed border-[#CBD5E1] inline-block px-8">
                  {'{{studentName}}'}
                </div>
                <p>has successfully completed the prescribed curriculum and 80% passing exam for</p>
                <div className="text-sm sm:text-base font-bold text-[#17202A] py-0.5">
                  {'{{courseName}}'}
                </div>
                <p className="text-xs">
                  Issued by <strong className="text-[#17202A]">{template.orgDisplayName}</strong>
                </p>
              </div>

              {/* Metadata Details Row */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#5F6B76] my-6 font-mono">
                <div>
                  <span>Certificate No: </span>
                  <strong className="text-[#17202A]">{'{{certificateNumber}}'}</strong>
                </div>
                <div>
                  <span>Issue Date: </span>
                  <strong className="text-[#17202A]">{'{{issueDate}}'}</strong>
                </div>
              </div>

              {/* Footer: Signatory, Seal & QR Code (Section 37) */}
              <div className="pt-6 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
                
                {/* Signatory */}
                <div className="text-center sm:text-left">
                  <div className="font-serif italic text-sm text-[#1F4E79] mb-1">
                    {template.signatoryName || 'Authorized Signatory'}
                  </div>
                  <div className="font-bold text-xs text-[#17202A]">
                    {template.signatoryName}
                  </div>
                  <div className="text-[11px] text-[#5F6B76]">
                    {template.signatoryDesignation}
                  </div>
                </div>

                {/* Institute Seal Stamp */}
                <div className="w-14 h-14 rounded-full border border-dashed border-[#1F4E79] flex items-center justify-center text-[9px] font-bold text-[#1F4E79] uppercase text-center p-1">
                  Official Seal
                </div>

                {/* Verification QR Code */}
                <div className="text-center sm:text-right">
                  <div className="w-14 h-14 bg-[#F8FAFC] border border-[#E5E7EB] rounded-[4px] p-1 mx-auto sm:ml-auto flex items-center justify-center">
                    <QrCode className="w-12 h-12 text-[#17202A]" />
                  </div>
                  <span className="text-[9px] text-[#87919B] font-mono block mt-1">
                    Scan to Verify
                  </span>
                </div>

              </div>

              {/* Legal Regulatory Footer Note */}
              <div className="mt-4 pt-2 text-[10px] text-[#87919B] text-center">
                {template.footerNote}
              </div>

            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default InstituteCertTemplate;
