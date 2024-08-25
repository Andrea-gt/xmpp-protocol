/**
 * @file Login.js
 * @description The Login component provides a form for users to log in. It uses Formik for form management, 
 *              Material-UI for styling, and Redux for state management. Upon successful authentication, 
 *              it connects to the XMPP server and navigates to the home page.
 * 
 *              Key functionalities provided by this component include:
 *              - Handling user input and form validation.
 *              - Managing form state with Formik and validation with Yup.
 *              - Connecting to the XMPP server upon successful login.
 *              - Navigating to the home page upon successful authentication.
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
import { connectXMPP } from '../../utils/xmppClient';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { 
  setLogin, 
  setContacts, 
  updateContactStatus, 
  addOrUpdateImage,
  addOrUpdateStatus,
  setMessages,
  setNotification
 } from '../../state';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useXMPP } from '../../context/XMPPContext';
import { xml } from '@xmpp/client';

// Schema for validating login form fields using Yup
const loginSchema = yup.object().shape({
  username: yup.string().required("*Required"), // Username is required
  password: yup.string().required("*Required"), // Password is required
});

/**
 * Login component that provides the main user interface for user auth.
 *
 * @param {Object} props - Component properties.
 * @param {Array} props.status_list - List of contact statuses.
 * @param {Array} props.images - List of contact images.
 * @returns {JSX.Element} - The Login component.
 */
