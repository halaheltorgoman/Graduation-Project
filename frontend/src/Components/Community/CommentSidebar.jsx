import React from "react";
import { FaTimes } from "react-icons/fa";
import { UserOutlined } from "@ant-design/icons";
import { Spin, Input, Button } from "antd";
import BuildCarousel from "../Community/BuildCarousel";
import postImage from "../../assets/images/postBuild_dummy.png"; // Make sure to import
import BigImageSlider from "../Community/BigImageSlider";
const { TextArea } = Input;
import "../Community/Community.css"; // Adjust the path as necessary

function CommentModal({
  visible,
  onClose,
  comments,
  commentLoading,
  newComment,
  setNewComment,
  handleAddComment,
  authToken,
  post,
}) {
  if (!visible) return null;

  const handleCommentSubmit = () => {
    handleAddComment(post._id);
  };
  const isTextOnly =
    !post?.build && (!post?.images || post.images.length === 0);
  return (
    <div className="comment-modal-overlay">
      <div className={`comment-modal${isTextOnly ? " text-only" : ""}`}>
        <button className="close-modal" onClick={onClose}>
          <FaTimes />
        </button>

        {/* Post Content Section */}
        {post?.build ? (
          <BigImageSlider components={post.build.components} />
        ) : post?.images && post.images.length > 0 ? (
          <BigImageSlider images={post.images} />
        ) : null}

        {/* Comments Section */}
        <div className="modal-comments-section">
          <div className="modal-comments-header">
            <h3>Comments ({comments.length})</h3>
          </div>
          <div className="modal-comments-list">
            {commentLoading && comments.length === 0 ? (
              <Spin size="large" />
            ) : comments.length === 0 ? (
              <p className="no-comments">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment._id} className="comment-item">
                  <div className="comment-user">
                    {comment.user?.profilePicture ? (
                      <img
                        src={comment.user.profilePicture}
                        alt={comment.user.username}
                        className="comment-user-avatar"
                      />
                    ) : (
                      <UserOutlined className="comment-default-avatar" />
                    )}
                    <span className="comment-username">
                      {comment.user?.username || "Anonymous"}
                    </span>
                  </div>
                  <p className="comment-text">{comment.text}</p>
                  <span className="comment-time">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
          <div className="modal-comment-input">
            <TextArea
              rows={3}
              placeholder="Write your comment..."
              style={{ color: "white" }}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={!authToken}
            />
            <Button
              type="primary"
              onClick={handleCommentSubmit}
              loading={commentLoading}
              disabled={!newComment.trim() || !authToken}
            >
              Post Comment
            </Button>
            {!authToken && (
              <p className="login-prompt">Please login to leave a comment</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommentModal;
