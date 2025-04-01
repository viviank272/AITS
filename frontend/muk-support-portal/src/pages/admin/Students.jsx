import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faEdit,
  faTrash,
  faSearch,
  faTimes,
  faUserGraduate
} from '@fortawesome/free-solid-svg-icons';

const Students = () => {
  const [students, setStudents] = useState([
    {
      id: 1,
      name: 'John Doe',
      regNumber: '2024/BCE/001',
      email: 'john.doe@muk.ac.ug',
      phone: '+256 700 123 456',
      program: 'Bachelor of Computer Engineering',
      college: 'College of Engineering',
      department: 'Computer Engineering',
      year: '1',
      semester: '1',
      status: 'active',
      lastLogin: '2024-03-15 10:30 AM'
    },
    {
      id: 2,
      name: 'Jane Smith',
      regNumber: '2024/BSCS/001',
      email: 'jane.smith@muk.ac.ug',
      phone: '+256 700 123 457',
      program: 'Bachelor of Science in Computer Science',
      college: 'College of Computing and IT',
      department: 'Computer Science',
      year: '1',
      semester: '1',
      status: 'active',
      lastLogin: '2024-03-14 02:15 PM'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterProgram, setFilterProgram] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [filterSemester, setFilterSemester] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const programs = ['all', 'Bachelor of Computer Engineering', 'Bachelor of Science in Computer Science'];
  const years = ['all', '1', '2', '3', '4', '5'];
  const statuses = ['all', 'active', 'inactive', 'suspended'];

  const colleges = [
    {
      id: 1,
      name: 'College of Computing and Information Sciences',
      departments: [
        'Computer Science',
        'Software Engineering',
        'Information Technology',
        'Information Systems'
      ]
    },
    {
      id: 2,
      name: 'College of Engineering, Design, Art and Technology',
      departments: [
        'Civil Engineering',
        'Electrical Engineering',
        'Mechanical Engineering',
        'Computer Engineering'
      ]
    },
    {
      id: 3,
      name: 'College of Business and Management Sciences',
      departments: [
        'Business Administration',
        'Finance',
        'Accounting',
        'Marketing'
      ]
    },
    {
      id: 4,
      name: 'College of Natural Sciences',
      departments: [
        'Mathematics',
        'Physics',
        'Chemistry',
        'Biology'
      ]
    }
  ];

  const programsByDepartment = {
    'Computer Science': ['Bachelor of Science in Computer Science', 'Bachelor of Information Technology'],
    'Software Engineering': ['Bachelor of Software Engineering'],
    'Information Technology': ['Bachelor of Information Technology'],
    'Information Systems': ['Bachelor of Information Systems'],
    'Civil Engineering': ['Bachelor of Civil Engineering'],
    'Electrical Engineering': ['Bachelor of Electrical Engineering'],
    'Mechanical Engineering': ['Bachelor of Mechanical Engineering'],
    'Computer Engineering': ['Bachelor of Computer Engineering'],
    'Business Administration': ['Bachelor of Business Administration'],
    'Finance': ['Bachelor of Finance'],
    'Accounting': ['Bachelor of Accounting'],
    'Marketing': ['Bachelor of Marketing'],
    'Mathematics': ['Bachelor of Science in Mathematics'],
    'Physics': ['Bachelor of Science in Physics'],
    'Chemistry': ['Bachelor of Science in Chemistry'],
    'Biology': ['Bachelor of Science in Biology'],
  };

  // Get available semesters based on selected year
  const getAvailableSemesters = (selectedYear) => {
    if (selectedYear === 'all') return ['all'];
    return ['all', '1', '2'];
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleYearChange = (e) => {
    const selectedYear = e.target.value;
    setFilterYear(selectedYear);
    // Reset semester when year changes
    setFilterSemester('all');
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.regNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProgram = filterProgram === 'all' || student.program === filterProgram;
    const matchesYear = filterYear === 'all' || student.year === filterYear;
    const matchesSemester = filterSemester === 'all' || student.semester === filterSemester;
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
    return matchesSearch && matchesProgram && matchesYear && matchesSemester && matchesStatus;
  });

  const handleAddStudent = () => {
    setShowAddForm(true);
    setEditingStudent(null);
  };

  const handleSaveStudent = (studentData) => {
    if (editingStudent) {
      setStudents(students.map(student => 
        student.id === editingStudent.id ? { ...student, ...studentData } : student
      ));
      setEditingStudent(null);
    } else {
      setStudents([...students, { ...studentData, id: Date.now(), lastLogin: 'Never' }]);
      setShowAddForm(false);
    }
  };

  const handleDeleteStudent = (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      setStudents(students.filter(student => student.id !== studentId));
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-[#1e1e77]">Student Management</h1>
        <button
          onClick={handleAddStudent}
          className="flex items-center gap-2 px-4 py-2 bg-[#1e1e77] text-white rounded-lg hover:bg-[#2a2a8f]"
        >
          <FontAwesomeIcon icon={faPlus} />
          Add Student
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search students..."
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
          value={filterProgram}
          onChange={(e) => setFilterProgram(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          {programs.map(program => (
            <option key={program} value={program}>
              {program === 'all' ? 'All Programs' : program}
            </option>
          ))}
        </select>
        <select
          value={filterYear}
          onChange={handleYearChange}
          className="px-4 py-2 border rounded-lg"
        >
          {years.map(year => (
            <option key={year} value={year}>
              {year === 'all' ? 'All Years' : `Year ${year}`}
            </option>
          ))}
        </select>
        <select
          value={filterSemester}
          onChange={(e) => setFilterSemester(e.target.value)}
          className="px-4 py-2 border rounded-lg"
          disabled={filterYear === 'all'}
        >
          {getAvailableSemesters(filterYear).map(semester => (
            <option key={semester} value={semester}>
              {semester === 'all' ? 'All Semesters' : `Semester ${semester}`}
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

      {/* Student Form */}
      {(showAddForm || editingStudent) && (
        <StudentForm
          student={editingStudent}
          onSave={handleSaveStudent}
          onCancel={() => {
            setShowAddForm(false);
            setEditingStudent(null);
          }}
          colleges={colleges}
          years={years.filter(y => y !== 'all')}
          semesters={['1', '2']}
          programsByDepartment={programsByDepartment}
        />
      )}

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents.map(student => (
              <tr key={student.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-[#1e1e77] text-white flex items-center justify-center">
                        <FontAwesomeIcon icon={faUserGraduate} className="text-xl" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                      <div className="text-sm text-gray-500">{student.regNumber}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.program}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Year {student.year}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Semester {student.semester}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize
                    ${student.status === 'active' ? 'bg-green-100 text-green-800' : 
                      student.status === 'inactive' ? 'bg-gray-100 text-gray-800' : 
                      'bg-red-100 text-red-800'}`}>
                    {student.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.lastLogin}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => setEditingStudent(student)}
                    className="text-blue-600 hover:text-blue-900 mx-2"
                    title="Edit Student"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    onClick={() => handleDeleteStudent(student.id)}
                    className="text-red-600 hover:text-red-900 mx-2"
                    title="Delete Student"
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

const StudentForm = ({ student, onSave, onCancel, colleges, years, semesters, programsByDepartment }) => {
  const [formData, setFormData] = useState({
    name: student?.name || '',
    regNumber: student?.regNumber || '',
    email: student?.email || '',
    phone: student?.phone || '',
    program: student?.program || '',
    college: student?.college || '',
    department: student?.department || '',
    year: student?.year || '1',
    semester: student?.semester || '1',
    status: student?.status || 'active'
  });

  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [availablePrograms, setAvailablePrograms] = useState([]);

  const handleCollegeChange = (e) => {
    const selectedCollege = e.target.value;
    setFormData(prev => ({
      ...prev,
      college: selectedCollege,
      department: '', // Reset department when college changes
      program: '' // Reset program when college changes
    }));

    // Update available departments based on selected college
    const college = colleges.find(c => c.name === selectedCollege);
    setAvailableDepartments(college ? college.departments : []);
    setAvailablePrograms([]); // Reset programs when college changes
  };

  const handleDepartmentChange = (e) => {
    const selectedDepartment = e.target.value;
    setFormData(prev => ({
      ...prev,
      department: selectedDepartment,
      program: '' // Reset program when department changes
    }));

    // Update available programs based on selected department
    setAvailablePrograms(programsByDepartment[selectedDepartment] || []);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">{student ? 'Edit Student' : 'Add New Student'}</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-500">
            <FontAwesomeIcon icon={faTimes} className="text-xl" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Registration Number</label>
              <input
                type="text"
                value={formData.regNumber}
                onChange={(e) => setFormData({ ...formData, regNumber: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">College</label>
              <select
                value={formData.college}
                onChange={handleCollegeChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              >
                <option value="">Select College</option>
                {colleges.map(college => (
                  <option key={college.id} value={college.name}>
                    {college.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <select
                value={formData.department}
                onChange={handleDepartmentChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
                disabled={!formData.college}
              >
                <option value="">Select Department</option>
                {availableDepartments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Program</label>
              <select
                value={formData.program}
                onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
                disabled={!formData.department}
              >
                <option value="">Select Program</option>
                {availablePrograms.map(program => (
                  <option key={program} value={program}>
                    {program}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Year</label>
              <select
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              >
                {years.map(year => (
                  <option key={year} value={year}>
                    Year {year}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Semester</label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              >
                {semesters.map(semester => (
                  <option key={semester} value={semester}>
                    Semester {semester}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1e1e77] hover:bg-[#2e2ea7]"
            >
              {student ? 'Update Student' : 'Add Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Students; 