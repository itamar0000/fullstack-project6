import React from "react";

function TodoFilters({ search, sortBy, onSortChange, onSearchFieldChange, onSearchTermChange }) {
  return (
    <div className="toolbar filters">
      <label>
        Sort by
        <select value={sortBy} onChange={(event) => onSortChange(event.target.value)}>
          <option value="id">ID</option>
          <option value="title">Title</option>
          <option value="completed">Completion</option>
        </select>
      </label>
      <label>
        Search field
        <select value={search.field} onChange={(event) => onSearchFieldChange(event.target.value)}>
          <option value="id">ID</option>
          <option value="title">Title</option>
          <option value="completed">Completion</option>
        </select>
      </label>
      <label className="grow">
        Search
        <input
          value={search.term}
          onChange={(event) => onSearchTermChange(event.target.value)}
          placeholder="Type to filter"
        />
      </label>
    </div>
  );
}

export default TodoFilters;
