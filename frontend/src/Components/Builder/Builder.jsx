import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ItemCard from "./ItemCard";
import NavigationLayout from "./NavigationLayout";
import BuilderNavbar from "./BuilderNavbar";
import Filters from "../Filters/Filters";

import { Spin, message } from "antd";
import FullBuildSummary from "./FullBuildSummary";

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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [components, setComponents] = useState([]);
  const [availableFilters, setAvailableFilters] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [errorId, setErrorId] = useState(null);
  const [requirementError, setRequirementError] = useState("");
  const [selectedComponents, setSelectedComponents] = useState({});
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState(null);

  // For correct navigation after state update
  const nextTypeRef = useRef(null);

  // For full build view
  const [fullBuild, setFullBuild] = useState(null);
  const [fullBuildLoading, setFullBuildLoading] = useState(false);

  const pageSize = 4;
  const currentPage = parseInt(searchParams.get("page")) || 1;

  const requestIdRef = useRef(0);

  // Fetch components
  const fetchComponents = useCallback(async () => {
    if (type === "full-build") {
      setIsLoading(false);
      return;
    }

    const currentRequestId = ++requestIdRef.current;

    setIsLoading(true);
    setComponents([]);
    setAvailableFilters({});

    try {
      const { data } = await axios.post(
        "http://localhost:4000/api/build/next-components",
        {
          selectedComponents,
          targetType: type,
          filters,
          sortBy,
        },
        {
          withCredentials: true,
          timeout: 10000,
        }
      );

      if (requestIdRef.current !== currentRequestId) {
        return;
      }

      setComponents(data.components || []);
      setAvailableFilters(data.availableFilters || {});
    } catch (error) {
      if (requestIdRef.current === currentRequestId) {
        setComponents([]);
        setAvailableFilters({});
      }
    } finally {
      if (requestIdRef.current === currentRequestId) {
        setIsLoading(false);
      }
    }
  }, [type, selectedComponents, filters, sortBy]);

  useEffect(() => {
    fetchComponents();
  }, [fetchComponents]);

  useEffect(() => {
    setSelectedId(null);
    setErrorId(null);
    setRequirementError("");
  }, [type]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const handleSortChange = useCallback((newSortBy) => {
    setSortBy(newSortBy);
  }, []);

  const handleSelect = useCallback(
    (id) => {
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
    [type, selectedComponents]
  );

  // The key fix: set nextTypeRef and update state, then navigate in useEffect
  const handleNextComponent = useCallback(
    async (cardId) => {
      if (selectedId === cardId) {
        const currentIndex = COMPONENT_ORDER.indexOf(type);
        if (currentIndex !== -1 && currentIndex < COMPONENT_ORDER.length - 1) {
          const nextType = COMPONENT_ORDER[currentIndex + 1];

          // If nextType is "full-build", call createBuild
          if (nextType === "full-build") {
            setFullBuildLoading(true);
            try {
              const { data } = await axios.post(
                "http://localhost:4000/api/build/createbuild",
                {
                  components: { ...selectedComponents, [type]: cardId },
                },
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
            setSelectedId(null);
            setErrorId(null);
            setRequirementError("");
          }
        }
      } else {
        setSelectedId(cardId);
      }
    },
    [type, selectedId, selectedComponents, navigate]
  );

  useEffect(() => {
    if (nextTypeRef.current) {
      navigate(`/builder/${nextTypeRef.current}?page=1`);
      nextTypeRef.current = null;
    }
  }, [selectedComponents, navigate]);

  const paginatedComponents = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return components.slice(startIndex, startIndex + pageSize);
  }, [components, currentPage, pageSize]);

  const handlePageChange = useCallback(
    (page) => {
      navigate(`/builder/${type}?page=${page}`);
    },
    [navigate, type]
  );

  // Render full build summary
  const renderFullBuild = () => (
    <FullBuildSummary fullBuild={fullBuild} loading={fullBuildLoading} />
  );

  return (
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
          />
        </div>
      )}

      <div className={type === "full-build" ? "w-full" : "w-3/4"}>
        <BuilderNavbar selectedComponents={selectedComponents} />
        <NavigationLayout
          components={components}
          currentPage={currentPage}
          pageSize={pageSize}
          isLoading={isLoading}
          handlePageChange={handlePageChange}
        >
          <>
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
                No components found matching your filters.
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
                />
              ))
            )}
          </>
        </NavigationLayout>
      </div>
    </section>
  );
}

export default Builder;
