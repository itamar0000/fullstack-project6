import React, { useState } from "react";

function AlbumCreateForm({ onCreate }) {
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      return;
    }

    setSubmitting(true);
    const created = await onCreate(cleanTitle);
    setSubmitting(false);

    if (created) {
      setTitle("");
    }
  }

  return (
    <form className="toolbar" onSubmit={handleSubmit}>
      <label className="grow">
        New album
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Album title" />
      </label>
      <button type="submit" className="primary-button" disabled={submitting}>
        Add
      </button>
    </form>
  );
}

export default AlbumCreateForm;
