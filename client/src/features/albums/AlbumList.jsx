import React from "react";
import AlbumRow from "./AlbumRow.jsx";

function AlbumList({ albums, currentUserId, selectedAlbumId, onDelete, onRename }) {
  return (
    <div className="resource-list compact-list">
      {albums.map((album) => (
        <AlbumRow
          key={album.id}
          album={album}
          currentUserId={currentUserId}
          selected={selectedAlbumId === album.id}
          onDelete={onDelete}
          onRename={onRename}
        />
      ))}
    </div>
  );
}

export default AlbumList;
