import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  BellIcon,
  ArrowLeftOnRectangleIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

function LecturerSideNav() {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/lecturer', icon: HomeIcon },
    { name: 'Assigned Issues', href: '/lecturer/assigned', icon: DocumentTextIcon },
    { name: 'Department Issues', href: '/lecturer/department', icon: UserGroupIcon },
    { name: 'Messages', href: '/lecturer/messages', icon: ChatBubbleLeftRightIcon },
    { name: 'Notifications', href: '/lecturer/notifications', icon: BellIcon },
    { name: 'Reports', href: '/lecturer/reports', icon: ChartBarIcon },
    { name: 'Settings', href: '/lecturer/settings', icon: Cog6ToothIcon },
    { name: 'Logout', href: '/logout', icon: ArrowLeftOnRectangleIcon },
  ];

  return (
    <div className="flex flex-col w-64 bg-[#2C3E50] min-h-screen text-white">
      <div className="p-4">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-xl font-bold">
            DP
          </div>
          <div>
            <h3 className="font-medium">Dr. Peter Wakholi</h3>
            <p className="text-sm text-gray-300">Computer Science</p>
          </div>
        </div>
        <p className="text-sm text-gray-300 mt-2">College ID: F9876543</p>
      </div>
      
      <nav className="flex-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-4 py-2 my-1 text-sm font-medium rounded-md ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-[#374a5f] hover:text-white'
              }`}
            >
              <item.icon
                className={`mr-3 flex-shrink-0 h-5 w-5`}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default LecturerSideNav; 