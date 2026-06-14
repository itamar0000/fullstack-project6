import React from "react";

export function LoadingState({ label = "Loading data" }) {
  return <p className="status muted">{label}...</p>;
}

export function ErrorState({ message }) {
  if (!message) {
    return null;
  }

  return (
    <p className="status error" role="alert">
      {message}
    </p>
  );
}

export function EmptyState({ message }) {
  return <p className="status muted">{message}</p>;
}
