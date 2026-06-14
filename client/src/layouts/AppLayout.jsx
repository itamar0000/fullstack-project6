import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Modal from "../components/Modal.jsx";
import UserInfo from "../components/UserInfo.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { appRoutes } from "../routes/paths.js";

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
        <div>
          <p className="eyebrow">Current user</p>
          <h1>{currentUser.name}</h1>
        </div>
        <nav className="topnav" aria-label="Primary">
          <NavLink to={appRoutes.home}>Home</NavLink>
          <button type="button" className="link-button" onClick={() => setIsInfoOpen(true)}>
            Info
          </button>
          <NavLink to={appRoutes.userTodos(currentUser.id)}>Todos</NavLink>
          <NavLink to={appRoutes.userPosts(currentUser.id)}>Posts</NavLink>
          <NavLink to={appRoutes.userAlbums(currentUser.id)}>Albums</NavLink>
          <button type="button" className="danger-button" onClick={handleLogout}>
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
