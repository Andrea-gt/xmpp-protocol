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
  TextField,
  Button
} from "@mui/material";

import AttachFileIcon from'@mui/icons-material/AttachFile';
import SendIcon from '@mui/icons-material/Send';

const Chat = () => {
  const { palette } = useTheme();
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleSubmit = () => {
    // Handle message submissionconsole.log('Message:', message);
    console.log('File:', file);
    // Reset input fields after submissionsetMessage('');
    setFile(null);
  };

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
        height="90%"
        sx ={{
          background: 'rgba(0, 0, 0, 0.6)',
        }}
      />
      {/* Chat messages go here */}
      <Box
        display="flex"
        flexDirection="row"
        width="100%"
        height="10%"
        alignItems="center"
        padding="0 0.8rem"
        gap="10px"
        sx ={{
          backgroundColor: palette.grey[200]
        }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your message..."
          value={message}
          size="small"
          sx={{
            backgroundColor: "#F6F6F6"
          }}
          onChange={handleMessageChange}
        />
        <input
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
          style={{ display: 'none' }}
          id="file-upload"
          type="file"
          onChange={handleFileChange}
        />
        <Tooltip title="Attach a file">
          <IconButton component="label" htmlFor="file-upload">
            <AttachFileIcon />
          </IconButton>
        </Tooltip>
        <Button
          variant="contained"
          color="primary"
          endIcon={<SendIcon />}
          onClick={handleSubmit}>Send</Button>
      </Box>
    </Box>
  );
};

export default Chat;