/**
 * Entry Point for React Application
 * 
 * This file initializes the React application and configures Redux store without persistence.
 * It renders the main App component without setting up Redux Persist.
 * 
 * Documentation Generated with ChatGPT
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import chatReducer from "./state";

// Disable TLS certificate validation for local development (not recommended for production)
import.meta.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Configure the Redux store with the reducer
const store = configureStore({
  reducer: chatReducer,
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false, // Disable serializableCheck if needed
    })
});

// Create and render the root element of the React application
ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>
);
