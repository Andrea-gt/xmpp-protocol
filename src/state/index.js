import { createSlice } from "@reduxjs/toolkit";

// Initial state for the chat slice
const initialState = {
    mode: "light",     // Theme mode (light or dark)
    user: null,        // Currently logged-in user
    picture: null,     // State to hold user profile picture
    token: null,       // Authentication token
    contacts: [],      // State to hold contacts
    chat_jid: null,    // State to hold chat data
    messages: [],      // State to hold messages
    images: [],        // State to hold user images
    statusList: [],   // State to hold contact status
    notification: null  // State to hold the notifications
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
            return Object.assign({}, state, { mode: state.mode === "light" ? "dark" : "light" });
        },

        /**
         * Toggle the theme mode between light and dark.
         * @param {Object} state - The current state.
         */
        setNotification: (state, action) => {
            return Object.assign({}, state, { notification: action.payload.notification, 
                type: action.payload.type,
                from: action.payload.from });
        },
        
        /**
         * Set the user details upon login.
         * @param {Object} state - The current state.
         * @param {Object} action - The action containing the user data.
         */
        setLogin: (state, action) => {
            return Object.assign({}, state, { user: action.payload.user });
        },
        
        /**
         * Clear the user details upon logout.
         * @param {Object} state - The current state.
         */
        setLogout: (state) => {
            return Object.assign({}, state, { user: null });
        },

        /**
         * Set the user contact list. 
         * @param {Object} state - The current state.
         * @param {Object} action - The action containing the contacts data.
         */
        setContacts: (state, action) => {
            return Object.assign({}, state, { contacts: action.payload.contacts });
        },

        /**
         * Update a contact's status in the state.
         * @param {Object} state - The current state.
         * @param {Object} action - The action containing the contact status update.
         */
        updateContactStatus: (state, action) => {
            const { jid, status, image, status_text } = action.payload;
            const updatedContacts = state.contacts.map(contact => {
                if (contact.jid === jid) {
                    return {
                        ...contact,
                        status: status !== undefined ? status : contact.status, // Update status only if provided
                        status_text: status_text !== undefined ? status_text : contact.status_text, // Update status_text only if provided
                        image: image !== undefined ? image : contact.image    // Update image only if provided
                    };
                }
                return contact;
            });
            return Object.assign({}, state, { contacts: updatedContacts });
        },

        /**
         * Set the chats state with a new array of messages.
         * @param {Object} state - The current state.
         * @param {Object} action - The action containing the new chats array.
         */
        setChat: (state, action) => {
            return Object.assign({}, state, { chat_jid: action.payload.chat_jid });
        },
        
        /**
         * Set the messages state with a new array of messages.
         * @param {Object} state - The current state.
         * @param {Object} action - The action containing the new messages array.
         */
        setMessages: (state, action) => {
            const newMessages = action.payload.messages;
            const messageMap = new Map();
            // Add existing messages to the map
            state.messages.forEach(msg => messageMap.set(msg.timestamp, msg));
            // Add new messages to the map
            newMessages.forEach(msg => messageMap.set(msg.timestamp, msg));
            // Convert map values to an array and sort by timestamp
            const updatedMessages = Array.from(messageMap.values()).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            return Object.assign({}, state, { messages: updatedMessages });
        },

        /**
         * Add or update an image in the images state.
         * @param {Object} state - The current state.
         * @param {Object} action - The action containing the image data.
         */
        addOrUpdateImage: (state, action) => {
            const { jid, image } = action.payload;
            const updatedImages = [...state.images];
            const imageIndex = updatedImages.findIndex(img => img.jid === jid);
            if (imageIndex !== -1) {
                updatedImages[imageIndex] = { jid, image };
            } else {
                updatedImages.push({ jid, image });
            }
            return Object.assign({}, state, { images: updatedImages });
        },

        /**
         * Add or update a status in the statusList state.
         * @param {Object} state - The current state.
         * @param {Object} action - The action containing the status data.
         */
        addOrUpdateStatus: (state, action) => {
            const { jid, status, status_text } = action.payload;
            const updatedStatusList = [...state.statusList];
            const statusIndex = updatedStatusList.findIndex(s => s.jid === jid);
            if (statusIndex !== -1) {
                updatedStatusList[statusIndex] = { jid, status, status_text };
            } else {
                updatedStatusList.push({ jid, status, status_text });
            }
            if(updatedStatusList){
            return Object.assign({}, state, { statusList: updatedStatusList });}
        },
    },
});

// Export actions for use in components
export const {
    setMode,
    setLogin,
    setLogout,
    setContacts,
    updateContactStatus,
    setChat,
    setMessages,
    addOrUpdateImage,
    addOrUpdateStatus,
    setNotification
} = chatSlice.actions;

// Export the reducer to be used in the store
export default chatSlice.reducer;