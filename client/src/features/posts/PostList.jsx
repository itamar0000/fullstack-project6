import React from "react";

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
          <span className="resource-id">#{post.id}</span>
          <strong>{post.title}</strong>
        </button>
      ))}
    </div>
  );
}

export default PostList;
