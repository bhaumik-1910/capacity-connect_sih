const mongoose = require('mongoose');

const paymentTransactionSchema = new mongoose.Schema({
  transactionType: {
    type: String,
    enum: ['INSTITUTE_SUBSCRIPTION', 'INDIVIDUAL_COURSE_ENROLLMENT', 'REFUND'],
    required: true
  },
  orderId: { type: String, required: true, index: true },
  paymentId: { type: String, default: '', index: true },
  signature: { type: String, default: '' },
  
  // Actor / Paying Entity
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, default: '' },
  userEmail: { type: String, default: '' },
  
  // Organization Details (Populated for Institutional Subscriptions)
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  organizationName: { type: String, default: '' },
  planTier: { type: String, default: '' },
  quotaGranted: { type: Number, default: 0 },
  
  // Course Details (Populated for Individual Trainee Purchases)
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  courseTitle: { type: String, default: '' },

  // Financial Metadata
  amount: { type: Number, required: true }, // In INR
  currency: { type: String, default: 'INR' },
  status: {
    type: String,
    enum: ['created', 'authorized', 'captured', 'failed', 'refunded'],
    default: 'created',
    index: true
  },
  paymentMethod: { type: String, default: 'upi' },
  receipt: { type: String, required: true, unique: true },
  
  notes: { type: Map, of: String },
  failureReason: { type: String, default: '' }
}, { timestamps: true });

paymentTransactionSchema.index({ userId: 1, createdAt: -1 });
paymentTransactionSchema.index({ organizationId: 1, createdAt: -1 });

module.exports = mongoose.model('PaymentTransaction', paymentTransactionSchema);
