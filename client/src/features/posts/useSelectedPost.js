import { useSearchParams } from "react-router-dom";

export function useSelectedPost(posts) {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedPostId = Number(searchParams.get("postId") || 0);
  const selectedPost = posts.find((post) => post.id === selectedPostId) || null;

  function selectPost(postId) {
    setSearchParams({ postId: String(postId) });
  }

  function clearSelectedPost() {
    setSearchParams({});
  }

  return {
    selectedPost,
    selectedPostId,
    selectPost,
    clearSelectedPost
  };
}
