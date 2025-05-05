import { NavLink, useLocation } from "react-router-dom";

const BuilderNavbar = () => {
  const location = useLocation();

  return (
    <nav className="mb-36 mx-auto w-fit">
      <ul className="flex relative gap-6 *:text-white/65">
        <li>
          <NavLink
            className={() => location.pathname === "/builder" && "active"}
            to="/builder"
          >
            CPU
          </NavLink>
        </li>
        <li>
          <NavLink to="/builder/gpu">GPU</NavLink>
        </li>
        <li>
          <NavLink to="/builder/motherboard">Motherboard</NavLink>
        </li>
        <li>
          <NavLink to="/builder/case">Case</NavLink>
        </li>
        <li>
          <NavLink to="/builder/cooling">Cooling</NavLink>
        </li>
        <li>
          <NavLink to="/builder/memory">Memory</NavLink>
        </li>
        <li>
          <NavLink to="/builder/storage">Storage</NavLink>
        </li>
        <li>
          <NavLink to="/builder/psu">PSU</NavLink>
        </li>
        <li>
          <NavLink to="/builder/full-build">Full Build</NavLink>
        </li>
        {/* <div className="indicator" /> */}
      </ul>
    </nav>
  );
};
export default BuilderNavbar;
