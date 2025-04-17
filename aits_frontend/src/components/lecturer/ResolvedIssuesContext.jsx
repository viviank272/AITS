import React, { createContext, useState } from 'react';

export const ResolvedIssuesContext = createContext();

export const ResolvedIssuesProvider = ({ children }) => {
  const [issues, setIssues] = useState([
    { id: 1, title: 'Late grades', description: 'No grade posted for CS101', status: 'Pending' },
    { id: 2, title: 'Lecture notes missing', description: 'Week 5 notes are missing', status: 'Pending' },
  ]);

  const resolveIssue = (id) => {
    setIssues(prev =>
      prev.map(issue => issue.id === id ? { ...issue, status: 'Resolved' } : issue)
    );
  };

  return (
    <ResolvedIssuesContext.Provider value={{ issues, resolveIssue }}>
      {children}
    </ResolvedIssuesContext.Provider>
  );
};
