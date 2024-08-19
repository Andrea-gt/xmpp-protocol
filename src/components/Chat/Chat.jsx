/**
 * Chat component for displaying and sending messages in a chat interface.
 * 
 * This component handles the chat interface, including displaying individual chat messages 
 * and providing functionality for sending messages and attaching files.
 * 
 * Dependencies:
 * - @mui/material
 * - @mui/icons-material
 * - react-redux
 * - @xmpp/client
 * 
 * Created by [Your Name] - [Date]
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  useTheme,
  Tooltip,
  IconButton,
  TextField,
  Button
} from "@mui/material";
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SendIcon from '@mui/icons-material/Send';
import { useSelector, useDispatch } from 'react-redux';
import { 
  setMessages
 } from '../../state';
import { useXMPP } from '../../context/XMPPContext';
import { xml } from '@xmpp/client';

/**
 * ChatBubble component displays an individual chat message.
 * @param {Object} props - The component props.
 * @param {string} props.from - The sender's username.
 * @param {string} props.message - The message content.
 * @param {number} props.timestamp - The timestamp of the message.
 * @param {boolean} props.isCurrentUser - Flag indicating if the message is from the current user.
 */
const ChatBubble = ({ from = 'Unknown', message = '', timestamp = Date.now(), isCurrentUser = false }) => {
  const { palette } = useTheme();

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems={isCurrentUser ? 'flex-end' : 'flex-start'}
      marginBottom="15px"
    >
      <Typography marginBottom="5px" color="#F0F0F0" variant="body1">
        {isCurrentUser ? "You" : from}
      </Typography>
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

/**
 * Chat component manages the chat interface and message sending functionality.
 */
const Chat = () => {
  const { palette } = useTheme();
  const [message, setMessage] = useState(''); // State to manage the message input
  const [file, setFile] = useState(null); // State to manage the selected file
  const [filteredMessages, setFilteredMessages] = useState([]); // State to manage the filtered messages
  const dispatch = useDispatch(); // Get dispatch function from Redux
  const username = useSelector((state) => state.user); // Get the current username from Redux store
  const messages = useSelector((state) => state.messages); // Get all messages from Redux store
  const chat_jid = useSelector((state) => state.chat_jid); // Get the chat JID from Redux store
  const { xmppClient } = useXMPP(); // Get the XMPP client from context

  // Update filtered messages when messages or username change
  useEffect(() => {
    const updatedMessages = messages.filter(
      msg => (msg.from && msg.to && msg.from.split('@')[0] === username && msg.to === chat_jid) ||
             (msg.to && msg.from && msg.to.split('@')[0] === username && msg.from === chat_jid)
    );
    setFilteredMessages(updatedMessages);
  }, [messages, username, chat_jid]);

  /**
   * Handles file selection and updates the state.
   * @param {Event} event - The change event from the file input.
   */
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  /**
   * Handles message input changes and updates the state.
   * @param {Event} event - The change event from the text field.
   */
  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  /**
   * Handles message submission by sending the message via XMPP.
   */
  const handleSubmit = async () => {
    if (message) {
      const timestamp = new Date().toISOString();

      // Create a message stanza
      const messageObject = {
        to: chat_jid,
        from: `${username}@alumchat.lol`,
        timestamp: timestamp,
        content: message
      };

      // Create a message stanza
      const messageRequest = xml('message', { type: 'chat', to: chat_jid, from: `${username}@alumchat.lol` }, [
          xml('body', {}, message),
      ]);

      try {
        await xmppClient.send(messageRequest);
        console.log('Message request sent');
      } catch (error) {
        console.error('Failed to send message request:', error);
      }
      dispatch(setMessages({ messages: [...messages, messageObject] }));
      setFile(null);
      setMessage('');
    }
  };

  return (
    <Box
      width="100%"
      height="100%"
      sx={{
        backgroundImage: `url(/chat_bg.jpeg)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '1rem 1rem',
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)',
      }}
    >
      <Box
        display="flex"
        flexDirection="column"
        width="100%"
        height="90%"
        padding="2rem"
        overflow="auto"
        justifyContent={filteredMessages.length === 0 ? 'center' : 'flex-start'}
        sx={{ background: 'rgba(0, 0, 0, 0.6)' }}
      >
        {filteredMessages.length === 0 ? (
          <Typography color="#F0F0F0" textAlign="center" variant="h6">
            It is quiet here! Start the conversation by sending a message or attaching a file.
          </Typography>
        ) : (
          filteredMessages.map((msg, index) => (
            <ChatBubble
              key={index}
              from={msg.from ? msg.from.split('@')[0] : 'Unknown'}
              message={msg.content || ''}
              timestamp={msg.timestamp || Date.now()}
              isCurrentUser={msg.from ? msg.from.split('@')[0] === username : false}
            />
          ))
        )}
      </Box>
      <Box
        display="flex"
        flexDirection="row"
        width="100%"
        height="10%"
        alignItems="center"
        padding="0 0.8rem"
        gap="10px"
        sx={{ backgroundColor: palette.grey[200] }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your message..."
          value={message}
          size="small"
          sx={{ backgroundColor: "#F0F0F0" }}
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
          onClick={handleSubmit}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default Chat;
