export function getVisibleAlbums(albums, search) {
  const query = search.term.trim().toLowerCase();

  return albums.filter((album) => {
    if (!query) {
      return true;
    }

    if (search.field === "id") {
      return String(album.id).includes(query);
    }

    return album.title.toLowerCase().includes(query);
  });
}
