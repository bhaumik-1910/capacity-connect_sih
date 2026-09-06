const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  actorName: { type: String, default: 'System' },
  actorRole: { type: String, default: 'system' },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  action: { type: String, required: true }, // e.g., 'USER_APPROVAL', 'COURSE_PUBLISHED', 'CERTIFICATE_ISSUED', 'CERTIFICATE_REVOKED'
  module: { type: String, required: true }, // 'AUTH', 'USERS', 'COURSES', 'ASSESSMENTS', 'CERTIFICATES', 'ADMIN'
  targetId: { type: String },
  targetName: { type: String },
  severity: { type: String, enum: ['INFO', 'WARNING', 'CRITICAL'], default: 'INFO' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  ipAddress: { type: String, default: '127.0.0.1' },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

auditLogSchema.index({ module: 1, action: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
