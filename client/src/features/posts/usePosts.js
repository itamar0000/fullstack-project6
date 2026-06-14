import { use, useEffect, useState } from "react";
import { postsApi } from "../../api/resources.js";

function assertPostOwner(post, userId) {
  if (post.userId !== userId) {
    throw new Error("You can only manage your own posts.");
  }
}

export function usePosts(userId) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPosts() {
      setLoading(true);
      setError("");

      try {
        const data = await postsApi.list();
        if (active) {
          setPosts(data);
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

    loadPosts();
    return () => {
      active = false;
    };
  }, [userId]);

  async function createPost(title, body) {
    setError("");

    try {
      const created = await postsApi.create({
        userId,
        title,
        body
      });
      setPosts((items) => [...items, created]);
      return created;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }

  async function updatePost(post, changes) {
    setError("");

    try {
      assertPostOwner(post, userId);
      const updated = await postsApi.update(post.id, changes);
      setPosts((items) => items.map((item) => (item.id === updated.id ? updated : item)));
      return updated;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }

  async function deletePost(post) {
    setError("");

    try {
      assertPostOwner(post, userId);
      await postsApi.remove(post.id);
      setPosts((items) => items.filter((item) => item.id !== post.id));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }

  return {
    posts,
    loading,
    error,
    createPost,
    updatePost,
    deletePost
  };
}
