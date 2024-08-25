/**
 * @file Forms.js
 * @description The Forms component manages the display of the login and registration forms. 
 *              It toggles between the Login and Register components based on user interaction.
 * 
 *              Key functionalities provided by this component include:
 *              - Managing the state to switch between login and registration forms.
 *              - Passing the form toggle function to child components.
 *              - Logging the state change when the form is toggled.
 * 
 * @author Andrea Ximena Ramirez Recinos
 * @created Aug 2024
 * 
 * @note Documentation Generated with ChatGPT
 */

import React, { useState } from 'react';
import { Box } from "@mui/material";
import Login from '../../components/Login/Login';
import Register from '../../components/Register/Register';

/**
 * Forms component that displays either the login or registration form based on the state.
 *
 * @returns {JSX.Element} - The Forms component which renders the Login or Register component.
 */
const Forms = () => {
  const [showLogin, setShowLogin] = useState(true);

  /**
   * Toggles between displaying the login and registration forms.
   * Logs the new state of the form to the console.
   */
  const toggleForm = () => {
    setShowLogin((prevShowLogin) => !prevShowLogin);
    console.log("Toggled Form: ", !showLogin); // Log the new state
  };

  return (
    <Box>
      {showLogin ? (
        <Login toggleForm={toggleForm} /> 
      ) : (
        <Register toggleForm={toggleForm} />
      )}
    </Box>
  );
};

export default Forms;