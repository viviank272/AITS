import React, { createContext, useContext, useState } from 'react';
import { getIssueById as fetchIssueById, updateIssue as updateIssueApi } from '../services/api';

const IssuesContext = createContext();

export function IssuesProvider({ children }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getIssueById = async (issueId) => {
    try {
      console.log('Fetching issue with ID:', issueId);
      setLoading(true);
      setError(null);
      const response = await fetchIssueById(issueId);
      console.log('API Response:', response);
      if (!response) {
        throw new Error('No response received from server');
      }
      return response;
    } catch (err) {
      console.error('Error fetching issue:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(err.message || 'Failed to fetch issue details');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateIssue = async (issueId, issueData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await updateIssueApi(issueId, issueData);
      // Update the issues list with the updated issue
      setIssues(prevIssues => 
        prevIssues.map(issue => 
          issue.id === issueId ? { ...issue, ...issueData } : issue
        )
      );
      return response;
    } catch (err) {
      console.error('Error updating issue:', err);
      setError(err.message || 'Failed to update issue');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    issues,
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
}

export function useIssues() {
  const context = useContext(IssuesContext);
  if (context === undefined) {
    throw new Error('useIssues must be used within an IssuesProvider');
  }
  return context;
} 