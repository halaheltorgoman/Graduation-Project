import { NavLink } from "react-router-dom";

const BuilderNavbar = () => {
  return (
    <nav className="my-8 mx-auto w-fit">
      <ul
        className="flex relative gap-6 *:text-white/65 hover:*:text-white
      *:transition-colors *:duration-300 *:ease-in-out"
      >
        <li>
          <NavLink className="nav-item" to="/builder/cpu">
            CPU
          </NavLink>
        </li>
        <li>
          <NavLink className="nav-item" to="/builder/gpu">
            GPU
          </NavLink>
        </li>
        <li>
          <NavLink className="nav-item" to="/builder/motherboard">
            Motherboard
          </NavLink>
        </li>
        <li>
          <NavLink className="nav-item" to="/builder/case">
            Case
          </NavLink>
        </li>
        <li>
          <NavLink className="nav-item" to="/builder/cooling">
            Cooling
          </NavLink>
        </li>
        <li>
          <NavLink className="nav-item" to="/builder/memory">
            Memory
          </NavLink>
        </li>
        <li>
          <NavLink className="nav-item" to="/builder/storage">
            Storage
          </NavLink>
        </li>
        <li>
          <NavLink className="nav-item" to="/builder/psu">
            PSU
          </NavLink>
        </li>
        <li>
          <NavLink className="nav-item" to="/builder/full-build">
            Full Build
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};
export default BuilderNavbar;
