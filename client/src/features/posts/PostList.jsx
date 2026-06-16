import React from "react";
import { IconDocument } from "../../components/icons.jsx";

function PostList({ posts, selectedPostId, onSelectPost }) {
  return (
    <div className="resource-list compact-list">
      {posts.map((post) => (
        <button
          type="button"
          className={`post-row ${post.id === selectedPostId ? "selected" : ""}`}
          key={post.id}
          onClick={() => onSelectPost(post.id)}
        >
          <span className="post-row-icon">
            <IconDocument />
          </span>
          <div>
            <span className="resource-id">#{post.id}</span>
            <strong>{post.title}</strong>
          </div>
        </button>
      ))}
    </div>
  );
}

export default PostList;
