import React from "react";

function PostSearchControls({ search, onSearchFieldChange, onSearchTermChange }) {
  return (
    <div className="toolbar filters stacked">
      <label>
        Search field
        <select value={search.field} onChange={(event) => onSearchFieldChange(event.target.value)}>
          <option value="id">ID</option>
          <option value="title">Title</option>
        </select>
      </label>
      <label>
        Search posts
        <input
          value={search.term}
          onChange={(event) => onSearchTermChange(event.target.value)}
          placeholder="Type to filter"
        />
      </label>
    </div>
  );
}

export default PostSearchControls;
