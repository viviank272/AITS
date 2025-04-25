import { Link, useNavigate } from 'react-router-dom';
import {
  UserGroupIcon,
  AcademicCapIcon,
  UserIcon
} from '@heroicons/react/24/outline';

function RoleSelection() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  // If user is already logged in, redirect to their role dashboard
  if (user) {
    const rolePath = {
      admin: '/admin',
      lecturer: '/lecturer',
      student: '/student'
    }[user.role];

    if (rolePath) {
      navigate(rolePath);
    }
  }

  const roles = [
    {
      name: 'Admin',
      description: 'System administrator with full access to manage users, departments, and system settings.',
      icon: UserGroupIcon,
      role: 'admin',
      color: 'bg-purple-500'
    },
    {
      name: 'Lecturer',
      description: 'Department staff member who can manage department-specific issues and student accounts.',
      icon: AcademicCapIcon,
      role: 'lecturer',
      color: 'bg-blue-500'
    },
    {
      name: 'Student',
      description: 'Student who can submit and track their academic support issues.',
      icon: UserIcon,
      role: 'student',
      color: 'bg-green-500'
    }
  ];

  const handleRoleSelect = (role) => {
    navigate(`/login?role=${role}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Welcome to MUK Support Portal
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Please select your role to continue
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <button
              key={role.name}
              onClick={() => handleRoleSelect(role.role)}
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400 transition-all duration-200 hover:shadow-md text-left w-full"
            >
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${role.color}`}>
                  <role.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">{role.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{role.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RoleSelection; 