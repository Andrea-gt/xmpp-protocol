import React from 'react';
import { Box, Typography, Button, Modal, useTheme, TextField, MenuItem } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as yup from 'yup'; // Import Yup for form validation
import { useXMPP } from '../../context/XMPPContext';
import { useDispatch, useSelector } from 'react-redux';
import { updateContactStatus } from '../../state';
import { xml } from '@xmpp/client';

const EditStatus = ({ open, onClose }) => {
  const { palette } = useTheme(); // Get theme palette from Material-UI
  const { xmppClient } = useXMPP(); // Access XMPP client from context
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user); // Retrieve username from Redux store

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
    borderRadius: '8px',
  };

  // Validation schema for the form using Yup
  const validationSchema = yup.object({
    statusType: yup.string().required('Status type is required'),
    statusText: yup.string().required('Status text is required'),
  });

  // Status options with emojis
  const statusOptions = [
    { value: 'chat', label: '😊 Available' },
    { value: 'away', label: '🚶 Away' },
    { value: 'dnd', label: '🔕 Do Not Disturb' },
    { value: 'xa', label: '🌙 Extended Away' },
  ];
  
  // Handle form submission
  const handleSubmit = (values, { setSubmitting }) => {
    const { statusType, statusText } = values;
    // Sending the new status to the XMPP server
    const presence = xml(
      'presence',
      { type: statusType },
      xml('show', {}, statusType),
      xml('status', {}, statusText)
    );
    try{
      xmppClient.send(presence);
      dispatch(updateContactStatus({ jid: `${user}alumchat.lol`, status: statusType }));
    } catch (error) {
      console.error('Failed to edit status:', error); // Log error if contact addition fails
      alert('Failed to set status. Please try again later.'); // Make an alert in case of error
    } finally {
      setSubmitting(false); // Set submitting to false after handling the submission
    }
    onClose(); // Close the modal after submission
  };

  return (
    <Modal
      open={open} // Open state of the modal
      onClose={onClose} // Close handler for the modal
      aria-labelledby="edit-status-modal"
      aria-describedby="modal-to-edit-status"
    >
      <Box sx={style}>
        <Typography variant="h6" mb={2}>
          Edit Status
        </Typography>
        <Box sx={{ borderRadius: '8px', marginTop: '16px', marginBottom: '16px' }}>
          <Typography variant="body1" sx={{ fontWeight: '400' }}>
            Please select a new status and enter your preferred status message to proceed.
          </Typography>
        </Box>
        <Formik
          initialValues={{ statusType: '', statusText: '' }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched, handleChange }) => (
            <Form>
              <Box sx={{ marginBottom: '16px' }}>
                <Field
                  as={TextField}
                  name="statusType"
                  select
                  fullWidth
                  label="Select Status"
                  variant="outlined"
                  onChange={handleChange}
                  error={touched.statusType && Boolean(errors.statusType)}
                  helperText={touched.statusType && errors.statusType}
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Field>
              </Box>

              <Box sx={{ marginBottom: '16px' }}>
                <Field
                  as={TextField}
                  name="statusText"
                  fullWidth
                  label="Status Text"
                  variant="outlined"
                  onChange={handleChange}
                  error={touched.statusText && Boolean(errors.statusText)}
                  helperText={touched.statusText && errors.statusText}
                />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={isSubmitting}
                >
                  Save
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={onClose}
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

export default EditStatus;