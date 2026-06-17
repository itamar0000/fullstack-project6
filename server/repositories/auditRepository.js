import pool from "../db/pool.js";

// Writes one row to audit_logs. Exported as logAction to keep the many existing
// call sites unchanged (they only update their import path).
export async function logAction(actorId, action, targetType, targetId = null, details = {}) {
  await pool.execute(
    "INSERT INTO audit_logs (actorId, action, targetType, targetId, details) VALUES (?,?,?,?,?)",
    [
      actorId || null,
      action,
      targetType,
      targetId,
      JSON.stringify(details)
    ]
  );
}

// Most recent log rows joined to the acting user's username (for the admin view).
export async function listRecent(limit = 100) {
  const [rows] = await pool.execute(
    `SELECT l.id, l.actorId, u.username AS actorUsername, l.action, l.targetType,
            l.targetId, l.details, l.createdAt
     FROM audit_logs l
     LEFT JOIN users u ON l.actorId = u.id
     ORDER BY l.id DESC
     LIMIT ${Number(limit)}`
  );
  return rows;
}
