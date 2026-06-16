import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Modal from "../components/Modal.jsx";
import UserInfo from "../components/UserInfo.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { appRoutes } from "../routes/paths.js";
import { IconCheckCircle, IconDocument, IconHome, IconImages, IconInfo, IconLogout } from "../components/icons.jsx";

function getInitials(name) {
  return (name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function AppLayout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate(appRoutes.login, { replace: true });
  }

  return (
    <div className="app-frame">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">N</span>
          <div>
            <p className="brand-name">Nimbus</p>
            <p className="brand-tagline">Project 6 workspace</p>
          </div>
        </div>

        <div className="user-pill">
          <span className="user-avatar" aria-hidden="true">
            {getInitials(currentUser.name)}
          </span>
          <div>
            <p className="eyebrow">Signed in as</p>
            <strong>{currentUser.name}</strong>
          </div>
        </div>

        <nav className="topnav" aria-label="Primary">
          <NavLink to={appRoutes.home}>
            <IconHome className="icon" />
            Home
          </NavLink>
          <button type="button" className="link-button" onClick={() => setIsInfoOpen(true)}>
            <IconInfo className="icon" />
            Info
          </button>
          <NavLink to={appRoutes.userTodos(currentUser.id)}>
            <IconCheckCircle className="icon" />
            Todos
          </NavLink>
          <NavLink to={appRoutes.userPosts(currentUser.id)}>
            <IconDocument className="icon" />
            Posts
          </NavLink>
          <NavLink to={appRoutes.userAlbums(currentUser.id)}>
            <IconImages className="icon" />
            Albums
          </NavLink>
          <button type="button" className="danger-button" onClick={handleLogout}>
            <IconLogout className="icon" />
            Logout
          </button>
        </nav>
      </header>

      <main className="content">
        <Outlet />
      </main>

      {isInfoOpen && (
        <Modal title="Profile information" onClose={() => setIsInfoOpen(false)}>
          <UserInfo user={currentUser} />
        </Modal>
      )}
    </div>
  );
}

export default AppLayout;
