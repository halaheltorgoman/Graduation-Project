import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  useParams,
  useSearchParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import axios from "axios";
import ItemCard from "./ItemCard";
import NavigationLayout from "./NavigationLayout";
import BuilderNavbar from "./BuilderNavbar";
import Filters from "../Filters/Filters";
import logo from "../../assets/images/logo.svg";
import { Button } from "../ui/button";
import { Spin, message } from "antd";
import FullBuildSummary from "./FullBuildSummary";
import { CiSearch } from "react-icons/ci";

const COMPONENT_ORDER = [
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

export const COMPONENT_REQUIREMENTS = {
  cpu: [],
  gpu: ["cpu"],
  motherboard: ["cpu", "gpu"],
  case: ["cpu", "gpu", "motherboard"],
  cooler: ["cpu", "gpu", "motherboard", "case"],
  memory: ["cpu", "gpu", "motherboard", "case", "cooler"],
  storage: ["cpu", "gpu", "motherboard", "case", "cooler", "memory"],
  psu: ["cpu", "gpu", "motherboard", "case", "cooler", "memory", "storage"],
  "full-build": [
    "cpu",
    "gpu",
    "motherboard",
    "case",
    "cooler",
    "memory",
    "storage",
    "psu",
  ],
};

function Builder() {
  const { type = "cpu" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [components, setComponents] = useState([]);
  const [availableFilters, setAvailableFilters] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [errorId, setErrorId] = useState(null);
  const [requirementError, setRequirementError] = useState("");
  const [selectedComponents, setSelectedComponents] = useState({});
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState(null);
  const [configureMode, setConfigureMode] = useState(false);
  const [originalBuildId, setOriginalBuildId] = useState(null);

  // Guide-specific state
  const [fromGuide, setFromGuide] = useState(false);
  const [guideId, setGuideId] = useState(null);
  const [guideTitle, setGuideTitle] = useState("");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // For correct navigation after state update
  const nextTypeRef = useRef(null);

  // For full build view
  const [fullBuild, setFullBuild] = useState(null);
  const [fullBuildLoading, setFullBuildLoading] = useState(false);

  // Search refs
  const searchTimeoutRef = useRef(null);
  const prevSearchQueryRef = useRef(searchQuery);

  // Build details state
  const [buildTitle, setBuildTitle] = useState("");
  const [buildDescription, setBuildDescription] = useState("");

  const pageSize = 4;
  const currentPage = parseInt(searchParams.get("page")) || 1;
  const urlSearchQuery = searchParams.get("q") || "";

  const requestIdRef = useRef(0);

  // Initialize search from URL
  useEffect(() => {
    if (urlSearchQuery) {
      setSearchQuery(urlSearchQuery);
      setSearchInput(urlSearchQuery);
    }
  }, [urlSearchQuery]);

  // Initialize configure mode from location state
  useEffect(() => {
    if (location.state?.configureMode && location.state?.selectedComponents) {
      setConfigureMode(true);
      setSelectedComponents(location.state.selectedComponents);
      setOriginalBuildId(location.state.buildId);

      // Check if this is from a guide
      if (location.state?.fromGuide) {
        setFromGuide(true);
        setGuideId(location.state.guideId);
        setGuideTitle(location.state.originalBuild?.title || "Guide Build");

        message.info(
          `Configuring ${type.toUpperCase()} from guide - changes will be saved as a new build`
        );
      } else {
        message.info(
          `Configuring ${type.toUpperCase()} - other components are pre-selected from your build`
        );
      }
    }
  }, [location.state, type]);

  // Fetch components with search support
  const fetchComponents = useCallback(async () => {
    if (type === "full-build") {
      // Handle full build view
      if (location.state?.updatedBuild) {
        setFullBuild(location.state.updatedBuild);
      }
      setIsLoading(false);
      return;
    }

    const currentRequestId = ++requestIdRef.current;

    setIsLoading(true);
    setComponents([]);
    setAvailableFilters({});

    try {
      // Determine which endpoint to use based on search query
      const endpoint =
        searchQuery && searchQuery.trim()
          ? "http://localhost:4000/api/build/search-components"
          : "http://localhost:4000/api/build/next-components";

      const requestData = {
        selectedComponents,
        targetType: type,
        filters,
        sortBy,
      };

      // Add search query if present
      if (searchQuery && searchQuery.trim()) {
        requestData.searchQuery = searchQuery.trim();
      }

      const { data } = await axios.post(endpoint, requestData, {
        withCredentials: true,
        timeout: 10000,
      });

      if (requestIdRef.current !== currentRequestId) {
        return;
      }

      setComponents(data.components || []);
      setAvailableFilters(data.availableFilters || {});
    } catch (error) {
      if (requestIdRef.current === currentRequestId) {
        setComponents([]);
        setAvailableFilters({});

        if (configureMode) {
          message.error(
            `No compatible ${type} components found for your current build configuration`
          );
        }
      }
    } finally {
      if (requestIdRef.current === currentRequestId) {
        setIsLoading(false);
      }
    }
  }, [
    type,
    selectedComponents,
    filters,
    sortBy,
    searchQuery,
    configureMode,
    location.state,
  ]);

  useEffect(() => {
    fetchComponents();
  }, [fetchComponents]);

  useEffect(() => {
    setSelectedId(null);
    setErrorId(null);
    setRequirementError("");

    // Reset search when type changes
    setSearchQuery("");
    setSearchInput("");

    // Clear search from URL when type changes
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete("q");
    newSearchParams.set("page", "1");
    setSearchParams(newSearchParams, { replace: true });
  }, [type]);

  // Handle search input changes with debouncing
  const handleSearchInputChange = useCallback(
    (e) => {
      const value = e.target.value;
      setSearchInput(value);

      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Debounce search for 500ms
      searchTimeoutRef.current = setTimeout(() => {
        setSearchQuery(value);

        // Update URL with search query
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set("page", "1");
        if (value.trim()) {
          newSearchParams.set("q", value.trim());
        } else {
          newSearchParams.delete("q");
        }
        setSearchParams(newSearchParams);
      }, 500);
    },
    [searchParams, setSearchParams]
  );

  // Handle search button click
  const handleSearchSubmit = useCallback(
    (e) => {
      e.preventDefault();

      // Clear timeout if user clicks search button
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      setSearchQuery(searchInput);

      // Update URL with search query
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set("page", "1");
      if (searchInput.trim()) {
        newSearchParams.set("q", searchInput.trim());
      } else {
        newSearchParams.delete("q");
      }
      setSearchParams(newSearchParams);
    },
    [searchInput, searchParams, setSearchParams]
  );

  // Cleanup search timeout
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const handleSortChange = useCallback((newSortBy) => {
    setSortBy(newSortBy);
  }, []);

  const handleSelect = useCallback(
    (id) => {
      if (configureMode) {
        setSelectedId(id);
        setErrorId(null);
        setRequirementError("");
        return;
      }

      const requirements = COMPONENT_REQUIREMENTS[type] || [];
      const missing = requirements.filter((req) => !selectedComponents[req]);

      if (missing.length > 0) {
        setRequirementError(
          `Please select ${missing.join(" and ")} before selecting a ${type}.`
        );
        setErrorId(id);
        return;
      }

      setSelectedId(id);
      setErrorId(null);
      setRequirementError("");
    },
    [type, selectedComponents, configureMode]
  );

  // Handle build details update
  const handleBuildDetailsUpdate = useCallback((title, description) => {
    setBuildTitle(title || "");
    setBuildDescription(description || "");
  }, []);

  // Modified handleNextComponent function to handle guide configurations
  // Updated handleNextComponent function for Builder.jsx
  const handleNextComponent = useCallback(
    async (cardId) => {
      if (configureMode) {
        if (selectedId === cardId) {
          try {
            if (fromGuide) {
              // GUIDE CUSTOMIZATION: Always create a new build, never update the guide
              console.log("Creating new build from guide customization");

              const buildData = {
                components: { ...selectedComponents, [type]: cardId },
                title: `${guideTitle} - Customized`,
                description: `Customized build based on guide: ${guideTitle}`,
                // Store reference to original guide without modifying it
                metadata: {
                  basedOnGuide: guideId,
                  originalGuideTitle: guideTitle,
                  customizedComponent: type,
                  customizationDate: new Date().toISOString(),
                },
              };

              const { data } = await axios.post(
                "http://localhost:4000/api/build/createbuild",
                buildData,
                { withCredentials: true }
              );

              // Navigate to the new build's full view
              navigate(`/builder/full-build`, {
                state: {
                  configureMode: false,
                  updatedBuild: data.build,
                  fromGuideConfig: true,
                  originalGuideId: guideId,
                  isNewBuildFromGuide: true, // Flag to indicate this is a new build
                },
              });

              message.success(
                `New build created from guide! Your customized ${type} has been saved to your completed builds.`
              );
            } else {
              // EXISTING BUILD UPDATE: Update the existing build
              console.log("Updating existing build component");

              const { data } = await axios.put(
                `http://localhost:4000/api/build/${originalBuildId}/update-component`,
                {
                  componentType: type,
                  componentId: cardId,
                },
                { withCredentials: true }
              );

              // Navigate to full build view with the updated build
              navigate(`/builder/full-build`, {
                state: {
                  configureMode: true,
                  originalBuildId,
                  updatedBuild: data.build,
                  originalBuild: data.build,
                  isExistingBuildUpdate: true, // Flag to indicate this is an update
                },
              });

              message.success(
                `Your existing build has been updated with the new ${type}!`
              );
            }
          } catch (err) {
            console.error("Component update/creation error:", err);
            message.error(
              err.response?.data?.message ||
                `Failed to ${
                  fromGuide ? "create new build" : "update component"
                }. Please try again.`
            );
          }
        } else {
          setSelectedId(cardId);
        }
        return;
      }

      // Original next component logic for normal build creation mode
      if (selectedId === cardId) {
        const currentIndex = COMPONENT_ORDER.indexOf(type);
        if (currentIndex !== -1 && currentIndex < COMPONENT_ORDER.length - 1) {
          const nextType = COMPONENT_ORDER[currentIndex + 1];

          if (nextType === "full-build") {
            setFullBuildLoading(true);
            try {
              const buildData = {
                components: { ...selectedComponents, [type]: cardId },
                title:
                  buildTitle || `My Build ${new Date().toLocaleDateString()}`,
              };

              // Include description if provided
              if (buildDescription && buildDescription.trim()) {
                buildData.description = buildDescription.trim();
              }

              const { data } = await axios.post(
                "http://localhost:4000/api/build/createbuild",
                buildData,
                { withCredentials: true }
              );

              setFullBuild(data.build);
              setFullBuildLoading(false);
              navigate(`/builder/full-build`);
            } catch (err) {
              setFullBuildLoading(false);
              message.error(
                err.response?.data?.message ||
                  "Failed to create build. Please try again."
              );
            }
          } else {
            nextTypeRef.current = nextType;
            setSelectedComponents((prev) => ({
              ...prev,
              [type]: cardId,
            }));
          }
        }
      } else {
        setSelectedId(cardId);
      }
    },
    [
      type,
      selectedId,
      selectedComponents,
      navigate,
      configureMode,
      originalBuildId,
      buildTitle,
      buildDescription,
      fromGuide,
      guideId,
      guideTitle,
    ]
  );

  useEffect(() => {
    if (nextTypeRef.current && !configureMode) {
      navigate(`/builder/${nextTypeRef.current}?page=1`);
      nextTypeRef.current = null;
    }
  }, [selectedComponents, navigate, configureMode]);

  const paginatedComponents = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return components.slice(startIndex, startIndex + pageSize);
  }, [components, currentPage, pageSize]);

  const handlePageChange = useCallback(
    (page) => {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set("page", page.toString());
      if (searchQuery) {
        newSearchParams.set("q", searchQuery);
      }
      navigate(`/builder/${type}?${newSearchParams.toString()}`);
    },
    [navigate, type, searchParams, searchQuery]
  );

  const handleCancelConfigure = useCallback(() => {
    if (fromGuide) {
      // If from guide, go back to guides
      navigate("/guides");
    } else {
      // Original logic for builds
      navigate("/profile?tab=1");
    }
  }, [navigate, fromGuide]);

  const renderFullBuild = () => (
    <FullBuildSummary
      fullBuild={fullBuild}
      loading={fullBuildLoading}
      configureMode={configureMode}
      originalBuildId={originalBuildId}
      fromGuideConfig={location.state?.fromGuideConfig}
      originalGuideId={location.state?.originalGuideId}
    />
  );

  return (
    <div className="builder-container">
      <section className="flex gap-4 justify-around overflow-hidden">
        {type !== "full-build" && (
          <div className="w-1/4">
            <Filters
              key={type}
              onFilterChange={handleFilterChange}
              onSortChange={handleSortChange}
              initialFilters={filters}
              initialSort={sortBy}
              availableFilters={availableFilters}
              configureMode={configureMode}
            />
          </div>
        )}
        <div className={type === "full-build" ? "w-full" : "w-3/4"}>
          <BuilderNavbar
            selectedComponents={selectedComponents}
            configureMode={configureMode}
            targetComponent={configureMode ? type : null}
            // Pass build details and handlers to BuilderNavbar
            buildTitle={buildTitle}
            buildDescription={buildDescription}
            onBuildDetailsUpdate={handleBuildDetailsUpdate}
            fromGuide={fromGuide}
            guideTitle={guideTitle}
          />

          <NavigationLayout
            components={components}
            currentPage={currentPage}
            pageSize={pageSize}
            isLoading={isLoading}
            handlePageChange={handlePageChange}
            configureMode={configureMode}
          >
            <>
              {configureMode && (
                <div className="configure-mode-header">
                  <div className="configure-mode-content">
                    <h3>
                      <span className="configure-badge">
                        {fromGuide ? "Guide Configuration" : "Configure Mode"}
                      </span>
                      {type === "full-build"
                        ? fromGuide
                          ? "New Build Created"
                          : "Review Build Changes"
                        : `Updating ${type.toUpperCase()}`}
                    </h3>
                    <p>
                      {type === "full-build"
                        ? fromGuide
                          ? "Your customized build has been created successfully!"
                          : "Review your build changes and choose how to save them."
                        : fromGuide
                        ? `Customizing ${type} from guide "${guideTitle}". Your changes will be saved as a new build.`
                        : `You're updating a component in your existing build. Select a compatible ${type} to continue.`}
                    </p>
                    <div className="configure-actions">
                      <Button
                        variant="outline"
                        onClick={handleCancelConfigure}
                        className="configure-cancel-btn"
                      >
                        {fromGuide ? "Back to Guides" : "Cancel Update"}
                      </Button>
                    </div>
                  </div>
                  <div className="configure-progress">
                    <div
                      className={`progress-step ${
                        type !== "full-build" ? "active" : "completed"
                      }`}
                    >
                      <span>1</span>
                      <p>
                        Select{" "}
                        {configureMode && type !== "full-build"
                          ? type
                          : "Component"}
                      </p>
                    </div>
                    <div
                      className={`progress-step ${
                        type === "full-build" ? "active" : ""
                      }`}
                    >
                      <span>2</span>
                      <p>{fromGuide ? "Build Created" : "Review Build"}</p>
                    </div>
                    {/* <div className="progress-step">
                      <span>3</span>
                      <p>{fromGuide ? "Complete" : "Save Changes"}</p>
                    </div> */}
                  </div>
                </div>
              )}
              {requirementError && (
                <div className="text-red-500 text-center my-2">
                  {requirementError}
                </div>
              )}
              {type === "full-build" ? (
                renderFullBuild()
              ) : isLoading ? (
                <div className="flex justify-center items-center py-10">
                  <Spin size="large" />
                </div>
              ) : paginatedComponents.length === 0 ? (
                <div className="text-center text-gray-400 py-10">
                  {searchQuery
                    ? `No ${type} components found matching "${searchQuery}"${
                        configureMode
                          ? " that are compatible with your build"
                          : ""
                      }.`
                    : configureMode
                    ? `No compatible ${type} components found for your current build configuration.`
                    : "No components found matching your filters."}
                </div>
              ) : (
                paginatedComponents.map((component) => (
                  <ItemCard
                    key={component._id || component.id}
                    item={component}
                    type={type}
                    selected={selectedId === (component._id || component.id)}
                    onSelect={() => handleSelect(component._id || component.id)}
                    onNext={() =>
                      handleNextComponent(component._id || component.id)
                    }
                    showError={errorId === (component._id || component.id)}
                    configureMode={configureMode}
                    buttonText={
                      fromGuide
                        ? "Create New Build"
                        : configureMode
                        ? "Update & Continue"
                        : "Next"
                    }
                  />
                ))
              )}
            </>
          </NavigationLayout>
        </div>
      </section>
    </div>
  );
}

export default Builder;
