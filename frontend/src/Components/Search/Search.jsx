import React from "react";
import SearchIcon from "../../assets/icons/search_icon.svg";

export default function SearchBar({
  isSearchOpen,
  setIsSearchOpen,
  setMenuOpen,
}) {
  return (
    <div className="search-bar-container">
      <>
        <input type="text" placeholder="Search..." className="search-input" />
        <button
          className="close-search-btn"
          onClick={() => {
            setIsSearchOpen(false);
            setMenuOpen(false);
          }}
        >
          ✖
        </button>
      </>
    </div>
  );
}
