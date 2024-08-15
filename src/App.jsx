import React, { createContext, useContext, useState, useMemo } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { themeSettings } from './theme';
import { useSelector } from "react-redux";

// Import pages
import Forms from "./pages/Login";
import Home from "./pages/Home";

// Create an AuthContext
const AuthContext = createContext();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const mode = useSelector((state) => state.mode);
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      <div className="app">
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <CssBaseline />
          <Routes>
            <Route path="/" element={<Forms />} />
            <Route 
              path="/home" 
              element={
                isAuthenticated ? <Home /> : <Navigate to="/" />
              } 
            />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
      </div>
    </AuthContext.Provider>
  );
}

// Optional: Custom hook for using the AuthContext
export const useAuth = () => useContext(AuthContext);
export default App