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
  getPrograms
} from '../../services/api';
import { toast } from 'react-toastify';
import { validateAcademicData, debugStudentForm, inspectProgramStructure } from '../../utils/academicDataDebugger';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [programsByDepartment, setProgramsByDepartment] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterProgram, setFilterProgram] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [filterSemester, setFilterSemester] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const years = ['all', '1', '2', '3', '4', '5'];
  const statuses = ['all', 'active', 'inactive', 'suspended'];

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
          setProgramsByDepartment(mockProgramsByDepartment);
          setPrograms(
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
        const departmentsByCollege = {};
        const programsByDept = {};
        
        console.log('Full programs data structure:', programsData);
        
        // Check if we have any programs
        if (programsData.length === 0) {
          console.warn('No program data available, using mock data');
          setColleges(mockColleges);
          setProgramsByDepartment(mockProgramsByDepartment);
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
        setPrograms(programsData);
        
        programsData.forEach(program => {
          // Check for different property names that might contain department name
          let departmentName = null;
          
          // Try to get department_name directly
          if (program.department_name) {
            departmentName = program.department_name;
          } 
          // Try to get from department object
          else if (program.department) {
            if (typeof program.department === 'object') {
              departmentName = program.department.dept_name;
            } else if (typeof program.department === 'string') {
              departmentName = program.department;
            } else if (typeof program.department === 'number') {
              // We have a department ID but not a name - will need to handle this
              console.log('Found department by ID only:', program.department);
            }
          }
          
          // Try to get college ID
          let collegeId = null;
          
          if (typeof program.college === 'number') {
            collegeId = program.college;
          } else if (program.college_id) {
            collegeId = program.college_id;
          } else if (program.college && typeof program.college === 'object' && program.college.college_id) {
            collegeId = program.college.college_id;
          }
          
          // Make sure we have valid data
          if (!collegeId || !departmentName) {
            console.warn('Program missing required data:', program);
            return;
          }
          
          // Add department to college's department list
          if (!departmentsByCollege[collegeId]) {
            departmentsByCollege[collegeId] = new Set();
          }
          departmentsByCollege[collegeId].add(departmentName);
          
          // Add program to department's program list
          if (!programsByDept[departmentName]) {
            programsByDept[departmentName] = [];
          }
          programsByDept[departmentName].push(program.program_name || program.name);
        });
        
        // If we didn't find any departments, use mock data
        if (Object.keys(departmentsByCollege).length === 0) {
          console.warn('No departments could be extracted from program data, using mock data');
          setColleges(mockColleges);
          setProgramsByDepartment(mockProgramsByDepartment);
          setLoading(false);
          return;
        }
        
        // Log all departments by college before creating final structure
        console.log('Departments by college (raw):', departmentsByCollege);
        
        // Update colleges with their departments
        const collegesWithDepartments = formattedColleges.map(college => {
          const depts = departmentsByCollege[college.id] 
            ? Array.from(departmentsByCollege[college.id])
            : [];
            
          console.log(`College ${college.name} (ID: ${college.id}) has departments:`, depts);
          
          // If this college has no departments, try to get them from mock data
          if (depts.length === 0) {
            const mockCollege = mockColleges.find(c => 
              c.name.toLowerCase().includes(college.name.toLowerCase()) || 
              college.name.toLowerCase().includes(c.name.toLowerCase())
            );
            
            if (mockCollege) {
              console.log(`Using mock departments for college ${college.name}:`, mockCollege.departments);
              return {
                ...college,
                departments: mockCollege.departments
              };
            }
          }
          
          return {
            ...college,
            departments: depts
          };
        });
        
        console.log('Final colleges with departments:', collegesWithDepartments);
        console.log('Programs by department:', programsByDept);
        
        // If we didn't extract any programs by department, use mock data
        if (Object.keys(programsByDept).length === 0) {
          console.warn('No programs by department could be extracted, using mock data');
          setProgramsByDepartment(mockProgramsByDepartment);
        } else {
          setProgramsByDepartment(programsByDept);
        }
        
        // Validate the academic data structure
        validateAcademicData(collegesWithDepartments, programsData, programsByDept);
        
        setColleges(collegesWithDepartments);
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
      
      // Transform API data to match our component's expected format
      const formattedStudents = data.map(student => ({
        id: student.student_id,
        name: student.user_details.full_name,
        studentNumber: student.student_number,
        regNumber: student.registration_number,
        email: student.user_details.email,
        phone: student.user_details?.phone || 'N/A',
        program: student.program_name,
        college: student.college_name,
        department: student.department_name,
        year: student.year_level.toString(),
        semester: student.semester_in_year.toString(),
        status: student.enrollment_status,
        lastLogin: student.user_details?.last_login || 'Never'
      }));
      
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
    setShowAddForm(true);
    setEditingStudent(null);
  };

  const handleSaveStudent = async (studentData) => {
    try {
      if (editingStudent) {
        // Update existing student
        setLoading(true);
        const updatedStudent = await updateStudent(editingStudent.id, studentData);
        
        setStudents(students.map(student => 
          student.id === editingStudent.id ? { 
            id: updatedStudent.student_id,
            name: updatedStudent.user_details.full_name,
            studentNumber: updatedStudent.student_number,
            regNumber: updatedStudent.registration_number,
            email: updatedStudent.user_details.email,
            program: updatedStudent.program_name,
            college: updatedStudent.college_name,
            department: updatedStudent.department_name,
            year: updatedStudent.year_level.toString(),
            semester: updatedStudent.semester_in_year.toString(),
            status: updatedStudent.enrollment_status,
            lastLogin: updatedStudent.user_details?.last_login || 'Never'
          } : student
        ));
        
        setEditingStudent(null);
        toast.success('Student updated successfully');
      } else {
        // Add new student
        setLoading(true);
        console.log('Creating new student with data:', studentData);
        
        const newStudent = await createStudent(studentData);
        console.log('API response for new student:', newStudent);
        
        const formattedNewStudent = {
          id: newStudent.student_id,
          name: newStudent.user_details.full_name,
          studentNumber: newStudent.student_number,
          regNumber: newStudent.registration_number,
          email: newStudent.user_details.email,
          program: newStudent.program_name,
          college: newStudent.college_name,
          department: newStudent.department_name,
          year: newStudent.year_level.toString(),
          semester: newStudent.semester_in_year.toString(),
          status: newStudent.enrollment_status,
          lastLogin: 'Never'
        };
        
        setStudents([...students, formattedNewStudent]);
        setShowAddForm(false);
        toast.success('Student added successfully');
      }
    } catch (err) {
      console.error('Error saving student:', err);
      console.error('Error details:', err.response?.data);
      toast.error(err.response?.data?.error || 'Failed to save student');
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
          {programs.map(program => (
            <option key={program.program_id} value={program.program_name}>
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
          loading={loading}
          programs={programs}
        />
      )}

      {/* Loading State */}
      {loading && !showAddForm && !editingStudent && (
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

const StudentForm = ({ student, onSave, onCancel, colleges, years, semesters, programsByDepartment, loading, programs }) => {
  const [formData, setFormData] = useState({
    name: student?.name || '',
    regNumber: student?.regNumber || '',
    studentNumber: student?.studentNumber || '',
    email: student?.email || '',
    program: student?.program || '',
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
          setAvailablePrograms(programsByDepartment[student.department] || []);
        }
      } else {
        console.warn('Could not find college with name:', student.college);
        console.log('Available colleges:', colleges);
      }
    }
  }, [student, colleges, programsByDepartment]);

  // Handle college selection
  const handleCollegeChange = (e) => {
    const collegeId = e.target.value;
    setSelectedCollegeId(collegeId);
    
    console.log('Selected college ID:', collegeId);
    
    if (!collegeId) {
      // Reset everything if no college is selected
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
    
    console.log('Selected college object:', selectedCollege);
    
    if (selectedCollege) {
      // Set college name in form data
      setFormData(prev => ({
        ...prev,
        college: selectedCollege.name,
        department: '',
        program: ''
      }));
      
      // Log detailed information about college departments
      console.log('College object structure:', Object.keys(selectedCollege));
      console.log('College departments type:', typeof selectedCollege.departments);
      console.log('College departments value:', JSON.stringify(selectedCollege.departments));
      
      // Make sure departments is always an array
      let departmentsToUse = [];
      
      if (selectedCollege.departments && Array.isArray(selectedCollege.departments)) {
        departmentsToUse = selectedCollege.departments.filter(d => d);
      }
      
      console.log('Filtered departments to use:', departmentsToUse);
      
      // If we have departments, set them
      if (departmentsToUse.length > 0) {
        console.log(`Setting ${departmentsToUse.length} departments for college:`, selectedCollege.name);
        
        // Clean up any potential duplicates or formatting issues
        const cleanedDepartments = departmentsToUse
          .filter(dept => dept && typeof dept === 'string')
          .map(dept => {
            // Handle common formatting issues like "Department of Computer Science"
            if (dept.toLowerCase().startsWith('department of ')) {
              return dept.substring('department of '.length);
            }
            return dept;
          });
        
        console.log('Final cleaned departments:', cleanedDepartments);
        setAvailableDepartments(cleanedDepartments);
      } else {
        console.warn('Selected college has no departments or empty array:', selectedCollege.name);
        
        // Fallback: Use a hardcoded list of departments for testing
        const fallbackDepartments = [
          'Computer Science',
          'Information Technology',
          'Software Engineering',
          'Data Science',
          'Artificial Intelligence'
        ];
        
        console.log('Using fallback departments:', fallbackDepartments);
        setAvailableDepartments(fallbackDepartments);
      }
    } else {
      console.warn('College not found with ID:', collegeId);
      setFormData(prev => ({
        ...prev,
        college: '',
        department: '',
        program: ''
      }));
      setAvailableDepartments([]);
    }
    
    // Reset programs when college changes
    setAvailablePrograms([]);
  };

  // Handle department selection
  const handleDepartmentChange = (e) => {
    const department = e.target.value;
    console.log('Selected department:', department);
    
    if (!department) {
      // Reset program if no department is selected
      setFormData(prev => ({
        ...prev,
        department: '',
        program: ''
      }));
      setAvailablePrograms([]);
      return;
    }
    
    // Set department in form data
    setFormData(prev => ({
      ...prev,
      department: department,
      program: ''
    }));
    
    // Create variations of the department name to try
    const departmentVariations = [
      department,
      `Department of ${department}`,
      department.toLowerCase(),
      `Department of ${department}`.toLowerCase()
    ];
    
    // Try to find programs using different variations of the department name
    let foundPrograms = [];
    
    for (const deptVariation of departmentVariations) {
      if (programsByDepartment[deptVariation] && programsByDepartment[deptVariation].length > 0) {
        foundPrograms = programsByDepartment[deptVariation];
        console.log(`Found programs using department variation "${deptVariation}":`, foundPrograms);
        break;
      }
    }
    
    if (foundPrograms.length > 0) {
      setAvailablePrograms(foundPrograms);
      return;
    }
    
    // If still no programs, search through programs array directly
    const programsForDepartment = programs
      .filter(program => {
        // Check all variations of department name
        const programDept = program.department_name || 
                          (program.department && typeof program.department === 'object' ? program.department.dept_name : program.department);
                          
        if (!programDept) return false;
        
        // Try different variations
        return departmentVariations.some(variation => 
          programDept.toLowerCase().includes(variation.toLowerCase())
        );
      })
      .map(program => program.program_name || program.name);
    
    // Remove duplicates
    const uniquePrograms = [...new Set(programsForDepartment)];
    
    if (uniquePrograms.length > 0) {
      console.log('Found programs by searching program objects directly:', uniquePrograms);
      setAvailablePrograms(uniquePrograms);
      return;
    }
    
    console.warn('No programs found for department:', department);
    
    // Fallback: Use hardcoded programs for testing
    const fallbackPrograms = {
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
      'Artificial Intelligence': [
        'Bachelor of Artificial Intelligence',
        'Master of Artificial Intelligence'
      ]
    };
    
    // Try variations of department name with fallback
    for (const deptVariation of departmentVariations) {
      if (fallbackPrograms[deptVariation]) {
        console.log(`Using fallback programs for department variation "${deptVariation}":`);
        setAvailablePrograms(fallbackPrograms[deptVariation]);
        return;
      }
    }
    
    // Last resort - try matching parts of department name
    for (const [fallbackDept, fallbackProgs] of Object.entries(fallbackPrograms)) {
      if (department.toLowerCase().includes(fallbackDept.toLowerCase()) || 
          fallbackDept.toLowerCase().includes(department.toLowerCase())) {
        console.log(`Using partial match fallback programs for "${fallbackDept}":`);
        setAvailablePrograms(fallbackProgs);
        return;
      }
    }
    
    setAvailablePrograms([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate that student number is an integer
    if (formData.studentNumber && !/^\d+$/.test(formData.studentNumber)) {
      setStudentNumberError('Student Number must contain only integers');
      return;
    }
    
    console.log('Submitting form data:', formData);
    
    // Check if all required fields are filled
    const requiredFields = ['name', 'regNumber', 'email', 'college', 'department', 'program', 'year', 'semester', 'status'];
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
        
        setAvailableDepartments(defaultDepartments);
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
                  <option key={college.id} value={college.id.toString()}>
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
                disabled={selectedCollegeId === ''}
              >
                {availableDepartments.length === 0 ? (
                  <option value="">No departments available</option>
                ) : (
                  <>
                    <option value="">Select Department</option>
                    {availableDepartments.map((dept, index) => {
                      // Format the display text - remove "Department of" if present
                      let displayName = dept;
                      if (dept && typeof dept === 'string' && dept.toLowerCase().startsWith('department of ')) {
                        displayName = dept.substring('department of '.length);
                      }
                      
                      // Log the value being set
                      console.log(`Department option ${index}:`, { original: dept, display: displayName });
                      
                      return (
                        <option key={dept || index} value={displayName}>
                          {displayName || 'Unknown Department'}
                        </option>
                      );
                    })}
                  </>
                )}
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
                {availablePrograms.length === 0 ? (
                  <option value="">No programs available</option>
                ) : (
                  <>
                    <option value="">Select Program</option>
                    {availablePrograms.map(program => (
                      <option key={program} value={program}>
                        {program}
                      </option>
                    ))}
                  </>
                )}
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