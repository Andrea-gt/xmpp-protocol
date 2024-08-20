/**
 * @file Chat.js
 * @description Chat component for displaying and sending messages in a chat interface.
 * This component handles the chat interface, including displaying individual chat messages
 * and providing functionality for sending messages and attaching files. The component
 * integrates with the XMPP protocol for real-time messaging.
 * 
 * @dependencies:
 * - @mui/material
 * - @mui/icons-material
 * - react-redux
 * - @xmpp/client
 * 
 * Documentation Generated with ChatGPT
 * @date 2024-08-19
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
import { setMessages } from '../../state';
import { useXMPP } from '../../context/XMPPContext';
import { xml } from '@xmpp/client';

/**
 * ChatBubble component displays an individual chat message.
 * 
 * @param {Object} props - The component props.
 * @param {string} props.from - The sender's username.
 * @param {string} props.message - The message content.
 * @param {number} props.timestamp - The timestamp of the message.
 * @param {boolean} props.isCurrentUser - Flag indicating if the message is from the current user.
 * 
 * @returns {JSX.Element} The rendered chat bubble component.
 */
/**
 * ChatBubble component displays an individual chat message.
 * 
 * @param {Object} props - The component props.
 * @param {string} props.from - The sender's username.
 * @param {string} props.message - The message content.
 * @param {number} props.timestamp - The timestamp of the message.
 * @param {boolean} props.isCurrentUser - Flag indicating if the message is from the current user.
 * @param {string} [props.image] - The URL of the image to display in the chat bubble (optional).
 * 
 * @returns {JSX.Element} The rendered chat bubble component.
 */
const ChatBubble = ({ from = 'Unknown', message = '', timestamp = Date.now(), isCurrentUser = false, image = null }) => {
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
        {image && (
          <img
            src={image}
            alt="Sent image"
            style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '10px' }}
          />
        )}
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
 * 
 * @returns {JSX.Element} The rendered chat component.
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

  /**
   * Filters messages relevant to the current chat between the user and the chat_jid.
   * Updates the filteredMessages state when messages, username, or chat_jid change.
   */
  useEffect(() => {
    const updatedMessages = messages.filter(
      msg => (msg.from && msg.to && msg.from.split('@')[0] === username && msg.to === chat_jid) ||
             (msg.to && msg.from && msg.to.split('@')[0] === username && msg.from === chat_jid)
    );
    setFilteredMessages(updatedMessages);
  }, [messages, username, chat_jid]);

  /**
   * Handles file selection and updates the file state.
   * 
   * @param {Event} event - The change event from the file input.
   */
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  /**
   * Handles message input changes and updates the message state.
   * 
   * @param {Event} event - The change event from the text field.
   */
  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  /**
   * Uploads the selected file to the specified URL.
   * 
   * @param {File} file - The file to be uploaded.
   * @param {string} uploadUrl - The URL to upload the file to.
   */
  const handleUploadFile = async (file, uploadUrl) => {
    try {
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
          'Content-Length': file.size,
        },
        body: file,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload file: ${response.statusText}`);
      }
      console.log('File uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  /**
   * Handles message submission by sending the message or file via XMPP.
   */
  const handleSubmit = async () => {
    if (message || file) {
      const timestamp = new Date().toISOString();

      if (file) {
        // Request file upload slot
        const requestSlot = xml('iq', { type: 'get', to: 'httpfileupload.alumchat.lol', id: 'upload-request', xmlns: 'jabber:client' }, [
          xml('request', { xmlns: 'urn:xmpp:http:upload:0', filename: file.name, size: file.size, 'content-type': file.type })
        ]);

        try {
          // Send the slot request IQ stanza
          await xmppClient.send(requestSlot);
          // Handle incoming roster response
          xmppClient.on('stanza', async (stanza) => {
            if (stanza.is("iq") && stanza.attrs.id === 'upload-request') {
              const slot = stanza.getChild('slot', 'urn:xmpp:http:upload:0');
              const url = slot.getChild('put').attrs.url;
              
              console.log(url)

              await handleUploadFile(file, url);

              const messageRequest = xml('message', { type: 'chat', to: chat_jid, from: `${username}@alumchat.lol` }, [
                xml('body', {}, `File sent: ${file.name}`),
                xml('x', { xmlns: 'jabber:x:oob' }, [
                  xml('url', {}, url),
                  xml('desc', {}, file.name)
                ]),
                xml('request', { xmlns: 'urn:xmpp:receipts' }),
                xml('markable', { xmlns: 'urn:xmpp:chat-markers:0' })
              ]);

              await xmppClient.send(messageRequest);
              console.log('Message with file URL sent');

              const messageObject = {
                to: chat_jid,
                from: `${username}@alumchat.lol`,
                timestamp: timestamp,
                content: `File sent: ${file.name}`,
                image: url,
              };

              dispatch(setMessages({ messages: [...messages, messageObject] }));
            }
          });
        } catch (error) {
          console.error('Failed to handle file upload:', error);
        }
      } else if (message) {
        const messageObject = {
          to: chat_jid,
          from: `${username}@alumchat.lol`,
          timestamp: timestamp,
          content: message,
          image: null
        };

        const messageRequest = xml('message', { type: 'chat', to: chat_jid, from: `${username}@alumchat.lol` }, [
          xml('body', {}, message),
        ]);

        try {
          await xmppClient.send(messageRequest);
          console.log('Message sent');
          dispatch(setMessages({ messages: [...messages, messageObject] }));
        } catch (error) {
          console.error('Failed to send message request:', error);
        }
      }
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
        overflow="auto"
        justifyContent={filteredMessages.length === 0 ? 'center' : 'flex-start'}
        sx={{ 
          background: 'rgba(0, 0, 0, 0.6)',
          marginBottom: '10px',
           padding: '2rem' 
          }}
      >
        {filteredMessages.length > 0 ? (
          filteredMessages.map((msg, i) => (
            <ChatBubble
              key={i}
              from={msg.from.split('@')[0]}
              message={msg.content}
              timestamp={msg.timestamp}
              isCurrentUser={msg.from.split('@')[0] === username}
              image={msg.image}
            />
          ))
        ) : (
          <Typography color="#F0F0F0" textAlign="center" variant="h6">
            It is quiet here! Start the conversation by sending a message or attaching a file.
          </Typography>
        )}
      </Box>
      <Box
        display="flex"
        alignItems="center"
        padding="0.5rem"
        backgroundColor={palette.background.default}
        borderRadius="0.5rem"
      >
        <Tooltip title="Attach File">
          <IconButton component="label">
            <AttachFileIcon />
            <input
              type="file"
              accept="image/*, .pdf, .doc, .docx, .xls, .xlsx"
              hidden
              onChange={handleFileChange}
            />
          </IconButton>
        </Tooltip>
        <TextField
          fullWidth
          size="small"
          variant="outlined"
          placeholder="Type a message"
          value={message}
          onChange={handleMessageChange}
        />
        <Button
          variant="contained"
          color="primary"
          endIcon={<SendIcon />}
          sx={{ marginLeft: '10px' }}
          onClick={handleSubmit}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default Chat;