import { useEffect, useState } from "react";
import { photosApi } from "../../api/resources.js";
import { makeThumbnailUrl } from "./photoUrls.js";

const PHOTO_PAGE_SIZE = 6;

function assertPhotoInAlbum(photo, albumId) {
  if (photo.albumId !== albumId) {
    throw new Error("You can only manage photos in the selected album.");
  }
}

export function useAlbumPhotos(album) {
  const [photos, setPhotos] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadPhotoPage(nextPage, replace = false) {
    setLoading(true);
    setError("");

    try {
      const payload = await photosApi.getPage(album.id, nextPage, PHOTO_PAGE_SIZE);
      setPhotos((items) => (replace ? payload.items : [...items, ...payload.items]));
      setPage(nextPage);
      setHasMore(payload.items.length === PHOTO_PAGE_SIZE);
      return payload;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function loadFirstPage() {
      setPhotos([]);
      setPage(1);
      setHasMore(true);
      setLoading(true);
      setError("");

      try {
        const payload = await photosApi.getPage(album.id, 1, PHOTO_PAGE_SIZE);
        if (active) {
          setPhotos(payload.items);
          setHasMore(payload.items.length === PHOTO_PAGE_SIZE);
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

    loadFirstPage();
    return () => {
      active = false;
    };
  }, [album.id]);

  async function loadMore() {
    return loadPhotoPage(page + 1);
  }

  async function createPhoto(title, url) {
    setError("");

    try {
      const created = await photosApi.create({
        albumId: album.id,
        title,
        url,
        thumbnailUrl: makeThumbnailUrl(url)
      });
      setPhotos((items) => [created, ...items]);
      return created;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }

  async function updatePhoto(photo, changes) {
    setError("");

    try {
      assertPhotoInAlbum(photo, album.id);
      const updated = await photosApi.update(photo.id, {
        ...changes,
        thumbnailUrl: makeThumbnailUrl(changes.url)
      });
      setPhotos((items) => items.map((item) => (item.id === updated.id ? updated : item)));
      return updated;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }

  async function deletePhoto(photo) {
    setError("");

    try {
      assertPhotoInAlbum(photo, album.id);
      await photosApi.remove(photo.id);
      setPhotos((items) => items.filter((item) => item.id !== photo.id));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }

  return {
    photos,
    loading,
    hasMore,
    error,
    createPhoto,
    deletePhoto,
    loadMore,
    updatePhoto
  };
}
