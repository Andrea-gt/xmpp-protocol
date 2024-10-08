/**
 * @file EditStatus.jsx
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

import React, { useEffect } from 'react';
import { Box, Typography, useTheme, styled, Badge, Avatar } from "@mui/material";
import { useSelector } from 'react-redux';
import { setChat } from '../../state';
import { useDispatch } from 'react-redux';

/**
 * Status colors for different user statuses.
 * 
 * @type {Object}
 * @property {string} dnd - Color for 'Do Not Disturb' status.
 * @property {string} chat - Color for 'Available' status.
 * @property {string} away - Color for 'Away' status.
 */
const statusColors = {
  dnd: "#D90429",  // Do Not Disturb
  chat: "#44B700", // Available
  away: "#F6AA1C", // Away
  xa: "#0077B6" // Exteded away
};

/**
 * Sample user data for testing purposes.
 * 
 * @type {Array<Object>}
 * @property {string} name - Full name of the user.
 * @property {string} username - Username of the user.
 * @property {string} status - Current status of the user.
 * @property {string} image - Path to the user's avatar image.
 * @property {string} jid - Jabber ID of the user.
 */

/**
 * Styled Badge component to show user status.
 * 
 * @component
 * @example
 * <StyledBadge status="chat" overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} variant="dot">
 *   <Avatar src="path/to/avatar.jpg" />
 * </StyledBadge>
 * 
 * @param {Object} props - Component properties
 * @param {string} props.status - The user's status to determine badge color
 * @returns {JSX.Element} The StyledBadge component
 */
const StyledBadge = styled(Badge)(({ theme, status }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: statusColors[status] || '#A3A3A3',
    color: statusColors[status] || '#A3A3A3',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      border: '1px solid currentColor',
      content: '""',
    },
  },
}));

/**
 * ContactList Component
 * 
 * This component displays a list of contacts with their status indicators.
 * If no contacts are available, it shows a "No contacts available" message.
 * 
 * @component
 * @example
 * return <ContactList />;
 * 
 * @returns {JSX.Element} The ContactList component
 */
const ContactList = ({ statusList, images }) => {
  const { palette } = useTheme();
  const dispatch = useDispatch(); // Get dispatch function from Redux
  const users = useSelector((state) => state.contacts); 

  /**
   * Handles click events on a user.
   * 
   * @param {Object} user - The user object for the clicked contact
   */
  const handleUserClick = (user, users) => {
    // Check if the JID contains "conference" to determine if it's a group chat
    const isGroupChat = user.jid.includes("conference");
    // Dispatch the chat action with the appropriate JID format
    dispatch(setChat({ chat_jid: isGroupChat ? `${user.jid}` : `${user.username}@alumchat.lol` }));
  };  

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap="20px"
      width="40%"
      sx={{ maxHeight: '100%', overflowY: 'auto' }}
    >
      <Typography variant="h4" sx={{ color: palette.primary.main, fontWeight: '700' }}> Contacts </Typography>
      {users.length === 0 ? (
        <Typography sx={{ textAlign: 'left', color: 'grey', marginTop: '20px' }}>
          No contacts here yet! Add some friends to start chatting.
        </Typography>
      ) : (
        <Box
          display="flex"
          flexDirection="column"
          gap="15px"
          minWidth="100%"
          sx={{
            padding: '0.5rem 0.5rem',
            height: "65%",
            width: "100%",
            overflowY: "auto",
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#F5F5F5',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: palette.primary.main,
              borderRadius: '8px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              backgroundColor: palette.primary.dark,
            },
            scrollbarWidth: 'thin', // For Firefox
            scrollbarColor: `${palette.primary.main} ${'#F5F5F5'}`, // For Firefox
          }}
        >
          {users.map((user) => {
            return (
              <Box
              key={user.jid}
              display="flex"
              flexDirection="row"
              height="75px"
              alignItems="center"
              sx={{
                padding: '1rem 2rem',
                backgroundColor: "#F5F5F5",
                boxShadow: `0 2px 4px rgba(0, 0, 0, 0.1)`,
                cursor: 'pointer'
              }}
              onClick={() => handleUserClick(user, users)}
            >
              <StyledBadge
                status={statusList ? statusList.find(s => s.jid === user.jid)?.status : ''}
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                variant='dot'
                sx={{ marginRight: '1rem' }}
              >
                <Avatar
                  alt={user.username}
                  src={images.find(s => s.jid === user.jid)?.image}
                  sx={{ width: 50, height: 50 }}
                />
              </StyledBadge>
              <Box display="flex" flexDirection="column">
                <Typography sx={{ color: palette.primary.dark, fontWeight: '500' }}>{user.username}</Typography>
                <Typography sx={{ fontSize: "9px", color: palette.primary.main }}>
                  {statusList ? (statusList.find(s => s.jid === user.jid)?.status_text ? `"${statusList.find(s => s.jid === user.jid)?.status_text}"` : '') : ''}
                </Typography>
                <Typography sx={{ color: 'grey' }}>{user.name}, {user.jid}</Typography>
              </Box>
            </Box>
            )
          }
          )}
        </Box>
      )}
    </Box>
  );
};

export default ContactList;