const AuditLog = require('../models/AuditLog');

const logAuditEvent = async ({ actor, action, module, targetId, targetName, severity = 'INFO', metadata = {}, ip = '127.0.0.1' }) => {
  try {
    await AuditLog.create({
      actorId: actor ? actor._id : null,
      actorName: actor ? actor.name : 'System/Anonymous',
      actorRole: actor ? actor.role : 'system',
      organizationId: actor ? actor.organizationId : null,
      action,
      module,
      targetId: targetId ? targetId.toString() : '',
      targetName: targetName || '',
      severity,
      metadata,
      ipAddress: ip,
      timestamp: new Date()
    });
  } catch (err) {
    console.error('[Audit Log Error]', err.message);
  }
};

module.exports = { logAuditEvent };
