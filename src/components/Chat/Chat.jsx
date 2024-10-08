/**
 * @file Chat.jsx
 * @description The Chat component provides an interface for displaying and sending messages in a chat application. 
 *              This component manages the chat UI, including showing individual messages and allowing users 
 *              to send text messages and attach files. It integrates with the XMPP protocol for real-time messaging.
 * 
 *              Key functionalities of this component include:
 *              - Displaying a list of chat messages, with differentiation for messages from the current user.
 *              - Handling file attachments and uploading them to a specified URL.
 *              - Sending text messages and file URLs to the XMPP server.
 *              - Updating the Redux store with new messages.
 * 
 * @dependencies:
 * - @mui/material
 * - @mui/icons-material
 * - react-redux
 * - @xmpp/client
 * 
 * @returns {JSX.Element} The rendered Chat component.
 * 
 * @author Andrea Ximena Ramirez Recinos
 * @created Aug 2024
 * 
 * @note Documentation Generated with ChatGPT
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
          wordBreak: 'break-word', // Ensures long words break to the next line
          overflowWrap: 'break-word', // Ensures wrapping in case of long continuous text  
        }}
      >
        {image && (
          <img
            src={image}
            alt="Sent file"
            style={{ width: '100%', borderRadius: '8px', marginBottom: '10px' }}
          />
        )}
        <Typography variant="body1">{message}</Typography>
        <Typography variant="caption" align="right" sx={{ display: 'block', marginTop: '5px' }}>
          {new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}{' | '}
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
  const isGroupchat = chat_jid?.includes("conference")

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
      console.log(file)
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
          'Content-Length': file.size,
        },
        body: file,
      });

      if (!response.ok) {
        console.log(response)
        throw new Error(`Failed to upload file: ${response.statusText}`);
      }
      console.log('File uploaded successfully');
      setFile(null);
      console.log(file)
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  useEffect(() => {
    const presenceStanza = xml('presence', { to: `${chat_jid}/${username}` });
    // Send presence when the component mounts
    if (isGroupchat && xmppClient) {
      xmppClient.send(presenceStanza).catch(console.error);
    }
  }, [chat_jid, username, xmppClient, isGroupchat]);

  /**
   * Handles message submission by sending the message or file via XMPP.
   */
  const handleSubmit = async () => {
    if (message || file) {
      const timestamp = new Date().toISOString();
      const requestId = `upload-request-${Date.now()}`;  // Generate a unique request ID
  
      if (file) {
        // Request file upload slot with the unique request ID
        const requestSlot = xml('iq', { type: 'get', to: 'httpfileupload.alumchat.lol', id: requestId, xmlns: 'jabber:client' }, [
          xml('request', { xmlns: 'urn:xmpp:http:upload:0', filename: file.name, size: file.size, 'content-type': file.type })
        ]);
  
        try {
          // Send the slot request IQ stanza
          await xmppClient.send(requestSlot);
  
          // Handle incoming stanza response
          xmppClient.on('stanza', async (stanza) => {
            // Check if the response ID matches the current request
            if (stanza.is("iq") && stanza.attrs.id === requestId) {
              const slot = stanza.getChild('slot', 'urn:xmpp:http:upload:0');
              const url = slot.getChild('put').attrs.url;
              const url_get = slot.getChild('get').attrs.url;
  
              // Upload the file to the provided URL
              await handleUploadFile(file, url);
  
              // Send the message with the file's URL
              let chat_type =  isGroupchat ? 'groupchat' : 'chat'
              const messageRequest = xml('message', { type: chat_type, to: chat_jid, from: `${username}@alumchat.lol` }, [
                xml('body', {}, `File sent: ${file.name} -- URL: ${url_get}`),
                xml('x', { xmlns: 'jabber:x:oob' }, [
                  xml('url', {}, url_get),
                  xml('desc', {}, file.name)
                ]),
                xml('request', { xmlns: 'urn:xmpp:receipts' }),
                xml('markable', { xmlns: 'urn:xmpp:chat-markers:0' })
              ]);
  
              await xmppClient.send(messageRequest);
              console.log('Message with file URL sent');
  
              // Update the chat with the new message
              const messageObject = {
                to: chat_jid,
                from: `${username}@alumchat.lol`,
                timestamp: timestamp,
                content: `File sent: ${file.name} -- URL: ${url_get}`,
                image: url_get,
                complete_from: `${username}@alumchat.lol`
              };
              if(!isGroupchat) {
                dispatch(setMessages({ messages: [...messages, messageObject] }));
              }
            }
          });
        } catch (error) {
          console.error('Failed to handle file upload:', error);
        }
      }
  
      if (message) {
        console.log(chat_jid)
        let chat_type =  isGroupchat ? 'groupchat' : 'chat'
        console.log(chat_type)
        const messageRequest = xml('message', { type: chat_type, to: chat_jid, from: `${username}@alumchat.lol` }, [
          xml('body', {}, message),
          xml('request', { xmlns: 'urn:xmpp:receipts' }),
          xml('markable', { xmlns: 'urn:xmpp:chat-markers:0' })
        ]);

        await xmppClient.send(messageRequest);
        console.log('Message sent');
  
        // Update the chat with the new message
        const messageObject = {
          to: chat_jid,
          from: `${username}@alumchat.lol`,
          timestamp: timestamp,
          content: message,
          complete_from: `${username}@alumchat.lol`
        };

        if(!isGroupchat) {
          dispatch(setMessages({ messages: [...messages, messageObject] }));
        }
      }
  
      // Reset message and file inputs
      setMessage('');
      setFile(null);
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
              from={chat_jid.includes("conference") ? (msg.complete_from?.split('/')[1]?.split('@')[0] || msg.from?.split('@')[0]) : (msg.from?.split('@')[0] || '')}
              message={msg.content}
              timestamp={msg.timestamp}
              isCurrentUser={(chat_jid.includes("conference") ? (msg.complete_from?.split('/')[1]?.split('@')[0] || msg.from?.split('@')[0])  
                : msg.from.split('@')[0]) === username}
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
        <Tooltip 
          title={file ? "File selected" : "Attach File"} 
          sx={{
            '& .MuiTooltip-tooltip': {
              backgroundColor: file ? palette.primary.main : 'inherit',
              color: file ? palette.primary.contrastText : 'inherit',
            }
          }}
        >
          <IconButton component="label">
            <AttachFileIcon sx={{ color: file ? palette.primary.main : 'inherit' }} />
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