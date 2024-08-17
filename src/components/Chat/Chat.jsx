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

const Chat = () => {
  const { palette } = useTheme();

  return (
    <Box
    width="100%"
    sx={{
      backgroundImage: `url(/public/chat_bg.jpeg)`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      boxShadow: 'inset 0px 0px 20px rgba(0, 0, 0, 0.5)',
      padding: '1rem 1rem',
      boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)',
    }}
    >
      <Box
        width="100%"
        height="100%"
        sx ={{
          background: 'rgba(0, 0, 0, 0.5)',
        }}
      >
        ""
      </Box>

    </Box>
  );
};

export default Chat;