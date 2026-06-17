import React from "react";
import { EmptyState, ErrorState, LoadingState } from "../components/Status.jsx";
import TodoCreateForm from "../features/todos/TodoCreateForm.jsx";
import TodoFilters from "../features/todos/TodoFilters.jsx";
import TodoList from "../features/todos/TodoList.jsx";
import { useTodoFilters } from "../features/todos/useTodoFilters.js";
import { useTodos } from "../features/todos/useTodos.js";
import { useAuth } from "../context/AuthContext.jsx";

function TodosPage() {
  const { currentUser } = useAuth();
  const todosState = useTodos(currentUser.id);
  const filters = useTodoFilters(currentUser.id, todosState.todos);

  return (
    <section className="page-section">
      <div className="section-heading">
        <p className="eyebrow">Todos</p>
        <h2>Task management</h2>
      </div>

      <TodoCreateForm onCreate={todosState.createTodo} />
      <TodoFilters
        search={filters.search}
        sortBy={filters.sortBy}
        onSortChange={filters.setSortBy}
        onSearchFieldChange={filters.updateSearchField}
        onSearchTermChange={filters.updateSearchTerm}
      />

      <ErrorState message={todosState.error} />
      {todosState.loading && <LoadingState />}

      {!todosState.loading && filters.visibleTodos.length === 0 && (
        <EmptyState message="No todos match this view." />
      )}

      <TodoList
        todos={filters.visibleTodos}
        busyId={todosState.busyId}
        onDelete={todosState.deleteTodo}
        onRename={todosState.renameTodo}
        onToggle={todosState.toggleTodo}
      />

      <p className="pagination-status">
        Loaded {todosState.todos.length} of {todosState.totalCount} todos
      </p>
      {todosState.hasMore && (
        <button
          type="button"
          className="secondary-button load-more"
          disabled={todosState.loadingMore}
          onClick={todosState.loadMore}
        >
          {todosState.loadingMore ? "Loading..." : "Load more"}
        </button>
      )}
    </section>
  );
}

export default TodosPage;
