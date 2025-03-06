import React from "react";
import Logo from "../../assets/images/logo.svg";
import { NavLink } from "react-router-dom";
import "./Footer.css";
import { RiFacebookBoxFill } from "react-icons/ri";
import { FaFacebook, FaTwitter, FaYoutube, FaGithub } from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer_primary">
        <div className="footer_logo">
          <img src={Logo} width={30} />
        </div>
        <div className="footer_mainlinks">
          <div className="footer_section">
            <p className="footer_title">Get Started</p>
            <ul className="footer_column">
              <li>
                <NavLink to="builder">Builder</NavLink>
              </li>
              <li>
                <NavLink to="guides">Guides</NavLink>
              </li>
              <li>
                <NavLink to="articles">Articles</NavLink>
              </li>
              <li>
                <NavLink to="browse">Browse</NavLink>
              </li>
            </ul>
          </div>
          <div className="footer_section">
            <p className="footer_title">Account</p>
            <ul className="footer_column">
              <li>
                <NavLink to="signin">Sign in</NavLink>
              </li>
              <li>
                <NavLink to="viewcollection">View Collection</NavLink>
              </li>
              <li>
                <NavLink to="deletecollection">Delete Collection</NavLink>
              </li>
            </ul>
          </div>
          <div className="footer_section">
            <p className="footer_title">PCSmith</p>
            <ul className="footer_column">
              <li>
                <NavLink to="developers">Developers</NavLink>
              </li>
              <li>
                <NavLink to="about">About</NavLink>
              </li>
              <li>
                <NavLink to="help">Help</NavLink>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer_btn">
          <button className="footer_btn_signup">
            <NavLink to="signup">Sign Up</NavLink>
          </button>
        </div>
      </div>
      <div className="footer_secondary">
        <p>
          Say goodbye to confusion and enjoy peaceful pc building without a nerd
          in your ear.
        </p>
        <div className="footer_socialmediaLinks">
          <ul>
            <li>
              <NavLink to="facebook">
                {" "}
                <FaYoutube size={16} />
              </NavLink>
            </li>
            <li>
              <NavLink to="facebook">
                {" "}
                <FaTwitter size={16} />
              </NavLink>
            </li>
            <li>
              <NavLink to="facebook">
                {" "}
                <FaGithub size={16} />
              </NavLink>
            </li>
            <li>
              <NavLink to="facebook">
                {" "}
                <FaFacebook size={16} />
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
