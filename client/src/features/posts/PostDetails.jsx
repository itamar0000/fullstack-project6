import React, { useState } from "react";
import { EmptyState } from "../../components/Status.jsx";
import { usePostComments } from "./usePostComments.js";
import CommentsSection from "./comments/CommentsSection.jsx";
import { IconCheck, IconPencil, IconTrash, IconX } from "../../components/icons.jsx";

function PostDetails({ post, currentUser, onDelete, onUpdate }) {
  const [draft, setDraft] = useState(null);
  const commentsState = usePostComments(post?.id, currentUser);

  if (!post) {
    return <EmptyState message="Select a post to view details and comments." />;
  }

  async function handleUpdate(event) {
    event.preventDefault();

    const title = draft.title.trim();
    const body = draft.body.trim();

    if (!title || !body) {
      return;
    }

    const updated = await onUpdate(post, { title, body });
    if (updated) {
      setDraft(null);
    }
  }

  async function handleDelete() {
    const deleted = await onDelete(post);
    if (deleted) {
      setDraft(null);
    }
  }

  return (
    <>
      <div className="detail-header">
        <div>
          <span className="resource-id">#{post.id}</span>
          <h3>{post.title}</h3>
        </div>
        {currentUser.id === post.userId && (
          <div className="row-actions">
            <button type="button" className="ghost-button small" onClick={() => setDraft(post)}>
              <IconPencil className="icon" />
              Edit
            </button>
            <button type="button" className="danger-button small" onClick={handleDelete}>
              <IconTrash className="icon" />
              Delete
            </button>
          </div>
        )}
      </div>

      <p className="body-text">{post.body}</p>

      {draft && draft.id === post.id && (
        <form className="form-stack edit-box" onSubmit={handleUpdate}>
          <label>
            Title
            <input
              value={draft.title}
              onChange={(event) => setDraft((state) => ({ ...state, title: event.target.value }))}
            />
          </label>
          <label>
            Body
            <textarea
              value={draft.body}
              onChange={(event) => setDraft((state) => ({ ...state, body: event.target.value }))}
            />
          </label>
          <div className="row-actions">
            <button type="submit" className="primary-button small">
              <IconCheck className="icon" />
              Save
            </button>
            <button type="button" className="ghost-button small" onClick={() => setDraft(null)}>
              <IconX className="icon" />
              Cancel
            </button>
          </div>
        </form>
      )}

      <CommentsSection commentsState={commentsState} currentUser={currentUser} />
    </>
  );
}

export default PostDetails;
