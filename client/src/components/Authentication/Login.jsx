import React, { useState, useContext } from "react";
import {
  Box,
  Typography,
  TextField,
  CssBaseline,
  Button,
  Card,
  CardContent,
  Grid,
  Link,
} from "@material-ui/core";
import { useNavigate } from "react-router-dom";
import UserContext from "../../context/UserContext";
import Axios from "axios";
import config from "../../config/Config";

import styles from "./Auth.module.css";

const Login = () => {
  const navigate = useNavigate();
  const { setUserData } = useContext(UserContext);

  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const onChangeUsername = (e) => setUsername(e.target.value);
  const onChangePassword = (e) => setPassword(e.target.value);

  const onSubmit = async (e) => {
    e.preventDefault();

    // Convert username to lowercase to match backend
    const newUser = { username: username.toLowerCase(), password };
    const url = config.base_url + "/api/auth/login";

    try {
      const loginRes = await Axios.post(url, newUser);

      if (loginRes.data.status === "fail") {
        setUsernameError(loginRes.data.message);
        setPasswordError(loginRes.data.message);
      } else {
        const { token, user } = loginRes.data;

        // Save token in localStorage
        localStorage.setItem("auth-token", token);

        // Set context
        setUserData({ token, user });

        // Redirect based on KYC status
        if (!user.kyc || user.kyc.status === "pending") {
          navigate("/kyc"); // Redirect to KYC form page
        } else {
          navigate("/dashboard"); // Redirect to main dashboard
        }
      }
    } catch (err) {
      console.error(err);
      setUsernameError("Something went wrong. Please try again.");
      setPasswordError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className={styles.background}>
      <CssBaseline />
      <Grid
        container
        spacing={0}
        direction="column"
        alignItems="center"
        justifyContent="center"
        style={{ minHeight: "100vh" }}
      >
        <Box width="70vh" boxShadow={1}>
          <Card className={styles.paper}>
            <CardContent>
              <Typography component="h1" variant="h5" align="center">
                Login
              </Typography>
              <form className={styles.form} onSubmit={onSubmit}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                  error={usernameError.length > 0}
                  helperText={usernameError}
                  value={username}
                  onChange={onChangeUsername}
                />
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  error={passwordError.length > 0}
                  helperText={passwordError}
                  value={password}
                  onChange={onChangePassword}
                />
                <Box display="flex" justifyContent="center" mt={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    className={styles.submit}
                  >
                    Login
                  </Button>
                </Box>
              </form>
              <Grid container justifyContent="center" style={{ marginTop: "1rem" }}>
                <Grid item>
                  <Link href="/register" variant="body2">
                    Need an account?
                  </Link>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      </Grid>
    </div>
  );
};

export default Login;
