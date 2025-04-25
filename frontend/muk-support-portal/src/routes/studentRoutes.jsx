import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StudentLayout from '../layouts/StudentLayout';
import Dashboard from '../pages/student/Dashboard';
import Issues from '../pages/issues/Issues';
import IssueDetails from '../pages/issues/IssueDetails';
import Settings from '../pages/student/Settings';

const StudentRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<StudentLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="issues" element={<Issues />} />
        <Route path="issues/:issueId" element={<IssueDetails />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
};

export default StudentRoutes; 