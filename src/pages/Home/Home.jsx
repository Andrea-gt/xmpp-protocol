/**
 * @file Home.js
 * @description The Home component serves as the main interface for authenticated users, displaying contact lists and chat functionality.
 *              It handles incoming notifications, manages XMPP contact requests, and integrates with Redux for state management.
 *              The component uses Material-UI for layout and styling.
 * 
 *              Key functionalities provided by this component include:
 *              - Displaying and managing contacts and chat interactions.
 *              - Handling notifications with a Snackbar component.
 *              - Processing XMPP presence and roster requests.
 *              - Retrieving and displaying user images and statuses.
 * 
 * @author Andrea Ximena Ramirez Recinos
 * @created Aug 2024
 * 
 * @note Documentation Generated with ChatGPT
 */

import React, { useEffect } from 'react';
import {
  Box,
  useTheme,
  Snackbar,
  Button,
  IconButton
} from "@mui/material";
import FlexBetween from '../../FlexBetween';
import Navbar from '../../components/Navbar/Navbar';
import ContactList from '../../components/ContactList/ContactList';
import Chat from '../../components/Chat/Chat';
import { useSelector, useDispatch } from 'react-redux';
import { 
  setNotification,
  setContacts
} from '../../state';
import CloseIcon from '@mui/icons-material/Close';
import { useXMPP } from '../../context/XMPPContext';
import { xml } from '@xmpp/client';

/**
 * Home component that provides the main user interface for displaying contacts and chat.
 *
 * @param {Object} props - Component properties.
 * @param {Array} props.statusList - List of contact statuses.
 * @param {Array} props.images - List of contact images.
 * @returns {JSX.Element} - The Home component.
 */
const Home = ({ statusList, images }) => {
  const { palette } = useTheme();
  const dispatch = useDispatch();
  const snackbarMessage = useSelector((state) => state.notification);
  const snackbar_type = useSelector((state) => state.type);
  const snackbar_from = useSelector((state) => state.from);
  const user = useSelector((state) => state.user); // Retrieve username from Redux store
  const [openSnackbar, setOpenSnackbar] = React.useState(false);
  const { xmppClient } = useXMPP(); // Access XMPP client from context

  // Create an XMPP presence stanza to request adding a contact
  const presenceRequest = xml('presence', { type: 'subscribed', to: snackbar_from });
  // Create an XMPP IQ stanza to request the contact list
  const rosterRequest = xml('iq', { type: 'get', id: 'roster-request', from: `${user}@alumchat.lol` }, [xml('query', { xmlns: 'jabber:iq:roster' })]);
  // Create an XMPP IQ stanza to accept a contact request
  const acceptContactRequest = xml('iq', { type: 'set', id: 'accept-request' }, [xml('query', { xmlns: 'jabber:iq:roster' }, [
      xml('item', { jid: snackbar_from, subscription: 'both' })
    ])
  ]);

  useEffect(() => {
    if (snackbarMessage) {
      setOpenSnackbar(true);
    }
  }, [snackbarMessage]);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    dispatch(setNotification('')); // Clear the message after displaying it
  };

  const getImageByJid = (jid) => {
    console.log('Looking for image with JID:', jid);
    const image = images.find(img => img.jid === jid);
    console.log('Found image:', image);
    return image ? image.image : ''; // Return image URL or empty string if not found
  };
  
  const getStatusByJid = (jid) => {
    console.log('Looking for status with JID:', jid);
    console.log(statusList)
    const status = statusList.find(status => status.jid === jid);
    console.log('Found status:', status);
    return status ? status.status : ''; // Return status or empty string if not found
  };

  const handleAccept = async () => {
    try {
      await xmppClient.send(acceptContactRequest);
      await xmppClient.send(presenceRequest);
      console.log('Contact added successfully'); // Log success message
      try {
        // Send the roster request IQ stanza
        await xmppClient.send(rosterRequest);
        // Handle incoming roster response
        xmppClient.on('stanza', (stanza) => {
          console.log(stanza)
          if (stanza.is("iq") && stanza.attrs.id === 'roster-request') {
            const query = stanza.getChild('query');
            const items = query.getChildren('item');
            // Transform XML data into JSON format
            const contacts = items.map(item => ({
              jid: item.attrs.jid, // JID of the contact
              name: item.attrs.name || 'No name', // Contact's name (default to 'No name' if not present)
              username: item.attrs.jid.split('@')[0], // Extract username from JID
              image: getImageByJid(item.attrs.jid), // Placeholder for image URL (requires additional handling if images are provided)
              status: getStatusByJid(item.attrs.jid) // Contact's status (default to empty string if not present)
            }));
            console.log( contacts )
            dispatch(setContacts({ contacts: contacts }));
          }
        });
      } catch (error) {
        console.error("Error getting contact list:", error);
      }
    } catch (error){
      console.error('Failed to accept contact:', error); // Log error if contact addition fails
    }
    setOpenSnackbar(false);
    dispatch(setNotification(''));
  };

  const action = (
    <React.Fragment>
      {snackbar_type === 'subscription' && (
        <Button sx={{ color: palette.primary.main} } size="small" onClick={handleAccept}>
          Accept
        </Button>
      )}
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleCloseSnackbar}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  return (
    <FlexBetween
      display="flex"
      flexDirection="column"
      sx={{
        backgroundColor: palette.grey[200],
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <Box
        display="flex"
        flexDirection="column"
        sx={{
          width: "100%",
          height: '100%',
        }}
      >
        <Navbar />
        <Box
          display="flex"
          flexDirection="row"
          gap="50px"
          height="90%"
          sx={{ padding: '5rem' }}
        >
          <ContactList statusList={statusList} images={images}/>
          <Chat />
        </Box>
      </Box>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        severity="info"
        variant="filled"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        message={snackbarMessage}
        action={action}
      />
    </FlexBetween>
  );
};

export default Home;