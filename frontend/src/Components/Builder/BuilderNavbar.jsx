// import { NavLink } from "react-router-dom";

// const BuilderNavbar = () => {
//   return (
//     <nav className="my-8 mx-auto w-fit">
//       <ul
//         className="flex relative gap-3 *:text-white/65 hover:*:text-white
//       *:transition-colors *:duration-300 *:ease-in-out"
//       >
//         <li>
//           <NavLink className="nav-item" to="/builder/cpu">
//             CPU
//           </NavLink>
//         </li>
//         <li>
//           <NavLink className="nav-item" to="/builder/gpu">
//             GPU
//           </NavLink>
//         </li>
//         <li>
//           <NavLink className="nav-item" to="/builder/motherboard">
//             Motherboard
//           </NavLink>
//         </li>
//         <li>
//           <NavLink className="nav-item" to="/builder/case">
//             Case
//           </NavLink>
//         </li>
//         <li>
//           <NavLink className="nav-item" to="/builder/cooling">
//             Cooling
//           </NavLink>
//         </li>
//         <li>
//           <NavLink className="nav-item" to="/builder/memory">
//             Memory
//           </NavLink>
//         </li>
//         <li>
//           <NavLink className="nav-item" to="/builder/storage">
//             Storage
//           </NavLink>
//         </li>
//         <li>
//           <NavLink className="nav-item" to="/builder/psu">
//             PSU
//           </NavLink>
//         </li>
//         <li>
//           <NavLink className="nav-item" to="/builder/full-build">
//             Full Build
//           </NavLink>
//         </li>
//       </ul>
//     </nav>
//   );
// };
// export default BuilderNavbar;
import { NavLink } from "react-router-dom";
import { COMPONENT_REQUIREMENTS } from "./Builder"; // or export it to a shared file

const NAV_ITEMS = [
  "cpu",
  "gpu",
  "motherboard",
  "case",
  "cooler",
  "memory",
  "storage",
  "psu",
  "full-build",
];

const BuilderNavbar = ({ selectedComponents }) => {
  const isDisabled = (type) => {
    const required = COMPONENT_REQUIREMENTS[type] || [];
    return required.some((r) => !selectedComponents[r]);
  };

  return (
    <nav className="my-8 mx-auto w-fit">
      <ul className="flex relative gap-3 *:text-white/65 hover:*:text-white *:transition-colors *:duration-300 *:ease-in-out">
        {NAV_ITEMS.map((type) => {
          const disabled = isDisabled(type);
          return (
            <li key={type}>
              <NavLink
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active text-white" : ""} ${
                    disabled ? "opacity-30 cursor-not-allowed" : ""
                  }`
                }
                to={`/builder/${type}`}
                onClick={(e) => {
                  if (disabled) e.preventDefault();
                }}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default BuilderNavbar;
