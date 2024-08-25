/**
 * @file EditStatus.js
 * @description The EditStatus component provides a modal for users to update their presence status in the XmppClient application. 
 *              It uses Formik for form management and Yup for validation. The component allows users to select a status type 
 *              and enter a status message, which is then sent to the XMPP server.
 * 
 *              Key functionalities provided by this component include:
 *              - Displaying a modal with a form to edit the user's status.
 *              - Validating user input using Yup.
 *              - Sending the updated status to the XMPP server via the XMPP client.
 *              - Updating the Redux store with the new status.
 * 
 * @param {Object} props - Component properties.
 * @param {boolean} props.open - Controls whether the modal is open or closed.
 * @param {Function} props.onClose - Function to handle closing the modal.
 * 
 * @returns {JSX.Element} - The EditStatus component.
 * 
 * @author Andrea Ximena Ramirez Recinos
 * @created Aug 2024
 * 
 * @note Documentation Generated with ChatGPT
 */
import React from 'react';
import { Box, Typography, Button, Modal, useTheme, TextField, MenuItem } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as yup from 'yup'; // Import Yup for form validation
import { useXMPP } from '../../context/XMPPContext';
import { useDispatch, useSelector } from 'react-redux';
import { updateContactStatus } from '../../state';
import { xml } from '@xmpp/client';

/**
 * EditStatus component that provides a modal for users to update their presence status.
 *
 * @param {Object} props - Component properties.
 * @param {boolean} props.open - Indicates whether the modal is open or closed.
 * @param {Function} props.onClose - Function to handle closing the modal.
 * 
 * @returns {JSX.Element} - The EditStatus modal component.
 * 
 * @component
 * 
 * @description
 * The EditStatus component renders a modal dialog where users can select a new status type and enter a status message. 
 * It uses Formik for form management and Yup for form validation. Upon submission, the component sends the updated 
 * status to the XMPP server using the XMPP client and updates the Redux store with the new status.
 * 
 * The component includes:
 * - A select field for choosing the status type (e.g., Available, Away, Do Not Disturb, Extended Away).
 * - A text field for entering a custom status message.
 * - Submit and cancel buttons to handle form submission and modal dismissal.
 * 
 * @example
 * <EditStatus open={isModalOpen} onClose={handleCloseModal} />
 * 
 * @see {@link https://formik.org/docs} for Formik documentation.
 * @see {@link https://github.com/jquense/yup} for Yup documentation.
 */

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