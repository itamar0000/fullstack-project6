import React, { useState } from "react";
import { IconCheck, IconPencil, IconTrash, IconX } from "../../../components/icons.jsx";

function getInitials(name) {
  return (name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function CommentItem({ comment, currentUser, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(comment.body);
  const isOwner = comment.userId === currentUser.id;

  async function handleSave() {
    const cleanBody = body.trim();

    if (!cleanBody) {
      return;
    }

    const updated = await onUpdate(comment, cleanBody);
    if (updated) {
      setEditing(false);
    }
  }

  function cancelEdit() {
    setBody(comment.body);
    setEditing(false);
  }

  return (
    <article className="comment-item">
      <header>
        <div className="comment-author">
          <span className="user-avatar" aria-hidden="true">
            {getInitials(comment.name)}
          </span>
          <div>
            <strong>{comment.name}</strong>
            <span className="comment-email">{comment.email}</span>
          </div>
        </div>
        {isOwner && <span className="badge-owner">You</span>}
      </header>
      {editing ? (
        <input value={body} onChange={(event) => setBody(event.target.value)} />
      ) : (
        <p>{comment.body}</p>
      )}
      {isOwner && (
        <div className="row-actions">
          {editing ? (
            <>
              <button type="button" className="primary-button small" onClick={handleSave}>
                <IconCheck className="icon" />
                Save
              </button>
              <button type="button" className="ghost-button small" onClick={cancelEdit}>
                <IconX className="icon" />
                Cancel
              </button>
            </>
          ) : (
            <button type="button" className="ghost-button small" onClick={() => setEditing(true)}>
              <IconPencil className="icon" />
              Edit
            </button>
          )}
          <button type="button" className="danger-button small" onClick={() => onDelete(comment)}>
            <IconTrash className="icon" />
            Delete
          </button>
        </div>
      )}
    </article>
  );
}

export default CommentItem;
