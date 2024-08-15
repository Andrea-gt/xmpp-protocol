/**
 * Entry Point for React Application
 * 
 * This file initializes the React application, configures Redux store with persistence,
 * and renders the main App component. It includes setup for Redux Persist to maintain 
 * state across sessions.
 * 
 * Documentation Generated with ChatGPT
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import { PersistGate } from "redux-persist/integration/react";
import chatReducer from "./state";

// Disable TLS certificate validation for local development (not recommended for production)
import.meta.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Configuration for Redux Persist
const persistConfig = {
  key: "root",       // Key for storing the persisted state
  storage,           // Storage mechanism (localStorage by default)
  version: 1         // Version of the persisted state schema
};

// Create a persisted reducer using the persistConfig
const persistedReducer = persistReducer(persistConfig, chatReducer);

// Configure the Redux store with the persisted reducer and middleware
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore actions related to Redux Persist to avoid serialization errors
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      }
    })
});

// Create and render the root element of the React application
ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    {/* PersistGate is used to delay the rendering of the app until the persisted state has been retrieved */}
    <PersistGate loading={null} persistor={persistStore(store)}>
      <App />
    </PersistGate>
  </Provider>
);