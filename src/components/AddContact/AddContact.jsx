/**
 * AddContact Component
 * 
 * This component renders a modal that allows users to add a new contact by entering a username. 
 * It uses Formik for form handling and validation with Yup, Material-UI for styling, 
 * and XMPP client context for sending the contact addition request.
 * 
 * Documentation Generated with ChatGPT
 */

import React from 'react';
import { Box, Typography, Button, Modal, useTheme, TextField, InputAdornment, Alert } from '@mui/material';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import { Formik, Form, Field } from 'formik';
import * as yup from 'yup'; // Import Yup for form validation
import { useXMPP } from '../../context/XMPPContext';
import { xml } from '@xmpp/client';

const AddContact = ({ open, onClose }) => {
  const { palette } = useTheme(); // Get theme palette from Material-UI
  const { xmppClient } = useXMPP(); // Access XMPP client from context

  // Styles for the modal
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: palette.grey[100], // Background color from theme palette
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)', // Shadow effect for modal
    p: '20px',
    width: '400px',
  };

  // Validation schema for the form using Yup
  const validationSchema = yup.object({
    username: yup.string()
      .required('Username is required') // Ensure username is provided
  });

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    console.log('Submitted values:', values);
    if (!xmppClient) {
      console.error('XMPP client is not connected'); // Log error if XMPP client is not available
      return;
    }

    // Create an XMPP IQ stanza to request adding a contact
    const addRequest = xml('iq', { type: 'set', id: 'add-user' }, [
      xml('query', { xmlns: 'jabber:iq:roster' }, [
        xml('item', { jid: `${values.username}@alumchat.lol` }) // Specify the JID of the contact to add
      ])
    ]);

    // Create an XMPP presence stanza to request adding a contact
    const presenceRequest = xml('presence', { type: 'subscribe', to: `${values.username}@alumchat.lol` });

    try {
      // Send the requests using the XMPP client
      await xmppClient.send(addRequest);
      await xmppClient.send(presenceRequest);
      console.log('Contact added successfully'); // Log success message
      onClose(); // Close the modal after successful submission
    } catch (error) {
      console.error('Failed to add contact:', error); // Log error if contact addition fails
      alert('Failed to add new contact. Please try again later.'); // Make an alert in case of error
    } finally {
      setSubmitting(false); // Set submitting to false after handling the submission
    }
  };

  return (
    <Modal
      open={open} // Open state of the modal
      onClose={onClose} // Close handler for the modal
      aria-labelledby="add-contact-modal"
      aria-describedby="modal-to-add-new-contact"
    >
      <Box sx={style}>
        <Typography variant="h6" mb={2}>
          Add New Contact
        </Typography>

        <Box sx={{ borderRadius: '8px', marginTop: '16px' }}>
          <Typography variant="body1" sx={{ fontWeight: '400' }}>
            To proceed, kindly provide the username of the contact you'd like to add to your list.
          </Typography>
        </Box>
        <Formik
          initialValues={{ username: '' }} // Initial form values
          validationSchema={validationSchema} // Validation schema for the form
          onSubmit={handleSubmit} // Form submission handler
        >
          {({ errors, touched, isSubmitting, isValid }) => (
            <Form>
              <Field name="username">
                {({ field, meta }) => (
                  <Box mb={2}>
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
                  </Box>
                )}
              </Field>

              {errors.username && touched.username && (
                <Box mb={2}>
                  <Alert severity="error">{errors.username}</Alert> {/* Show error alert */}
                </Box>
              )}
              
              <Box mt={2}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting || !isValid} // Disable button if form is submitting or invalid
                >
                  Add Contact
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={onClose}
                  sx={{ ml: 1 }}
                >
                  Cancel
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Box>
    </Modal>
  );
};

export default AddContact;