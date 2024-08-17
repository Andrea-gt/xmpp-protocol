/**
 * Redux Slice for Chat Management
 * 
 * This module defines a Redux slice for managing chat-related state in the application.
 * It includes actions and reducers for handling user authentication, theme mode, and chat data.
 * 
 * Documentation Generated with ChatGPT
 */

import { createSlice } from "@reduxjs/toolkit";

// Initial state for the chat slice
const initialState = {
    mode: "light",     // Theme mode (light or dark)
    user: null,        // Currently logged-in user
    token: null,       // Authentication token
    contacts: [],       // State to hold contacts
    chats: [],         // State to hold chat data
    messages: [],      // State to hold messages
    images: [],         // State to hold user images
    statusList: []     // State to hold user status
};

// Create the chat slice with actions and reducers
export const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        /**
         * Toggle the theme mode between light and dark.
         * @param {Object} state - The current state.
         */
        setMode: (state) => {
            state.mode = state.mode === "light" ? "dark" : "light";
        },
        
        /**
         * Set the user details upon login.
         * @param {Object} state - The current state.
         * @param {Object} action - The action containing the user data.
         */
        setLogin: (state, action) => {
            state.user = action.payload.user;
        },
        
        /**
         * Clear the user details upon logout.
         * @param {Object} state - The current state.
         */
        setLogout: (state) => {
            state.user = null;
        },

        /**
         * Set the user contact list. 
         * @param {Object} state - The current state.
         * @param {Object} action - The action containing the contacts data.
         */
        setContacts: (state, action) => {
            state.contacts = action.payload.contacts;
        },

        /**
         * Update a contact's status in the state.
         * @param {Object} state - The current state.
         * @param {Object} action - The action containing the contact status update.
         */
        updateContactStatus: (state, action) => {
            const { jid, status, image } = action.payload;
            state.contacts = state.contacts.map(contact => {
                if (contact.jid === jid) {
                    return {
                        ...contact,
                        status: status !== undefined ? status : contact.status, // Update status only if provided
                        image: image !== undefined ? image : contact.image    // Update image only if provided
                    };
                }
                return contact;
            });
        },       
        
        /**
         * Add a new chat to the state.
         * @param {Object} state - The current state.
         * @param {Object} action - The action containing the new chat data.
         */
        addChat: (state, action) => {
            state.chats.push(action.payload.chat);
        },
        
        /**
         * Remove a chat from the state based on its ID.
         * @param {Object} state - The current state.
         * @param {Object} action - The action containing the chat ID to be removed.
         */
        removeChat: (state, action) => {
            state.chats = state.chats.filter(chat => chat.id !== action.payload.id);
        },
        
        /**
         * Add a new message to the messages state.
         * @param {Object} state - The current state.
         * @param {Object} action - The action containing the new message data.
         */
        addMessage: (state, action) => {
            state.messages.push(action.payload.message);
        },
        
        /**
         * Set the messages state with a new array of messages.
         * @param {Object} state - The current state.
         * @param {Object} action - The action containing the new messages array.
         */
        setMessages: (state, action) => {
            state.messages = action.payload.messages;
        },
        
        /**
         * Clear all messages from the state.
         * @param {Object} state - The current state.
         */
        clearMessages: (state) => {
            state.messages = [];
        },

        /**
         * Add or update an image in the images state.
         * @param {Object} state - The current state.
         * @param {Object} action - The action containing the image data.
         */

        addOrUpdateImage: (state, action) => {
            const { jid, image } = action.payload;
            const imageIndex = state.images.findIndex(img => img.jid === jid);

            if (imageIndex !== -1) {
                // Update existing image
                state.images[imageIndex] = { jid, image };
            } else {
                // Add new image
                state.images.push({ jid, image });
            }
        },

        /**
         * Add or update a status in the statusList state.
         * @param {Object} state - The current state.
         * @param {Object} action - The action containing the image data.
         */

        addOrUpdateStatus: (state, action) => {
            const { jid, status } = action.payload;
            const statusIndex = state.statusList.findIndex(status => status.jid === jid);
            if (statusIndex !== -1) {
                // Update existing status
                state.statusList[statusIndex] = { jid, status };
            } else {
                // Add new status
                state.statusList.push({ jid, status });
            }
        },
    },
});

// Export actions for use in components
export const {
    setMode,
    setLogin,
    setLogout,
    setContacts,
    updateContactStatus,  // Export the new action
    addChat,
    removeChat,
    addMessage,
    setMessages,
    clearMessages,
    addOrUpdateImage,
    addOrUpdateStatus
} = chatSlice.actions;

// Export the reducer to be used in the store
export default chatSlice.reducer;