import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faEdit,
  faTrash,
  faSearch,
  faFilter,
  faSave,
  faTimes,
  faGraduationCap
} from '@fortawesome/free-solid-svg-icons';
import '../../utils/fontawesome';

const Programs = () => {
  const [programs, setPrograms] = useState([
    {
      id: 1,
      name: 'Bachelor of Computer Engineering',
      code: 'BCE',
      college: 'College of Engineering',
      department: 'Computer Engineering',
      duration: '4 years',
      status: 'active',
      students: 120
    },
    {
      id: 2,
      name: 'Bachelor of Science in Computer Science',
      code: 'BSCS',
      college: 'College of Computing and IT',
      department: 'Computer Science',
      duration: '3 years',
      status: 'active',
      students: 150
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCollege, setFilterCollege] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);

  const colleges = ['all', 'College of Engineering', 'College of Computing and IT', 'College of Natural Sciences', 'College of Business', 'College of Humanities'];
  const statuses = ['all', 'active', 'inactive'];

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = 
      program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCollege = filterCollege === 'all' || program.college === filterCollege;
    const matchesStatus = filterStatus === 'all' || program.status === filterStatus;

    return matchesSearch && matchesCollege && matchesStatus;
  });

  const handleAddProgram = () => {
    setShowAddForm(true);
    setEditingProgram(null);
  };

  const handleSaveProgram = (programData) => {
    if (editingProgram) {
      setPrograms(programs.map(program => 
        program.id === editingProgram.id ? { ...program, ...programData } : program
      ));
      setEditingProgram(null);
    } else {
      setPrograms([...programs, { ...programData, id: Date.now(), students: 0 }]);
      setShowAddForm(false);
    }
  };

  const handleDeleteProgram = (programId) => {
    if (window.confirm('Are you sure you want to delete this program?')) {
      setPrograms(programs.filter(program => program.id !== programId));
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-[#1e1e77]">Program Management</h1>
        <button
          onClick={handleAddProgram}
          className="flex items-center gap-2 px-4 py-2 bg-[#1e1e77] text-white rounded-lg hover:bg-[#2a2a8f]"
        >
          <FontAwesomeIcon icon={faPlus} />
          Add Program
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search programs..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={handleSearch}
          />
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
        </div>
        <select
          value={filterCollege}
          onChange={(e) => setFilterCollege(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          {colleges.map(college => (
            <option key={college} value={college}>
              {college === 'all' ? 'All Colleges' : college}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg capitalize"
        >
          {statuses.map(status => (
            <option key={status} value={status} className="capitalize">
              {status === 'all' ? 'All Statuses' : status}
            </option>
          ))}
        </select>
      </div>

      {/* Program Form */}
      {(showAddForm || editingProgram) && (
        <ProgramForm
          program={editingProgram}
          onSave={handleSaveProgram}
          onCancel={() => {
            setShowAddForm(false);
            setEditingProgram(null);
          }}
        />
      )}

      {/* Programs Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">College</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPrograms.map(program => (
              <tr key={program.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-[#1e1e77] text-white flex items-center justify-center">
                        <FontAwesomeIcon icon={faGraduationCap} className="text-xl" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{program.name}</div>
                      <div className="text-sm text-gray-500">{program.code}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {program.college}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {program.department}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {program.duration}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {program.students}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize
                    ${program.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {program.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => setEditingProgram(program)}
                    className="text-blue-600 hover:text-blue-900 mx-2"
                    title="Edit Program"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    onClick={() => handleDeleteProgram(program.id)}
                    className="text-red-600 hover:text-red-900 mx-2"
                    title="Delete Program"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ProgramForm = ({ program, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: program?.name || '',
    code: program?.code || '',
    college: program?.college || '',
    department: program?.department || '',
    duration: program?.duration || '3 years',
    status: program?.status || 'active'
  });

  const collegesAndDepartments = {
    'College of Engineering': [
      'Computer Engineering',
      'Electrical Engineering',
      'Mechanical Engineering',
      'Civil Engineering',
      'Software Engineering'
    ],
    'College of Computing and IT': [
      'Computer Science',
      'Information Technology',
      'Information Systems',
      'Software Engineering'
    ],
    'College of Natural Sciences': [
      'Physics',
      'Chemistry',
      'Mathematics',
      'Biology'
    ],
    'College of Business': [
      'Business Administration',
      'Economics',
      'Finance',
      'Accounting'
    ],
    'College of Humanities': [
      'Literature',
      'Languages',
      'Philosophy',
      'History'
    ]
  };

  const handleCollegeChange = (e) => {
    const selectedCollege = e.target.value;
    setFormData({
      ...formData,
      college: selectedCollege,
      department: '' // Reset department when college changes
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {program ? 'Edit Program' : 'Add New Program'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Program Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Enter program name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Program Code</label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Enter program code"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">College</label>
            <select
              value={formData.college}
              onChange={handleCollegeChange}
              className="w-full px-3 py-2 border rounded-lg"
              required
            >
              <option value="">Select College</option>
              {Object.keys(collegesAndDepartments).map(college => (
                <option key={college} value={college}>
                  {college}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
              disabled={!formData.college}
            >
              <option value="">Select Department</option>
              {formData.college && collegesAndDepartments[formData.college].map(dept => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
            <select
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="3 years">3 years</option>
              <option value="4 years">4 years</option>
              <option value="5 years">5 years</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg capitalize"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            <FontAwesomeIcon icon={faTimes} className="mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#1e1e77] text-white rounded hover:bg-[#2a2a8f]"
          >
            <FontAwesomeIcon icon={faSave} className="mr-2" />
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default Programs; 