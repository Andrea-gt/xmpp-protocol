import React, { useState, useRef } from 'react';
import { Box, Typography, Button, Modal, useTheme, TextField, InputAdornment, Alert, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel } from '@mui/material';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import { Formik, Form, Field } from 'formik';
import * as yup from 'yup'; // Import Yup for form validation
import { useXMPP } from '../../context/XMPPContext';
import { xml } from '@xmpp/client';
import { setContacts } from '../../state';
import { useDispatch, useSelector } from 'react-redux';

// Define validation schemas for different action types
const contactValidationSchema = yup.object({
  username: yup.string()
    .required('Username is required') // Ensure username is provided
});

const groupValidationSchema = yup.object({
  username: yup.string()
    .required('Group name is required') // Ensure group name is provided
});

// Define initial values for each form type
const contactInitialValues = { username: '' };
const groupInitialValues = { username: '' };

const AddContact = ({ open, onClose }) => {
  const { palette } = useTheme(); // Get theme palette from Material-UI
  const { xmppClient } = useXMPP(); // Access XMPP client from context
  const images = useSelector((state) => state.images); // Access images from Redux store
  const statusList = useSelector((state) => state.statusList); // Access status list from Redux store
  const dispatch = useDispatch(); // Get dispatch function from Redux

  const [actionType, setActionType] = useState('contact'); // State to manage action type (contact or group)
  const [initialValues, setInitialValues] = useState(contactInitialValues); // State for initial form values
  const formikRef = useRef(); // Reference to the Formik instance

  // Function to get image URL by JID
  const getImageByJid = (jid) => {
    const image = images.find(img => img.jid === jid);
    return image ? image.image : '';
  };
  
  // Function to get status by JID
  const getStatusByJid = (jid) => {
    const status = statusList.find(status => status.jid === jid);
    return status ? status.status : '';
  };

  // Styles for the modal
  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: palette.grey[100], // Background color from theme palette
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)', // Shadow effect for modal
    padding: '20px',
    width: '400px',
  };

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    let request;
    let contacts = [];
    let rooms = [];
  
    try {
      if (actionType === 'contact') {
        // Create an XMPP IQ stanza to request adding a contact
        request = xml('iq', { type: 'set', id: 'add-user' }, [
          xml('query', { xmlns: 'jabber:iq:roster' }, [
            xml('item', { jid: `${values.username}@alumchat.lol`, subscription: 'both' })
          ])
        ]);
  
        // Create presence stanzas for subscription request
        const subscribeRequest = xml('presence', { type: 'subscribe', to: `${values.username}@alumchat.lol` });
        const subscribedResponse = xml('presence', { type: 'subscribed', to: `${values.username}@alumchat.lol` });
  
        await xmppClient.send(request);
        await xmppClient.send(subscribeRequest);
        await xmppClient.send(subscribedResponse);
  
        console.log('Contact added successfully');
      } else if (actionType === 'group') {
        console.log(values);
        // Create an XMPP IQ stanza to create a group chat
        request = xml('iq', { type: 'set', id: 'create-groupchat' }, [
          xml('query', { xmlns: 'http://jabber.org/protocol/muc#owner' }, [
            xml('x', { xmlns: 'jabber:x:data', type: 'submit' }, [
              xml('field', { var: 'FORM_TYPE', type: 'hidden' }, [
                xml('value', 'http://jabber.org/protocol/muc#roomconfig')
              ]),
              xml('field', { var: 'muc#roomconfig_roomname' }, [
                xml('value', values.username) // Use username as room name
              ])
            ])
          ])
        ]);
  
        await xmppClient.send(request);
        console.log('Group chat created successfully');
      }
  
      // Request the contact list
      const rosterRequest = xml('iq', { type: 'get', id: 'roster-request' }, [xml('query', { xmlns: 'jabber:iq:roster' })]);
      // Create IQ stanza to request list of rooms the user is in
      const requestRooms = xml('iq', { type: 'get', id: 'rooms-request' }, xml('query', 'jabber:iq:private', xml('storage', 'storage:bookmarks')));
      // Send the requests to the server
      await xmppClient.send(rosterRequest);
      await xmppClient.send(requestRooms);
  
      // Function to handle stanza responses
      const handleStanza = (stanza) => {
        if (stanza.is("iq")) {
          if (stanza.attrs.id === 'roster-request') {
            const query = stanza.getChild('query');
            const items = query.getChildren('item');
            contacts = items.map(item => ({
              jid: item.attrs.jid,
              name: item.attrs.name || 'No name',
              username: item.attrs.jid.split('@')[0],
              image: getImageByJid(item.attrs.jid),
              status: getStatusByJid(item.attrs.jid),
            }));
          } else if (stanza.attrs.id === 'rooms-request') {
            console.log(stanza);
            const items = stanza.getChild('query').getChild('storage').getChildren('conference');
            rooms = items.map(item => ({
              jid: item.attrs.jid,
              name: "", // Placeholder for group name
            }));
            // Request details for each group chat
            rooms.forEach(chat => {
              xmppClient.send(xml('iq', { type: 'get', id: `gcinformation-request`, to: chat.jid },
                xml('query', 'http://jabber.org/protocol/disco#info')
              ));
            });
          } else if (stanza.attrs.id.startsWith('gcinformation-request')) {
            console.log(stanza);
            const jid = stanza.attrs.from;
            const room = rooms.find(c => c.jid === jid);
            if (room) {
              const name_ = stanza.getChild('query').getChild('identity').attrs.name;
              room.name = name_ ? name_ : 'Groupchat';
            }
          }
        }
      };
  
      // Register the stanza handler
      xmppClient.on('stanza', handleStanza);
  
      // Wait until all room details are received
      await new Promise((resolve) => {
        const interval = setInterval(() => {
          if (rooms.every(room => room.name)) {
            clearInterval(interval);
            resolve();
          }
        }, 100); // Check every 100ms
      });
  
      // Unregister the stanza handler
      xmppClient.off('stanza', handleStanza);
  
      // Combine contacts and group chats
      const combinedList = [
        ...contacts,
        ...rooms.map(room => ({
          jid: room.jid,
          name: room.name,
          username: null, // Set username to null for groups
          image: null, // Set image to null for groups
          status: null, // Set status to null for groups
        }))
      ];
  
      // Dispatch the combined list as contacts
      dispatch(setContacts({ contacts: combinedList }));
      onClose(); // Close the modal after successful submission
  
    } catch (error) {
      console.error(`Failed to ${actionType === 'contact' ? 'add contact' : 'create group chat'}:`, error);
      alert(`Failed to ${actionType === 'contact' ? 'add new contact' : 'create group chat'}. Please try again later.`);
    } finally {
      setSubmitting(false); // Set submitting to false after handling the submission
    }
  };  

  // Handle action type change and update form values
  const handleActionTypeChange = (event) => {
    const newActionType = event.target.value;
    setActionType(newActionType);

    if (newActionType === 'contact') {
      setInitialValues(contactInitialValues);
    } else if (newActionType === 'group') {
      setInitialValues(groupInitialValues);
    }

    if (formikRef.current) {
      formikRef.current.resetForm();
    }
  };

  return (
    <Modal
      open={open} // Open state of the modal
      onClose={onClose} // Close handler for the modal
      aria-labelledby="add-contact-modal"
      aria-describedby="modal-to-add-new-contact"
    >
      <Box sx={modalStyle}>
        <Typography variant="h6" mb={2}>
          Add New Contact or Group
        </Typography>

        <Box sx={{ borderRadius: '8px', marginTop: '16px' }}>
          <Typography variant="body1" sx={{ fontWeight: '400' }}>
            To proceed, kindly provide the username of the contact or name of group you'd like to add to your list.
          </Typography>
        </Box>

        <FormControl component="fieldset" sx={{ mt: 2 }}>
          <FormLabel component="legend">Action Type</FormLabel>
          <RadioGroup
            aria-label="action-type"
            name="actionType"
            value={actionType}
            onChange={handleActionTypeChange} // Update action type and initial values on change
          >
            <FormControlLabel value="contact" control={<Radio />} label="Add Contact" />
            <FormControlLabel value="group" control={<Radio />} label="Create Group Chat" />
          </RadioGroup>
        </FormControl>

        <Formik
          innerRef={formikRef} // Reference to Formik instance
          initialValues={initialValues} // Initial values based on action type
          validationSchema={actionType === 'contact' ? contactValidationSchema : groupValidationSchema} // Validation schema based on action type
          onSubmit={handleSubmit} // Form submission handler
        >
          {({ errors, touched, isSubmitting, isValid }) => (
            <Form>
              <Field name='username'>
                {({ field, meta }) => (
                  <Box mb={2}>
                    <TextField
                      {...field}
                      label={ actionType === 'contact' ? 'Username' : 'Group Name' }
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
                  disabled={isSubmitting || !isValid} // Disable button while submitting or if form is invalid
                >
                  {actionType === 'contact' ? 'Add Contact' : 'Create Group Chat'}
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