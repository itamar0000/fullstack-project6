import React from "react";
import { IconAlertTriangle, IconInbox } from "./icons.jsx";

export function LoadingState({ label = "Loading data" }) {
  return (
    <p className="status muted">
      <span className="spinner" aria-hidden="true" />
      {label}...
    </p>
  );
}

export function ErrorState({ message }) {
  if (!message) {
    return null;
  }

  return (
    <p className="status error" role="alert">
      <IconAlertTriangle className="icon" />
      {message}
    </p>
  );
}

export function EmptyState({ message }) {
  return (
    <p className="status muted">
      <IconInbox className="icon" />
      {message}
    </p>
  );
}
