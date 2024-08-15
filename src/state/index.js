import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    mode: "light",
    user: null,
    token: null,
    chats: [],         // State to hold chat data
    messages: [],      // State to hold messages
};

export const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        setMode: (state) => {
            state.mode = state.mode === "light" ? "dark" : "light";
        },
        setLogin: (state, action) => {
            state.user = action.payload.user;
        },
        setLogout: (state) => {
            state.user = null;
        },
        addChat: (state, action) => {
            state.chats.push(action.payload.chat);
        },
        removeChat: (state, action) => {
            state.chats = state.chats.filter(chat => chat.id !== action.payload.id);
        },
        addMessage: (state, action) => {
            state.messages.push(action.payload.message);
        },
        setMessages: (state, action) => {
            state.messages = action.payload.messages;
        },
        clearMessages: (state) => {
            state.messages = [];
        },
    },
});

export const {
    setMode,
    setLogin,
    setLogout,
    addChat,
    removeChat,
    addMessage,
    setMessages,
    clearMessages,
} = chatSlice.actions;

export default chatSlice.reducer;