const Login = ({ status_list, toggleForm }) => {
  const { palette } = useTheme(); // Retrieve theme palette from Material-UI
  const dispatch = useDispatch(); // Get dispatch function from Redux
  const [errorMessage, setErrorMessage] = React.useState(''); // State for managing error messages
  const navigate = useNavigate(); // Hook for navigation
  const { updateClient } = useXMPP(); // Custom hook for XMPP context
  let images = useSelector((state) => state.images);
  //let status_list = useSelector((state) => state.statusList);
  const messages = useSelector((state) => state.messages);

  // Handle form submission
  const handleSubmit = async (values) => {
    const { username, password } = values;
    let rooms = []

    try {
      // Attempt to connect to XMPP server
      const connection = await connectXMPP(username, password);
      updateClient(connection); // Update XMPP client in context
      dispatch(setLogin({ user: username })); // Update Redux store with logged-in user

      // Create an XMPP IQ stanza to request the contact list
      const rosterRequest = xml('iq', { type: 'get', id: 'roster-request' }, [
        xml('query', { xmlns: 'jabber:iq:roster' })
      ]);
      // Create IQ stanza to request list of rooms the user is in
      const requestRooms = xml('iq', { type: 'get', id: 'rooms-request' }, xml('query', 'jabber:iq:private', xml('storage', 'storage:bookmarks')));
      // Create an XMPP IQ stanza to request the chat list
      const chatRequest = xml('iq', { type: 'set', id: 'mamReq' }, xml('query', { xmlns: 'urn:xmpp:mam:2', queryid: 'f27' }));
      // Create an XMPP IQ stanza to request the user pfp.
      const pfpRequest = xml('iq', { type: 'get', id: `userpfp-request`, to: `${username}@alumchat.lol` },
        xml('pubsub', { xmlns: 'http://jabber.org/protocol/pubsub' },
            xml('items', { node: 'urn:xmpp:avatar:data' })
        )
      );

      try {
        // Send the roster request IQ stanza
        await connection.send(requestRooms);
        // Send the chat request IQ stanza
        await connection.send(chatRequest);
        // Send the chat request IQ stanza
        await connection.send(pfpRequest);
        // Send the roster request IQ stanza
        await connection.send(rosterRequest);

        // Handle incoming roster response
        connection.on('stanza', (stanza) => {
          if (stanza.is("iq") && stanza.getAttr("id") === 'rooms-request') {
            console.log(stanza);
            const items = stanza.getChild('query').getChild('storage').getChildren('conference');
            rooms = items.map(item => ({
              jid: item.attrs.jid,
              name: "Groupchat", // Placeholder for group name
            }));
            // Request details for each group chat
            rooms.forEach(chat => {
              connection.send(xml('iq', { type: 'get', id: `gcinformation-request`, to: chat.jid },
                xml('query', 'http://jabber.org/protocol/disco#info')
              ));
            });
          }
  
          if (stanza.is("iq") && stanza.getAttr("id") === 'gcinformation-request') {
              console.log(stanza);
              const jid = stanza.attrs.from;
              const room = rooms.find(c => c.jid === jid);
              console.log(jid, room)
              if (room) {
                const name_ = stanza.getChild('query')?.getChild('identity')?.attrs.name ?? null;
                room.name = name_ ? name_ : 'Groupchat';
              }
          }

          if (stanza.is("iq") && stanza.attrs.id === 'roster-request') {
            console.log('roster')
            const query = stanza.getChild('query');
            const items = query.getChildren('item');
            // Transform XML data into JSON format
            const contacts = items.map(item => {
              // Find the status entry for the current item
              const statusEntry = status_list?.find(status => status.jid === item.attrs.jid) || {};
              return {
                jid: item.attrs.jid, // JID of the contact
                name: item.attrs.name || 'No name', // Contact's name (default to 'No name' if not present)
                username: item.attrs.jid.split('@')[0], // Extract username from JID
                image: images.find(img => img.jid === item.attrs.jid),
                status: statusEntry.status, // Status from status_list
                status_text: statusEntry.status_text // Status text from status_list
              };
            }); 

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
            
            console.log(rooms)
            // Dispatch the combined list as contacts
            dispatch(setContacts({ contacts: combinedList }));

            // Fetch avatars for each contact
            contacts.forEach((contact, index) => {
              const contactpfpRequest = xml('iq', { type: 'get', id: `pfp-request-${contact.jid}`, to: contact.jid },
                  xml('pubsub', { xmlns: 'http://jabber.org/protocol/pubsub' },
                      xml('items', { node: 'urn:xmpp:avatar:data' })
                  )
              );
              connection.send(contactpfpRequest);});
          };

          if (stanza.is('presence')) {
            if(stanza.attrs.type === "subscribe"){
              // Set Snackbar message and open it
              dispatch(setNotification({ notification: `You've been added by ${stanza.attrs.from.split('@')[0]}!`, type: 'subscription', from: stanza.attrs.from }));
            } else {
              let status = '';
              let status_text = null;
              let fromJid = stanza.attrs.from.split('/')[0]; // Get the JID of the user sending the presence

              if (stanza.attrs && stanza.attrs.type === "unavailable") {
                status = "unavailable";
              } else {
                status = stanza.getChildText('show') || 'chat'; // Extract the status, default to 'chat' if not present
                status_text = stanza.getChildText('status') || null;
              }

              console.log(fromJid, status)
              // Dispatch actions to update contact image and status
              dispatch(addOrUpdateStatus({ jid: fromJid, status: status, status_text: status_text }));
              dispatch(updateContactStatus({ jid: fromJid, status: status, status_text: status_text }));
            }
          }

          if (stanza.is("message")) {
            let message;
            if (stanza.getChild('result')) {
              // Case when 'result' is present
              const result = stanza.getChild('result');
              const forwardedMessage = result.getChild('forwarded').getChild('message');
              const delay = result.getChild('forwarded').getChild('delay');
              let image = null
              // Check for an 'x' element with the 'jabber:x:oob' namespace
              const oobElement = forwardedMessage.getChild('x', 'jabber:x:oob');
              if (oobElement) {
                const urlElement = oobElement.getChild('url');
                if (urlElement) {
                  image = urlElement.getText(); // Retrieve the URL of the image
                }
              }
              message = {
                to: forwardedMessage.getAttr('to'),
                from: forwardedMessage.getAttr('from').split('/')[0],
                timestamp: delay.getAttr('stamp'),
                content: forwardedMessage.getChild('body').getText(),
                image: image,
                complete_from: forwardedMessage.getAttr('from')
              };
              //console.log(message)
            } else if (stanza.getChild('body')) {
              console.log('TEST', stanza)
              let image = null
              // Case when only 'body' is present
              const body = stanza.getChild('body');
              if(stanza.getChild('x')){
                image = stanza.getChild('x').getChildText('url')
              }
              console.log(stanza.attrs.from)
              message = {
                to: stanza.attrs.to,  // No 'to' attribute available
                from: stanza.attrs.from.split('/')[0], // No 'from' attribute available
                timestamp: new Date().toISOString(), // No timestamp available
                content: body.getText(),
                image: image,
                complete_from: stanza.attrs.from
              };

              console.log(message.complete_from)

              // Set Snackbar message and open it
              dispatch(setNotification({ notification: `New message from ${message.from}`, type: 'message', from: message.from }));

            } else if (stanza.getChild('event')) {
              // Case when only 'event' is present
              const fromJid = stanza.attrs.from.split('/')[0]; // Get the JID of the sender
              const dataChild = stanza.getChild('event').getChild('items').getChild('item').getChild('data');

              if (dataChild) {
                const base64Image = dataChild.text();
                const imageURL = `data:image/jpeg;base64,${base64Image}`;
                // Dispatch action to update contact image (initial call)
                dispatch(addOrUpdateImage({ jid: fromJid, image: imageURL }));
                // Dispatch action to update contact status
                dispatch(updateContactStatus({ jid: fromJid, image: imageURL }));
              }
            } if (message) {
              dispatch(setMessages({ messages: [...messages, message] }));
            }
          }
        });
        setErrorMessage(''); // Clear any previous error message
        navigate("/home"); // Navigate to the home page upon successful login
      } catch (error) {
        console.error("Error getting contact list:", error);
      }
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
        <Box sx={{ padding: '16px', borderRadius: '8px' }}>
          <Formik
            initialValues={{ username: '', password: '' }} // Initial form values
            validationSchema={loginSchema} // Form validation schema
            onSubmit={handleSubmit} // Handle form submission
          >
            {({ errors, touched, isValid, dirty }) => (
              <Form>
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
                  disabled={!isValid || !dirty}
                  fullWidth
                  sx={{
                    backgroundColor: palette.primary.main,
                    '&:hover': {
                      backgroundColor: palette.primary.dark,
                    },
                  }}
                >
                  Login
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
          Don't have an account? Register here.
      </Typography>
      </Box>
    </FlexBetween>
  );
};

export default Login;