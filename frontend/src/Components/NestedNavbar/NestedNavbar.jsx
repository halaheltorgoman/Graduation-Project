import React from "react";
import { NavLink } from "react-router-dom";
import "./NestedNavBar.css";

// Check if we're at the base browsecomponents path
const isBaseBrowsePath = location.pathname === "/browsecomponents";
function NestedNavBar() {
  return (
    <div className="nestednav_container">
      <div className="nestednav_main">
        <ul>
          <li className="hover:text-white">
            <NavLink
              to="/browsecomponents/all"
              className={({ isActive }) =>
                isActive || isBaseBrowsePath ? "nav-item active" : "nav-item"
              }
            >
              All
            </NavLink>
          </li>
          <li className="hover:text-white">
            <NavLink
              to="/browsecomponents/cpu"
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              CPU
            </NavLink>
          </li>
          <li className="hover:text-white">
            <NavLink
              to="/browsecomponents/gpu"
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              GPU
            </NavLink>
          </li>
          <li className="hover:text-white">
            <NavLink
              to="/browsecomponents/motherboard"
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              MotherBoard
            </NavLink>
          </li>
          <li className="hover:text-white">
            <NavLink
              to="/browsecomponents/case"
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              Case
            </NavLink>
          </li>
          <li className="hover:text-white">
            <NavLink
              to="/browsecomponents/cooling"
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              Cooler
            </NavLink>
          </li>
          <li className="hover:text-white">
            <NavLink
              to="/browsecomponents/memory"
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              Memory
            </NavLink>
          </li>
          <li className="hover:text-white">
            <NavLink
              to="/browsecomponents/storage"
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              Storage
            </NavLink>
          </li>
          <li className="hover:text-white ">
            <NavLink
              to="/browsecomponents/power-supply"
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              Power Supply
            </NavLink>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default NestedNavBar;
