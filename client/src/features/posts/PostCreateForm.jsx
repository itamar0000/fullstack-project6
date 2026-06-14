import React, { useState } from "react";

const EMPTY_POST = { title: "", body: "" };

function PostCreateForm({ onCreate }) {
  const [draft, setDraft] = useState(EMPTY_POST);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const title = draft.title.trim();
    const body = draft.body.trim();

    if (!title || !body) {
      return;
    }

    setSubmitting(true);
    const created = await onCreate(title, body);
    setSubmitting(false);

    if (created) {
      setDraft(EMPTY_POST);
    }
  }

  return (
    <form className="form-stack compact-form" onSubmit={handleSubmit}>
      <h3>Add post</h3>
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
      <button type="submit" className="primary-button" disabled={submitting}>
        Add post
      </button>
    </form>
  );
}

export default PostCreateForm;
