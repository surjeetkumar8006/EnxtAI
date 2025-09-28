import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import styles from "./App.module.css";
import { Login, Register, NotFound, PageTemplate } from "./components";
import UserContext from "./context/UserContext";
import Axios from "axios";
import config from "./config/Config";
import KYCForm from "./components/kyc/KYCForm";

function App() {
  const [userData, setUserData] = useState({
    token: undefined,
    user: undefined,
  });

  useEffect(() => {
    const checkLoggedIn = async () => {
      let token = localStorage.getItem("auth-token");
      if (!token) {
        localStorage.setItem("auth-token", "");
        setUserData({ token: undefined, user: undefined });
        return;
      }

      const headers = { "x-auth-token": token };

      try {
        const tokenIsValid = await Axios.post(
          config.base_url + "/api/auth/validate",
          null,
          { headers }
        );

        if (tokenIsValid.data) {
          const userRes = await Axios.get(config.base_url + "/api/auth/user", {
            headers,
          });
          setUserData({
            token,
            user: userRes.data,
          });
        } else {
          setUserData({ token: undefined, user: undefined });
        }
      } catch (err) {
        setUserData({ token: undefined, user: undefined });
      }
    };

    checkLoggedIn();
  }, []);

  return (
    <Router>
      <UserContext.Provider value={{ userData, setUserData }}>
        <div className={styles.container}>
          <Routes>
            {/* Home route: redirect based on login & KYC */}
            <Route
              path="/"
              element={
                !userData.user ? (
                  <Navigate to="/register" />
                ) : userData.user.kyc?.status !== "approved" ? (
                  <Navigate to="/kyc" />
                ) : (
                  <Navigate to="/dashboard" />
                )
              }
            />

            {/* Authentication */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* KYC Form */}
             <Route
              path="/kyc"
              element={
                userData.user ? (
                  userData.user.kyc?.status !== "approved" ? (
                    <KYCForm />
                  ) : (
                    <Navigate to="/dashboard" />
                  )
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            {/* Dashboard route */}
            <Route
              path="/dashboard"
              element={
                userData.user ? (
                  userData.user.kyc?.status === "approved" ? (
                    <PageTemplate />
                  ) : (
                    <Navigate to="/kyc" />
                  )
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </UserContext.Provider>
    </Router>
  );
}

export default App;
