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
  const username = useSelector((state) => state.user); // Get the current username from Redux store
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
    let contacts = [];
    let combinedList = []; // This will include both contacts and groups
    let rooms = [];
  
    try {
      // Helper function to send stanzas and wait for responses
      const sendRequest = (request) => {
        return new Promise((resolve, reject) => {
          const handleStanza = (stanza) => {
            if (stanza.attrs.id === request.attrs.id) {
              xmppClient.off('stanza', handleStanza);
              resolve(stanza);
              console.log("RECIEVED", stanza)
            }
          };
          xmppClient.on('stanza', handleStanza);
          xmppClient.sendReceive(request).catch(reject);
        });
      };
  
      if (actionType === 'contact') {
        // Create and send the request to add a contact
        const contactRequest = xml('iq', { type: 'set', id: 'add-user' }, [
          xml('query', { xmlns: 'jabber:iq:roster' }, [
            xml('item', { jid: `${values.username}@alumchat.lol`, subscription: 'both' })
          ])
        ]);

        await sendRequest(contactRequest);
  
        // Send presence stanzas for subscription
        const subscribeRequest = xml('presence', { id: 'suscribe-request', type: 'subscribe', to: `${values.username}@alumchat.lol` });
        const subscribedResponse = xml('presence', { id: 'suscribed-request', type: 'subscribed', to: `${values.username}@alumchat.lol` });

        console.log('buenas tardes')
        await xmppClient.send(subscribeRequest);
        await xmppClient.send(subscribedResponse);
        console.log('Contact added successfully');

      } else if (actionType === 'group') {
        // Create and send the request to create a group chat
        const groupRequest = xml('iq', { to: `${values.username}@conference.alumchat.lol`, type: 'get', id: 'creategc-request' },
          xml('query', 'http://jabber.org/protocol/disco#info')
        );
        const groupResponse = await sendRequest(groupRequest);
        console.log('Group chat created successfully');
  
        // Join the group chat
        const joinRequest = xml('presence', { id: 'joingc-request', to: `${values.username}@conference.alumchat.lol/${username}` },
          xml('x', { xmlns: 'http://jabber.org/protocol/muc' }));
        await sendRequest(joinRequest);
  
        // If the group exists, configure the room
        if (!groupResponse.getChild('query').getChild('identity')) {
          const configurationRequest = xml('iq', { to: `${values.username}@conference.alumchat.lol`, type: 'get', id: 'room-configuration' },
            xml('query', { xmlns: 'http://jabber.org/protocol/muc#owner' }));
          await sendRequest(configurationRequest);
  
          // Configure the room to be public and persistent
          const publicRequest = xml('iq', { 
            to: `${values.username}@conference.alumchat.lol`, type: 'set', id: 'public-request' 
          },
          xml('query', { xmlns: 'http://jabber.org/protocol/muc#owner' }, 
            xml('x', { xmlns: 'jabber:x:data', type: 'submit' }, 
              xml('field', { var: 'FORM_TYPE', type: 'hidden' }, 
                xml('value', {}, 'http://jabber.org/protocol/muc#roomconfig')
              ),
              xml('field', { var: 'muc#roomconfig_roomname', type: "text-single", label: "Room Name" }, 
                xml('value', {}, values.username)
              ),
              xml('field', { var: 'muc#roomconfig_publicroom', type: "text-single", label: "List Room in Directory" }, 
                xml('value', {}, 1)
              ),
              xml('field', { var: 'muc#roomconfig_persistentroom', type: "text-single", label: "Room is Persistent" }, 
                xml('value', {}, 1)
              )
            )
          ));
          await sendRequest(publicRequest);
        }
      }
  
      // Request the contact list
      const rosterRequest = xml('iq', { type: 'get', id: 'roster-request' }, [
        xml('query', { xmlns: 'jabber:iq:roster' })
      ]);

      const rosterResponse = await sendRequest(rosterRequest);
  
      // Extract contacts from the response
      const rosterItems = rosterResponse.getChild('query').getChildren('item');
      contacts = rosterItems.map(item => ({
        jid: item.attrs.jid,
        name: item.attrs.name || 'No name',
        username: item.attrs.jid.split('@')[0],
        image: getImageByJid(item.attrs.jid),
        status: getStatusByJid(item.attrs.jid),
      }));
  
      // Request the list of rooms the user is in
      const roomsRequest = xml('iq', { type: 'get', id: 'add-rooms-request' }, 
        xml('query', 'jabber:iq:private', xml('storage', 'storage:bookmarks'))
      );

      const roomsResponse = await sendRequest(roomsRequest);
  
      // Extract rooms from the response
      const roomItems = roomsResponse.getChild('query').getChild('storage').getChildren('conference');
      rooms = roomItems.map(item => ({
        jid: item.attrs.jid,
        name: "", // Placeholder for group name
      }));
  
      // Request details for each group chat and update room names
      await Promise.all(rooms.map(async (room) => {
        const roomInfoRequest = xml('iq', { type: 'get', id: `gcinformation-request${room.jid}`, to: room.jid },
          xml('query', 'http://jabber.org/protocol/disco#info')
        );
        const roomInfoResponse = await sendRequest(roomInfoRequest);
        console.log(roomInfoResponse)
        const name_ = roomInfoResponse.getChild('query')?.getChild('identity')?.attrs.name ?? null;
        room.name = name_ || 'Groupchat';
      }));
  
      // Create the conferencesList array for adding bookmarks
      const conferencesList = rooms
        .map(group => xml('conference', { autojoin: 'true', jid: group.jid }));

      // Combine contacts and rooms into a single list
      combinedList = [
        ...contacts,
        ...rooms.map(room => ({
          jid: room.jid,
          name: room.name,
          username: null, // Set username to null for groups
          image: null, // Set image to null for groups
          status: null, // Set status to null for groups
        }))
      ];

      // Add the current user's conference room
      if(actionType === 'group'){
        combinedList.push({ 
          jid: `${values.username}@conference.alumchat.lol`,
          name: `${values.username}`,
          username: null, // Set username to null for groups
          image: null, // Set image to null for groups
          status: null, // Set status to null for groups
        })

        conferencesList.push(xml('conference', { autojoin: 'true', jid: `${values.username}@conference.alumchat.lol` }));
        // Create and send the request to add the bookmark
        const addBmRequest = xml('iq', { type: 'set', id: 'addbookmark-request' }, 
          xml('pubsub', { xmlns: 'http://jabber.org/protocol/pubsub' }, 
            xml('publish', { node: 'storage:bookmarks' }, 
              xml('item', { id: 'current' }, 
                xml('storage', { xmlns: 'storage:bookmarks' }, ...conferencesList)
              )
            ),
            xml('publish-options', {}, 
              xml('x', { xmlns: 'jabber:x:data', type: 'submit' }, 
                xml('field', { var: 'FORM_TYPE', type: 'hidden' }, 
                  xml('value', {}, 'http://jabber.org/protocol/pubsub#publish-options')
                ),
                xml('field', { var: 'pubsub#persist_items' }, 
                  xml('value', {}, '1')
                ),
                xml('field', { var: 'pubsub#access_model' }, 
                  xml('value', {}, 'whitelist')
                )
              )
            )
          )
        );
        await sendRequest(addBmRequest);
      }
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