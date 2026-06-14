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
  const [error, setError] = useState("");

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
        const data = await commentsApi.listByPost(postId);
        if (active) {
          setComments(data);
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
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }

  return {
    comments,
    loading,
    error,
    createComment,
    updateComment,
    deleteComment
  };
}
