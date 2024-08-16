/**
 * Login Page Component
 * 
 * This component provides a login form for users to enter their credentials. 
 * It uses Formik for form handling and validation, Material-UI for styling, 
 * and Redux for state management. Upon successful login, it connects to the XMPP server
 * and navigates to the home page.
 * 
 * Documentation Generated with ChatGPT
 */

import React from 'react';
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
import { connectXMPP } from '../../utils/xmppClient';
import { useDispatch } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { setLogin, setContacts, updateContactStatus } from '../../state';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useXMPP } from '../../context/XMPPContext';
import { xml } from '@xmpp/client';

// Schema for validating login form fields using Yup
const loginSchema = yup.object().shape({
  username: yup.string().required("*Required"), // Username is required
  password: yup.string().required("*Required"), // Password is required
});

const Login = () => {
  const { palette } = useTheme(); // Retrieve theme palette from Material-UI
  const dispatch = useDispatch(); // Get dispatch function from Redux
  const [errorMessage, setErrorMessage] = React.useState(''); // State for managing error messages
  const navigate = useNavigate(); // Hook for navigation
  const { updateClient } = useXMPP(); // Custom hook for XMPP context

  // Handle form submission
  const handleSubmit = async (values) => {
    const { username, password } = values;
    try {
      // Attempt to connect to XMPP server
      const connection = await connectXMPP(username, password);
      updateClient(connection); // Update XMPP client in context
      dispatch(setLogin({ user: username })); // Update Redux store with logged-in user

      // Create an XMPP IQ stanza to request the contact list
      const rosterRequest = xml('iq', { type: 'get', id: 'roster-request' }, [
        xml('query', { xmlns: 'jabber:iq:roster' })
      ]);

      try {
        // Send the roster request IQ stanza
        await connection.send(rosterRequest);
        
        // Handle incoming roster response
        connection.on('stanza', (stanza) => {
          console.log(stanza)
          if (stanza.is("iq") && stanza.attrs.id === 'roster-request') {
            const query = stanza.getChild('query');
            const items = query.getChildren('item');
      
            // Transform XML data into JSON format
            const contacts = items.map(item => {
              return {
                jid: item.attrs.jid, // JID of the contact
                name: item.attrs.name || 'No name', // Contact's name (default to empty string if not present)
                username: item.attrs.jid.split('@')[0], // Extract username from JID
                image: '', // Placeholder for image URL (requires additional handling if images are provided)
                status: item.attrs.show || '' // Contact's status (default to empty string if not present)
              };
            });
            // Process the contacts as needed
            console.log('Contact List:', contacts);
            dispatch(setContacts({ contacts }));
          }

          if (stanza.is('presence')) {
            let fromJid = stanza.attrs.from.split('/')[0]; // Get the JID of the user sending the presence
            const status = stanza.getChildText('show') || 'chat'; // Extract the status, default to empty string if not present
            console.log(`Status for ${fromJid}: ${status}`);
            // Process the status
            // Dispatch action to update contact status
            dispatch(updateContactStatus({
              jid: fromJid,
              status: status
            }));

          }
        });
      } catch (error) {
        console.error("Error getting contact list:", error);
      }

      setErrorMessage(''); // Clear any previous error message
      navigate("/home"); // Navigate to the home page upon successful login
    } catch (error) {
      console.error("Login failed:", error);
      setErrorMessage("Login failed. Please check your username and password."); // Set the error message
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
          Ready to Chat? 💬
        </Typography>
        <Box sx={{ padding: '16px', borderRadius: '8px', marginTop: '16px' }}>
          <Typography variant="body1" sx={{ fontWeight: '400' }}>
            To continue, please enter your username and password. Your chats are just a login away.
          </Typography>
        </Box>

        {/* Display error message if any */}
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        <Box sx={{ width: "60%" }}>
          <Formik
            initialValues={{ username: '', password: '' }} // Initial form values
            validationSchema={loginSchema} // Validation schema for the form
            onSubmit={handleSubmit} // Handle form submission
          >
            {({ handleSubmit, isValid, dirty }) => (
              <Form onSubmit={handleSubmit}>
                <Box display="flex" flexDirection="column" gap="20px">
                  <Field name="username">
                    {({ field, meta }) => (
                      <TextField
                        {...field}
                        label="Username"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        error={meta.touched && Boolean(meta.error)} // Show error state if touched and has error
                        helperText={meta.touched && meta.error} // Display error message
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AccountCircleOutlinedIcon fontSize="small" /> {/* Icon for username field */}
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  </Field>

                  <Field name="password">
                    {({ field, meta }) => (
                      <TextField
                        {...field}
                        label="Password"
                        type="password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        error={meta.touched && Boolean(meta.error)} // Show error state if touched and has error
                        helperText={meta.touched && meta.error} // Display error message
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockOutlinedIcon fontSize="small" /> {/* Icon for password field */}
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  </Field>

                  <Button 
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ marginTop: '16px' }}
                    disabled={!isValid || !dirty} // Disable button if form is invalid or untouched
                  >
                    Login
                  </Button>
                </Box>
              </Form>
            )}
          </Formik>
        </Box>
      </Box>
    </FlexBetween>
  );
};

export default Login;