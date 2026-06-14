import React from "react";

function AlbumFilters({ search, onSearchFieldChange, onSearchTermChange }) {
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
        Search albums
        <input value={search.term} onChange={(event) => onSearchTermChange(event.target.value)} />
      </label>
    </div>
  );
}

export default AlbumFilters;
