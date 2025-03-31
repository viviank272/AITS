import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from '../layouts/AdminLayout'
import AdminDashboard from '../components/admin/AdminDashboard'
import CollegeManagement from './admin/CollegeManagement'

const AdminHome = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<div>User Management</div>} />
        <Route path="colleges" element={<CollegeManagement />} />
        <Route path="programs" element={<div>Programs</div>} />
        <Route path="students" element={<div>Students</div>} />
        <Route path="issues" element={<div>All Issues</div>} />
        <Route path="categories" element={<div>Categories</div>} />
        <Route path="reports" element={<div>Reports & Analytics</div>} />
        <Route path="settings" element={<div>System Settings</div>} />
        <Route path="roles" element={<div>Roles & Permissions</div>} />
        <Route path="logs" element={<div>Audit Logs</div>} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  )
}

export default AdminHome