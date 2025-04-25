// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Container, Box, Typography, TextField, Button, Paper, Alert } from '@mui/material';
// import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

// const Register = () => {
//   const navigate = useNavigate();
//   const [selectedRole, setSelectedRole] = useState('');
//   const [formData, setFormData] = useState({
//     firstName: '',
//     lastName: '',
//     email: '',
//     registrationNumber: '',
//     studentNumber: '',
//     password: '',
//     confirmPassword: '',
//     verificationCode: ''
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [verificationStep, setVerificationStep] = useState(false);
//   const [verificationMessage, setVerificationMessage] = useState('');

//   useEffect(() => {
//     const role = localStorage.getItem('selectedRole');
//     if (!role) {
//       navigate('/');
//       return;
//     }
//     setSelectedRole(role);
//   }, [navigate]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     if (formData.password !== formData.confirmPassword) {
//       setError('Passwords do not match');
//       setLoading(false);
//       return;
//     }

//     try {
//       const requestBody = {
//         firstName: formData.firstName,
//         lastName: formData.lastName,
//         email: formData.email,
//         password: formData.password,
//         role: selectedRole
//       };

//       if (selectedRole === 'student') {
//         requestBody.registrationNumber = formData.registrationNumber;
//         requestBody.studentNumber = formData.studentNumber;
//       }

//       const response = await fetch('http://localhost:8000/api/users/register/', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(requestBody),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || 'Registration failed');
//       }

//       setVerificationStep(true);
//       setVerificationMessage('Please check your email for the verification code');
//     } catch (err) {
//       console.error('Registration error:', err);
//       setError(err.message || 'Registration failed. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleVerification = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     try {
//       const response = await fetch('http://localhost:8000/api/users/verify/', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           email: formData.email,
//           verificationCode: formData.verificationCode
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || 'Verification failed');
//       }

//       navigate('/login');
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const renderStudentForm = () => (
//     <>
//       <TextField
//         margin="normal"
//         required
//         fullWidth
//         id="registrationNumber"
//         label="Registration Number"
//         name="registrationNumber"
//         value={formData.registrationNumber}
//         onChange={handleChange}
//       />
//       <TextField
//         margin="normal"
//         required
//         fullWidth
//         id="studentNumber"
//         label="Student Number"
//         name="studentNumber"
//         value={formData.studentNumber}
//         onChange={handleChange}
//       />
//     </>
//   );

//   const renderAdminLecturerForm = () => (
//     <TextField
//       margin="normal"
//       required
//       fullWidth
//       id="email"
//       label="Email Address"
//       name="email"
//       autoComplete="email"
//       value={formData.email}
//       onChange={handleChange}
//     />
//   );

//   return (
//     <Container component="main" maxWidth="xs">
//       <Box
//         sx={{
//           marginTop: 8,
//           display: 'flex',
//           flexDirection: 'column',
//           alignItems: 'center',
//         }}
//       >
//         <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
//           <Typography component="h1" variant="h5" align="center" gutterBottom>
//             {verificationStep ? 'Verify Your Email' : `Register as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
//           </Typography>
//           {verificationMessage && (
//             <Alert severity="info" sx={{ mb: 2 }}>
//               {verificationMessage}
//             </Alert>
//           )}
//           {error && (
//             <Alert severity="error" sx={{ mb: 2 }}>
//               {error}
//             </Alert>
//           )}
//           <Box component="form" onSubmit={verificationStep ? handleVerification : handleSubmit} noValidate>
//             {!verificationStep ? (
//               <>
//                 <TextField
//                   margin="normal"
//                   required
//                   fullWidth
//                   id="firstName"
//                   label="First Name"
//                   name="firstName"
//                   autoComplete="given-name"
//                   value={formData.firstName}
//                   onChange={handleChange}
//                 />
//                 <TextField
//                   margin="normal"
//                   required
//                   fullWidth
//                   id="lastName"
//                   label="Last Name"
//                   name="lastName"
//                   autoComplete="family-name"
//                   value={formData.lastName}
//                   onChange={handleChange}
//                 />
//                 {selectedRole === 'student' ? renderStudentForm() : renderAdminLecturerForm()}
//                 <TextField
//                   margin="normal"
//                   required
//                   fullWidth
//                   name="password"
//                   label="Password"
//                   type={showPassword ? 'text' : 'password'}
//                   id="password"
//                   autoComplete="new-password"
//                   value={formData.password}
//                   onChange={handleChange}
//                   InputProps={{
//                     endAdornment: (
//                       <Button
//                         onClick={() => setShowPassword(!showPassword)}
//                         edge="end"
//                       >
//                         {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
//                       </Button>
//                     ),
//                   }}
//                 />
//                 <TextField
//                   margin="normal"
//                   required
//                   fullWidth
//                   name="confirmPassword"
//                   label="Confirm Password"
//                   type={showPassword ? 'text' : 'password'}
//                   id="confirmPassword"
//                   value={formData.confirmPassword}
//                   onChange={handleChange}
//                 />
//               </>
//             ) : (
//               <TextField
//                 margin="normal"
//                 required
//                 fullWidth
//                 id="verificationCode"
//                 label="Verification Code"
//                 name="verificationCode"
//                 value={formData.verificationCode}
//                 onChange={handleChange}
//               />
//             )}
//             <Button
//               type="submit"
//               fullWidth
//               variant="contained"
//               sx={{ mt: 3, mb: 2 }}
//               disabled={loading}
//             >
//               {loading ? 'Processing...' : verificationStep ? 'Verify' : 'Register'}
//             </Button>
//           </Box>
//         </Paper>
//       </Box>
//     </Container>
//   );
// };

// export default Register; 

