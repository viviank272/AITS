import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

function ProgramForm({ program, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    department: '',
    college: '',
    duration: '',
    coordinator: '',
    is_active: true
  });

  // Mock data for departments and colleges
  const departments = [
    { id: 1, name: 'Computer Science', college: 'College of Computing and Information Sciences' },
    { id: 2, name: 'Information Technology', college: 'College of Computing and Information Sciences' },
    { id: 3, name: 'Software Engineering', college: 'College of Computing and Information Sciences' }
  ];

  const colleges = [
    { id: 1, name: 'College of Computing and Information Sciences' },
    { id: 2, name: 'College of Engineering, Design, Art and Technology' },
    { id: 3, name: 'College of Business and Management Sciences' }
  ];

  const durations = ['1 year', '2 years', '3 years', '4 years', '5 years'];

  useEffect(() => {
    if (program) {
      setFormData({
        name: program.name,
        code: program.code,
        department: program.department,
        college: program.college,
        duration: program.duration,
        coordinator: program.coordinator,
        is_active: program.is_active
      });
    }
  }, [program]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Update college when department changes
    if (name === 'department') {
      const selectedDepartment = departments.find(dept => dept.name === value);
      if (selectedDepartment) {
        setFormData(prev => ({
          ...prev,
          department: value,
          college: selectedDepartment.college
        }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {program ? 'Edit Program' : 'Add New Program'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Program Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                Program Code
              </label>
              <input
                type="text"
                name="code"
                id="code"
                value={formData.code}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                Department
              </label>
              <select
                name="department"
                id="department"
                value={formData.department}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">Select a department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="college" className="block text-sm font-medium text-gray-700">
                College
              </label>
              <input
                type="text"
                name="college"
                id="college"
                value={formData.college}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                Duration
              </label>
              <select
                name="duration"
                id="duration"
                value={formData.duration}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">Select duration</option>
                {durations.map(duration => (
                  <option key={duration} value={duration}>
                    {duration}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="coordinator" className="block text-sm font-medium text-gray-700">
                Program Coordinator
              </label>
              <input
                type="text"
                name="coordinator"
                id="coordinator"
                value={formData.coordinator}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                id="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                Active Program
              </label>
            </div>

            <div className="mt-5 sm:mt-6">
              <button
                type="submit"
                className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
              >
                {program ? 'Update Program' : 'Create Program'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProgramForm; 