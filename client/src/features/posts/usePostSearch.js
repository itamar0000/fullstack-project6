import { useMemo } from "react";
import { usePersistentState } from "../../hooks/usePersistentState.js";
import { getVisiblePosts } from "./postView.js";

export function usePostSearch(userId, posts) {
  const [search, setSearch] = usePersistentState(`project5.posts.search.${userId}`, {
    field: "title",
    term: ""
  });

  const visiblePosts = useMemo(() => getVisiblePosts(posts, search), [posts, search]);

  function updateSearchField(field) {
    setSearch((state) => ({ ...state, field }));
  }

  function updateSearchTerm(term) {
    setSearch((state) => ({ ...state, term }));
  }

  return {
    search,
    visiblePosts,
    updateSearchField,
    updateSearchTerm
  };
}
