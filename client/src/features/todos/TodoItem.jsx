import React, { useState } from "react";

function TodoItem({ todo, busy, onDelete, onRename, onToggle }) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);

  async function saveTitle() {
    const cleanTitle = editTitle.trim();

    if (!cleanTitle) {
      return;
    }

    const updated = await onRename(todo, cleanTitle);
    if (updated) {
      setEditing(false);
    }
  }

  function cancelEdit() {
    setEditTitle(todo.title);
    setEditing(false);
  }

  return (
    <article className="resource-row">
      <label className="check-cell">
        <input type="checkbox" checked={todo.completed} disabled={busy} onChange={() => onToggle(todo)} />
        <span>{todo.completed ? "Completed" : "Active"}</span>
      </label>
      <div className="row-main">
        <span className="resource-id">#{todo.id}</span>
        {editing ? (
          <input value={editTitle} onChange={(event) => setEditTitle(event.target.value)} />
        ) : (
          <h3>{todo.title}</h3>
        )}
      </div>
      <div className="row-actions">
        {editing ? (
          <>
            <button type="button" className="primary-button small" disabled={busy} onClick={saveTitle}>
              Save
            </button>
            <button type="button" className="ghost-button small" onClick={cancelEdit}>
              Cancel
            </button>
          </>
        ) : (
          <button type="button" className="ghost-button small" onClick={() => setEditing(true)}>
            Edit title
          </button>
        )}
        <button type="button" className="danger-button small" disabled={busy} onClick={() => onDelete(todo)}>
          Delete
        </button>
      </div>
    </article>
  );
}

export default TodoItem;
