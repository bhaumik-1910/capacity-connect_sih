const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  traineeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  
  status: { 
    type: String, 
    enum: ['enrolled', 'in_progress', 'completed', 'dropped'], 
    default: 'enrolled' 
  },
  progressPercentage: { type: Number, default: 0 },
  completedModuleItems: [{ type: String }], // Unique item IDs or index strings e.g. "0-0", "0-1"
  
  enrolledAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  lastAccessedAt: { type: Date, default: Date.now },
  
  attendancePercentage: { type: Number, default: 95 },
  assessmentPassed: { type: Boolean, default: false },
  bestAssessmentScore: { type: Number, default: 0 },
  
  certificateIssued: { type: Boolean, default: false },
  certificateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Certificate' },
  
  // Payment Coverage Metadata
  enrollmentType: { 
    type: String, 
    enum: ['INSTITUTE_SPONSORED_FREE', 'INDIVIDUAL_PAID', 'GOV_SCHOLARSHIP'], 
    default: 'INSTITUTE_SPONSORED_FREE' 
  },
  paymentTransactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentTransaction' }
}, { timestamps: true });

// Ensure unique enrollment per trainee per course
enrollmentSchema.index({ traineeId: 1, courseId: 1 }, { unique: true });
enrollmentSchema.index({ traineeId: 1, status: 1 });
enrollmentSchema.index({ courseId: 1, status: 1 });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
