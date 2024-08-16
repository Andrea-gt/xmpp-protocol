import React from 'react';
import { Box, Typography, useTheme, styled, Badge, Avatar } from "@mui/material";

// Define status colors
const statusColors = {
  dnd: "#D90429",
  chat: "#44B700",
  away: "#F6AA1C",
};

// Sample user data
const testUsers = [
  {
    name: "Alice Johnson",
    username: "alice_j",
    status: "dnd",
    image: "alice.jpg",
    jid: "alice@alumchat.lol"
  },
  {
    name: "Bob Smith",
    username: "bob_s",
    status: "xa",
    image: "bob.jpg",
    jid: "bob@alumchat.lol"
  },
  {
    name: "Charlie Brown",
    username: "charlie_b",
    status: "away",
    image: "charlie.jpg",
    jid: "charlie@alumchat.lol"
  },
  {
    name: "Diana Prince",
    username: "diana_p",
    status: "dnd",
    image: "diana.jpg",
    jid: "diana@alumchat.lol"
  },
  {
    name: "Edward Cullen",
    username: "edward_c",
    status: "chat",
    image: "edward.jpg",
    jid: "edward@alumchat.lol"
  },
  {
    name: "Fiona Apple",
    username: "fiona_a",
    status: "away",
    image: "fiona.jpg",
    jid: "fiona@alumchat.lol"
  },
  {
    name: "George Bailey",
    username: "george_b",
    status: "dnd",
    image: "george.jpg",
    jid: "george@alumchat.lol"
  },
  {
    name: "Hannah Montana",
    username: "hannah_m",
    status: "chat",
    image: "hannah.jpg",
    jid: "hannah@alumchat.lol"
  },
  {
    name: "Ian Malcolm",
    username: "ian_m",
    status: "away",
    image: "ian.jpg",
    jid: "ian@alumchat.lol"
  },
  {
    name: "Judy Garland",
    username: "judy_g",
    status: "dnd",
    image: "judy.jpg",
    jid: "judy@alumchat.lol"
  },
];

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

const ContactList = () => {
  const { palette } = useTheme();

  // Handle user click
  const handleUserClick = (user) => {
    console.log(`User clicked: ${user.username}`);
    // Add further logic here
  };


  return (
    <Box
      display="flex"
      flexDirection="column"
      gap="20px"
      width="30%"
      sx={{ height: '100%', overflowY: 'auto' }}
    >
      <Typography variant="h4" sx={{ color: palette.primary.main, fontWeight: '700' }}> Contacts </Typography>
      <Box
        display="flex"
        flexDirection="column"
        gap="15px"
        minWidth="100%"
        sx={{
          padding: '0.5rem 0.5rem',
          maxHeight: "65%",
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
        {testUsers.map((user) => (
          <Box
            key={user.username}
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
            onClick={() => handleUserClick(user)}
          >
            <StyledBadge
              status={user.status}
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              variant='dot'
              sx={{ marginRight: '1rem' }}
            >
              <Avatar
                alt={user.username}
                src={user.image}
                sx={{ width: 50, height: 50 }}
              />
            </StyledBadge>
            <Box display="flex" flexDirection="column">
              <Typography sx={{ color: palette.primary.dark, fontWeight: '500' }}>{user.username}</Typography>
              <Typography sx={{ color: 'grey' }}>{user.name}, {user.jid}</Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default ContactList;