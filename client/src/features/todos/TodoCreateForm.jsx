import React, { useRef, useState } from "react";
import { IconPlus } from "../../components/icons.jsx";

function TodoCreateForm({ onCreate }) {
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const titleInputRef = useRef(null);

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
      titleInputRef.current?.focus();
    }
  }

  return (
    <form className="toolbar" onSubmit={handleSubmit}>
      <label>
        New todo
        <input
          ref={titleInputRef}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Add a task"
        />
      </label>
      <button type="submit" className="primary-button" disabled={submitting}>
        <IconPlus className="icon" />
        Add
      </button>
    </form>
  );
}

export default TodoCreateForm;
