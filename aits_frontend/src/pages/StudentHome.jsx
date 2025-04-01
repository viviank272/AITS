import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import StudentLayout from '../layouts/StudentLayout'
import StudentDashboard from './StudentDashboard'
import CreateIssue from './issues/CreateIssue'
import Issues from './student/Issues'
import IssueDetails from './issues/IssueDetails'
import Notifications from './student/Notifications'
import Settings from './student/Settings'

const StudentHome = () => {
  return (
    <Routes>
      <Route element={<StudentLayout />}>
        <Route index element={<StudentDashboard />} />
        <Route path="issues">
          <Route index element={<Issues />} />
          <Route path="create" element={<CreateIssue />} />
          <Route path=":issueId">
            <Route index element={<IssueDetails />} />
            <Route path="comments" element={<div>Issue Comments</div>} />
            <Route path="track" element={<div>Issue Tracking</div>} />
          </Route>
        </Route>
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="." replace />} />
      </Route>
    </Routes>
  )
}

export default StudentHome