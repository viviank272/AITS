import { useState, useEffect } from "react";
import "./Issues list.css";

const Issues = () => {
  const [issues, setIssues] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    // Fetch issues from API (mocked for now)
    setIssues([
      { id: 1, title: "Bug in login", description: "Login fails randomly" },
      { id: 2, title: "UI issue on mobile", description: "Buttons misaligned" },
    ]);
  }, []);

  const handleCreateIssue = (e) => {
    e.preventDefault();
    const newIssue = { id: issues.length + 1, title, description };
    setIssues([...issues, newIssue]);
    setTitle("");
    setDescription("");
  };

  return (
    <div>
      <h2>Issues List</h2>
      <ul>
        {issues.map((issue) => (
          <li key={issue.id}>{issue.title} - {issue.description}</li>
        ))}
      </ul>
      <h3>Create New Issue</h3>
      <form onSubmit={handleCreateIssue}>
        <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
        <button type="submit">Create Issue</button>
      </form>
    </div>
  );
};

export default Issues;