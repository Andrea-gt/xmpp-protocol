/**
 * @file App.jsx
 * @description The main entry point of the React application. This component configures routing, theming, and context providers.
 *              It uses Redux for state management and Material-UI for styling. The `App` component sets up routes for different pages,
 *              applies a theme based on the application's mode, and provides the XMPP context to the component tree.
 * 
 *              Key functionalities provided by this component include:
 *              - Routing setup using React Router.
 *              - Theming with Material-UI's `ThemeProvider`.
 *              - Context provisioning through `XMPPProvider`.
 *              - Conditional routing based on user authentication status.
 * 
 * @author Andrea Ximena Ramirez Recinos
 * @created Aug 2024
 * 
 * @note Documentation Generated with ChatGPT
 */

import React, { useMemo } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { themeSettings } from './theme';
import { useSelector } from "react-redux";
import { XMPPProvider } from "./context/XMPPContext";

// Import pages
import Forms from "./pages/Login";
import Home from "./pages/Home";

/**
 * Main App component that sets up routing and theme for the application.
 *
 * @returns {JSX.Element} - The main application component.
 */
const App = () => {
  // Get user and mode from Redux store
  const user = useSelector((state) => state.user);
  const mode = useSelector((state) => state.mode);
  const statusList = useSelector((state) => state.statusList);
  const images = useSelector((state) => state.images);

  // Create a theme object using the mode from Redux store
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);

  return (
    <div className="app">
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <CssBaseline />
          {/* Provide XMPP context to the component tree */}
          <XMPPProvider>
            <Routes>
              {/* Route for login page */}
              <Route path="/" element={<Forms statusList={statusList}/>} />
              {/* Route for home page, redirect to login if user is not authenticated */}
              <Route 
                path="/home" 
                element={
                  user ? <Home statusList={statusList} images={images}/> : <Navigate to="/" /> 
                } 
              />
            </Routes>
          </XMPPProvider>
        </BrowserRouter>
      </ThemeProvider>
    </div>
  );
}

export default App;