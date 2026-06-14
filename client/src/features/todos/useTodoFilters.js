import { useMemo } from "react";
import { usePersistentState } from "../../hooks/usePersistentState.js";
import { getVisibleTodos } from "./todoView.js";

export function useTodoFilters(userId, todos) {
  const [sortBy, setSortBy] = usePersistentState(`project5.todos.sort.${userId}`, "id");
  const [search, setSearch] = usePersistentState(`project5.todos.search.${userId}`, {
    field: "title",
    term: ""
  });

  const visibleTodos = useMemo(() => getVisibleTodos(todos, search, sortBy), [todos, search, sortBy]);

  function updateSearchField(field) {
    setSearch((state) => ({ ...state, field }));
  }

  function updateSearchTerm(term) {
    setSearch((state) => ({ ...state, term }));
  }

  return {
    search,
    sortBy,
    visibleTodos,
    setSortBy,
    updateSearchField,
    updateSearchTerm
  };
}
