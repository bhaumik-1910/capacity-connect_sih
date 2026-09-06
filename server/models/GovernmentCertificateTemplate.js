const mongoose = require('mongoose');

const governmentCertificateTemplateSchema = new mongoose.Schema({
  orgDisplayName: {
    type: String,
    default: 'Ministry of Earth Sciences (MoES), Government of India'
  },
  subHeader: {
    type: String,
    default: 'National Digital Capacity Building & Competency Assurance Registry'
  },
  logoUrl: {
    type: String,
    default: '/logo-moes.png'
  },
  nationalEmblemUrl: {
    type: String,
    default: '/emblem-india.png'
  },
  sealUrl: {
    type: String,
    default: ''
  },
  certTitleText: {
    type: String,
    default: 'National Certificate of Competency & Professional Excellence'
  },
  headerLine: {
    type: String,
    default: 'National Skill Qualification Framework (NSQF) • Government of India Accredited'
  },
  signatoryName: {
    type: String,
    default: 'Dr. Mrutyunjay Mohapatra'
  },
  signatoryDesignation: {
    type: String,
    default: 'Director General of Meteorology, Govt. of India'
  },
  signatorySignatureUrl: {
    type: String,
    default: ''
  },
  secondarySignatoryName: {
    type: String,
    default: 'Dr. M. Ravichandran'
  },
  secondarySignatoryDesignation: {
    type: String,
    default: 'Secretary, Ministry of Earth Sciences'
  },
  secondarySignatureUrl: {
    type: String,
    default: ''
  },
  minScoreForCertificate: {
    type: Number,
    default: 75
  },
  accentColor: {
    type: String,
    default: '#1e3a8a'
  },
  borderStyle: {
    type: String,
    enum: ['ornate-gold', 'royal-navy', 'national-tri', 'modern-geometric'],
    default: 'ornate-gold'
  },
  footerNote: {
    type: String,
    default: 'Issued to open public citizen learners upon successful verification of meteorological competencies. Valid nationwide and WMO compliant.'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('GovernmentCertificateTemplate', governmentCertificateTemplateSchema);
