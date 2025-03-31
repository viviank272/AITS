import { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import ProgramForm from '../../components/programs/ProgramForm';

function ProgramManagement() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);

  // Mock data for testing
  const mockPrograms = [
    {
      id: 1,
      name: 'Bachelor of Science in Computer Science',
      code: 'BSC-CS',
      department: 'Computer Science',
      college: 'College of Computing and Information Sciences',
      duration: '4 years',
      coordinator: 'Dr. Alice Johnson',
      is_active: true
    },
    {
      id: 2,
      name: 'Bachelor of Information Technology',
      code: 'BIT',
      department: 'Information Technology',
      college: 'College of Computing and Information Sciences',
      duration: '3 years',
      coordinator: 'Dr. Bob Smith',
      is_active: true
    },
    {
      id: 3,
      name: 'Master of Computer Science',
      code: 'MSC-CS',
      department: 'Computer Science',
      college: 'College of Computing and Information Sciences',
      duration: '2 years',
      coordinator: 'Dr. Carol Williams',
      is_active: true
    }
  ];

  useEffect(() => {
    // Simulate API call
    setPrograms(mockPrograms);
    setLoading(false);
  }, []);

  const handleAddProgram = () => {
    setSelectedProgram(null);
    setShowModal(true);
  };

  const handleEditProgram = (program) => {
    setSelectedProgram(program);
    setShowModal(true);
  };

  const handleDeleteProgram = (programId) => {
    // Add confirmation dialog and API call here
    setPrograms(programs.filter(program => program.id !== programId));
  };

  const handleSubmit = (programData) => {
    if (selectedProgram) {
      // Update existing program
      setPrograms(programs.map(program =>
        program.id === selectedProgram.id ? { ...program, ...programData } : program
      ));
    } else {
      // Add new program
      setPrograms([...programs, { ...programData, id: programs.length + 1 }]);
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
          <h1 className="text-2xl font-semibold text-gray-900">Program Management</h1>
          <button
            onClick={handleAddProgram}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Program
          </button>
        </div>

        {/* Program List */}
        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Program</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Code</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Department</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Duration</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Coordinator</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {programs.map((program) => (
                      <tr key={program.id}>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                          <div className="flex items-center">
                            <AcademicCapIcon className="h-5 w-5 text-gray-400 mr-2" />
                            <div>
                              <div className="font-medium">{program.name}</div>
                              <div className="text-gray-500">{program.college}</div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{program.code}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{program.department}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{program.duration}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{program.coordinator}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            program.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {program.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={() => handleEditProgram(program)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <PencilSquareIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProgram(program.id)}
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

      {/* Program Form Modal */}
      {showModal && (
        <ProgramForm
          program={selectedProgram}
          onSubmit={handleSubmit}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

export default ProgramManagement; 