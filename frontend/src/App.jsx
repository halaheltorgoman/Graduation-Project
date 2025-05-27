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
import VerifyForgotPassword from "./Components/VerifyForgotPassword/VerifyForgotPassword";
import ComponentDetails from "./Components/ComponentDetails/ComponentDetails";
import Verifysignupemail from "./Components/Verifysignupemail/Verifysignupemail";
import Signupverification from "./Components/Signupverification/Signupverification";
import { ContextProvider } from "./Context/ContextProvider";
import { Routes, Route, useLocation } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "builder", element: <Builder /> },
      { path: "guides", element: <Guides /> },
      { path: "community", element: <Community /> },
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
    ],
  },
  { path: "login", element: <Login /> },
  { path: "signup", element: <Signup /> },
  { path: "forgot-password", element: <Forgotpassword /> },
  { path: "verify-forgot-password", element: <VerifyForgotPassword /> },
  { path: "home", element: <Home /> },
  { path: "signup-verification", element: <Signupverification /> },
  { path: "verify-signup-email", element: <Verifysignupemail /> },
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
