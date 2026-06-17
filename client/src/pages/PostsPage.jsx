import React from "react";
import { EmptyState, ErrorState, LoadingState } from "../components/Status.jsx";
import PostCreateForm from "../features/posts/PostCreateForm.jsx";
import PostDetails from "../features/posts/PostDetails.jsx";
import PostList from "../features/posts/PostList.jsx";
import PostSearchControls from "../features/posts/PostSearchControls.jsx";
import { usePostSearch } from "../features/posts/usePostSearch.js";
import { usePosts } from "../features/posts/usePosts.js";
import { useSelectedPost } from "../features/posts/useSelectedPost.js";
import { useAuth } from "../context/AuthContext.jsx";

function PostsPage() {
  const { currentUser } = useAuth();
  const postsState = usePosts(currentUser.id);
  const postSearch = usePostSearch(currentUser.id, postsState.posts);
  const selectedPostState = useSelectedPost(postsState.posts);

  async function createAndSelectPost(title, body) {
    const created = await postsState.createPost(title, body);

    if (created) {
      selectedPostState.selectPost(created.id);
    }

    return created;
  }

  async function deleteAndClearPost(post) {
    const deleted = await postsState.deletePost(post);

    if (deleted) {
      selectedPostState.clearSelectedPost();
    }

    return deleted;
  }

  return (
    <section className="page-section split-page">
      <div className="section-heading">
        <p className="eyebrow">Posts</p>
        <h2>All posts and comments</h2>
      </div>

      <ErrorState message={postsState.error} />

      <div className="split-grid">
        <section className="plain-panel">
          <PostCreateForm onCreate={createAndSelectPost} />
          <PostSearchControls
            search={postSearch.search}
            onSearchFieldChange={postSearch.updateSearchField}
            onSearchTermChange={postSearch.updateSearchTerm}
          />

          {postsState.loading && <LoadingState />}
          {!postsState.loading && postSearch.visiblePosts.length === 0 && (
            <EmptyState message="No posts match this view." />
          )}

          <PostList
            posts={postSearch.visiblePosts}
            selectedPostId={selectedPostState.selectedPostId}
            onSelectPost={selectedPostState.selectPost}
          />

          <p className="pagination-status">
            Loaded {postsState.posts.length} of {postsState.totalCount} posts
          </p>
          {postsState.hasMore && (
            <button
              type="button"
              className="secondary-button load-more"
              disabled={postsState.loadingMore}
              onClick={postsState.loadMore}
            >
              {postsState.loadingMore ? "Loading..." : "Load more"}
            </button>
          )}
        </section>

        <section className="plain-panel">
          <PostDetails
            post={selectedPostState.selectedPost}
            currentUser={currentUser}
            onDelete={deleteAndClearPost}
            onUpdate={postsState.updatePost}
          />
        </section>
      </div>
    </section>
  );
}

export default PostsPage;
