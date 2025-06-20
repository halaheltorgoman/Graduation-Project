import React, {
  useState,
  useRef,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { FaSearch } from "react-icons/fa";
import Logo from "../../assets/images/logo.svg";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import "./NavBar.css";
import { CiUser } from "react-icons/ci";
import { PiBellLight } from "react-icons/pi";
import { UserContext } from "../../Context/UserContext";
import { useNavigation } from "../../Context/NavigationContext";
import { debounce } from "lodash";
import axios from "axios";


export default function NavBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredComponents, setFilteredComponents] = useState([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(UserContext);
  const { navigateToComponentDetail, getPageState } = useNavigation();

  // Check if returning from navigation and restore search state
  useEffect(() => {
    // Check if we need to restore search state
    if (location.state?.restoreSearch) {
      const savedState = getPageState("navbar-search");
      if (savedState && savedState.searchTerm) {
        setSearchTerm(savedState.searchTerm);
        setIsSearchActive(true);
        setShowResults(true);

        // Restore scroll position after a brief delay
        setTimeout(() => {
          if (savedState.scrollPosition) {
            window.scrollTo({
              top: savedState.scrollPosition,
              behavior: "smooth",
            });
          }
        }, 100);
      }
    }
  }, [location.state, getPageState]);

  // Safe highlight matching function
  const highlightMatchHTML = (text, searchQuery) => {
    if (!text || typeof text !== "string") return { __html: text };
    if (!searchQuery || typeof searchQuery !== "string")
      return { __html: text };

    try {
      const regex = new RegExp(`(${escapeRegExp(searchQuery)})`, "gi");
      const highlightedText = text.replace(
        regex,
        '<span class="search-highlight">$1</span>'
      );
      return { __html: highlightedText };
    } catch (e) {
      console.error("Highlight error:", e);
      return { __html: text };
    }
  };

  // Helper to escape regex special characters
  const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };

  // API-based search function
  const performSearch = useCallback(
    debounce(async (query) => {
      if (!query.trim()) {
        setFilteredComponents([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      setError(null);

      try {
        // Call the new search API
        const response = await axios.get(
          `http://localhost:4000/api/search/all`,
          {
            params: {
              q: query.trim(),
              limit: 1000, // Limit to 10 results for navbar
            },
          }
        );

        if (response.data.success) {
          setFilteredComponents(response.data.components || []);
        } else {
          setError(response.data.message || "Search failed");
          setFilteredComponents([]);
        }
      } catch (err) {
        console.error("Search API error:", err);

        // Handle different error types
        if (err.response) {
          // Server responded with error status
          setError(
            `Search failed: ${
              err.response.data?.message || err.response.statusText
            }`
          );
        } else if (err.request) {
          // Network error
          setError("Network error. Please check your connection.");
        } else {
          // Other error
          setError("An unexpected error occurred while searching.");
        }

        setFilteredComponents([]);
      } finally {
        setIsSearching(false);
      }
    }, 300), // Increased debounce to 300ms to reduce API calls
    []
  );

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchTerm(query);

    if (query.length > 0) {
      performSearch(query);
      setShowResults(true);
    } else {
      setFilteredComponents([]);
      setShowResults(false);
      setIsSearching(false);
    }
  };

  const toggleSearch = () => {
    setIsSearchActive(!isSearchActive);
    if (!isSearchActive && searchRef.current) {
      setTimeout(() => {
        searchRef.current.focus();
        if (searchTerm.length > 0) {
          setShowResults(true);
        }
      }, 50);
    } else {
      setShowResults(false);
    }
  };

  const handleSearchFocus = () => {
    if (searchTerm.length > 0) {
      setShowResults(true);
    }
  };

  const handleSearchBlur = () => {
    setTimeout(() => {
      setShowResults(false);
      if (searchTerm === "") {
        setIsSearchActive(false);
      }
    }, 200);
  };

  const handleResultClick = (component) => {
    // Use the navigation context to handle the click
    navigateToComponentDetail(component, {
      sourcePage: "search",
      searchTerm: searchTerm,
      scrollPosition: window.pageYOffset,
    });

    // Clear search UI
    setShowResults(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setShowResults(false);
      setIsSearchActive(false);
      setSearchTerm("");
      searchRef.current?.blur();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
        if (searchTerm === "") {
          setIsSearchActive(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchTerm]);

  return (
    <div className="navbar_container">
      <header>
        <div className="navbar_logoContainer">
          <img src={Logo} width={50} alt="Logo" />
        </div>

        <nav className="navbar_components">
          {!isSearchActive && (
            <div className="navbar_navigationMain">
              <ul className="navbar_headerList">
                <li>
                  <NavLink to="">Home</NavLink>
                </li>
                <li>
                  <NavLink to="builder">Builder</NavLink>
                </li>
                <li>
                  <NavLink to="guides">Guides</NavLink>
                </li>
                <li>
                  <NavLink to="community">Community</NavLink>
                </li>
                <li>
                  <NavLink to="browsecomponents">Browse Components</NavLink>
                </li>
              </ul>
            </div>
          )}

          <div
            className={`navbar_iconsContainer ${
              isSearchActive ? "search-active" : ""
            }`}
          >
            {!isSearchActive ? (
              <>
                <div className="navbar_icons">
                  <div
                    className="navbar_search-icon-container"
                    onClick={toggleSearch}
                  >
                    <FaSearch className="navbar_search-icon" />
                  </div>

                  {user !== null && (
                    <NavLink to="profile" className="navbar_nav-icon">
                      <CiUser size={24} />
                    </NavLink>
                  )}

                  {/* <NavLink to="notifications" className="navbar_nav-icon">
                    <PiBellLight size={24} />
                  </NavLink> */}
                </div>

                <div className="navbar_actual-btn">
                  <NavLink to="ai_assistant">
                    <button className="navbar_ai-button">Try AI</button>
                  </NavLink>

                  {user === null ? (
                    <NavLink to="login">
                      <button className="navbar_log-button">Log In</button>
                    </NavLink>
                  ) : (
                    <button className="navbar_log-button" onClick={logout}>
                      Log Out
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="navbar_search-expanded">
                <div className="navbar_search-container" ref={searchRef}>
                  <input
                    type="text"
                    placeholder="Search components..."
                    className="navbar_search-input"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onFocus={handleSearchFocus}
                    onBlur={handleSearchBlur}
                    onKeyDown={handleKeyDown}
                    ref={searchRef}
                    autoComplete="off"
                    spellCheck="false"
                  />
                  <FaSearch
                    className="navbar_search-icon"
                    onClick={toggleSearch}
                  />

                  {showResults && (
                    <div className="navbar_search-results">
                      {error ? (
                        <div className="navbar_search-error">
                          <div className="error-icon">⚠️</div>
                          <div>{error}</div>
                        </div>
                      ) : isSearching ? (
                        <div className="navbar_search-loading">
                          <div className="navbar_search-loading-spinner"></div>
                          <div>Searching...</div>
                        </div>
                      ) : (
                        <>
                          {filteredComponents.length > 0 ? (
                            <div className="navbar_search-result-category">
                              <div className="navbar_search-category-title">
                                <span className="navbar_search-category-icon">
                                  🔧
                                </span>
                                Components ({filteredComponents.length})
                              </div>
                              {filteredComponents.map((item) => (
                                <div
                                  key={item._id}
                                  className="navbar_search-result-item"
                                  onMouseDown={() => handleResultClick(item)}
                                >
                                  <div className="navbar_search-result-main">
                                    <div className="navbar_search-result-name">
                                      <img
                                        src={item.image_source}
                                        className="search_image"
                                        alt={item.title}
                                        onError={(e) => {
                                          // Fallback for broken images
                                          e.target.style.display = "none";
                                        }}
                                      />
                                      <span
                                        dangerouslySetInnerHTML={highlightMatchHTML(
                                          item.title,
                                          searchTerm
                                        )}
                                      />
                                    </div>
                                    <div className="navbar_search-result-meta">
                                      {(item.type || item.componentType) && (
                                        <span className="navbar_search-result-type">
                                          {item.type || item.componentType}
                                        </span>
                                      )}
                                      {item.brand && (
                                        <>
                                          <span className="navbar_search-result-separator">
                                            •
                                          </span>
                                          <span className="navbar_search-result-brand">
                                            <span
                                              dangerouslySetInnerHTML={highlightMatchHTML(
                                                item.brand,
                                                searchTerm
                                              )}
                                            />
                                          </span>
                                        </>
                                      )}
                                      {item.price && (
                                        <>
                                          <span className="navbar_search-result-separator">
                                            •
                                          </span>
                                          <span className="navbar_search-result-price">
                                            EGP {item.price}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : searchTerm.length > 0 ? (
                            <div className="navbar_search-no-results">
                              <div className="navbar_search-no-results-icon">
                                🔍
                              </div>
                              <div>No results found for "{searchTerm}"</div>
                              <div className="navbar_search-no-results-suggestion">
                                Try different keywords
                              </div>
                            </div>
                          ) : (
                            <div className="navbar_search-empty-state">
                              <div className="navbar_search-empty-icon">💡</div>
                              <div>Start typing to search components</div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </nav>
      </header>
    </div>
  );
}
