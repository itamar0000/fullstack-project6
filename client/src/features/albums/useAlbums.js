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
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadAlbums() {
      setLoading(true);
      setError("");

      try {
        const data = await albumsApi.listByUser(userId);
        if (active) {
          setAlbums(data);
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

  async function createAlbum(title) {
    setError("");

    try {
      const created = await albumsApi.create({
        userId,
        title
      });
      setAlbums((items) => [...items, created]);
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
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }

  return {
    albums,
    loading,
    error,
    createAlbum,
    renameAlbum,
    deleteAlbum
  };
}
