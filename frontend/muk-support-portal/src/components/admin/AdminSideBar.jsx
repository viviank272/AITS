import React, { useContext } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faHome, 
  faUsers, 
  faUniversity, 
  faGraduationCap,
  faUserGraduate,
  faTicketAlt,
  faStream,
  faChartBar,
  faCog,
  faShieldAlt,
  faHistory,
  faSignOutAlt 
} from '@fortawesome/free-solid-svg-icons'
import { AuthContext } from '../../context/AuthContext'

const AdminSidebar = () => {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()
  
  const handleLogout = () => {
    logout()
    navigate('/login')
  }
  
  const isActive = (path) => {
    return location.pathname === path
  }
  
  return (
    <div className="sidebar" style={{ backgroundColor: 'var(--admin-primary-color)' }}>
      <div className="sidebar-header">
        <div className="user-info">
          <div className="user-avatar" style={{ backgroundColor: '#5c6bc0' }}>
            {user && user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h2>{user?.name}</h2>
            <p>System Administrator</p>
          </div>
        </div>
        <p>Admin ID: {user?.id}</p>
      </div>
      
      <ul className="nav-menu">
        <li className={`nav-item ${isActive('/admin') ? 'active' : ''}`} onClick={() => navigate('/admin')}>
          <FontAwesomeIcon icon={faHome} /> Dashboard
        </li>
        
        <div style={{ 
          padding: '15px 20px 5px', 
          fontSize: '0.75rem', 
          textTransform: 'uppercase', 
          letterSpacing: '1px', 
          color: 'rgba(255,255,255,0.5)' 
        }}>
          Management
        </div>
        
        <li className={`nav-item ${isActive('/admin/users') ? 'active' : ''}`} onClick={() => navigate('/admin/users')}>
          <FontAwesomeIcon icon={faUsers} /> User Management
        </li>
        <li className={`nav-item ${isActive('/admin/colleges') ? 'active' : ''}`} onClick={() => navigate('/admin/colleges')}>
          <FontAwesomeIcon icon={faUniversity} /> Colleges & Departments
        </li>
        <li className={`nav-item ${isActive('/admin/programs') ? 'active' : ''}`} onClick={() => navigate('/admin/programs')}>
          <FontAwesomeIcon icon={faGraduationCap} /> Programs
        </li>
        <li className={`nav-item ${isActive('/admin/students') ? 'active' : ''}`} onClick={() => navigate('/admin/students')}>
          <FontAwesomeIcon icon={faUserGraduate} /> Students
        </li>
        
        <div style={{ 
          padding: '15px 20px 5px', 
          fontSize: '0.75rem', 
          textTransform: 'uppercase', 
          letterSpacing: '1px', 
          color: 'rgba(255,255,255,0.5)' 
        }}>
          Issue Tracking
        </div>
        
        <li className={`nav-item ${isActive('/admin/issues') ? 'active' : ''}`} onClick={() => navigate('/admin/issues')}>
          <FontAwesomeIcon icon={faTicketAlt} /> All Issues
        </li>
        <li className={`nav-item ${isActive('/admin/categories') ? 'active' : ''}`} onClick={() => navigate('/admin/categories')}>
          <FontAwesomeIcon icon={faStream} /> Categories
        </li>
        <li className={`nav-item ${isActive('/admin/reports') ? 'active' : ''}`} onClick={() => navigate('/admin/reports')}>
          <FontAwesomeIcon icon={faChartBar} /> Reports & Analytics
        </li>
        
        <div style={{ 
          padding: '15px 20px 5px', 
          fontSize: '0.75rem', 
          textTransform: 'uppercase', 
          letterSpacing: '1px', 
          color: 'rgba(255,255,255,0.5)' 
        }}>
          System
        </div>
        
        <li className={`nav-item ${isActive('/admin/settings') ? 'active' : ''}`} onClick={() => navigate('/admin/settings')}>
          <FontAwesomeIcon icon={faCog} /> System Settings
        </li>
        <li className={`nav-item ${isActive('/admin/roles') ? 'active' : ''}`} onClick={() => navigate('/admin/roles')}>
          <FontAwesomeIcon icon={faShieldAlt} /> Roles & Permissions
        </li>
        <li className={`nav-item ${isActive('/admin/logs') ? 'active' : ''}`} onClick={() => navigate('/admin/logs')}>
          <FontAwesomeIcon icon={faHistory} /> Audit Logs
        </li>
        <li className="nav-item" onClick={handleLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} /> Logout
        </li>
      </ul>
    </div>
  )
}

export default AdminSidebar