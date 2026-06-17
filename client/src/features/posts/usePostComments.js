import { useEffect, useState } from "react";
import { commentsApi } from "../../api/resources.js";

function assertCommentOwner(comment, userId) {
  if (comment.userId !== userId) {
    throw new Error("You can only update or delete your own comments.");
  }
}

export function usePostComments(postId, currentUser) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadComments() {
      if (!postId) {
        setComments([]);
        setError("");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const payload = await commentsApi.getPageByPost(postId, 1);
        if (active) {
          setComments(payload.items);
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

    loadComments();
    return () => {
      active = false;
    };
  }, [postId]);

  async function loadMore() {
    if (!postId || loadingMore || comments.length >= totalCount) {
      return;
    }

    setLoadingMore(true);
    setError("");

    try {
      const nextPage = page + 1;
      const payload = await commentsApi.getPageByPost(postId, nextPage);
      setComments((items) => [...items, ...payload.items]);
      setTotalCount(payload.totalCount);
      setPage(nextPage);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingMore(false);
    }
  }

  async function createComment(body) {
    if (!postId) {
      return null;
    }

    setError("");

    try {
      const created = await commentsApi.create({
        postId,
        userId: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        body
      });
      setComments((items) => [...items, created]);
      setTotalCount((count) => count + 1);
      return created;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }

  async function updateComment(comment, body) {
    setError("");

    try {
      assertCommentOwner(comment, currentUser.id);
      const updated = await commentsApi.update(comment.id, { body });
      setComments((items) => items.map((item) => (item.id === updated.id ? updated : item)));
      return updated;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }

  async function deleteComment(comment) {
    setError("");

    try {
      assertCommentOwner(comment, currentUser.id);
      await commentsApi.remove(comment.id);
      setComments((items) => items.filter((item) => item.id !== comment.id));
      setTotalCount((count) => Math.max(0, count - 1));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }

  return {
    comments,
    loading,
    loadingMore,
    error,
    hasMore: comments.length < totalCount,
    totalCount,
    createComment,
    updateComment,
    deleteComment,
    loadMore
  };
}
