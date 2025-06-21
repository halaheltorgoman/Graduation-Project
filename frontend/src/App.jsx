// App.jsx
import "./App.css";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import Home from "./Components/Home/Home";
import Builder from "./Components/Builder/Builder";
import Guides from "./Components/Guides/Guides";
import Community from "./Components/Community/Community";
import BrowseComponents from "./Components/BrowseComponents/BrowseComponents";
import Layout from "./Components/Layout/Layout";
import NotFound from "./Components/NotFound/NotFound";
import Forgotpassword from "./Components/Forgotpassword/Forgotpassword";
import Profile from "./Components/Profile/Profile";
import Login from "./Components/Login/Login";
import Signup from "./Components/Signup/Signup";
import AIAssistant from "./Components/AIAssistant/AIAssistant";
import VerifyForgotPassword from "./Components/ForgotPassword/VerifyForgotPassword";
import ComponentDetails from "./Components/ComponentDetails/ComponentDetails";
import Verifysignupemail from "./Components/Verifysignupemail/Verifysignupemail";
import Signupverification from "./Components/Signupverification/Signupverification";
import { ContextProvider } from "./Context/ContextProvider";
import { Routes, Route, useLocation } from "react-router-dom";
import ForgotPasswordEmail from "./Components/ForgotPassword/ForgotPasswordEmail";

const router = createBrowserRouter([
  {
    path: "",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "builder", element: <Builder /> },
      {
        path: "guides",
        children: [
          {
            index: true,
            element: <Navigate to="gaming" replace />,
          },
          {
            path: ":category",
            element: <Guides />,
          },
        ],
      },
      { path: "community", element: <Community /> },
      {
        path: "builder",
        children: [
          { index: true, element: <Navigate to="cpu" replace /> },
          { path: ":type", element: <Builder /> },
        ],
      },
      {
        path: "browsecomponents",
        children: [
          { index: true, element: <Navigate to="all" replace /> },
          {
            path: ":type",
            element: <BrowseComponents />,
          },
          {
            path: ":type/:componentId",
            element: <ComponentDetails />,
          },
        ],
      },
      { path: "profile", element: <Profile /> },
      { path: "ai_assistant", element: <AIAssistant /> },
      { path: "*", element: <NotFound /> },
      { path: "/components/:type/:componentId", element: <ComponentDetails /> },
    ],
  },
  { path: "login", element: <Login /> },
  { path: "signup", element: <Signup /> },
  { path: "home", element: <Home /> },
  { path: "signup-verification", element: <Signupverification /> },
  { path: "verify-signup-email", element: <Verifysignupemail /> },

  // FIXED FORGOT PASSWORD FLOW
  // Step 1: User enters email
  { path: "forgot-password", element: <ForgotPasswordEmail /> },
  // Step 2: User verifies OTP from email
  { path: "verify-forgot-password", element: <VerifyForgotPassword /> },
  // Step 3: User resets password
  { path: "reset-password", element: <Forgotpassword /> },
]);

function App() {
  return (
    <div>
      <ContextProvider>
        <RouterProvider router={router} />
      </ContextProvider>
    </div>
  );
}

export default App;
