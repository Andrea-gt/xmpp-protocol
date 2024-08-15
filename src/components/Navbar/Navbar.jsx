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
import { useNavigate } from "react-router-dom";
import { setLogout } from '../../state';
import { useDispatch } from 'react-redux';
import { useXMPP } from '../../context/XMPPContext';
import { xml } from '@xmpp/client';
import AddContact from '../AddContact/AddContact';

// Styled Badge Component
const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

const Navbar = () => {
  const { palette } = useTheme();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user); // Retrieve username from Redux store
  const [anchorEl, setAnchorEl] = useState(null);
  const [openAddContact, setOpenAddContact] = useState(false);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const { xmppClient } = useXMPP(); 

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
      await new Promise(resolve => setTimeout(resolve, 1000)); // 2-second delay

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
            >
              <Avatar alt="User Avatar" src="/static/images/avatar/1.jpg" />
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
        
    </FlexBetween>
  );
};

export default Navbar;