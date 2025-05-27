import React, { useContext, useEffect, useRef, useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import Logo from "../../assets/images/logo.svg";
import ProfileIcon from "../../assets/icons/profile_icon.svg";
import NotificationIcon from "../../assets/icons/notification_icon.svg";
import SearchIcon from "../../assets/icons/search_icon.svg";
import { Navigate, NavLink, useNavigate } from "react-router-dom";
import "./NavBar.css";
import SearchBar from "../Search/Search";
import { CiSearch, CiUser } from "react-icons/ci";
import { RiUserLine } from "react-icons/ri";
import { PiBellLight } from "react-icons/pi";
import { UserContext } from "../../Context/UserContext";

export default function NavBar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  let navigate = useNavigate();

  let { user, logout } = useContext(UserContext);

  const logOut = async () => {
    await logout(); // this calls backend and clears context
    navigate("/login");
  };

  // let { userLogin, setuserLogin } = useContext(UserContext);
  // function logOut() {
  //   localStorage.removeItem("userToken");
  //   setuserLogin(null);
  //   navigate("/login");
  // }
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const toggleNavbar = () => {
    if (navRef.current) {
      if (menuOpen) {
        navRef.current.classList.remove("navbar_responsive_nav");
      } else {
        navRef.current.classList.add("navbar_responsive_nav");
      }
      setMenuOpen(!menuOpen);
    }
  };

  const closeNavbar = () => {
    if (navRef.current) {
      navRef.current.classList.remove("navbar_responsive_nav");
      setMenuOpen(false);
    }
  };

  return (
    <div className="navbar_container">
      <header>
        <div className="navbar_logoContainer">
          <img src={Logo} width={50} alt="Logo" />
        </div>

        {/* If search is open, show only the search bar */}
        {isSearchOpen ? (
          <SearchBar
            isSearchOpen={isSearchOpen}
            setIsSearchOpen={setIsSearchOpen}
            setMenuOpen={setMenuOpen}
          />
        ) : (
          <nav className="navbar_components" ref={navRef}>
            <div className="navbar_navigationMain">
              <ul className="navbar_headerList">
                <li className="hover:text-white" onClick={closeNavbar}>
                  <NavLink to="">Home</NavLink>
                </li>

                <li className="hover:text-white" onClick={closeNavbar}>
                  <NavLink to="builder">Builder</NavLink>
                </li>

                <li className="hover:text-white" onClick={closeNavbar}>
                  <NavLink to="guides">Guides</NavLink>
                </li>

                <li className="hover:text-white" onClick={closeNavbar}>
                  <NavLink to="community">Community</NavLink>
                </li>

                <li className="hover:text-white" onClick={closeNavbar}>
                  <NavLink to="browsecomponents">Browse Components</NavLink>
                </li>
              </ul>
            </div>

            <div className="navbar_iconsContainer">
              <div className="navbar_icons">
                <button
                  className="navbar_nav-icon"
                  onClick={() => setIsSearchOpen(true)}
                >
                  <CiSearch size={25} />
                </button>
                {user !== null ? (
                  <>
                    <button className="navbar_nav-icon" onClick={closeNavbar}>
                      <NavLink to="profile">
                        <CiUser size={25} />
                      </NavLink>
                    </button>
                  </>
                ) : null}

                <button className="navbar_nav-icon" onClick={closeNavbar}>
                  <NavLink to="notifications">
                    <PiBellLight size={25} />
                  </NavLink>
                </button>
              </div>
              <div className="navbar_actual-btn">
                <NavLink to="ai_assistant">
                  <button className="navbar_ai-button" onClick={closeNavbar}>
                    Try AI
                  </button>
                </NavLink>
                {user === null ? (
                  <>
                    {" "}
                    <NavLink to="login">
                      <button className=" navbar_log-button hover:outline ring-offset-2  transition-all duration-500 ease-in-out p-2 rounded-lg">
                        Log In
                      </button>
                    </NavLink>
                  </>
                ) : (
                  <span onClick={logOut}>
                    <button
                      className="navbar_log-button hover:outline ring-offset-2  transition-all duration-500 ease-in-out p-2 rounded-lg"
                      onClick={closeNavbar}
                    >
                      Log Out
                    </button>
                  </span>
                )}
              </div>
            </div>

            <button
              className="navbar_nav-btn navbar_nav-close-btn"
              onClick={toggleNavbar}
            >
              <FaTimes />
            </button>
          </nav>
        )}
        <button
          className={`navbar_nav-btn ${menuOpen ? "navbar_hide" : ""}`}
          onClick={toggleNavbar}
        >
          <FaBars />
        </button>
      </header>
    </div>
  );
}
