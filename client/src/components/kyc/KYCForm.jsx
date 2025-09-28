import React, { useState, useContext, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
} from "@material-ui/core";
import { useNavigate } from "react-router-dom";
import Axios from "axios";
import UserContext from "../../context/UserContext";
import config from "../../config/Config";
import styles from "./KYCForm.module.css";

const KYCForm = () => {
  const { userData, setUserData } = useContext(UserContext);
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [pan, setPan] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Agar user login nahi hai, redirect login page
    if (!userData?.user) navigate("/login");
  }, [userData, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await Axios.post(
        config.base_url + "/api/kyc/submit",
        {
          userId: userData.user.id,
          fullName,
          dob,
          pan,
          address,
        },
        { headers: { "x-auth-token": localStorage.getItem("auth-token") } }
      );
      if (res.data.user) {
        alert("KYC submitted successfully!");

        // ✅ Frontend me KYC approve kar do
        setUserData((prev) => ({
          ...prev,
          user: {
            ...res.data.user,
            kyc: { ...res.data.user.kyc, status: "approved" }, // Mock approval
          },
        }));

        navigate("/dashboard"); // KYC submit ke baad dashboard
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div className={styles.background}>
      <Grid
        container
        spacing={0}
        direction="column"
        alignItems="center"
        justify="center"
        style={{ minHeight: "100vh" }}
      >
        <Box width="70vh" boxShadow={1}>
          <Card className={styles.card}>
            <CardContent>
              <Typography variant="h5">KYC Form</Typography>
              <form onSubmit={handleSubmit} className={styles.form}>
                <TextField
                  label="Full Name"
                  fullWidth
                  required
                  margin="normal"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                <TextField
                  label="Date of Birth"
                  type="date"
                  fullWidth
                  required
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
                <TextField
                  label="PAN Number"
                  fullWidth
                  required
                  margin="normal"
                  value={pan}
                  onChange={(e) => setPan(e.target.value)}
                />
                <TextField
                  label="Address"
                  fullWidth
                  margin="normal"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                {error && <Typography color="error">{error}</Typography>}
                <Box mt={2} display="flex" justifyContent="center">
                  <Button type="submit" variant="contained" color="primary">
                    Submit KYC
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Box>
      </Grid>
    </div>
  );
};

export default KYCForm;
