const { AuditLog } = require('../models');

async function logAudit({ actorId, action, entityType, entityId, message, transaction }) {
  try {
    await AuditLog.create(
      {
        actor_id: actorId || null,
        action,
        entity_type: entityType,
        entity_id: entityId || null,
        message
      },
      { transaction }
    );
  } catch (error) {
    console.error('Audit log failed:', error.message);
  }
}

module.exports = logAudit;
