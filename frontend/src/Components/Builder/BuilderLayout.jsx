import { Outlet } from "react-router-dom";
import BuilderFilter from "./BuilderFilter";
import BuilderNavbar from "./BuilderNavbar";
import "./Builder.css";

const BuilderLayout = () => {
  return (
    <section className="flex py-16 px-8 gap-7">
      <BuilderFilter />
      <div className="flex-1">
        <BuilderNavbar />
        <Outlet />
      </div>
    </section>
  );
};
export default BuilderLayout;
