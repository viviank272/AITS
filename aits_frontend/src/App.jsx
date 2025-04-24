import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { IssuesProvider } from './context/IssuesContext';
import './utils/fontawesome';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MainLayout from './layouts/MainLayout';
import LecturerLayout from './layouts/LecturerLayout';
import StudentLayout from './layouts/StudentLayout';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import LecturerDashboard from './pages/LecturerDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Landing from './pages/Landing';
import Login from './pages/Login';
// import Register from './pages/Register';
import NotFound from './pages/NotFound';

// Admin Pages
import UserManagement from './pages/admin/UserManagement';
import CollegeManagement from './pages/admin/CollegeManagement';
import Programs from './pages/admin/Programs';
import Students from './pages/admin/Students';
import AdminIssues from './pages/admin/Issues';
import Categories from './pages/admin/Categories';
import AdminReports from './pages/admin/Reports';
import SystemSettings from './pages/admin/SystemSettings';
import RoleManagement from './pages/admin/RoleManagement';
import AuditLogs from './pages/admin/AuditLogs';
import IssueGraphs from './components/admin/Issue Trend graphs';

// Student Pages
import StudentIssues from './pages/student/Issues';
import StudentMessages from './pages/student/Messages';
import StudentNotifications from './pages/student/Notifications';
import StudentDocuments from './pages/student/Documents';
import StudentSettings from './pages/student/Settings';
import EditIssue from './pages/issues/EditIssue';

// Common Pages
import IssueList from './pages/issues/IssueList';
import IssueDetails from './pages/issues/IssueDetails';
import CreateIssue from './pages/issues/CreateIssue';
import Profile from './pages/Profile';
import CommunicationGuide from './pages/docs/CommunicationGuide';

// Lecturer Pages
import AssignedIssues from './pages/lecturer/AssignedIssues';
import DepartmentIssues from './pages/lecturer/DepartmentIssues';
import LecturerMessages from './pages/lecturer/Messages';
import LecturerNotifications from './pages/lecturer/Notifications';
import LecturerReports from './pages/lecturer/Reports';
import LecturerSettings from './pages/lecturer/Settings';
import LecturerCreateIssue from './pages/lecturer/CreateIssue';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <IssuesProvider>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          {/* <Route path="/register" element={<Register />} /> */}

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="colleges" element={<CollegeManagement />} />
            <Route path="programs" element={<Programs />} />
            <Route path="students" element={<Students />} />
            <Route path="issues" element={<AdminIssues />} />
            <Route path="categories" element={<Categories />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="settings" element={<SystemSettings />} />
            <Route path="roles" element={<RoleManagement />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="issue-trends" element={<IssueGraphs />} />
          </Route>

          {/* Lecturer Routes */}
          <Route
            path="/lecturer"
            element={
              <ProtectedRoute allowedRoles={['lecturer']}>
                <LecturerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<LecturerDashboard />} />
            <Route path="assigned" element={<AssignedIssues />} />
            <Route path="department" element={<DepartmentIssues />} />
            <Route path="messages" element={<LecturerMessages />} />
            <Route path="notifications" element={<LecturerNotifications />} />
            <Route path="reports" element={<LecturerReports />} />
            <Route path="settings" element={<LecturerSettings />} />
            <Route path="issues/create" element={<LecturerCreateIssue />} />
            <Route path="issues/:issueId" element={<IssueDetails />} />
          </Route>

          {/* Student Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StudentDashboard />} />
            <Route path="issues" element={<StudentIssues />} />
            <Route path="issues/create" element={<CreateIssue />} />
            <Route path="issues/:issueId" element={<IssueDetails />} />
            <Route path="issues/:issueId/edit" element={<EditIssue />} />
            <Route path="messages" element={<StudentMessages />} />
            <Route path="notifications" element={<StudentNotifications />} />
            <Route path="documents" element={<StudentDocuments />} />
            <Route path="settings" element={<StudentSettings />} />
          </Route>

          {/* Common routes for all authenticated users */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/docs/communication-guide"
            element={
              <ProtectedRoute>
                <CommunicationGuide />
              </ProtectedRoute>
            }
          />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </IssuesProvider>
    </AuthProvider>
  );
}

export default App;