/**
 * Academic Data Debugger
 * 
 * Utility functions to validate and debug academic data structures
 */

/**
 * Validates and logs academic data structure
 * @param {Array} colleges - The colleges data
 * @param {Array} programs - The programs data
 * @param {Object} programsByDepartment - Programs organized by department
 */
export const validateAcademicData = (colleges, programs, programsByDepartment) => {
  console.group('Academic Data Validation');
  
  // Validate colleges
  console.log('Colleges count:', colleges.length);
  colleges.forEach(college => {
    console.log(`College: ${college.name} (ID: ${college.id})`);
    console.log(`- Departments (${college.departments.length}):`, college.departments);
  });
  
  // Validate programs
  console.log('Programs count:', programs.length);
  const programsWithMissingData = programs.filter(program => 
    !program.college || !program.department_name || !program.program_name
  );
  
  if (programsWithMissingData.length > 0) {
    console.warn('Programs with missing data:', programsWithMissingData);
  }
  
  // Validate department -> programs mapping
  console.log('Departments with programs:', Object.keys(programsByDepartment).length);
  Object.entries(programsByDepartment).forEach(([dept, progs]) => {
    console.log(`Department: ${dept} - Programs (${progs.length}):`, progs);
  });
  
  // Check for orphaned departments (not belonging to any college)
  const allDepartmentsInColleges = new Set();
  colleges.forEach(college => {
    college.departments.forEach(dept => allDepartmentsInColleges.add(dept));
  });
  
  const orphanedDepartments = Object.keys(programsByDepartment).filter(
    dept => !allDepartmentsInColleges.has(dept)
  );
  
  if (orphanedDepartments.length > 0) {
    console.log('Departments not explicitly assigned to colleges:', orphanedDepartments.length);
    // Only log first 5 for brevity if too many
    if (orphanedDepartments.length > 5) {
      console.log('Sample departments:', orphanedDepartments.slice(0, 5), `and ${orphanedDepartments.length - 5} more...`);
    } else {
      console.log('Departments:', orphanedDepartments);
    }
  }
  
  console.groupEnd();
  
  return {
    valid: programsWithMissingData.length === 0, // Don't consider orphaned departments as an issue
    issues: {
      programsWithMissingData: programsWithMissingData.length,
      orphanedDepartments
    }
  };
};

/**
 * Simulates the selection of a college and logs the result
 * @param {Array} colleges - The colleges data
 * @param {string|number} collegeId - The ID of the selected college
 */
export const simulateCollegeSelection = (colleges, collegeId) => {
  console.group(`Simulating selection of college ID: ${collegeId}`);
  
  const selectedCollege = colleges.find(
    college => college.id.toString() === collegeId.toString()
  );
  
  if (selectedCollege) {
    console.log('Selected college:', selectedCollege.name);
    console.log('Available departments:', selectedCollege.departments);
  } else {
    console.warn('College not found with ID:', collegeId);
  }
  
  console.groupEnd();
  
  return selectedCollege;
};

/**
 * Simulates the selection of a department and logs the result
 * @param {Object} programsByDepartment - Programs organized by department
 * @param {string} departmentName - The name of the selected department
 */
export const simulateDepartmentSelection = (programsByDepartment, departmentName) => {
  console.group(`Simulating selection of department: ${departmentName}`);
  
  const availablePrograms = programsByDepartment[departmentName] || [];
  
  if (availablePrograms.length > 0) {
    console.log('Available programs:', availablePrograms);
  } else {
    console.warn('No programs found for department:', departmentName);
  }
  
  console.groupEnd();
  
  return availablePrograms;
};

/**
 * Logs the complete state of the student form for debugging
 * @param {Object} formData - The form data state
 * @param {string} selectedCollegeId - The selected college ID
 * @param {Array} availableDepartments - The available departments
 * @param {Array} availablePrograms - The available programs
 */
export const debugStudentForm = (formData, selectedCollegeId, availableDepartments, availablePrograms) => {
  console.group('Student Form Debug');
  console.log('Form Data:', formData);
  console.log('Selected College ID:', selectedCollegeId);
  console.log('Available Departments:', availableDepartments);
  console.log('Available Programs:', availablePrograms);
  console.groupEnd();
};

/**
 * Logs extensive information about the structure of program data
 * @param {Array} programsData - The raw programs data 
 */
export const inspectProgramStructure = (programsData) => {
  console.group('Program Data Structure Inspection');
  
  // Show a sample program object if available
  if (programsData.length > 0) {
    console.log('Sample program object:', programsData[0]);
    console.log('Program keys:', Object.keys(programsData[0]));
  } else {
    console.warn('No programs data available');
  }
  
  // Check for inconsistencies in property names
  const propertyStats = {
    college: { count: 0, types: new Set() },
    department: { count: 0, types: new Set() },
    department_name: { count: 0, types: new Set() },
    program_name: { count: 0, types: new Set() }
  };
  
  programsData.forEach(program => {
    for (const key of Object.keys(propertyStats)) {
      if (program[key] !== undefined) {
        propertyStats[key].count++;
        propertyStats[key].types.add(typeof program[key]);
      }
    }
  });
  
  console.log('Property statistics:', 
    Object.entries(propertyStats).map(([key, stats]) => ({
      property: key,
      count: stats.count,
      percentage: Math.round((stats.count / programsData.length) * 100) + '%',
      types: Array.from(stats.types).join(', ')
    }))
  );
  
  console.groupEnd();
}; 