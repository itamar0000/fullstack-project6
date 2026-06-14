export function getVisibleTodos(todos, search, sortBy) {
  return sortTodos(
    todos.filter((todo) => matchesTodo(todo, search.field, search.term)),
    sortBy
  );
}

function matchesTodo(todo, field, term) {
  const query = term.trim().toLowerCase();

  if (!query) {
    return true;
  }

  if (field === "id") {
    return String(todo.id).includes(query);
  }

  if (field === "completed") {
    const status = todo.completed ? "completed true done" : "active false incomplete";
    return status.includes(query);
  }

  return todo.title.toLowerCase().includes(query);
}

function sortTodos(todos, sortBy) {
  return [...todos].sort((a, b) => {
    if (sortBy === "title") {
      return a.title.localeCompare(b.title);
    }

    if (sortBy === "completed") {
      return Number(a.completed) - Number(b.completed) || a.id - b.id;
    }

    return a.id - b.id;
  });
}
