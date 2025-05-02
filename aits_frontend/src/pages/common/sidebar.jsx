import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

/**
 * Sidebar component for navigation
 * @param {Object} props
 * @param {Array} props.menuItems - Array of menu items with properties: name, path, icon
 * @param {string} props.userRole - Role of the current user (student, lecturer, admin)
 */
const Sidebar = ({ menuItems, userRole = 'student' }) => {
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <aside className={`bg-primary-500 text-white h-screen flex flex-col transition-all ${collapsed ? 'w-16' : 'w-56'}`}>
      <div className="flex items-center p-4 border-b border-primary-400/20">
        <div className="flex-shrink-0 text-2xl mr-2">JS</div>
        {!collapsed && (
          <h2 className="text-lg font-semibold flex-grow">Support Portal</h2>
        )}
        <button 
          className="text-white hover:bg-primary-600 rounded p-1"
          onClick={toggleSidebar}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <div className="p-4 border-b border-primary-400/20">
        {!collapsed && (
          <>
            <p className="font-semibold text-lg">{user?.name || 'User'}</p>
            <p className="text-primary-100">{user?.department || ''}</p>
            <p className="text-sm text-primary-100">
              {userRole === 'student' && `Student ID: ${user?.studentId || ''}`}
              {userRole !== 'student' && `${userRole.charAt(0).toUpperCase() + userRole.slice(1)}`}
            </p>
          </>
        )}
      </div>

      <nav className="flex-grow py-4">
        <ul>
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link 
                to={item.path} 
                className={`flex items-center py-3 px-4 hover:bg-primary-600/50 transition-colors ${location.pathname === item.path ? 'bg-primary-600/50' : ''}`}
                title={collapsed ? item.name : ''}
              >
                <span className="text-xl mr-3">{item.icon}</span>
                {!collapsed && <span>{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-primary-400/20">
        <button 
          className="flex items-center w-full text-white hover:bg-primary-600/50 rounded py-2 px-2 transition-colors"
          onClick={logout}
        >
          <span className="text-xl mr-3">⏻</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;