import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";

const IssueDetail = () => {
  const { issueId } = useParams();
  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
   // get issue details and comments from the API
    setIssue({ id: issueId, title: "Sample Issue", description: "Issue details go here." });
    setComments([
      { id: 1, content: "This is a comment.", user: "John" },
      { id: 2, content: "Another comment.", user: "Jane" },
    ]);
  }, [issueId]);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim() !== "") {
      setComments([...comments, { id: comments.length + 1, content: newComment, user: "You" }]);
      setNewComment("");
    }
  };

  if (!issue) return <p>Loading...</p>;

  return (
    <div>
      <h2>{issue.title}</h2>
      <p>{issue.description}</p>
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

export default IssueDetail;