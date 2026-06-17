import React from "react";

function Icon({ children, className = "icon", ...props }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconHome(props) {
  return (
    <Icon {...props}>
      <path d="M3 11.2 12 4l9 7.2" />
      <path d="M5 9.8V20h14V9.8" />
    </Icon>
  );
}

export function IconInfo(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.2" />
      <circle cx="12" cy="7.8" r="0.6" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function IconUser(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5.2 20a6.8 6.8 0 0 1 13.6 0" />
    </Icon>
  );
}

export function IconShield(props) {
  return (
    <Icon {...props}>
      <path d="M12 3.5 19 6v5.2c0 4.1-2.8 7.7-7 9.3-4.2-1.6-7-5.2-7-9.3V6Z" />
      <path d="M9.2 12.2 11.1 14l3.8-4.1" />
    </Icon>
  );
}

export function IconCheckCircle(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.2 12.4 11 15l4.8-6" />
    </Icon>
  );
}

export function IconDocument(props) {
  return (
    <Icon {...props}>
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v4h4" />
      <path d="M9.5 13h5M9.5 16.3h5" />
    </Icon>
  );
}

export function IconImages(props) {
  return (
    <Icon {...props}>
      <rect x="3.2" y="6.5" width="13.5" height="12" rx="1.6" />
      <path d="M3.2 14.5l3.3-3.2a1.4 1.4 0 0 1 1.9 0l2.7 2.6" />
      <circle cx="7.4" cy="10" r="1" fill="currentColor" stroke="none" />
      <path d="M9.4 6.5 11.8 4h7l1.6 1.6v11.2l-2.2 2.1" />
    </Icon>
  );
}

export function IconLogout(props) {
  return (
    <Icon {...props}>
      <path d="M9.5 4.3H6a1.4 1.4 0 0 0-1.4 1.4v12.6A1.4 1.4 0 0 0 6 19.7h3.5" />
      <path d="M14.6 16 19 12l-4.4-4" />
      <path d="M19 12H9.2" />
    </Icon>
  );
}

export function IconPencil(props) {
  return (
    <Icon {...props}>
      <path d="M16 3.8 20.2 8 8 20.2H3.8V16Z" />
      <path d="M13.6 6.2 17.8 10.4" />
    </Icon>
  );
}

export function IconTrash(props) {
  return (
    <Icon {...props}>
      <path d="M4.5 7h15" />
      <path d="M9.5 7V4.6h5V7" />
      <path d="M6.3 7l1 12.3a1.4 1.4 0 0 0 1.4 1.3h6.6a1.4 1.4 0 0 0 1.4-1.3l1-12.3" />
      <path d="M10.2 11v5M13.8 11v5" />
    </Icon>
  );
}

export function IconPlus(props) {
  return (
    <Icon {...props}>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  );
}

export function IconCheck(props) {
  return (
    <Icon {...props}>
      <path d="M5 12.5 9.5 17 19 6.8" />
    </Icon>
  );
}

export function IconX(props) {
  return (
    <Icon {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Icon>
  );
}

export function IconArrowLeft(props) {
  return (
    <Icon {...props}>
      <path d="M19 12H5M10.5 17.5 5 12l5.5-5.5" />
    </Icon>
  );
}

export function IconInbox(props) {
  return (
    <Icon {...props}>
      <path d="M4 12 6.5 5h11L20 12" />
      <path d="M4 12v6.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V12" />
      <path d="M4 12h5l1.3 2.5h3.4L15 12h5" />
    </Icon>
  );
}

export function IconAlertTriangle(props) {
  return (
    <Icon {...props}>
      <path d="M12 3.5 21 19.5H3Z" />
      <path d="M12 9.5v4.2" />
      <circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function IconComment(props) {
  return (
    <Icon {...props}>
      <path d="M4 5.5h16v10.2H10.5L6 19.5v-3.8H4Z" />
    </Icon>
  );
}
