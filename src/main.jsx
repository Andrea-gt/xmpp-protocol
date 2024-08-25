/**
 * @file main.jsx
 * @description This file serves as the entry point for initializing and rendering the React application. 
 *              It sets up the Redux store without persistence and integrates it with the React application.
 * 
 *              The file includes configuration for the Redux store using Redux Toolkit's `configureStore` 
 *              function, and it provides the `Provider` component from React Redux to supply the store to the 
 *              React application. It also disables TLS certificate validation for local development, though 
 *              this is not recommended for production environments.
 * 
 *              Key functionalities provided by this file include:
 *              - Setting up and configuring the Redux store.
 *              - Integrating the Redux store with the React application.
 *              - Rendering the main `App` component into the root DOM element.
 * 
 * @author Andrea Ximena Ramirez Recinos
 * @created Aug 2024
 * 
 * @note Documentation Generated with ChatGPT
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
