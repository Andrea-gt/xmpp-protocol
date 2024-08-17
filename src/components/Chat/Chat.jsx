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
import { useSelector, useDispatch } from 'react-redux';

const ChatBubble = ({ from, message, timestamp, isCurrentUser }) => {
  const { palette } = useTheme();

  return (
    <Box 
    display="flex"
    flexDirection="column"
    alignItems={isCurrentUser ? 'flex-end' : 'flex-start'}
    marginBottom="15px">
      <Typography marginBottom="5px" color={"#F0F0F0"} variant="body1">{ isCurrentUser ? "You" : from } </Typography>
      <Box
        padding="10px"
        borderRadius="10px"
        maxWidth="70%"
        sx={{
          backgroundColor: isCurrentUser ? palette.primary.main : palette.grey[300],
          color: isCurrentUser ? palette.primary.contrastText : palette.text.primary,
          alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
        }}
      >
        <Typography variant="body1">{message}</Typography>
        <Typography variant="caption" align="right" sx={{ display: 'block', marginTop: '5px' }}>
          {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Typography>
      </Box>
    </Box>
  );
};

const Chat = () => {
  const { palette } = useTheme();
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const username = useSelector((state) => state.user);
  const messages = useSelector((state) => state.messages);
  const chat_jid = useSelector((state) => state.chat_jid);
  const filteredMessages = messages.filter(msg => msg.from === chat_jid);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleSubmit = () => {
    console.log('Message:', message);
    console.log('File:', file);
    setFile(null);
  };

  return (
    <Box
    width="100%"
    minHeight="90%"
    sx={{
      backgroundImage: `url(/public/chat_bg.jpeg)`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      boxShadow: 'inset 0px 0px 20px rgba(0, 0, 0, 0.5)',
      padding: '1rem 1rem',
      boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)',
    }}>
      <Box
        width="100%"
        height="90%"
        padding="2rem"
        overflow="auto"
        sx ={{
          background: 'rgba(0, 0, 0, 0.6)',
        }}>
        {filteredMessages.map((msg, index) => (
          <ChatBubble key={index} from={msg.from} message={msg.message} timestamp={msg.timestamp} isCurrentUser={msg.from === username}
          />
        ))}
      </Box>
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
            backgroundColor: "#F0F0F0"
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