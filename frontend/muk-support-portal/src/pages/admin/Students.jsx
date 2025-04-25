import React, { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
  faPlus,
  faTrash,
  faTimes,
  faSpinner,
  faSearch,
  faUserGraduate
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { 
  getStudents, 
  createStudent,
  updateStudent,
  deleteStudent,
  getColleges,
  getPrograms,
  getDepartmentsByCollege,
  getProgramsByDepartment
} from '../../services/api';
import { toast } from 'react-toastify';
import { validateAcademicData, debugStudentForm, inspectProgramStructure } from '../../utils/academicDataDebugger';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('all');
  const [filterSemester, setFilterSemester] = useState('all');
  const [filterProgram, setFilterProgram] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [availablePrograms, setAvailablePrograms] = useState([]);
  const [error, setError] = useState(null);

  const statuses = ['all', 'active', 'inactive', 'suspended'];
  const years = ['all', '1', '2', '3', '4', '5'];

  // Get available semesters based on selected year
  const getAvailableSemesters = (selectedYear) => {
    if (selectedYear === 'all') return ['all'];
    return ['all', '1', '2'];
  };

  // Fetch academic data (colleges, departments, programs)
  useEffect(() => {
    const fetchAcademicData = async () => {
      try {
        setLoading(true);
        
        // Define mock data to use as fallback
        const mockColleges = [
          {
            id: 1,
            name: 'College of Computing and Information Sciences',
            departments: [
              'Computer Science',
              'Information Technology',
              'Software Engineering',
              'Data Science'
            ]
          },
          {
            id: 2,
            name: 'College of Engineering, Design, Art and Technology',
            departments: [
              'Civil Engineering',
              'Electrical Engineering',
              'Mechanical Engineering',
              'Architecture'
            ]
          },
          {
            id: 3,
            name: 'College of Business and Management Sciences',
            departments: [
              'Business Administration',
              'Finance',
              'Marketing',
              'Economics'
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
        
        const mockProgramsByDepartment = {
          'Computer Science': [
            'Bachelor of Science in Computer Science',
            'Master of Science in Computer Science',
            'PhD in Computer Science'
          ],
          'Information Technology': [
            'Bachelor of Information Technology',
            'Master of Information Technology'
          ],
          'Software Engineering': [
            'Bachelor of Software Engineering',
            'Master of Software Engineering'
          ],
          'Data Science': [
            'Bachelor of Science in Data Science',
            'Master of Data Science'
          ],
          'Civil Engineering': [
            'Bachelor of Civil Engineering',
            'Master of Civil Engineering'
          ],
          'Electrical Engineering': [
            'Bachelor of Electrical Engineering',
            'Master of Electrical Engineering'
          ],
          'Mechanical Engineering': [
            'Bachelor of Mechanical Engineering',
            'Master of Mechanical Engineering'
          ],
          'Architecture': [
            'Bachelor of Architecture',
            'Master of Architecture'
          ],
          'Business Administration': [
            'Bachelor of Business Administration',
            'Master of Business Administration'
          ],
          'Finance': [
            'Bachelor of Finance',
            'Master of Finance'
          ],
          'Marketing': [
            'Bachelor of Marketing',
            'Bachelor of Commerce in Marketing'
          ],
          'Economics': [
            'Bachelor of Economics',
            'Master of Economics'
          ],
          'Mathematics': [
            'Bachelor of Science in Mathematics',
            'Master of Science in Mathematics'
          ],
          'Physics': [
            'Bachelor of Science in Physics',
            'Master of Science in Physics'
          ],
          'Chemistry': [
            'Bachelor of Science in Chemistry',
            'Master of Science in Chemistry'
          ],
          'Biology': [
            'Bachelor of Science in Biology',
            'Master of Science in Biology'
          ]
        };
        
        // Try to fetch real data first
        let collegesData = [];
        let programsData = [];
        let useRealData = true;
        
        try {
          // Fetch colleges
          collegesData = await getColleges();
          console.log('Fetched colleges:', collegesData);
          
          // Fetch programs
          programsData = await getPrograms();
          console.log('Fetched programs raw data:', JSON.stringify(programsData));
          
          // Inspect the program data structure for debugging
          inspectProgramStructure(programsData);
          
          // If we have empty or invalid data, use mock data
          if (!collegesData || collegesData.length === 0 || !programsData || programsData.length === 0) {
            console.warn('Empty data received from API, using mock data instead');
            useRealData = false;
            collegesData = mockColleges.map(college => ({
              college_id: college.id,
              college_name: college.name
            }));
          }
        } catch (error) {
          console.error('Error fetching data from API:', error);
          useRealData = false;
          collegesData = mockColleges.map(college => ({
            college_id: college.id,
            college_name: college.name
          }));
        }
        
        // If we're not using real data, don't try to process it
        if (!useRealData) {
          console.log('Using mock data for colleges and departments');
          setColleges(mockColleges);
          setAvailablePrograms(mockProgramsByDepartment);
          setStudents(
            Object.entries(mockProgramsByDepartment).flatMap(([dept, programs]) => 
              programs.map(program => ({
                program_id: Math.random().toString(36).substr(2, 9),
                program_name: program,
                department_name: dept,
                college: mockColleges.find(c => c.departments.includes(dept))?.id
              }))
            )
          );
          setLoading(false);
          return;
        }
        
        // Initialize formatted colleges with empty departments
        const formattedColleges = collegesData.map(college => ({
          id: college.college_id,
          name: college.college_name,
          departments: [] // Will be populated after we get programs
        }));
        
        // Extract unique departments and organize by college
        const programsByDept = {};
        
        console.log('Full programs data structure:', programsData);
        
        // Check if we have any programs
        if (programsData.length === 0) {
          console.warn('No program data available, using mock data');
          setColleges(mockColleges);
          setAvailablePrograms(mockProgramsByDepartment);
          setLoading(false);
          return;
        }
        
        // Examine the first program to understand structure
        if (programsData.length > 0) {
          console.log('First program example:', programsData[0]);
          console.log('Department property type:', typeof programsData[0].department);
          console.log('College property type:', typeof programsData[0].college);
        }
        
        // Set programs state
        setStudents(programsData);
        
        // Organize programs by department and associate with colleges
        programsData.forEach(program => {
          // Normalize department name by removing 'Department of ' prefix if present
          const deptName = program.department_name.replace(/^Department of /i, '');
          
          // Add department to programsByDept
          if (!programsByDept[deptName]) {
            programsByDept[deptName] = [];
          }
          programsByDept[deptName].push(program.program_name);
          
          // Find the college this department belongs to
          const collegeId = program.college_id;
          const college = formattedColleges.find(c => c.id === collegeId);
          
          if (college && !college.departments.includes(deptName)) {
            college.departments.push(deptName);
          }
        });
        
        // If we didn't extract any programs by department, use mock data
        if (Object.keys(programsByDept).length === 0) {
          console.warn('No programs by department could be extracted, using mock data');
          setAvailablePrograms(mockProgramsByDepartment);
        } else {
          setAvailablePrograms(programsByDept);
        }
        
        // Validate the academic data structure
        validateAcademicData(formattedColleges, programsData, programsByDept);
        
        setColleges(formattedColleges);
      } catch (err) {
        console.error('Error fetching academic data:', err);
        setError('Failed to load academic data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAcademicData();
  }, []);

  // Fetch students from the backend
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStudents();
      console.log('Fetched students data:', data);
      
      // Transform API data to match our component's expected format
      const formattedStudents = data.map(student => {
        // Ensure all required fields are present
        const formattedStudent = {
          id: student.student_id || student.id,
          name: student.user_details?.full_name || student.name || 'N/A',
          studentNumber: student.student_number || student.studentNumber || 'N/A',
          regNumber: student.registration_number || student.regNumber || 'N/A',
          email: student.user_details?.email || student.email || 'N/A',
          phone: student.user_details?.phone || student.phone || 'N/A',
          program: student.program_name || student.program || 'N/A',
          college: student.college_name || student.college || 'N/A',
          department: student.department_name || student.department || 'N/A',
          year: (student.year_level || student.year || '1').toString(),
          semester: (student.semester_in_year || student.semester || '1').toString(),
          status: student.enrollment_status || student.status || 'active',
          lastLogin: student.user_details?.last_login || student.lastLogin || 'Never'
        };
        
        console.log('Formatted student:', formattedStudent);
        return formattedStudent;
      });
      
      console.log('Formatted students:', formattedStudents);
      setStudents(formattedStudents);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students. Please try again later.');
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
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

  // Get filtered students
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // Search filter
      const matchesSearch = 
        (student.name && student.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.regNumber && student.regNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.studentNumber && student.studentNumber.includes(searchTerm)) ||
        (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filters
      const matchesProgram = filterProgram === 'all' || student.program === filterProgram;
      const matchesYear = filterYear === 'all' || student.year === filterYear;
      const matchesSemester = filterSemester === 'all' || student.semester === filterSemester;
      const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
      
      return matchesSearch && matchesProgram && matchesYear && matchesSemester && matchesStatus;
    });
  }, [students, searchTerm, filterProgram, filterYear, filterSemester, filterStatus]);

  const handleAddStudent = () => {
    setShowAddDialog(true);
    setEditingStudent(null);
  };

  const handleSaveStudent = async (studentData) => {
    try {
      setLoading(true);
      setError(null);

      // Debug the form data
      debugStudentForm(studentData);

      let response;
      if (editingStudent) {
        // Update existing student
        response = await updateStudent(editingStudent.student_id, studentData);
        // Format the updated student data
        const formattedStudent = {
          id: response.student_id,
          name: response.user_details.full_name,
          studentNumber: response.student_number,
          regNumber: response.registration_number,
          email: response.user_details.email,
          phone: response.user_details?.phone || 'N/A',
          program: response.program_name,
          college: response.college_name,
          department: response.department_name,
          year: response.year_level.toString(),
          semester: response.semester_in_year.toString(),
          status: response.enrollment_status,
          lastLogin: response.user_details?.last_login || 'Never'
        };
        // Update the students list immediately
        setStudents(prevStudents => 
          prevStudents.map(student => 
            student.id === editingStudent.id ? formattedStudent : student
          )
        );
      } else {
        // Create new student
        response = await createStudent(studentData);
        // Format the new student data
        const formattedStudent = {
          id: response.student_id,
          name: response.user_details.full_name,
          studentNumber: response.student_number,
          regNumber: response.registration_number,
          email: response.user_details.email,
          phone: response.user_details?.phone || 'N/A',
          program: response.program_name,
          college: response.college_name,
          department: response.department_name,
          year: response.year_level.toString(),
          semester: response.semester_in_year.toString(),
          status: response.enrollment_status,
          lastLogin: response.user_details?.last_login || 'Never'
        };
        // Add the new student to the list immediately
        setStudents(prevStudents => [...prevStudents, formattedStudent]);
      }

      // Close the dialog and reset editing state
      setShowAddDialog(false);
      setEditingStudent(null);

      // Show success message
      toast.success(
        editingStudent 
          ? 'Student updated successfully' 
          : 'Student added successfully'
      );

    } catch (error) {
      console.error('Error saving student:', error);
      setError(error.response?.data?.error || 'Failed to save student');
      toast.error('Failed to save student');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        setLoading(true);
        await deleteStudent(studentId);
        setStudents(students.filter(student => student.id !== studentId));
        toast.success('Student deleted successfully');
      } catch (err) {
        console.error('Error deleting student:', err);
        toast.error('Failed to delete student');
      } finally {
        setLoading(false);
      }
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
          disabled={loading}
        >
          {loading ? (
            <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
          ) : (
            <FontAwesomeIcon icon={faPlus} />
          )}
          Add Student
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

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
          <option value="all">All Programs</option>
          {students.map((program, index) => (
            <option key={program.program_id || program.id || `program-${index}`} value={program.program_name}>
              {program.program_name}
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
      {(showAddDialog || editingStudent) && (
        <StudentForm
          student={editingStudent}
          onSave={handleSaveStudent}
          onCancel={() => {
            setShowAddDialog(false);
            setEditingStudent(null);
          }}
          colleges={colleges}
          years={years.filter(y => y !== 'all')}
          semesters={['1', '2']}
          loading={loading}
        />
      )}

      {/* Loading State */}
      {loading && !showAddDialog && !editingStudent && (
        <div className="flex justify-center items-center p-10">
          <FontAwesomeIcon icon={faSpinner} className="animate-spin text-3xl text-[#1e1e77]" />
          <span className="ml-2">Loading students...</span>
        </div>
      )}

      {/* Students Table */}
      {!loading && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {students.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No students found. Add your first student using the button above.
            </div>
          ) : (
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
                          <div className="text-sm text-gray-500">Student No: {student.studentNumber}</div>
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
          )}
        </div>
      )}
    </div>
  );
};

const StudentForm = ({ student, onSave, onCancel, colleges, years, semesters, loading }) => {
  const [formData, setFormData] = useState({
    name: student?.name || '',
    regNumber: student?.regNumber || '',
    studentNumber: student?.studentNumber || '',
    email: student?.email || '',
    program: student?.program || '',
    programId: student?.programId || null,
    college: student?.college || '',
    department: student?.department || '',
    year: student?.year || '1',
    semester: student?.semester || '1',
    status: student?.status || 'active'
  });

  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [availablePrograms, setAvailablePrograms] = useState([]);
  const [studentNumberError, setStudentNumberError] = useState('');
  const [selectedCollegeId, setSelectedCollegeId] = useState('');

  // Debug the current form state when it changes
  useEffect(() => {
    debugStudentForm(formData, selectedCollegeId, availableDepartments, availablePrograms);
  }, [formData, selectedCollegeId, availableDepartments, availablePrograms]);

  // Initialize form with student data if editing
  useEffect(() => {
    if (student && student.college) {
      // Find the college by name
      const selectedCollege = colleges.find(c => c.name === student.college);
      
      if (selectedCollege) {
        console.log('Found college for editing:', selectedCollege);
        
        // Store the selected college ID for the dropdown
        setSelectedCollegeId(selectedCollege.id.toString());
        
        // Set available departments from the selected college
        setAvailableDepartments(selectedCollege.departments || []);
        
        // If department is set, load available programs
        if (student.department) {
          setAvailablePrograms(availablePrograms[student.department] || []);
        }
      } else {
        console.warn('Could not find college with name:', student.college);
        console.log('Available colleges:', colleges);
      }
    }
  }, [student, colleges, availablePrograms]);

  // Handle college selection
  const handleCollegeChange = async (e) => {
    const collegeId = e.target.value;
    setSelectedCollegeId(collegeId);
    
    if (!collegeId) {
      setFormData(prev => ({
        ...prev,
        college: '',
        department: '',
        program: ''
      }));
      setAvailableDepartments([]);
      setAvailablePrograms([]);
      return;
    }
    
    // Find selected college object
    const selectedCollege = colleges.find(
      (college) => college.id.toString() === collegeId.toString()
    );
    
    if (selectedCollege) {
      setFormData(prev => ({
        ...prev,
        college: selectedCollege.name,
        department: '',
        program: ''
      }));
      
      try {
        // Fetch departments for the selected college
        const departments = await getDepartmentsByCollege(collegeId);
        setAvailableDepartments(departments.map(dept => ({
          id: dept.department_id,
          name: dept.dept_name
        })));
      } catch (error) {
        console.error('Error fetching departments:', error);
        setAvailableDepartments([]);
      }
    }
    
    setAvailablePrograms([]);
  };

  // Handle department selection
  const handleDepartmentChange = async (e) => {
    const departmentId = e.target.value;
    const selectedDepartment = availableDepartments.find(dept => dept.id.toString() === departmentId);
    
    if (!departmentId || !selectedDepartment) {
      setFormData(prev => ({
        ...prev,
        department: '',
        program: '',
        programId: null
      }));
      setAvailablePrograms([]);
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      department: selectedDepartment.name,
      program: '',
      programId: null
    }));
    
    try {
      // Fetch programs for the selected department
      const programs = await getProgramsByDepartment(departmentId);
      const formattedPrograms = programs.map(prog => ({
        id: prog.program_id,
        name: prog.program_name
      }));
      setAvailablePrograms(formattedPrograms);
    } catch (error) {
      console.error('Error fetching programs:', error);
      setAvailablePrograms([]);
    }
  };

  // Handle program selection
  const handleProgramChange = (e) => {
    const programName = e.target.value;
    const selectedProgram = availablePrograms.find(p => p.name === programName);
    
    if (!selectedProgram) {
      setFormData(prev => ({
        ...prev,
        program: '',
        programId: null
      }));
      return;
    }
    
    // Ensure we have a valid program ID
    if (!selectedProgram.id) {
      console.error('Selected program has no ID:', selectedProgram);
      toast.error('Invalid program selected');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      program: programName,
      programId: selectedProgram.id
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate student number format (10 digits starting with 24)
    if (formData.studentNumber) {
      const studentNumberRegex = /^24\d{8}$/;
      if (!studentNumberRegex.test(formData.studentNumber)) {
        setStudentNumberError('Student Number must be 10 digits starting with 24 (e.g., 2400725967)');
      return;
    }
    
      // Convert to number and validate range
      const studentNumber = parseInt(formData.studentNumber);
      if (isNaN(studentNumber)) {
        setStudentNumberError('Student Number must be a valid number');
        return;
      }
      
      // The number 2400725967 is within the valid range for a 32-bit integer
      // so we don't need the range check anymore
    }
    
    // Validate program ID
    if (!formData.programId) {
      toast.error('Please select a valid program');
      return;
    }
    
    console.log('Submitting form data:', formData);
    
    // Check if all required fields are filled
    const requiredFields = ['name', 'regNumber', 'email', 'college', 'department', 'program', 'programId', 'year', 'semester', 'status'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      console.warn('Missing required fields:', missingFields);
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    onSave(formData);
  };

  // Initialize a default set of departments if none are loaded after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (selectedCollegeId && availableDepartments.length === 0) {
        console.warn('No departments loaded after timeout, using defaults');
        
        // Default departments for fallback
        const defaultDepartments = [
          'Computer Science',
          'Information Technology',
          'Software Engineering', 
          'Data Science',
          'Information Systems'
        ];
        
        setAvailableDepartments(defaultDepartments.map(dept => ({
          id: Math.random().toString(36).substr(2, 9),
          name: dept
        })));
      }
    }, 1000); // Wait 1 second

    return () => clearTimeout(timer);
  }, [selectedCollegeId, availableDepartments]);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">{student ? 'Edit Student' : 'Add New Student'}</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-500" disabled={loading}>
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
              <label className="block text-sm font-medium text-gray-700">Student Number</label>
              <input
                type="text"
                value={formData.studentNumber}
                onChange={(e) => {
                  setStudentNumberError('');
                  setFormData({ ...formData, studentNumber: e.target.value });
                }}
                className={`mt-1 block w-full border ${studentNumberError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
                required
                placeholder="e.g., 2400756789"
              />
              {studentNumberError && (
                <p className="mt-1 text-sm text-red-600">{studentNumberError}</p>
              )}
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
              <label className="block text-sm font-medium text-gray-700">College</label>
              <select
                value={selectedCollegeId || ''}
                onChange={handleCollegeChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              >
                <option value="">Select College</option>
                {colleges.map(college => (
                  <option key={college.id} value={college.id}>
                    {college.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <select
                value={formData.department ? availableDepartments.find(d => d.name === formData.department)?.id : ''}
                onChange={handleDepartmentChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
                disabled={!selectedCollegeId}
              >
                    <option value="">Select Department</option>
                {availableDepartments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                        </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Program</label>
              <select
                value={formData.program}
                onChange={handleProgramChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
                disabled={!formData.department}
              >
                    <option value="">Select Program</option>
                {availablePrograms.map(prog => (
                  <option key={prog.id} value={prog.name}>
                    {prog.name}
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
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1e1e77] hover:bg-[#2e2ea7] flex items-center"
              disabled={loading}
            >
              {loading && <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />}
              {student ? 'Update Student' : 'Add Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Students; 