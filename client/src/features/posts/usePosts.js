import { useEffect, useState } from "react";
import { postsApi } from "../../api/resources.js";

function assertPostOwner(post, userId) {
  if (post.userId !== userId) {
    throw new Error("You can only manage your own posts.");
  }
}

export function usePosts(userId) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadPosts() {
      setLoading(true);
      setError("");

      try {
        const payload = await postsApi.getPage(1);
        if (active) {
          setPosts(payload.items);
          setTotalCount(payload.totalCount);
          setPage(1);
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

  async function loadMore() {
    if (loadingMore || posts.length >= totalCount) {
      return;
    }

    setLoadingMore(true);
    setError("");

    try {
      const nextPage = page + 1;
      const payload = await postsApi.getPage(nextPage);
      setPosts((items) => [...items, ...payload.items]);
      setTotalCount(payload.totalCount);
      setPage(nextPage);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingMore(false);
    }
  }

  async function createPost(title, body) {
    setError("");

    try {
      const created = await postsApi.create({
        userId,
        title,
        body
      });
      setPosts((items) => [...items, created]);
      setTotalCount((count) => count + 1);
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
      setTotalCount((count) => Math.max(0, count - 1));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }

  return {
    posts,
    loading,
    loadingMore,
    error,
    hasMore: posts.length < totalCount,
    totalCount,
    createPost,
    updatePost,
    deletePost,
    loadMore
  };
}
