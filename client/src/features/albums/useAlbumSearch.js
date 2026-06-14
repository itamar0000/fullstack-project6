import { useMemo } from "react";
import { usePersistentState } from "../../hooks/usePersistentState.js";
import { getVisibleAlbums } from "./albumView.js";

export function useAlbumSearch(userId, albums) {
  const [search, setSearch] = usePersistentState(`project5.albums.search.${userId}`, {
    field: "title",
    term: ""
  });

  const visibleAlbums = useMemo(() => getVisibleAlbums(albums, search), [albums, search]);

  function updateSearchField(field) {
    setSearch((state) => ({ ...state, field }));
  }

  function updateSearchTerm(term) {
    setSearch((state) => ({ ...state, term }));
  }

  return {
    search,
    visibleAlbums,
    updateSearchField,
    updateSearchTerm
  };
}
