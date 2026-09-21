const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const certificateSchema = new mongoose.Schema({
  certificateNumber: { 
    type: String, 
    required: true, 
    unique: true, 
    default: () => 'CC-IMD-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Date.now().toString().slice(-4)
  },
  verificationHash: {
    type: String,
    required: true,
    default: () => uuidv4()
  },
  
  traineeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },

  // Snapshotted fields at issuance
  studentName: { type: String, required: true },
  studentEmail: { type: String },
  studentDesignation: { type: String, default: '' },
  studentDepartment: { type: String, default: '' },
  
  organizationName: { type: String, default: '' },
  organizationLogo: { type: String, default: '' },
  signatoryName: { type: String, default: '' },
  signatoryDesignation: { type: String, default: '' },

  courseTitle: { type: String, required: true },
  courseCode: { type: String, required: true },
  grade: { type: String, default: 'Distinction' },
  scorePercentage: { type: Number, default: 92 },
  
  // Custom certificate template fields
  headerLine: { type: String, default: 'National Digital Capacity Building & Competency Assurance Registry' },
  footerNote: { type: String, default: '' },
  enrollmentNumber: { type: String, default: '' },
  
  // Per-course custom design (set by trainer)
  backgroundUrl: { type: String, default: '' },
  useCustomBackground: { type: Boolean, default: false },
  certTitleText: { type: String, default: '' },
  trainerSignatureName: { type: String, default: '' },
  trainerSignatureDesignation: { type: String, default: '' },
  accentColor: { type: String, default: '#b45309' },
  
  issueDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['valid', 'revoked', 'reissued', 'superseded'], default: 'valid' },
  revocationReason: { type: String, default: '' },
  reissuedToCertificateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Certificate' },
  
  qrPayload: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Certificate', certificateSchema);
