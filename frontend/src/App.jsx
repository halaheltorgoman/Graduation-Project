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
import Profile from "./Components/Profile/Profile";
import Login from "./Components/Login/login";
import Signup from "./Components/Signup/Signup";
import AIAssistant from "./Components/AIAssistant/AIAssistant";
import ComponentDetails from "./Components/ComponentDetails/ComponentDetails";

const router = createBrowserRouter([
  {
    path: "",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      {
        path: "builder",
        children: [
          { index: true, element: <Navigate to="cpu" replace /> },
          { path: ":type", element: <Builder /> },
        ],
      },
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
]);

function App() {
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
