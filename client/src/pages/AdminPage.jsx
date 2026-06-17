import React, { useEffect, useState } from "react";
import { adminApi } from "../api/resources.js";
import { EmptyState, ErrorState, LoadingState } from "../components/Status.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function formatDetails(details) {
  if (!details || Object.keys(details).length === 0) {
    return "";
  }

  return Object.entries(details)
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");
}

function AdminPage() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  async function loadAdminData() {
    setLoading(true);
    setError("");

    try {
      const [userRows, logRows] = await Promise.all([
        adminApi.listUsers(),
        adminApi.listAuditLogs()
      ]);
      setUsers(userRows);
      setLogs(logRows);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  async function toggleBlocked(user) {
    setBusyId(user.id);
    setError("");

    try {
      const updated = await adminApi.setUserBlocked(user.id, !user.isBlocked);
      setUsers((items) => items.map((item) => (item.id === updated.id ? updated : item)));
      const logRows = await adminApi.listAuditLogs();
      setLogs(logRows);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function promoteToAdmin(user) {
    setBusyId(user.id);
    setError("");

    try {
      const updated = await adminApi.promoteUserToAdmin(user.id);
      setUsers((items) => items.map((item) => (item.id === updated.id ? updated : item)));
      const logRows = await adminApi.listAuditLogs();
      setLogs(logRows);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  if (!currentUser.isAdmin) {
    return (
      <section className="page-section">
        <div className="section-heading">
          <p className="eyebrow">Admin</p>
          <h2>System management</h2>
        </div>
        <ErrorState message="Admin access required." />
      </section>
    );
  }

  return (
    <section className="page-section">
      <div className="section-heading">
        <p className="eyebrow">Admin</p>
        <h2>System management</h2>
        <p>Block users and review recent user actions.</p>
      </div>

      <ErrorState message={error} />
      {loading && <LoadingState label="Loading admin data" />}

      {!loading && (
        <div className="split-grid">
          <section className="plain-panel">
            <div className="section-heading compact">
              <p className="eyebrow">Users</p>
              <h3>User access</h3>
            </div>

            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Status</th>
                    <th>Role</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>#{user.id}</td>
                      <td>
                        <strong>{user.username}</strong>
                        <span>{user.name}</span>
                      </td>
                      <td>{user.isBlocked ? "Blocked" : "Active"}</td>
                      <td>{user.isAdmin ? "Admin" : "User"}</td>
                      <td>
                        <div className="row-actions compact-actions">
                          {!user.isAdmin && (
                            <button
                              type="button"
                              className="primary-button small"
                              disabled={busyId === user.id || user.isBlocked}
                              onClick={() => promoteToAdmin(user)}
                            >
                              Make admin
                            </button>
                          )}
                          <button
                            type="button"
                            className={user.isBlocked ? "secondary-button small" : "danger-button small"}
                            disabled={busyId === user.id || user.id === currentUser.id || user.isAdmin}
                            onClick={() => toggleBlocked(user)}
                          >
                            {user.isBlocked ? "Unblock" : "Block"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="plain-panel">
            <div className="section-heading compact">
              <p className="eyebrow">Audit</p>
              <h3>Recent actions</h3>
            </div>

            {logs.length === 0 && <EmptyState message="No actions recorded yet." />}
            <div className="audit-list">
              {logs.map((log) => (
                <article className="audit-item" key={log.id}>
                  <strong>{log.action}</strong>
                  <span>
                    {log.actorUsername || "Deleted user"} on {log.targetType}
                    {log.targetId ? ` #${log.targetId}` : ""}
                  </span>
                  {formatDetails(log.details) && <small>{formatDetails(log.details)}</small>}
                  <time>{new Date(log.createdAt).toLocaleString()}</time>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

export default AdminPage;
