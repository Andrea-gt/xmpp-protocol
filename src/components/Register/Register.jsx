/**
 * @file Register.jsx
 * @description The Register component provides a registration form for new users to create an account. 
 *              It utilizes Formik for form handling and validation, Material-UI for styling, 
 *              and integrates XMPP client functionality for user registration.
 * 
 *              Key functionalities provided by this component include:
 *              - Form validation and submission using Yup and Formik.
 *              - Error handling and display using Material-UI's Alert component.
 *              - The ability to toggle between the registration and login forms.
 * 
 * @author Andrea Ximena Ramirez Recinos
 * @created Aug 2024
 * 
 * @note Documentation Generated with ChatGPT
 */

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  useTheme,
  Button,
  TextField,
  InputAdornment,
  Alert,
} from "@mui/material";
import FlexBetween from '../../FlexBetween';
import { Formik, Form, Field } from "formik";
import * as yup from "yup";
import { registerXMPP } from '../../utils/xmppClient';
import BadgeIcon from '@mui/icons-material/Badge';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

// Schema for validating login form fields using Yup
const registerSchema = yup.object().shape({
  full_name: yup.string().required("*Required"), // Username is required
  username: yup.string().required("*Required"), // Username is required
  password: yup.string().required("*Required"), // Password is required
});

/**
 * Register component that provides the user interface for new user registration.
 *
 * This component includes:
 * - A form with fields for full name, username, and password.
 * - Validation rules to ensure all fields are filled out.
 * - Error handling and display for registration failures.
 * - The ability to toggle between registration and login forms.
 * - Integration with an XMPP client for user registration.
 *
 * @param {Object} props - Component properties.
 * @param {Function} props.toggleForm - Function to toggle between the registration and login forms.
 * @returns {JSX.Element} - The Register component.
 */
const Register = ({ toggleForm }) => {
  const { palette } = useTheme(); // Retrieve theme palette from Material-UI
  const [errorMessage, setErrorMessage] = React.useState(''); // State for managing error messages

  // Handle form submission
  const handleSubmit = async (values) => {
    const { full_name, username, password } = values;
    try {
      const response = await registerXMPP(full_name, username, password);
      if (response.status) {
        setErrorMessage('');
        toggleForm(); // Return to login component
      } else {
        setErrorMessage(response.message || "Registration failed.");
      }
    } catch (error) {
      setErrorMessage(error.message || "An unexpected error has occurred.");
    }
  };

  return (
    <FlexBetween 
      display="flex"
      sx={{
        backgroundColor: palette.grey[10], // Background color from theme palette
        height: '100vh', // Full viewport height
        justifyContent: 'center', 
        alignItems: 'center',
      }}
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        sx={{
          borderRadius: '8px', // Rounded corners
          padding: '2rem', // Padding around the form
          minHeight: '70vh', // Minimum height of the form container
          width: '50%', // Width of the form container
          justifyContent: 'center', 
          alignItems: 'center',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)', // Shadow effect for the form container
        }}
      >
        <Typography variant="h1" sx={{ fontWeight: '700' }}>
          Join the Conversation! 💬
        </Typography>
        <Box sx={{ padding: '16px', borderRadius: '8px', marginTop: '16px' }}>
          <Typography variant="body1" sx={{ fontWeight: '400' }}>
            Please enter your name, username and password. Your new chat experience is just a few steps away.
          </Typography>
        </Box>
        <Box sx={{ padding: '16px', borderRadius: '8px' }}>
          <Formik
            initialValues={{ full_name: '', username: '', password: '' }} // Initial form values
            validationSchema={registerSchema} // Form validation schema
            onSubmit={handleSubmit} // Handle form submission
          >
            {({ errors, touched, isValid, dirty }) => (
              <Form>
                <Field name="full_name">
                  {({ field }) => (
                    <TextField
                      {...field}
                      label="Full Name"
                      variant="outlined"
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BadgeIcon />
                          </InputAdornment>
                        ),
                      }}
                      error={Boolean(touched.full_name && errors.full_name)} // Show error if touched and invalid
                      helperText={touched.full_name && errors.full_name} // Show validation error message
                      sx={{ marginBottom: '16px' }} // Margin bottom for spacing
                    />
                  )}
                </Field>
                <Field name="username">
                  {({ field }) => (
                    <TextField
                      {...field}
                      label="Username"
                      variant="outlined"
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AccountCircleOutlinedIcon />
                          </InputAdornment>
                        ),
                      }}
                      error={Boolean(touched.username && errors.username)} // Show error if touched and invalid
                      helperText={touched.username && errors.username} // Show validation error message
                      sx={{ marginBottom: '16px' }} // Margin bottom for spacing
                    />
                  )}
                </Field>
                <Field name="password">
                  {({ field }) => (
                    <TextField
                      {...field}
                      label="Password"
                      variant="outlined"
                      type="password"
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlinedIcon />
                          </InputAdornment>
                        ),
                      }}
                      error={Boolean(touched.password && errors.password)} // Show error if touched and invalid
                      helperText={touched.password && errors.password} // Show validation error message
                      sx={{ marginBottom: '16px' }} // Margin bottom for spacing
                    />
                  )}
                </Field>
                {errorMessage && (
                  <Alert severity="error" sx={{ marginBottom: '16px' }}>
                    {errorMessage} {/* Display error message */}
                  </Alert>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={!isValid || !dirty}
                  sx={{
                    backgroundColor: palette.primary.main,
                    '&:hover': {
                      backgroundColor: palette.primary.dark,
                    },
                  }}
                >
                  Register
                </Button>
              </Form>
            )}
          </Formik>
        </Box>
        <Typography
        variant="body2"
        color="primary"
        sx={{ cursor: 'pointer', textDecoration: 'underline' }}
        onClick={toggleForm}
        >
          Already have an account? Login here.
      </Typography>
      </Box>
    </FlexBetween>
    );
};

export default Register;