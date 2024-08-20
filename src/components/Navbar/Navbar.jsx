import React, { useState } from 'react';
import {
  Box,
  Typography,
  useTheme,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  IconButton,
} from "@mui/material";
import { styled } from '@mui/material/styles';
import FlexBetween from '../../FlexBetween';
import { useSelector } from 'react-redux';
import PersonAdd from '@mui/icons-material/PersonAdd';
import Logout from '@mui/icons-material/Logout';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from "react-router-dom";
import { setLogout } from '../../state';
import { useDispatch } from 'react-redux';
import { useXMPP } from '../../context/XMPPContext';
import { xml } from '@xmpp/client';
import AddContact from '../AddContact/AddContact';
import EditStatus from '../EditStatus';

// Define status colors
const statusColors = {
  dnd: "#D90429",  // Do Not Disturb
  chat: "#44B700", // Available
  away: "#F6AA1C", // Away
  xa: "#0077B6" // Exteded away
};

// Styled Badge Component
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

const Navbar = () => {
  const { palette } = useTheme();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user); // Retrieve username from Redux store
  const [anchorEl, setAnchorEl] = useState(null);
  const [openAddContact, setOpenAddContact] = useState(false);
  const [openEditStatus, setEditStatus] = useState(false);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const { xmppClient } = useXMPP(); 
  const images = useSelector((state) => state.images);
  const status_list = useSelector((state) => state.statusList);


  // Determine status
  const userStatus = xmppClient ? 'connected' : 'offline'; // Update this logic as needed
  const badgeColor = statusColors[userStatus];

  const getImageByJid = (jid) => {
    const image = images.find(img => img.jid === jid);
    return image ? image.image : '';
  };

  const getStatusByJid = (jid) => {
    const status_ = status_list.find(status => status.jid === jid);
    console.log(status_)
    return status_ ? status_.status : '';
  };
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      if (xmppClient) {
        console.log('Stopping connection in xmpp'); // Log the error for debugging
        await xmppClient.stop();
      }
      dispatch(setLogout()); // Dispatch the logout action
      handleClose(); // Close the menu
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err); // Log the error for debugging
      alert('An error occurred while logging out. Please try again.'); // Set error message
    }
  };

  const handleEditStatus = async () => {
      handleClose(); // Close the menu
      setEditStatus(true); // Open the editStatus modal
  };

  const handleDelete = async () => {
    if (!xmppClient) {
      console.error('XMPP client is not connected');
      return;
    }

    // Create the deletion request
    const deletionRequest = xml('iq', { type: 'set', id: 'delete-account' }, [
      xml('query', { xmlns: 'jabber:iq:register' }, [
        xml('remove', {}, [])
      ])
    ]);

    try {
      await xmppClient.send(deletionRequest);
      console.log('Account deletion request sent');

      // Optionally wait a bit to ensure the request is processed
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1-second delay

      await xmppClient.stop(); // Stop the client after the request
      dispatch(setLogout()); // Optionally, log out the user from the app
      navigate('/'); // Redirect to home or login page
    } catch (error) {
      console.error('Failed to send account deletion request:', error);
      alert('Failed to delete the account. Please try again.');
    }
  };

  const handleAddContact = () => {
    handleClose(); // Close the menu
    setOpenAddContact(true); // Open the AddContact modal
  };

  return (
    <FlexBetween
      display="flex"
      justifyContent="space-between"
      gap="30px"
      sx={{
        backgroundColor: palette.grey[100],
        padding: '1rem 2rem',
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)',
      }}
    >
      <Typography variant="h4" sx={{ color: palette.primary.main, fontWeight: '700' }}>
        💬 XmppClient
      </Typography>
      
      <Box display="flex" alignItems="center" gap="10px">
        <Typography sx={{ fontWeight: '100' }}>
          Hello,{' '}
          <span style={{ color: palette.primary.main, fontWeight: '500' }}>
            {user || "Guest"}.
          </span>
        </Typography>
        
        <Tooltip title="More options">
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{ ml: 2 }}
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <StyledBadge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              variant="dot"
              status={getStatusByJid(`${user}@alumchat.lol`)} // Pass the status color here
            >
              <Avatar alt="User Avatar" src={getImageByJid(`${user}@alumchat.lol`)} />
            </StyledBadge>
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleAddContact}>
            <PersonAdd fontSize="small" sx={{ marginRight: 1 }} />
            Add contact
          </MenuItem>
          <MenuItem onClick={handleEditStatus}>
            <EditIcon fontSize="small" sx={{ marginRight: 1 }} />
            Edit Status
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <Logout fontSize="small" sx={{ marginRight: 1 }} />
            Logout
          </MenuItem>
          <MenuItem onClick={handleDelete}>
            <DeleteIcon fontSize="small" sx={{ marginRight: 1 }} />
            Delete account
          </MenuItem>
        </Menu>
      </Box>

      {/* AddContact Modal */}
      <AddContact open={openAddContact} onClose={() => setOpenAddContact(false)} />

      {/* Edit Status Modal */}
      <EditStatus open={openEditStatus} onClose={() => setEditStatus(false)} />
        
    </FlexBetween>
  );
};

export default Navbar;