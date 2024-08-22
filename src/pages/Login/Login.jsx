import React, { useState } from 'react';
import { Box } from "@mui/material";
import Login from '../../components/Login/Login';
import Register from '../../components/Register/Register';

const Forms = () => {
  const [showLogin, setShowLogin] = useState(true);

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