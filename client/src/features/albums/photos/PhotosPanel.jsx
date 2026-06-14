import React from "react";
import { Link } from "react-router-dom";
import { EmptyState, ErrorState, LoadingState } from "../../../components/Status.jsx";
import { appRoutes } from "../../../routes/paths.js";
import { useAlbumPhotos } from "../useAlbumPhotos.js";
import PhotoCard from "./PhotoCard.jsx";
import PhotoCreateForm from "./PhotoCreateForm.jsx";

function PhotosPanel({ album }) {
  const photosState = useAlbumPhotos(album);

  return (
    <section className="photos-panel">
      <div className="detail-header">
        <div>
          <p className="eyebrow">Photos</p>
          <h3>{album.title}</h3>
        </div>
        <Link className="ghost-button small" to={appRoutes.userAlbums(album.userId)}>
          Back to albums
        </Link>
      </div>

      <PhotoCreateForm onCreate={photosState.createPhoto} />
      <ErrorState message={photosState.error} />

      <div className="photo-grid">
        {photosState.photos.map((photo) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            onDelete={photosState.deletePhoto}
            onUpdate={photosState.updatePhoto}
          />
        ))}
      </div>

      {photosState.loading && <LoadingState label="Loading photos" />}
      {!photosState.loading && photosState.photos.length === 0 && (
        <EmptyState message="No photos in this album yet." />
      )}

      {photosState.hasMore && (
        <button
          type="button"
          className="secondary-button load-more"
          disabled={photosState.loading}
          onClick={photosState.loadMore}
        >
          Load more
        </button>
      )}
    </section>
  );
}

export default PhotosPanel;
