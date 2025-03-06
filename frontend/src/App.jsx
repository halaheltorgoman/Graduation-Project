import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
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

let x = createBrowserRouter([
  {
    path: "",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "builder", element: <Builder /> },
      { path: "guides", element: <Guides /> },
      { path: "community", element: <Community /> },
      { path: "browsecomponents", element: <BrowseComponents /> },
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
    <>
      <div className="overflow-x-hidden ">
        <RouterProvider router={x}></RouterProvider>
      </div>
    </>
  );
}

export default App;
