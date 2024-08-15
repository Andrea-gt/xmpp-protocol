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

const Home = () => {
  const { palette } = useTheme();
  return (
    <FlexBetween
      display="flex"
      flexDirection="column"
      sx={{
        backgroundColor: palette.grey[200],
        height: '100vh',
      }}
    >
      <Box
        display="flex"
        flexDirection="column"
        sx={{
          width: "100%"
        }}
      >
      <Navbar />
      <Box
        display="flex"
        flexDirection="row"
        gap="50px"
        sx={{padding: '5rem',}}
      >
        Test
      </Box>
      </Box>
    </FlexBetween>
  );
};

export default Home;