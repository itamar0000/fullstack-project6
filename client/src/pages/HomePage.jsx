import React from "react";
import { Link } from "react-router-dom";
import UserInfo from "../components/UserInfo.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { appRoutes } from "../routes/paths.js";
import { IconCheckCircle, IconDocument, IconImages } from "../components/icons.jsx";

function HomePage() {
  const { currentUser } = useAuth();

  return (
    <section className="page-section">
      <div className="section-heading">
        <p className="eyebrow">Home</p>
        <h2>Welcome back, {currentUser.name.split(" ")[0]}</h2>
        <p>Manage your todos, posts, albums, comments, and photos from the local REST API.</p>
      </div>

      <div className="quick-grid">
        <Link className="quick-link" to={appRoutes.userTodos(currentUser.id)}>
          <span className="icon-badge">
            <IconCheckCircle />
          </span>
          <div>
            <span className="quick-link-label">Todos</span>
            <strong>Search, sort, add, edit, delete, and toggle completion.</strong>
          </div>
        </Link>
        <Link className="quick-link" to={appRoutes.userPosts(currentUser.id)}>
          <span className="icon-badge">
            <IconDocument />
          </span>
          <div>
            <span className="quick-link-label">Posts</span>
            <strong>Open post details and manage owned comments.</strong>
          </div>
        </Link>
        <Link className="quick-link" to={appRoutes.userAlbums(currentUser.id)}>
          <span className="icon-badge">
            <IconImages />
          </span>
          <div>
            <span className="quick-link-label">Albums</span>
            <strong>Browse albums and load photos in small pages.</strong>
          </div>
        </Link>
      </div>

      <section className="plain-panel">
        <div className="section-heading compact">
          <p className="eyebrow">Info</p>
          <h3>Profile snapshot</h3>
        </div>
        <UserInfo user={currentUser} />
      </section>
    </section>
  );
}

export default HomePage;
