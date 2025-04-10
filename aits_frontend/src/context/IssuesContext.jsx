import React, { createContext, useContext, useState, useCallback } from 'react';
import { getIssueById as fetchIssue, updateIssue as updateIssueApi } from '../services/api';

const IssuesContext = createContext();

export const useIssues = () => {
  const context = useContext(IssuesContext);
  if (!context) {
    throw new Error('useIssues must be used within an IssuesProvider');
  }
  return context;
};

export const IssuesProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getIssueById = useCallback(async (issueId) => {
    setLoading(true);
    setError(null);
    try {
      const issue = await fetchIssue(issueId);
      return issue;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateIssue = useCallback(async (issueId, data) => {
    setLoading(true);
    setError(null);
    try {
      const updatedIssue = await updateIssueApi(issueId, data);
      return updatedIssue;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    loading,
    error,
    getIssueById,
    updateIssue
  };

  return (
    <IssuesContext.Provider value={value}>
      {children}
    </IssuesContext.Provider>
  );
};

export default IssuesProvider; 