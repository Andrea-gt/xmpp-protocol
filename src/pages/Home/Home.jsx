import React from 'react';
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
import Navbar from '../../components/Navbar/Navbar';
import ContactList from '../../components/ContactList/ContactList';
import Chat from '../../components/Chat/Chat';

const Home = ({ statusList, images }) => {
  const { palette } = useTheme();
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
    </FlexBetween>
  );
};

export default Home;