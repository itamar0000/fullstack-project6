import React from "react";
import { ErrorState, LoadingState } from "../../../components/Status.jsx";
import CommentCreateForm from "./CommentCreateForm.jsx";
import CommentItem from "./CommentItem.jsx";
import { IconComment } from "../../../components/icons.jsx";

function CommentsSection({ commentsState, currentUser }) {
  return (
    <section className="comments-block">
      <div className="section-heading compact">
        <p className="eyebrow">Comments</p>
        <h3>
          <IconComment className="icon" />
          {commentsState.totalCount} comments
        </h3>
      </div>

      <CommentCreateForm onCreate={commentsState.createComment} />
      <ErrorState message={commentsState.error} />
      {commentsState.loading && <LoadingState label="Loading comments" />}

      <div className="comment-list">
        {commentsState.comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            currentUser={currentUser}
            onDelete={commentsState.deleteComment}
            onUpdate={commentsState.updateComment}
          />
        ))}
      </div>

      <p className="pagination-status">
        Loaded {commentsState.comments.length} of {commentsState.totalCount} comments
      </p>
      {commentsState.hasMore && (
        <button
          type="button"
          className="secondary-button load-more"
          disabled={commentsState.loadingMore}
          onClick={commentsState.loadMore}
        >
          {commentsState.loadingMore ? "Loading..." : "Load more"}
        </button>
      )}
    </section>
  );
}

export default CommentsSection;
