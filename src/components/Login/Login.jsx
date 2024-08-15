import React from 'react';
import {
  Box,
  Typography,
  useTheme,
  Button,
  TextField,
  InputAdornment
} from "@mui/material";
import FlexBetween from '../../FlexBetween';
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";

import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const loginSchema = yup.object().shape({
  username: yup.string().required("*Required"),
  password: yup.string().required("*Required")
});

const Login = () => {
  const { palette } = useTheme();

  const handleSubmit = (values) => {
    const { username, password } = values;
    // Handle login logic here, e.g., authenticate with XMPP
    console.log("Username:", username);
    console.log("Password:", password);
  };

  return (
    <FlexBetween 
      display="flex"
      sx={{
        backgroundColor: palette.grey[10],
        height: '100vh',
        justifyContent: 'center', 
        alignItems: 'center',
      }}
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        sx={{
          borderRadius: '8px',
          padding: '2rem',
          minHeight: '70vh',
          width: '50%',
          justifyContent: 'center', 
          alignItems: 'center',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)',
        }}
      >
        <Typography variant="h1" sx={{ fontWeight: '700' }}>
          Ready to Chat? 💬
        </Typography>
        <Box sx={{ padding: '16px', borderRadius: '8px', marginTop: '16px' }}>
          <Typography variant="body1" sx={{ fontWeight: '400' }}>
            To continue, please enter your username and password. Your chats are just a login away.
          </Typography>
        </Box>

        <Box sx={{ width: "60%"}}>
        <Formik
          initialValues={{ username: '', password: '' }}
          validationSchema={loginSchema}
          onSubmit={handleSubmit}
        >
          {({ handleSubmit, isValid, dirty }) => (
            <Form onSubmit={handleSubmit}>
              <Box display="flex" flexDirection="column" gap="20px">
                <Field name="username">
                  {({ field, meta }) => (
                    <TextField
                      {...field}
                      label="Username"
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      error={meta.touched && Boolean(meta.error)}
                      helperText={meta.touched && meta.error}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AccountCircleOutlinedIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                </Field>

                <Field name="password">
                  {({ field, meta }) => (
                    <TextField
                      {...field}
                      label="Password"
                      type="password"
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      error={meta.touched && Boolean(meta.error)}
                      helperText={meta.touched && meta.error}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlinedIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                </Field>

                <Button 
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ marginTop: '16px' }}
                  disabled={!isValid || !dirty}
                >
                  Login
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
        </Box>
      </Box>
    </FlexBetween>
  );
};

export default Login;
