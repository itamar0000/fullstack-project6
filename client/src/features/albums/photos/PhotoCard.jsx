import React, { useState } from "react";

function PhotoCard({ photo, onDelete, onUpdate }) {
  const [draft, setDraft] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();

    const title = draft.title.trim();
    const url = draft.url.trim();

    if (!title || !url) {
      return;
    }

    const updated = await onUpdate(photo, { title, url });
    if (updated) {
      setDraft(null);
    }
  }

  return (
    <article className="photo-card">
      <img src={photo.thumbnailUrl || photo.url} alt={photo.title} loading="lazy" />
      {draft ? (
        <form className="form-stack edit-box" onSubmit={handleSubmit}>
          <label>
            Title
            <input
              value={draft.title}
              onChange={(event) => setDraft((state) => ({ ...state, title: event.target.value }))}
            />
          </label>
          <label>
            URL
            <input
              value={draft.url}
              onChange={(event) => setDraft((state) => ({ ...state, url: event.target.value }))}
            />
          </label>
          <div className="row-actions">
            <button type="submit" className="primary-button small">
              Save
            </button>
            <button type="button" className="ghost-button small" onClick={() => setDraft(null)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <h4>{photo.title}</h4>
          <div className="row-actions">
            <button type="button" className="ghost-button small" onClick={() => setDraft(photo)}>
              Edit
            </button>
            <button type="button" className="danger-button small" onClick={() => onDelete(photo)}>
              Delete
            </button>
          </div>
        </>
      )}
    </article>
  );
}

export default PhotoCard;
