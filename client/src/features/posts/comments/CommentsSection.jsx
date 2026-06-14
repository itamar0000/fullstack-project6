import React from "react";
import { ErrorState, LoadingState } from "../../../components/Status.jsx";
import CommentCreateForm from "./CommentCreateForm.jsx";
import CommentItem from "./CommentItem.jsx";

function CommentsSection({ commentsState, currentUser }) {
  return (
    <section className="comments-block">
      <div className="section-heading compact">
        <p className="eyebrow">Comments</p>
        <h3>{commentsState.comments.length} comments</h3>
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
    </section>
  );
}

export default CommentsSection;
