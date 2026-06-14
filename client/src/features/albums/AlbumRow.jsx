import React, { useState } from "react";
import { Link } from "react-router-dom";
import { appRoutes } from "../../routes/paths.js";

function AlbumRow({ album, currentUserId, selected, onDelete, onRename }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(album.title);

  async function handleSubmit(event) {
    event.preventDefault();

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      return;
    }

    const updated = await onRename(album, cleanTitle);
    if (updated) {
      setEditing(false);
    }
  }

  function cancelEdit() {
    setTitle(album.title);
    setEditing(false);
  }

  return (
    <article className={`resource-row album-row ${selected ? "selected" : ""}`}>
      <div className="row-main">
        <span className="resource-id">#{album.id}</span>
        {editing ? (
          <form className="inline-edit" onSubmit={handleSubmit}>
            <input value={title} onChange={(event) => setTitle(event.target.value)} />
            <button type="submit" className="primary-button small">
              Save
            </button>
            <button type="button" className="ghost-button small" onClick={cancelEdit}>
              Cancel
            </button>
          </form>
        ) : (
          <h3>{album.title}</h3>
        )}
      </div>
      <div className="row-actions">
        <Link className="primary-button small" to={appRoutes.albumPhotos(currentUserId, album.id)}>
          Photos
        </Link>
        <button type="button" className="ghost-button small" onClick={() => setEditing(true)}>
          Edit
        </button>
        <button type="button" className="danger-button small" onClick={() => onDelete(album)}>
          Delete
        </button>
      </div>
    </article>
  );
}

export default AlbumRow;
