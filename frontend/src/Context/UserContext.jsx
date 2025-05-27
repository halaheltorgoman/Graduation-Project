// import React, { createContext, useEffect, useState, useContext } from "react";
// import axios from "axios";
// import { SavedComponentsContext } from "./SavedComponentContext";

// export const UserContext = createContext(null);

// export function UserContextProvider({ children }) {
//   const [user, setUser] = useState(null); // Holds user info like id, email, etc.
//   const [loading, setLoading] = useState(true);
//   const [authToken, setAuthToken] = useState(null);

//   // Check login status on mount
//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         const res = await axios.get("http://localhost:4000/api/auth/me", {
//           withCredentials: true,
//         });

//         if (res.data.success) {
//           console.log("User authenticated:", res.data.user);
//           setUser(res.data.user); // Store user info from backend
//           // If we have a user, we're authenticated - set a dummy token to true
//           setAuthToken(true); // Just need a truthy value since actual token is in cookies
//         } else {
//           console.log("No authenticated user found");
//           setUser(null);
//           setAuthToken(null);
//         }
//       } catch (err) {
//         console.error("Auth check failed:", err);
//         setUser(null);
//         setAuthToken(null);
//       } finally {
//         setLoading(false);
//       }
//     };

//     checkAuth();
//   }, []);

//   // Login function - to be called after successful login
//   const login = async (userData) => {
//     try {
//       setUser(userData);
//       setAuthToken(true);
//       console.log("User logged in successfully:", userData);
//     } catch (err) {
//       console.error("Error setting user after login:", err);
//     }
//   };

//   // Logout
//   const logout = async () => {
//     try {
//       await axios.post(
//         "http://localhost:4000/api/auth/logout",
//         {},
//         {
//           withCredentials: true,
//         }
//       );

//       setUser(null);
//       setAuthToken(null);
//       localStorage.removeItem("favorites");
//       console.log("User logged out successfully");
//     } catch (err) {
//       console.error("Logout failed:", err);
//     }
//   };

//   return (
//     <UserContext.Provider
//       value={{
//         user,
//         setUser,
//         login, // Added login function
//         logout,
//         loading,
//         authToken, // Set to true when user is logged in
//         userLogin: authToken, // For backward compatibility with existing code
//       }}
//     >
//       {children}
//     </UserContext.Provider>
//   );
// }
// contexts/UserContext.js
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
