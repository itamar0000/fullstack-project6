import { useEffect, useState } from "react";
import { todosApi } from "../../api/resources.js";

function assertTodoOwner(todo, userId) {
  if (todo.userId !== userId) {
    throw new Error("You can only manage your own todos.");
  }
}

export function useTodos(userId) {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadTodos() {
      setLoading(true);
      setError("");

      try {
        const payload = await todosApi.getPageByUser(userId, 1);
        if (active) {
          setTodos(payload.items);
          setTotalCount(payload.totalCount);
          setPage(1);
        }
      } catch (err) {
        if (active) {
          setError(err.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadTodos();
    return () => {
      active = false;
    };
  }, [userId]);

  async function loadMore() {
    if (loadingMore || todos.length >= totalCount) {
      return;
    }

    setLoadingMore(true);
    setError("");

    try {
      const nextPage = page + 1;
      const payload = await todosApi.getPageByUser(userId, nextPage);
      setTodos((items) => [...items, ...payload.items]);
      setTotalCount(payload.totalCount);
      setPage(nextPage);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingMore(false);
    }
  }

  async function createTodo(title) {
    setError("");

    try {
      const created = await todosApi.create({
        userId,
        title,
        completed: false
      });
      setTodos((items) => [...items, created]);
      setTotalCount((count) => count + 1);
      return created;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }

  async function deleteTodo(todo) {
    setBusyId(todo.id);
    setError("");

    try {
      assertTodoOwner(todo, userId);
      await todosApi.remove(todo.id);
      setTodos((items) => items.filter((item) => item.id !== todo.id));
      setTotalCount((count) => Math.max(0, count - 1));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setBusyId(null);
    }
  }

  async function toggleTodo(todo) {
    setBusyId(todo.id);
    setError("");

    try {
      assertTodoOwner(todo, userId);
      const updated = await todosApi.update(todo.id, { completed: !todo.completed });
      setTodos((items) => items.map((item) => (item.id === todo.id ? updated : item)));
      return updated;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setBusyId(null);
    }
  }

  async function renameTodo(todo, title) {
    setBusyId(todo.id);
    setError("");

    try {
      assertTodoOwner(todo, userId);
      const updated = await todosApi.update(todo.id, { title });
      setTodos((items) => items.map((item) => (item.id === todo.id ? updated : item)));
      return updated;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setBusyId(null);
    }
  }

  return {
    todos,
    loading,
    loadingMore,
    busyId,
    error,
    hasMore: todos.length < totalCount,
    totalCount,
    createTodo,
    deleteTodo,
    toggleTodo,
    renameTodo,
    loadMore
  };
}
