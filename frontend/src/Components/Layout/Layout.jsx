import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "../NavBar/NavBar";
import Footer from "../Footer/Footer";

export default function Layout() {
  return (
    <div className="layout-container">
      <NavBar />
      <div className="main-content container py-16 mx-auto my-6 ">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
