import { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import DepartmentForm from '../../components/departments/DepartmentForm';

function DepartmentManagement() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  // Mock data for testing
  const mockDepartments = [
    {
      id: 1,
      name: 'Computer Science',
      code: 'CS',
      college: 'College of Computing and Information Sciences',
      head_of_department: 'Dr. John Smith',
      is_active: true
    },
    {
      id: 2,
      name: 'Information Systems',
      code: 'IS',
      college: 'College of Computing and Information Sciences',
      head_of_department: 'Dr. Jane Doe',
      is_active: true
    },
    {
      id: 3,
      name: 'Software Engineering',
      code: 'SE',
      college: 'College of Computing and Information Sciences',
      head_of_department: 'Dr. Robert Johnson',
      is_active: true
    }
  ];

  useEffect(() => {
    // Simulate API call
    setDepartments(mockDepartments);
    setLoading(false);
  }, []);

  const handleAddDepartment = () => {
    setSelectedDepartment(null);
    setShowModal(true);
  };

  const handleEditDepartment = (department) => {
    setSelectedDepartment(department);
    setShowModal(true);
  };

  const handleDeleteDepartment = (departmentId) => {
    // Add confirmation dialog and API call here
    setDepartments(departments.filter(dept => dept.id !== departmentId));
  };

  const handleSubmit = (departmentData) => {
    if (selectedDepartment) {
      // Update existing department
      setDepartments(departments.map(dept =>
        dept.id === selectedDepartment.id ? { ...dept, ...departmentData } : dept
      ));
    } else {
      // Add new department
      setDepartments([...departments, { ...departmentData, id: departments.length + 1 }]);
    }
    setShowModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Department Management</h1>
          <button
            onClick={handleAddDepartment}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Department
          </button>
        </div>

        {/* Department List */}
        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Department</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Code</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">College</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Head of Department</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {departments.map((department) => (
                      <tr key={department.id}>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                          <div className="flex items-center">
                            <AcademicCapIcon className="h-5 w-5 text-gray-400 mr-2" />
                            <div className="font-medium">{department.name}</div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{department.code}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{department.college}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{department.head_of_department}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            department.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {department.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={() => handleEditDepartment(department)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <PencilSquareIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteDepartment(department.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Department Form Modal */}
      {showModal && (
        <DepartmentForm
          department={selectedDepartment}
          onSubmit={handleSubmit}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

export default DepartmentManagement; 