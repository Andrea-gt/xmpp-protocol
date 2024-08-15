import React, { useMemo } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { themeSettings } from './theme';
import { useSelector } from "react-redux";

// Import pages
import Forms from "./pages/Login";
import Home from "./pages/Home";

const App = () => {
  const user = useSelector((state) => state.user);
  const mode = useSelector((state) => state.mode);
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);

  return (
    <div className="app">
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <CssBaseline />
          <Routes>
            <Route path="/" element={<Forms />} />
            <Route 
              path="/home" 
              element={
                user ? <Home /> : <Navigate to="/" /> 
              } 
            />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </div>
  );
}

export default App;