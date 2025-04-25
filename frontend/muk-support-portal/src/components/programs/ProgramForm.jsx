import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { getColleges, getDepartmentsByCollege } from '../../services/api';

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

  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const durations = ['1 year', '2 years', '3 years', '4 years', '5 years'];

  // Fetch colleges on component mount
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching colleges...');
        const data = await getColleges();
        console.log('Colleges data received:', data);
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid colleges data format received');
        }
        
        setColleges(data);
      } catch (err) {
        console.error('Error fetching colleges:', err);
        console.error('Error details:', err.response?.data || err.message);
        setError('Failed to fetch colleges. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchColleges();
  }, []);

  // Fetch departments when college changes
  useEffect(() => {
    const fetchDepartments = async () => {
      if (!formData.college) {
        console.log('No college selected, skipping department fetch');
        setDepartments([]);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        console.log('Current colleges:', colleges);
        console.log('Selected college name:', formData.college);
        
        const selectedCollege = colleges.find(c => c.college_name === formData.college);
        console.log('Selected college object:', selectedCollege);
        
        if (!selectedCollege) {
          console.error('Selected college not found in colleges list');
          setError('Invalid college selection');
          return;
        }

        console.log('Fetching departments for college ID:', selectedCollege.college_id);
        const data = await getDepartmentsByCollege(selectedCollege.college_id);
        console.log('Departments data received:', data);
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid departments data format received');
        }
        
        setDepartments(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching departments:', err);
        console.error('Error details:', err.response?.data || err.message);
        setError('Failed to fetch departments. Please try again.');
        setDepartments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, [formData.college, colleges]);

  useEffect(() => {
    if (program) {
      console.log('Setting initial program data:', program);
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
    console.log('Form field changed:', { name, value, type });
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      // Reset department when college changes
      ...(name === 'college' ? { department: '' } : {})
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting form data:', formData);
    onSubmit(formData);
  };

  if (loading && !colleges.length) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

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
              <label htmlFor="college" className="block text-sm font-medium text-gray-700">
                College
              </label>
              <select
                name="college"
                id="college"
                value={formData.college}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">Select a college</option>
                {colleges && colleges.length > 0 && colleges.map(college => (
                  <option key={college.college_id} value={college.college_name}>
                    {college.college_name}
                  </option>
                ))}
              </select>
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
                disabled={!formData.college}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100"
              >
                <option value="">Select a department</option>
                {departments && departments.length > 0 && departments.map(dept => (
                  <option key={dept.department_id} value={dept.dept_name}>
                    {dept.dept_name}
                  </option>
                ))}
              </select>
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
                disabled={loading}
                className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm disabled:bg-gray-400"
              >
                {loading ? 'Loading...' : program ? 'Update Program' : 'Create Program'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProgramForm; 