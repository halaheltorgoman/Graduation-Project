import React from "react";
import { NavLink } from "react-router-dom";
import "../NestedNavbar/NestedNavbar.css";

// Check if we're at the base browsecomponents path
const isBaseBrowsePath = location.pathname === "/browsecomponents";
function GuidesNavbar() {
  return (
    <div className="nestednav_container">
      <div className="nestednav_main">
        <ul>
          <li className="hover:text-white">
            <NavLink
              to="/guides/all"
              className={({ isActive }) =>
                isActive || isBaseBrowsePath ? "nav-item active" : "nav-item"
              }
            >
              All
            </NavLink>
          </li>
          <li className="hover:text-white">
            <NavLink
              to="/guides/gaming"
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              Gaming
            </NavLink>
          </li>
          <li className="hover:text-white">
            <NavLink
              to="/guides/development"
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              Development
            </NavLink>
          </li>
          <li className="hover:text-white">
            <NavLink
              to="/guides/workstation"
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              Workstation
            </NavLink>
          </li>
          <li className="hover:text-white">
            <NavLink
              to="/guides/budget"
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              Budget
            </NavLink>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default GuidesNavbar;
