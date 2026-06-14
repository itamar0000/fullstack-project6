import React, { useState } from "react";
import { makeDefaultPhotoUrl } from "../photoUrls.js";

function PhotoCreateForm({ onCreate }) {
  const [draft, setDraft] = useState({
    title: "",
    url: makeDefaultPhotoUrl()
  });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const title = draft.title.trim();
    const url = draft.url.trim();

    if (!title || !url) {
      return;
    }

    setSubmitting(true);
    const created = await onCreate(title, url);
    setSubmitting(false);

    if (created) {
      setDraft({
        title: "",
        url: makeDefaultPhotoUrl()
      });
    }
  }

  return (
    <form className="toolbar" onSubmit={handleSubmit}>
      <label className="grow">
        Photo title
        <input
          value={draft.title}
          onChange={(event) => setDraft((state) => ({ ...state, title: event.target.value }))}
          placeholder="Photo title"
        />
      </label>
      <label className="grow">
        Image URL
        <input
          value={draft.url}
          onChange={(event) => setDraft((state) => ({ ...state, url: event.target.value }))}
        />
      </label>
      <button type="submit" className="primary-button" disabled={submitting}>
        Add photo
      </button>
    </form>
  );
}

export default PhotoCreateForm;
