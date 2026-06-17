import pool from "./db.js";

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
