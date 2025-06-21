import React, { createContext, useEffect, useState } from "react";
import axios from "axios";
import { normalizeUser, getUserId } from "../utils/userUtils"; // Adjust the import path as necessary
import { SavedComponentsContext } from "./SavedComponentContext";

export const UserContext = createContext(null);

export function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthToken] = useState(null);

  // Normalized setter function
  const setNormalizedUser = (userData) => {
    setUser(normalizeUser(userData));
  };

  // Check login status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/auth/me", {
          withCredentials: true,
        });

        if (res.data.success) {
          console.log("User authenticated:", res.data.user);
          setNormalizedUser(res.data.user);
          setAuthToken(true);
        } else {
          console.log("No authenticated user found");
          setUser(null);
          setAuthToken(null);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        setUser(null);
        setAuthToken(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (userData) => {
    try {
      setNormalizedUser(userData);
      setAuthToken(true);
      console.log("User logged in successfully:", userData);
    } catch (err) {
      console.error("Error setting user after login:", err);
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        "http://localhost:4000/api/auth/logout",
        {},
        { withCredentials: true }
      );
      setUser(null);
      setAuthToken(null);
      localStorage.removeItem("favorites");
      console.log("User logged out successfully");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Provide both the normalized user and a consistent userId
  const value = {
    user,
    userId: getUserId(user),
    setUser: setNormalizedUser,
    login,
    logout,
    loading,
    authToken,
    userLogin: authToken, // For backward compatibility
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
