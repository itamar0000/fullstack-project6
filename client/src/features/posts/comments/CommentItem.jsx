import React, { useState } from "react";

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
        <strong>{comment.name}</strong>
        <span>{comment.email}</span>
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
                Save
              </button>
              <button type="button" className="ghost-button small" onClick={cancelEdit}>
                Cancel
              </button>
            </>
          ) : (
            <button type="button" className="ghost-button small" onClick={() => setEditing(true)}>
              Edit
            </button>
          )}
          <button type="button" className="danger-button small" onClick={() => onDelete(comment)}>
            Delete
          </button>
        </div>
      )}
    </article>
  );
}

export default CommentItem;
