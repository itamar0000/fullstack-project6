import React from "react";
import TodoItem from "./TodoItem.jsx";

function TodoList({ todos, busyId, onDelete, onRename, onToggle }) {
  return (
    <div className="resource-list">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          busy={busyId === todo.id}
          onDelete={onDelete}
          onRename={onRename}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}

export default TodoList;
