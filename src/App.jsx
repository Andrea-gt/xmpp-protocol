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

// Context

const App = () => {
  const user = useSelector((state) => state.user);
  const mode = useSelector((state) => state.mode);
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);

  return (
    <div className="app">
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <CssBaseline />
          <XMPPProvider>
          <Routes>
            <Route path="/" element={<Forms />} />
            <Route 
              path="/home" 
              element={
                user ? <Home /> : <Navigate to="/" /> 
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