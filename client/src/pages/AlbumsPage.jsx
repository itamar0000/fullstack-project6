import React from "react";
import { useParams } from "react-router-dom";
import { EmptyState, ErrorState, LoadingState } from "../components/Status.jsx";
import AlbumCreateForm from "../features/albums/AlbumCreateForm.jsx";
import AlbumFilters from "../features/albums/AlbumFilters.jsx";
import AlbumList from "../features/albums/AlbumList.jsx";
import PhotosPanel from "../features/albums/photos/PhotosPanel.jsx";
import { useAlbumSearch } from "../features/albums/useAlbumSearch.js";
import { useAlbums } from "../features/albums/useAlbums.js";
import { useAuth } from "../context/AuthContext.jsx";

function AlbumsPage() {
  const { currentUser } = useAuth();
  const { albumId } = useParams();
  const albumsState = useAlbums(currentUser.id);
  const albumSearch = useAlbumSearch(currentUser.id, albumsState.albums);
  const selectedAlbumId = Number(albumId);
  const selectedAlbum = albumsState.albums.find((album) => album.id === selectedAlbumId) || null;
  const albumRequested = Boolean(albumId);

  return (
    <section className="page-section">
      <div className="section-heading">
        <p className="eyebrow">Albums</p>
        <h2>Albums and photos</h2>
      </div>

      <ErrorState message={albumsState.error} />

      <div className="split-grid">
        <section className="plain-panel">
          <AlbumCreateForm onCreate={albumsState.createAlbum} />
          <AlbumFilters
            search={albumSearch.search}
            onSearchFieldChange={albumSearch.updateSearchField}
            onSearchTermChange={albumSearch.updateSearchTerm}
          />

          {albumsState.loading && <LoadingState label="Loading albums" />}
          {!albumsState.loading && albumSearch.visibleAlbums.length === 0 && (
            <EmptyState message="No albums match this view." />
          )}

          <AlbumList
            albums={albumSearch.visibleAlbums}
            currentUserId={currentUser.id}
            selectedAlbumId={selectedAlbum?.id}
            onDelete={albumsState.deleteAlbum}
            onRename={albumsState.renameAlbum}
          />

          <p className="pagination-status">
            Loaded {albumsState.albums.length} of {albumsState.totalCount} albums
          </p>
          {albumsState.hasMore && (
            <button
              type="button"
              className="secondary-button load-more"
              disabled={albumsState.loadingMore}
              onClick={albumsState.loadMore}
            >
              {albumsState.loadingMore ? "Loading..." : "Load more"}
            </button>
          )}
        </section>

        <section className="plain-panel">
          {albumRequested && !selectedAlbum && !albumsState.loading && (
            <EmptyState message="This album is not available for the current user." />
          )}
          {!albumRequested && <EmptyState message="Choose an album to load photos." />}
          {selectedAlbum && <PhotosPanel album={selectedAlbum} />}
        </section>
      </div>
    </section>
  );
}

export default AlbumsPage;
