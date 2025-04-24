import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
  faTrash,
  faSpinner,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import { getPrograms, createProgram, updateProgram, deleteProgram } from '../../services/api';
import AddProgramDialog from '../../components/programs/AddProgramDialog';
import { toast } from 'react-toastify';

const ProgramManagement = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);

  // Fetch programs on component mount
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPrograms();
        setPrograms(data);
      } catch (err) {
        console.error('Error fetching programs:', err);
        setError('Failed to fetch programs. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  const handleAddProgram = () => {
    setSelectedProgram(null);
    setShowDialog(true);
  };

  const handleEditProgram = (program) => {
    setSelectedProgram(program);
    setShowDialog(true);
  };

  const handleDeleteProgram = async (programId) => {
    if (!window.confirm('Are you sure you want to delete this program?')) {
      return;
    }

    try {
      setLoading(true);
      await deleteProgram(programId);
      setPrograms(programs.filter(p => p.program_id !== programId));
      toast.success('Program deleted successfully');
    } catch (err) {
      console.error('Error deleting program:', err);
      toast.error('Failed to delete program');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProgram = async (formData) => {
    try {
      if (selectedProgram) {
        // Update existing program
        const updatedProgram = await updateProgram(selectedProgram.program_id, formData);
        setPrograms(programs.map(p => 
          p.program_id === selectedProgram.program_id ? updatedProgram : p
        ));
        toast.success('Program updated successfully');
      } else {
        // Create new program
        const newProgram = await createProgram(formData);
        setPrograms([...programs, newProgram]);
        toast.success('Program created successfully');
      }
      setShowDialog(false);
    } catch (err) {
      console.error('Error saving program:', err);
      throw err; // Let the dialog component handle the error
    }
  };

  if (loading && !programs.length) {
    return (
      <div className="flex justify-center items-center h-full">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" />
      </div>
    );
  }

  if (error && !programs.length) {
    return (
      <div className="text-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Program Management</h1>
        <button
          onClick={handleAddProgram}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Add Program
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">College</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {programs.map((program) => (
              <tr key={program.program_id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{program.program_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{program.program_code}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{program.college_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{program.department_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{program.duration}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    program.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {program.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEditProgram(program)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    onClick={() => handleDeleteProgram(program.program_id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showDialog && (
        <AddProgramDialog
          program={selectedProgram}
          onSave={handleSaveProgram}
          onClose={() => setShowDialog(false)}
        />
      )}
    </div>
  );
};

export default ProgramManagement; 