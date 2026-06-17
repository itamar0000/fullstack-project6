import { useEffect, useState } from "react";
import { albumsApi } from "../../api/resources.js";

function assertAlbumOwner(album, userId) {
  if (album.userId !== userId) {
    throw new Error("You can only manage your own albums.");
  }
}

export function useAlbums(userId) {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadAlbums() {
      setLoading(true);
      setError("");

      try {
        const payload = await albumsApi.getPageByUser(userId, 1);
        if (active) {
          setAlbums(payload.items);
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

    loadAlbums();
    return () => {
      active = false;
    };
  }, [userId]);

  async function loadMore() {
    if (loadingMore || albums.length >= totalCount) {
      return;
    }

    setLoadingMore(true);
    setError("");

    try {
      const nextPage = page + 1;
      const payload = await albumsApi.getPageByUser(userId, nextPage);
      setAlbums((items) => [...items, ...payload.items]);
      setTotalCount(payload.totalCount);
      setPage(nextPage);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingMore(false);
    }
  }

  async function createAlbum(title) {
    setError("");

    try {
      const created = await albumsApi.create({
        userId,
        title
      });
      setAlbums((items) => [...items, created]);
      setTotalCount((count) => count + 1);
      return created;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }

  async function renameAlbum(album, title) {
    setError("");

    try {
      assertAlbumOwner(album, userId);
      const updated = await albumsApi.update(album.id, { title });
      setAlbums((items) => items.map((item) => (item.id === updated.id ? updated : item)));
      return updated;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }

  async function deleteAlbum(album) {
    setError("");

    try {
      assertAlbumOwner(album, userId);
      await albumsApi.remove(album.id);
      setAlbums((items) => items.filter((item) => item.id !== album.id));
      setTotalCount((count) => Math.max(0, count - 1));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }

  return {
    albums,
    loading,
    loadingMore,
    error,
    hasMore: albums.length < totalCount,
    totalCount,
    createAlbum,
    renameAlbum,
    deleteAlbum,
    loadMore
  };
}
