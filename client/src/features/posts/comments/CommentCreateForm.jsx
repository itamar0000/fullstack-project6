import React, { useState } from "react";
import { IconPlus } from "../../../components/icons.jsx";

function CommentCreateForm({ onCreate }) {
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const cleanBody = body.trim();
    if (!cleanBody) {
      return;
    }

    setSubmitting(true);
    const created = await onCreate(cleanBody);
    setSubmitting(false);

    if (created) {
      setBody("");
    }
  }

  return (
    <form className="toolbar" onSubmit={handleSubmit}>
      <label className="grow">
        New comment
        <input value={body} onChange={(event) => setBody(event.target.value)} placeholder="Add a comment" />
      </label>
      <button type="submit" className="primary-button" disabled={submitting}>
        <IconPlus className="icon" />
        Add
      </button>
    </form>
  );
}

export default CommentCreateForm;
