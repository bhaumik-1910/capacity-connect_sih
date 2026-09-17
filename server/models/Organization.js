const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  legalName: { type: String, required: true },
  displayName: { type: String, required: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  type: { 
    type: String, 
    enum: ['Government Ministry', 'Autonomous Institute', 'University', 'Training Academy', 'R&D Center'],
    default: 'Autonomous Institute'
  },
  domain: { type: String, default: 'imd.gov.in' },
  website: { type: String, default: 'https://mausam.imd.gov.in' },
  address: { type: String, default: 'Mausam Bhavan, Lodhi Road, New Delhi 110003' },
  contactPerson: {
    name: String,
    email: String,
    phone: String
  },
  logo: { type: String, default: '' },
  signatory: {
    name: { type: String, default: 'Dr. Mrutyunjay Mohapatra' },
    designation: { type: String, default: 'Director General of Meteorology' },
    signatureUrl: { type: String, default: '' }
  },

  // Verification Dossier & Official Documents
  verificationDocuments: [{
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, default: 'PDF' },
    uploadedAt: { type: Date, default: Date.now }
  }],
  authorizedRepresentative: {
    name: { type: String, default: '' },
    designation: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    idProofUrl: { type: String, default: '' }
  },

  // Academic Structure
  departments: [{ type: String }],
  programs: [{ type: String }],
  batches: [{ type: String }],

  // Review & Approval Audit
  rejectionReason: { type: String, default: '' },
  correctionNotes: { type: String, default: '' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },

  // --- Certificate Template Customization ---
  certificateTemplate: {
    // Organization display name on certificate (can differ from legalName)
    orgDisplayName: { type: String, default: '' },
    // Logo URL (can be a public URL or base64 data URL)
    logoUrl: { type: String, default: '' },
    // Signatory details on certificate
    signatoryName: { type: String, default: '' },
    signatoryDesignation: { type: String, default: '' },
    // Custom heading line below "Government of India"
    headerLine: { type: String, default: '' },
    // Minimum pass percentage to issue certificate (default: 80%)
    minScoreForCertificate: { type: Number, default: 80 },
    // Custom footer note on certificate
    footerNote: { type: String, default: '' },
    // Template Version for snapshot preservation
    templateVersion: { type: Number, default: 1 }
  },

  // Institutional Subscription & Student Quota
  subscription: {
    planTier: { 
      type: String, 
      enum: ['STARTER_250', 'STANDARD_1000', 'ENTERPRISE_5000', 'GOV_EXEMPT', 'CUSTOM'], 
      default: 'STANDARD_1000' 
    },
    maxStudentQuota: { type: Number, default: 1000 },
    activeStudentCount: { type: Number, default: 0 },
    status: { 
      type: String, 
      enum: ['PENDING_PAYMENT', 'ACTIVE', 'EXPIRED', 'SUSPENDED'], 
      default: 'ACTIVE' 
    },
    billingAmount: { type: Number, default: 75000 },
    currency: { type: String, default: 'INR' },
    paymentId: { type: String, default: '' },
    orderId: { type: String, default: '' },
    startDate: { type: Date, default: Date.now },
    expiryDate: { type: Date, default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) }
  },

  status: { 
    type: String, 
    enum: [
      'DRAFT',
      'PENDING_VERIFICATION',
      'UNDER_REVIEW',
      'APPROVED',
      'REJECTED',
      'SUSPENDED',
      'ARCHIVED',
      'pending',
      'active'
    ], 
    default: 'PENDING_VERIFICATION' 
  },
  verificationStatus: { 
    type: String, 
    enum: ['unverified', 'under_review', 'verified', 'rejected', 'correction_requested'], 
    default: 'unverified' 
  }
}, { timestamps: true });

organizationSchema.index({ status: 1 });

module.exports = mongoose.model('Organization', organizationSchema);
