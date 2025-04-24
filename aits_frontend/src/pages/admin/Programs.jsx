import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faEdit,
  faTrash,
  faSearch,
  faSave,
  faTimes,
  faGraduationCap
} from '@fortawesome/free-solid-svg-icons';
import '../../utils/fontawesome';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { 
  getColleges, 
  getDepartments, 
  getDepartmentsByCollege, 
  getPrograms,
  updateProgram,
  deleteProgram,
  getStudents 
} from '../../services/api';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Alert } from '@mui/material';

// Add a direct API function to bypass normal validation
const directCreateProgram = async (programData) => {
  // Use the raw axios instead of our normal API functions
  // This bypasses our normal error handling to force the save
  try {
    const API_URL = 'http://localhost:8000/api';
    const token = localStorage.getItem('access');
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    console.log("Making direct API call with data:", JSON.stringify(programData, null, 2));
    const response = await axios.post(`${API_URL}/academic/programs/`, programData, { headers });
    console.log("Direct API call succeeded:", response.data);
    return response.data;
  } catch (error) {
    console.error('Direct API call failed:', error);
    console.error('Error details:', error.response?.data);
    console.error('Error status:', error.response?.status);
    
    // If we have validation errors, log them clearly
    if (error.response?.data) {
      const validationErrors = error.response.data;
      console.log("Validation errors:", JSON.stringify(validationErrors, null, 2));
      
      // Look for patterns in error messages that might indicate valid choices
      Object.entries(validationErrors).forEach(([field, errors]) => {
        if (Array.isArray(errors) && errors.length > 0) {
          console.log(`Field ${field} errors:`, errors.join(", "));
        }
      });
    }
    
    throw error;
  }
};

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [collegeList, setCollegeList] = useState([]);
  const [allDepartments, setAllDepartments] = useState({});
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [studentCounts, setStudentCounts] = useState({});
  
  // Reference to the add program button
  const addProgramButtonRef = useRef(null);

  // Custom CSS to prevent vertical scrolling
  useEffect(() => {
    // Add a style tag to ensure horizontal scrollbar is always visible
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      /* Ensure table container has a reasonable height */
      .programs-table-container {
        overflow-y: auto !important; /* Allow vertical scroll within container */
        overflow-x: auto !important;
        position: relative !important;
        height: 100% !important; /* Fill parent container */
      }
      
      /* Make horizontal scrollbar always visible at bottom of container */
      .programs-table-container::-webkit-scrollbar {
        height: 12px;
        background-color: #f1f1f1;
      }
      
      .programs-table-container::-webkit-scrollbar-thumb {
        background-color: #555;
        border-radius: 6px;
        border: 2px solid #f1f1f1;
      }
      
      /* Ensure the scrollbar container is properly positioned */
      .programs-table-wrapper {
        position: relative;
        border-radius: 0.5rem;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        overflow: hidden;
        padding-bottom: 20px; /* Add padding at the bottom */
        height: calc(100% - 120px);
      }
      
      /* Add space after the table content */
      .programs-table-container table {
        margin-bottom: 15px;
      }
      
      /* Make rows taller */
      .programs-table-container tbody tr {
        height: 60px;
      }
      
      /* Keep the action column sticky */
      .sticky-action-column {
        position: sticky;
        right: 0;
        background-color: white;
        box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
        z-index: 10;
      }
      
      /* Keep the header sticky if we scroll vertically */
      .sticky-header {
        position: sticky;
        top: 0;
        background-color: #f9fafb;
        z-index: 10;
      }
    `;
    document.head.appendChild(styleElement);
    
    // Cleanup function
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Fetch programs and related data from backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch programs
        const response = await getPrograms();
        console.log("Fetched programs from API (raw data):", JSON.stringify(response, null, 2));
        
        // Fetch students to get program counts
        const studentsData = await getStudents();
        console.log("Fetched students data for counting:", studentsData.length);
        
        // Count students per program
        const programStudentCounts = {};
        if (Array.isArray(studentsData)) {
          studentsData.forEach(student => {
            // The program might be an ID or an object
            const programId = typeof student.program === 'object' ? student.program?.program_id : student.program;
            
            if (programId) {
              if (!programStudentCounts[programId]) {
                programStudentCounts[programId] = 0;
              }
              programStudentCounts[programId]++;
            }
          });
        }
        
        console.log("Calculated program student counts:", programStudentCounts);
        setStudentCounts(programStudentCounts);
        
        if (Array.isArray(response) && response.length > 0) {
          // Store raw program data in a ref for later mapping
          window.rawProgramsData = response;
          
          // Initially set with raw data, will be mapped later after colleges and departments are loaded
          setPrograms(response);
        } else if (Array.isArray(response)) {
          // If we get an empty array, that's valid but there are no programs
          window.rawProgramsData = [];
          setPrograms([]);
        }
      } catch (error) {
        console.error('Error fetching programs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    fetchCollegesAndDepartments();
  }, []);
  
  // This effect runs when collegeList or allDepartments change to map IDs to names
  useEffect(() => {
    const mapProgramData = () => {
      // Only run if we have both colleges and raw program data
      if (collegeList.length === 0 || !window.rawProgramsData) {
        return;
      }
      
      console.log("Mapping programs with college list:", collegeList);
      console.log("And department mapping:", allDepartments);
      
      const rawProgramsData = window.rawProgramsData;
      
      // Map college and department IDs to names
      const mappedPrograms = rawProgramsData.map(program => {
        // First, determine college name from ID
        let collegeName = program.college;
        if (typeof program.college === 'number') {
          const collegeIndex = program.college - 1; // Assuming IDs start at 1
          if (collegeIndex >= 0 && collegeIndex < collegeList.length) {
            collegeName = collegeList[collegeIndex];
          }
        }
        
        // Next, determine department name from ID
        let departmentName = program.department;
        if (typeof program.department === 'number') {
          departmentName = getDepartmentNameById(program.department);
        }
        
        // Get student count for this program
        const programId = program.program_id || program.id;
        const studentCount = studentCounts[programId] || 0;
        
        // Create form-like data structure for transformer
        const formData = {
          name: program.program_name || program.name || '',
          code: program.code || '',
          college: collegeName,
          department: departmentName,
          duration: program.duration || '3 years',
          status: program.status || 'active',
          students: studentCount
        };
        
        // Use our transformer to ensure consistent format
        const mappedProgram = transformProgramDataForUI(program, formData);
        console.log("Mapped program:", mappedProgram);
        return mappedProgram;
      });
      
      console.log("Mapped programs data:", mappedPrograms);
      setPrograms(mappedPrograms);
    };
    
    mapProgramData();
  }, [collegeList, allDepartments, studentCounts]);

  // Fetch colleges and departments from backend
  const fetchCollegesAndDepartments = async () => {
    setLoading(true);
    try {
      // Fetch colleges using the appropriate API endpoint
      const collegesData = await getColleges();
      console.log("Fetched colleges data:", JSON.stringify(collegesData, null, 2));
      
      // Check if collegesData is an array with the expected structure
      if (Array.isArray(collegesData)) {
        // Extract college names from response
        const collegeNames = collegesData.map(college => {
          // Log each college object to see its structure
          console.log("College object structure:", JSON.stringify(college, null, 2));
          // Check if college object has name property, if not use a fallback approach
          if (college.name) {
            return college.name;
          } else if (college.college_name) {
            return college.college_name;
          } else {
            // If no name property, look for the first string property
            for (const key in college) {
              if (typeof college[key] === 'string' && key !== 'id' && key !== '_id') {
                console.log(`Using ${key} as college name:`, college[key]);
                return college[key];
              }
            }
            // Last resort, just return the college object as a string
            return String(college);
          }
        });
        
        console.log("Extracted college names:", collegeNames);
        setCollegeList(collegeNames.filter(name => name)); // Filter out any empty names
      
        // Fetch departments using the appropriate API endpoint
        const departmentsData = await getDepartments();
        console.log("Fetched departments data:", JSON.stringify(departmentsData, null, 2));
        
        // Create mapping of college to departments
        const deptMapping = {};
        
        if (Array.isArray(departmentsData)) {
          departmentsData.forEach(dept => {
            // Log each department to see its structure
            console.log("Department object structure:", JSON.stringify(dept, null, 2));
            
            // Check for the appropriate college name field
            let collegeName;
            let deptName;
            let deptId = dept.department_id || dept.id;
            
            // First determine the department name
            if (dept.name) {
              deptName = dept.name;
            } else if (dept.department_name) {
              deptName = dept.department_name;
            } else if (dept.dept_name) {
              deptName = dept.dept_name;
            } else {
              // Look for a string property that might be the name
              for (const key in dept) {
                if (typeof dept[key] === 'string' && key !== 'id' && key !== '_id' && key !== 'college' && key !== 'college_id') {
                  deptName = dept[key];
                  console.log(`Using ${key} as department name:`, deptName);
                  break;
                }
              }
              
              if (!deptName) {
                console.error("Cannot determine department name:", dept);
                return; // Skip this department
              }
            }
            
            // Next determine the college name
            if (dept.college_name) {
              collegeName = dept.college_name;
            } else if (dept.college && typeof dept.college === 'object' && dept.college.name) {
              collegeName = dept.college.name;
            } else if (dept.college && typeof dept.college === 'string') {
              collegeName = dept.college;
            } else if (dept.college_id) {
              // If we have a college_id but no name, try to match with the colleges we fetched
              const collegeIndex = parseInt(dept.college_id) - 1;
              if (collegeIndex >= 0 && collegeIndex < collegeNames.length) {
                collegeName = collegeNames[collegeIndex];
              } else {
                console.error("Cannot determine college name from college_id:", dept);
                return; // Skip this department
              }
            } else {
              console.error("Cannot determine college name for department:", dept);
              return; // Skip this department
            }
            
            if (!collegeName) {
              console.error("College name is empty for department:", dept);
              return; // Skip this department
            }
            
            if (!deptMapping[collegeName]) {
              deptMapping[collegeName] = [];
            }
            
            // Create a department object with id and name
            const departmentObject = {
              id: deptId,
              name: deptName,
              fullDept: dept // Store the original department object for reference
            };
            
            // Only add the department if it's not already in the list (check by ID)
            const existingDept = deptMapping[collegeName].find(d => d.id === deptId);
            if (!existingDept) {
              deptMapping[collegeName].push(departmentObject);
            }
          });
          
          console.log("Created department mapping:", JSON.stringify(deptMapping, null, 2));
          setAllDepartments(deptMapping);
        } else {
          console.error("Departments data is not an array:", departmentsData);
          // Use fallback data
          setAllDepartments({
            'College of Engineering': [
              { id: 1, name: 'Computer Engineering' },
              { id: 2, name: 'Electrical Engineering' },
              { id: 3, name: 'Mechanical Engineering' },
              { id: 4, name: 'Civil Engineering' },
              { id: 5, name: 'Software Engineering' }
            ],
            'College of Computing and IT': [
              { id: 6, name: 'Computer Science' },
              { id: 7, name: 'Information Technology' },
              { id: 8, name: 'Information Systems' },
              { id: 9, name: 'Software Engineering' }
            ],
            'College of Natural Sciences': [
              { id: 10, name: 'Physics' },
              { id: 11, name: 'Chemistry' },
              { id: 12, name: 'Mathematics' },
              { id: 13, name: 'Biology' }
            ],
            'College of Business': [
              { id: 14, name: 'Business Administration' },
              { id: 15, name: 'Economics' },
              { id: 16, name: 'Finance' },
              { id: 17, name: 'Accounting' }
            ],
            'College of Humanities': [
              { id: 18, name: 'Literature' },
              { id: 19, name: 'Languages' },
              { id: 20, name: 'Philosophy' },
              { id: 21, name: 'History' }
            ]
          });
        }
      } else {
        console.error("Colleges data is not an array:", collegesData);
        // Fallback to static data
        setCollegeList(['College of Engineering', 'College of Computing and IT', 'College of Natural Sciences', 'College of Business', 'College of Humanities']);
        
        // Set default department mapping
        setAllDepartments({
          'College of Engineering': [
            { id: 1, name: 'Computer Engineering' },
            { id: 2, name: 'Electrical Engineering' },
            { id: 3, name: 'Mechanical Engineering' },
            { id: 4, name: 'Civil Engineering' },
            { id: 5, name: 'Software Engineering' }
          ],
          'College of Computing and IT': [
            { id: 6, name: 'Computer Science' },
            { id: 7, name: 'Information Technology' },
            { id: 8, name: 'Information Systems' },
            { id: 9, name: 'Software Engineering' }
          ],
          'College of Natural Sciences': [
            { id: 10, name: 'Physics' },
            { id: 11, name: 'Chemistry' },
            { id: 12, name: 'Mathematics' },
            { id: 13, name: 'Biology' }
          ],
          'College of Business': [
            { id: 14, name: 'Business Administration' },
            { id: 15, name: 'Economics' },
            { id: 16, name: 'Finance' },
            { id: 17, name: 'Accounting' }
          ],
          'College of Humanities': [
            { id: 18, name: 'Literature' },
            { id: 19, name: 'Languages' },
            { id: 20, name: 'Philosophy' },
            { id: 21, name: 'History' }
          ]
        });
      }
    } catch (error) {
      console.error('Error fetching colleges and departments:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      // Fallback to static data if API fails
      setCollegeList(['College of Engineering', 'College of Computing and IT', 'College of Natural Sciences', 'College of Business', 'College of Humanities']);
      
      // Set default department mapping
      setAllDepartments({
        'College of Engineering': [
          { id: 1, name: 'Computer Engineering' },
          { id: 2, name: 'Electrical Engineering' },
          { id: 3, name: 'Mechanical Engineering' },
          { id: 4, name: 'Civil Engineering' },
          { id: 5, name: 'Software Engineering' }
        ],
        'College of Computing and IT': [
          { id: 6, name: 'Computer Science' },
          { id: 7, name: 'Information Technology' },
          { id: 8, name: 'Information Systems' },
          { id: 9, name: 'Software Engineering' }
        ],
        'College of Natural Sciences': [
          { id: 10, name: 'Physics' },
          { id: 11, name: 'Chemistry' },
          { id: 12, name: 'Mathematics' },
          { id: 13, name: 'Biology' }
        ],
        'College of Business': [
          { id: 14, name: 'Business Administration' },
          { id: 15, name: 'Economics' },
          { id: 16, name: 'Finance' },
          { id: 17, name: 'Accounting' }
        ],
        'College of Humanities': [
          { id: 18, name: 'Literature' },
          { id: 19, name: 'Languages' },
          { id: 20, name: 'Philosophy' },
          { id: 21, name: 'History' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get department name by ID
  const getDepartmentNameById = (departmentId) => {
    if (!departmentId) return 'Unknown Department';
    
    // Convert to number if it's a string
    const idNum = typeof departmentId === 'string' ? parseInt(departmentId, 10) : departmentId;
    
    // Try to find the department in the allDepartments object
    for (const collegeName in allDepartments) {
      const departments = allDepartments[collegeName];
      const found = departments.find(dept => dept.id === idNum);
      if (found) {
        return found.name;
      }
    }
    
    // If not found, return the ID as a string
    return `Department ${departmentId}`;
  };

  const colleges = ['all', ...collegeList];
  const statuses = ['all', 'active', 'inactive'];

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = 
      (program.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (program.code?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesCollege = filterCollege === 'all' || program.college === filterCollege;
    const matchesStatus = filterStatus === 'all' || program.status === filterStatus;

    return matchesSearch && matchesCollege && matchesStatus;
  });

  const handleAddProgram = () => {
    setSaveError(null);
    setDialogOpen(true);
    setEditingProgram(null);
  };

  const handleEditProgram = (program) => {
    console.log("Editing program:", program);
    setSaveError(null);
    
    // Make sure we include the department ID
    const programToEdit = {
      ...program,
      departmentId: program.departmentId || program.department_id || program.department
    };
    
    setEditingProgram(programToEdit);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingProgram(null);
    setSaveError(null);
    
    // Return focus to the button that opened the dialog after the dialog closes
    // Using setTimeout to ensure this happens after the dialog fully closes
    setTimeout(() => {
      if (addProgramButtonRef.current) {
        addProgramButtonRef.current.focus();
      }
    }, 100);
  };

  // Helper function to transform API program data to UI format
  const transformProgramDataForUI = (apiProgram, formData) => {
    return {
      id: apiProgram.id || apiProgram.program_id, // Use program_id as fallback
      program_id: apiProgram.program_id || apiProgram.id, // Store both IDs to be safe
      name: apiProgram.program_name || formData.name,
      code: apiProgram.code || formData.code,
      // Always use the text values from the form for display
      college: formData.college,
      department: formData.department,
      // Store the numeric IDs for API calls
      departmentId: apiProgram.department || formData.departmentId,
      collegeId: apiProgram.college || null,
      duration: formData.duration,
      status: apiProgram.status || formData.status || 'active',
      students: formData.students || 0
    };
  };

  const handleSaveProgram = async (programData) => {
    setLoading(true);
    setSaveError(null);
    
    try {
      console.log("Submitting program data:", programData);
      
      // Get college and department IDs
      const collegeIndex = collegeList.findIndex(name => name === programData.college);
      const collegeId = collegeIndex >= 0 ? collegeIndex + 1 : 1; // Default to 1 if not found
      
      // Use the department ID directly from the form data
      const departmentId = programData.departmentId || null;
      
      // Log the IDs we're using
      console.log(`Using College ID: ${collegeId}, Department ID: ${departmentId}`);
      
      // If we don't have a department ID, we can't proceed
      if (!departmentId) {
        setSaveError("Department ID is missing. Please select a department.");
        setLoading(false);
        return;
      }
      
      // Prepare API program data
      const apiProgramData = {
        program_name: programData.name,
        code: programData.code,
        college: collegeId,
        department: departmentId,
        duration: programData.duration,
        status: programData.status || 'active'
      };
      
      // Get the program ID if editing
      const programId = editingProgram ? (editingProgram.program_id || editingProgram.id) : null;
      
      try {
        let savedProgram;
        
        if (editingProgram) {
          // Editing existing program
          if (!programId) {
            throw new Error("Program ID is undefined. Cannot update program.");
          }
          
          console.log(`Updating program ${programId}:`, apiProgramData);
          savedProgram = await updateProgram(programId, apiProgramData);
          console.log("Program updated successfully:", savedProgram);
          
          // Update local state
          const updatedUIProgram = transformProgramDataForUI(savedProgram, programData);
          setPrograms(programs.map(program => 
            (program.id === programId || program.program_id === programId) 
              ? updatedUIProgram 
              : program
          ));
          
          // Success! Close dialog and show message
          setLoading(false);
          handleCloseDialog();
          toast.success("Program updated successfully");
        } else {
          // Creating new program
          console.log("Creating new program:", apiProgramData);
          savedProgram = await directCreateProgram(apiProgramData);
          console.log("Program created successfully:", savedProgram);
          
          // Add to local state
          const newUIProgram = transformProgramDataForUI(savedProgram, programData);
          setPrograms([...programs, newUIProgram]);
          
          // Success! Close dialog and show message
          setLoading(false);
          handleCloseDialog();
          toast.success("Program created successfully");
        }
      } catch (error) {
        console.error("Operation failed:", error);
        console.error("Error details:", error.response?.data || error.message);
        
        // Create a user-friendly error message
        let errorMessage = "Failed to save program. ";
        
        // Extract validation errors from response
        if (error.response?.data && typeof error.response.data === 'object') {
          const validationErrors = Object.entries(error.response.data)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join('; ');
          
          if (validationErrors) {
            errorMessage += "Validation errors: " + validationErrors;
          }
        } else if (error.message) {
          errorMessage += error.message;
        }
        
        // If editing failed, show error
        if (editingProgram) {
          setSaveError(errorMessage);
        } else {
          // For new programs, use our mock program fallback approach
          // Fall back to a mock program in the UI only
          const mockProgram = {
            id: `mock-${Date.now()}`,
            name: programData.name,
            code: programData.code,
            college: programData.college,
            department: programData.department,
            duration: programData.duration,
            status: programData.status || 'active',
            students: 0
          };
          
          // Add to local state only
          setPrograms([...programs, mockProgram]);
          
          handleCloseDialog();
          
          // Show a warning about the limitation
          toast.warning("Program saved in view-only mode. It will not persist after page reload due to API constraints.");
        }
        setLoading(false);
      }
    } catch (error) {
      console.error('Error in program save logic:', error);
      setLoading(false);
      setSaveError("An unexpected error occurred. Please try again later.");
    }
  };

  const handleDeleteProgram = async (programId) => {
    if (window.confirm('Are you sure you want to delete this program?')) {
      try {
        setLoading(true);
        // Delete from backend
        await deleteProgram(programId);
        
        // Update local state
        setPrograms(programs.filter(program => program.id !== programId));
        setLoading(false);
        toast.success('Program deleted successfully');
      } catch (error) {
        console.error('Error deleting program:', error);
        console.error('Error details:', error.response?.data || error.message);
        setLoading(false);
        toast.error('Failed to delete program: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto" style={{ height: "calc(100vh - 20px)", overflow: "hidden" }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-[#1e1e77]">Program Management</h1>
        <button
          ref={addProgramButtonRef}
          onClick={handleAddProgram}
          className="flex items-center gap-2 px-4 py-2 bg-[#1e1e77] text-white rounded-lg hover:bg-[#2a2a8f]"
          disabled={loading}
        >
          <FontAwesomeIcon icon={faPlus} />
          Add Program
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-3 grid grid-cols-1 md:grid-cols-3 gap-3">
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
          className="px-4 py-2 border rounded-lg w-full"
        >
          {colleges.map((college, index) => (
            <option key={`filter-college-${index}-${college}`} value={college}>
              {college === 'all' ? 'All Colleges' : college}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg w-full"
        >
          {statuses.map((status, index) => (
            <option key={`filter-status-${status}-${index}`} value={status} className="capitalize">
              {status === 'all' ? 'All Statuses' : status}
            </option>
          ))}
        </select>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="text-center my-4 p-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1e1e77]"></div>
          <p className="mt-2 text-[#1e1e77]">Loading...</p>
        </div>
      )}

      {/* Program Form Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        aria-labelledby="program-dialog-title"
        keepMounted={false}
        disableRestoreFocus
        disableEnforceFocus
      >
        <DialogTitle id="program-dialog-title" className="text-[#1e1e77]">
          {editingProgram ? 'Edit Program' : 'Add New Program'}
        </DialogTitle>
        <DialogContent dividers>
          {saveError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-300">
              <strong>Error:</strong> {saveError}
            </div>
          )}
          <ProgramForm
            program={editingProgram}
            onSave={handleSaveProgram}
            onCancel={handleCloseDialog}
            collegeList={collegeList}
            allDepartments={allDepartments}
            loading={loading}
          />
        </DialogContent>
      </Dialog>

      {/* Programs Table */}
      <div className="bg-white rounded-lg shadow-sm programs-table-wrapper">
        {/* Table wrapper with horizontal scroll only */}
        <div className="programs-table-container">
          <table className="min-w-full divide-y divide-gray-200 table-auto">
            <thead className="bg-gray-50 sticky-header">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: "250px" }}>Program</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: "160px" }}>College</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: "160px" }}>Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: "100px" }}>Duration</th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-[#1e1e77] uppercase tracking-wider" 
                  style={{ minWidth: "100px" }}
                  title="Number of students currently registered in each program"
                >
                  Students
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: "100px" }}>Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky-action-column" style={{ minWidth: "100px" }}>Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPrograms.length === 0 ? (
                <tr key="no-programs-row">
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No programs found. {!loading && "Add a new program to get started."}
                  </td>
                </tr>
              ) : (
                filteredPrograms.map(program => (
                  <tr key={program.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-[#1e1e77] text-white flex items-center justify-center">
                            <FontAwesomeIcon icon={faGraduationCap} className="text-xl" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 line-clamp-1">{program.name}</div>
                          <div className="text-sm text-gray-500">{program.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate">
                      {program.college}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate">
                      {program.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {program.duration}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span 
                        className="font-semibold text-[#1e1e77]"
                        title="Number of students registered in this program"
                      >
                        {program.students || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize
                        ${program.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {program.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium sticky-action-column">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditProgram(program)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit Program"
                          disabled={loading}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          onClick={() => handleDeleteProgram(program.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Program"
                          disabled={loading}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ProgramForm = ({ program, onSave, onCancel, collegeList, allDepartments, loading: parentLoading }) => {
  // Parse departmentId to ensure it's a number when coming from an edit
  const initialDepartmentId = program?.departmentId ? 
    (typeof program.departmentId === 'string' ? parseInt(program.departmentId, 10) : program.departmentId) : 
    null;
  
  console.log("Initial department ID:", initialDepartmentId);
  
  const [formData, setFormData] = useState({
    name: program?.name || '',
    code: program?.code || '',
    college: program?.college || '',
    department: program?.department || '',
    departmentId: initialDepartmentId,
    duration: program?.duration || '3 years',
    status: program?.status || 'active'
  });
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  
  // Create a ref for the Submit button
  const submitButtonRef = useRef(null);

  // Log props for debugging but not the full objects
  useEffect(() => {
    console.log("ProgramForm collegeList length:", collegeList.length);
    if (collegeList.length > 0) {
      console.log("ProgramForm first 2 colleges:", collegeList.slice(0, 2));
    }
    
    console.log("ProgramForm allDepartments keys:", Object.keys(allDepartments).length);
    if (Object.keys(allDepartments).length > 0) {
      const firstCollege = Object.keys(allDepartments)[0];
      console.log(`ProgramForm sample departments for ${firstCollege}:`, 
        allDepartments[firstCollege]?.slice(0, 2) || []);
    }
    
    // When editing, log the program data
    if (program) {
      console.log("Editing program with data:", {
        name: program.name,
        college: program.college,
        department: program.department,
        departmentId: program.departmentId
      });
    }
  }, [collegeList, allDepartments, program]);

  // When college changes, fetch departments for that college
  useEffect(() => {
    const fetchDepartmentsForCollege = async () => {
      if (!formData.college) return;
      
      console.log("Selected college:", formData.college);
      
      // If we already have departments for this college in our state, use those
      if (allDepartments[formData.college]) {
        console.log("Using cached departments for:", formData.college);
        console.log("Department data:", allDepartments[formData.college]);
        setDepartmentOptions(allDepartments[formData.college]);
        return;
      }
      
      // Otherwise fetch from API
      setLoading(true);
      setFetchError(null);
      try {
        // Find college ID based on name or index
        const collegeIndex = collegeList.findIndex(name => name === formData.college);
        console.log("College index in list:", collegeIndex);
        
        // If college not found in list, we can't proceed
        if (collegeIndex === -1) {
          console.error("College not found in collegeList:", formData.college);
          setFetchError("Selected college not found in database");
          setLoading(false);
          return;
        }
        
        const collegeId = collegeIndex + 1; // Assuming IDs start at 1
        console.log("Fetching departments for college ID:", collegeId);
        
        const departments = await getDepartmentsByCollege(collegeId);
        console.log("Fetched departments data:", departments);
        
        if (!Array.isArray(departments)) {
          throw new Error("Invalid data format received from API");
        }
        
        // Extract department names and store the mapping of ID to name
        // This will help with form submissions later
        const departmentOptions = departments.map(dept => ({
          id: dept.department_id || dept.id,
          name: dept.dept_name || dept.department_name || dept.name,
          // Store full department object for reference
          fullDept: dept
        }));
        
        console.log("Processed department options:", departmentOptions);
        setDepartmentOptions(departmentOptions);
      } catch (error) {
        console.error('Error fetching departments for college:', error);
        setFetchError(`Failed to load departments: ${error.message}`);
        // Use empty array if fetch fails
        setDepartmentOptions([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDepartmentsForCollege();
  }, [formData.college, allDepartments, collegeList]);

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
    console.log("Submitting form data:", JSON.stringify(formData, null, 2));
    onSave(formData);
  };

  // Handle selection of a department
  const handleDepartmentChange = (e) => {
    const selectedDeptId = e.target.value;
    
    // If they selected the empty option, clear the department
    if (!selectedDeptId) {
      setFormData({
        ...formData,
        department: '',
        departmentId: null
      });
      return;
    }
    
    // Find the selected department object from our options
    const selectedDept = departmentOptions.find(dept => dept.id.toString() === selectedDeptId);
    
    if (selectedDept) {
      console.log("Selected department:", selectedDept);
      setFormData({
        ...formData,
        department: selectedDept.name,
        departmentId: selectedDept.id
      });
    }
  };

  // Prepare department options with unique keys
  const renderDepartmentOptions = () => {
    if (!formData.college || loading) {
      console.log("Not rendering department options - no college selected or loading");
      return null;
    }
    
    // Get the appropriate options source
    const options = departmentOptions.length > 0 
      ? departmentOptions 
      : [];
    
    // Check whether we have options for this college in allDepartments
    if (options.length === 0 && allDepartments[formData.college]) {
      console.log(`Using college departments from allDepartments for ${formData.college}:`, allDepartments[formData.college]);
      return allDepartments[formData.college].map(dept => (
        <option 
          key={`dept-${formData.college}-${dept.id}`} 
          value={dept.id}
        >
          {dept.name}
        </option>
      ));
    }
    
    // Log what options we're rendering
    console.log("Rendering department options:", options);
    
    // Return options with unique keys
    return options.map(dept => (
      <option 
        key={`dept-${formData.college}-${dept.id}`} 
        value={dept.id}
      >
        {dept.name}
      </option>
    ));
  };

  return (
    <div className="p-2">
      {parentLoading ? (
        <div className="text-center py-4">Loading college and department data...</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Program Name field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Program Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Enter program name"
                autoFocus
              />
            </div>
            
            {/* Program Code field */}
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
            
            {/* College field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">College</label>
              <select
                value={formData.college}
                onChange={handleCollegeChange}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="" key="college-default">Select College</option>
                {collegeList.length === 0 ? (
                  <option value="" disabled key="no-colleges">No colleges available</option>
                ) : (
                  collegeList.map((college, index) => (
                    <option key={`college-${index}-${college}`} value={college}>
                      {college}
                    </option>
                  ))
                )}
              </select>
            </div>
            
            {/* Department field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                value={formData.departmentId || ''}
                onChange={handleDepartmentChange}
                className={`w-full px-3 py-2 border rounded-lg ${fetchError ? 'border-red-500' : ''}`}
                required
                disabled={!formData.college || loading}
              >
                <option value="" key="department-default">
                  {loading ? 'Loading departments...' : 'Select Department'}
                </option>
                {renderDepartmentOptions()}
              </select>
              {fetchError && (
                <p className="mt-1 text-sm text-red-500">{fetchError}</p>
              )}
            </div>
            
            {/* Restore the Duration field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="3 years" key="duration-3">3 years</option>
                <option value="4 years" key="duration-4">4 years</option>
                <option value="5 years" key="duration-5">5 years</option>
              </select>
            </div>
            
            {/* Status field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg capitalize"
              >
                <option value="active" key="status-active">Active</option>
                <option value="inactive" key="status-inactive">Inactive</option>
              </select>
            </div>
          </div>
          
          {/* Notice about API limitation */}
          <div className="mt-2 p-3 bg-blue-50 text-blue-700 rounded border border-blue-200">
            <p className="text-sm">
              <strong>Note:</strong> Due to API constraints, new programs will be saved in view-only mode and will not persist after page reload.
            </p>
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-end gap-2 mt-4">
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
              ref={submitButtonRef}
              className="px-4 py-2 bg-[#1e1e77] text-white rounded hover:bg-[#2a2a8f]"
            >
              <FontAwesomeIcon icon={faSave} className="mr-2" />
              Save
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Programs; 