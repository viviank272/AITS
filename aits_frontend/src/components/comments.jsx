import { useState } from "react";
import "/.comments.css";
const Comments = ({ issueId }) => {
  const [comments, setComments] = useState([
    { id: 1, content: "This is a comment.", user: "John" },
    { id: 2, content: "Another comment.", user: "Jane" },
  ]);
  const [newComment, setNewComment] = useState("");

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim() !== "") {
      setComments([...comments, { id: comments.length + 1, content: newComment, user: "You" }]);
      setNewComment("");
    }
  };

  return (
    <div>
      <h3>Comments</h3>
      <ul>
        {comments.map((comment) => (
          <li key={comment.id}><strong>{comment.user}:</strong> {comment.content}</li>
        ))}
      </ul>
      <form onSubmit={handleCommentSubmit}>
        <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment" required />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Comments;