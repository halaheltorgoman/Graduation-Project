// import React, {
//   useState,
//   useEffect,
//   useCallback,
//   useMemo,
//   useRef,
// } from "react";
// import { useParams, useSearchParams, useNavigate } from "react-router-dom";
// import axios from "axios";
// import ItemCard from "./ItemCard";
// import NavigationLayout from "./NavigationLayout";
// import BuilderNavbar from "./BuilderNavbar";
// import Filters from "../Filters/Filters";

// import { Spin, message } from "antd";
// import FullBuildSummary from "./FullBuildSummary";

// const COMPONENT_ORDER = [
//   "cpu",
//   "gpu",
//   "motherboard",
//   "case",
//   "cooler",
//   "memory",
//   "storage",
//   "psu",
//   "full-build",
// ];

// export const COMPONENT_REQUIREMENTS = {
//   cpu: [],
//   gpu: ["cpu"],
//   motherboard: ["cpu", "gpu"],
//   case: ["cpu", "gpu", "motherboard"],
//   cooler: ["cpu", "gpu", "motherboard", "case"],
//   memory: ["cpu", "gpu", "motherboard", "case", "cooler"],
//   storage: ["cpu", "gpu", "motherboard", "case", "cooler", "memory"],
//   psu: ["cpu", "gpu", "motherboard", "case", "cooler", "memory", "storage"],
//   "full-build": [
//     "cpu",
//     "gpu",
//     "motherboard",
//     "case",
//     "cooler",
//     "memory",
//     "storage",
//     "psu",
//   ],
// };

// function Builder() {
//   const { type = "cpu" } = useParams();
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();

//   const [components, setComponents] = useState([]);
//   const [availableFilters, setAvailableFilters] = useState({});
//   const [isLoading, setIsLoading] = useState(true);
//   const [selectedId, setSelectedId] = useState(null);
//   const [errorId, setErrorId] = useState(null);
//   const [requirementError, setRequirementError] = useState("");
//   const [selectedComponents, setSelectedComponents] = useState({});
//   const [filters, setFilters] = useState({});
//   const [sortBy, setSortBy] = useState(null);

//   // For correct navigation after state update
//   const nextTypeRef = useRef(null);

//   // For full build view
//   const [fullBuild, setFullBuild] = useState(null);
//   const [fullBuildLoading, setFullBuildLoading] = useState(false);

//   const pageSize = 4;
//   const currentPage = parseInt(searchParams.get("page")) || 1;

//   const requestIdRef = useRef(0);

//   // Fetch components
//   const fetchComponents = useCallback(async () => {
//     if (type === "full-build") {
//       setIsLoading(false);
//       return;
//     }

//     const currentRequestId = ++requestIdRef.current;

//     setIsLoading(true);
//     setComponents([]);
//     setAvailableFilters({});

//     try {
//       const { data } = await axios.post(
//         "http://localhost:4000/api/build/next-components",
//         {
//           selectedComponents,
//           targetType: type,
//           filters,
//           sortBy,
//         },
//         {
//           withCredentials: true,
//           timeout: 10000,
//         }
//       );

//       if (requestIdRef.current !== currentRequestId) {
//         return;
//       }

//       setComponents(data.components || []);
//       setAvailableFilters(data.availableFilters || {});
//     } catch (error) {
//       if (requestIdRef.current === currentRequestId) {
//         setComponents([]);
//         setAvailableFilters({});
//       }
//     } finally {
//       if (requestIdRef.current === currentRequestId) {
//         setIsLoading(false);
//       }
//     }
//   }, [type, selectedComponents, filters, sortBy]);

//   useEffect(() => {
//     fetchComponents();
//   }, [fetchComponents]);

//   useEffect(() => {
//     setSelectedId(null);
//     setErrorId(null);
//     setRequirementError("");
//   }, [type]);

//   const handleFilterChange = useCallback((newFilters) => {
//     setFilters(newFilters);
//   }, []);

//   const handleSortChange = useCallback((newSortBy) => {
//     setSortBy(newSortBy);
//   }, []);

//   const handleSelect = useCallback(
//     (id) => {
//       const requirements = COMPONENT_REQUIREMENTS[type] || [];
//       const missing = requirements.filter((req) => !selectedComponents[req]);

//       if (missing.length > 0) {
//         setRequirementError(
//           `Please select ${missing.join(" and ")} before selecting a ${type}.`
//         );
//         setErrorId(id);
//         return;
//       }

//       setSelectedId(id);
//       setErrorId(null);
//       setRequirementError("");
//     },
//     [type, selectedComponents]
//   );

//   // The key fix: set nextTypeRef and update state, then navigate in useEffect
//   const handleNextComponent = useCallback(
//     async (cardId) => {
//       if (selectedId === cardId) {
//         const currentIndex = COMPONENT_ORDER.indexOf(type);
//         if (currentIndex !== -1 && currentIndex < COMPONENT_ORDER.length - 1) {
//           const nextType = COMPONENT_ORDER[currentIndex + 1];

//           // If nextType is "full-build", call createBuild
//           if (nextType === "full-build") {
//             setFullBuildLoading(true);
//             try {
//               const { data } = await axios.post(
//                 "http://localhost:4000/api/build/createbuild",
//                 {
//                   components: { ...selectedComponents, [type]: cardId },
//                 },
//                 { withCredentials: true }
//               );
//               setFullBuild(data.build);
//               setFullBuildLoading(false);
//               navigate(`/builder/full-build`);
//             } catch (err) {
//               setFullBuildLoading(false);
//               message.error(
//                 err.response?.data?.message ||
//                   "Failed to create build. Please try again."
//               );
//             }
//           } else {
//             nextTypeRef.current = nextType;
//             setSelectedComponents((prev) => ({
//               ...prev,
//               [type]: cardId,
//             }));
//             setSelectedId(null);
//             setErrorId(null);
//             setRequirementError("");
//           }
//         }
//       } else {
//         setSelectedId(cardId);
//       }
//     },
//     [type, selectedId, selectedComponents, navigate]
//   );

//   useEffect(() => {
//     if (nextTypeRef.current) {
//       navigate(`/builder/${nextTypeRef.current}?page=1`);
//       nextTypeRef.current = null;
//     }
//   }, [selectedComponents, navigate]);

//   const paginatedComponents = useMemo(() => {
//     const startIndex = (currentPage - 1) * pageSize;
//     return components.slice(startIndex, startIndex + pageSize);
//   }, [components, currentPage, pageSize]);

//   const handlePageChange = useCallback(
//     (page) => {
//       navigate(`/builder/${type}?page=${page}`);
//     },
//     [navigate, type]
//   );

//   // Render full build summary
//   const renderFullBuild = () => (
//     <FullBuildSummary fullBuild={fullBuild} loading={fullBuildLoading} />
//   );

//   return (
//     <section className="flex gap-4 justify-around overflow-hidden">
//       {type !== "full-build" && (
//         <div className="w-1/4">
//           <Filters
//             key={type}
//             onFilterChange={handleFilterChange}
//             onSortChange={handleSortChange}
//             initialFilters={filters}
//             initialSort={sortBy}
//             availableFilters={availableFilters}
//           />
//         </div>
//       )}

//       <div className={type === "full-build" ? "w-full" : "w-3/4"}>
//         <BuilderNavbar selectedComponents={selectedComponents} />
//         <NavigationLayout
//           components={components}
//           currentPage={currentPage}
//           pageSize={pageSize}
//           isLoading={isLoading}
//           handlePageChange={handlePageChange}
//         >
//           <>
//             {requirementError && (
//               <div className="text-red-500 text-center my-2">
//                 {requirementError}
//               </div>
//             )}
//             {type === "full-build" ? (
//               renderFullBuild()
//             ) : isLoading ? (
//               <div className="flex justify-center items-center py-10">
//                 <Spin size="large" />
//               </div>
//             ) : paginatedComponents.length === 0 ? (
//               <div className="text-center text-gray-400 py-10">
//                 No components found matching your filters.
//               </div>
//             ) : (
//               paginatedComponents.map((component) => (
//                 <ItemCard
//                   key={component._id || component.id}
//                   item={component}
//                   type={type}
//                   selected={selectedId === (component._id || component.id)}
//                   onSelect={() => handleSelect(component._id || component.id)}
//                   onNext={() =>
//                     handleNextComponent(component._id || component.id)
//                   }
//                   showError={errorId === (component._id || component.id)}
//                 />
//               ))
//             )}
//           </>
//         </NavigationLayout>
//       </div>
//     </section>
//   );
// }

// export default Builder;
// // import React, { useState, useEffect, useCallback } from "react";
// // import { useParams, useSearchParams, useNavigate } from "react-router-dom";
// // import axios from "axios";
// // import ItemCard from "./ItemCard";
// // import NavigationLayout from "./NavigationLayout";
// // import BuilderNavbar from "./BuilderNavbar";
// // import Filters from "../Filters/Filters";
// // import logo from "../../assets/images/logo.svg";
// // import { Button } from "../ui/button";

// // const COMPONENT_ORDER = [
// //   "cpu",
// //   "gpu",
// //   "motherboard",
// //   "case",
// //   "cooling",
// //   "memory",
// //   "storage",
// //   "psu",
// //   "full-build",
// // ];

// // const COMPONENT_REQUIREMENTS = {
// //   cpu: [],
// //   gpu: ["cpu"],
// //   motherboard: ["cpu", "gpu"],
// //   case: ["cpu", "gpu", "motherboard"],
// //   cooling: ["cpu", "gpu", "motherboard", "case"],
// //   memory: ["cpu", "gpu", "motherboard", "case", "cooling"],
// //   storage: ["cpu", "gpu", "motherboard", "case", "cooling", "memory"],
// //   psu: ["cpu", "gpu", "motherboard", "case", "cooling", "memory", "storage"],
// //   "full-build": [
// //     "cpu",
// //     "gpu",
// //     "motherboard",
// //     "case",
// //     "cooling",
// //     "memory",
// //     "storage",
// //     "psu",
// //   ],
// // };

// // function Builder() {
// //   const { type = "cpu" } = useParams();
// //   const [searchParams] = useSearchParams();
// //   const navigate = useNavigate();

// //   const [components, setComponents] = useState([]);
// //   const [sortBy, setSortBy] = useState(null);
// //   const [filters, setFilters] = useState({});
// //   const [isLoading, setIsLoading] = useState(false);
// //   const [selectedId, setSelectedId] = useState(null);
// //   const [errorId, setErrorId] = useState(null);
// //   const [requirementError, setRequirementError] = useState("");
// //   const [selectedComponents, setSelectedComponents] = useState({});

// //   const pageSize = 4;
// //   const currentPage = parseInt(searchParams.get("page")) || 1;

// //   // Reset selectedId and errors when type changes
// //   useEffect(() => {
// //     setSelectedId(null);
// //     setErrorId(null);
// //     setRequirementError("");
// //   }, [type]);

// //   // Fetch compatible components for the current type
// //   const getCompatibleComponents = useCallback(
// //     async (
// //       selectedComponentsObj,
// //       targetType,
// //       filterParams = {},
// //       sortOption = null
// //     ) => {
// //       setIsLoading(true);
// //       try {
// //         console.log("[DEBUG] Sending request with:", {
// //           selectedComponents: selectedComponentsObj,
// //           targetType,
// //           filters: filterParams,
// //           sortBy: sortOption,
// //         });

// //         const { data } = await axios.post(
// //           "http://localhost:4000/api/build/next-components",
// //           {
// //             selectedComponents: selectedComponentsObj,
// //             targetType,
// //             filters: filterParams,
// //             sortBy: sortOption,
// //           },
// //           { withCredentials: true }
// //         );

// //         console.log(
// //           `[DEBUG] Received ${data.components?.length || 0} components`
// //         );
// //         setComponents(data.components || []);
// //       } catch (error) {
// //         console.error("Error fetching compatible components:", error);
// //         setComponents([]);
// //       } finally {
// //         setIsLoading(false);
// //       }
// //     },
// //     []
// //   );

// //   // On mount or when type changes, fetch compatible components
// //   useEffect(() => {
// //     if (type !== "full-build") {
// //       getCompatibleComponents(selectedComponents, type, filters, sortBy);
// //     }
// //   }, [type, getCompatibleComponents, selectedComponents, filters, sortBy]);

// //   // Handler for filters change
// //   const handleFilterChange = useCallback((newFilters) => {
// //     console.log("[DEBUG] Filters changed:", newFilters);
// //     setFilters(newFilters);
// //   }, []);

// //   // Handler for sorting change
// //   const handleSortChange = useCallback((newSortBy) => {
// //     console.log("[DEBUG] Sort changed:", newSortBy);
// //     setSortBy(newSortBy);
// //   }, []);

// //   // Handler for Next button
// //   const handleNextComponent = useCallback(
// //     (cardId) => {
// //       if (selectedId === cardId) {
// //         setErrorId(null);
// //         setRequirementError("");
// //         const newSelectedComponents = {
// //           ...selectedComponents,
// //           [type]: cardId,
// //         };
// //         setSelectedComponents(newSelectedComponents);

// //         // Navigate to next component type
// //         const currentIndex = COMPONENT_ORDER.indexOf(type);
// //         if (currentIndex !== -1 && currentIndex < COMPONENT_ORDER.length - 1) {
// //           const nextType = COMPONENT_ORDER[currentIndex + 1];
// //           navigate(`/builder/${nextType}?page=1`);
// //         }
// //       } else {
// //         setErrorId(cardId);
// //       }
// //     },
// //     [selectedId, type, navigate, selectedComponents]
// //   );

// //   // When a card is selected, check requirements
// //   const handleSelect = (id) => {
// //     const requirements = COMPONENT_REQUIREMENTS[type] || [];
// //     const missing = requirements.filter((req) => !selectedComponents[req]);
// //     if (missing.length > 0) {
// //       setRequirementError(
// //         `Please select ${missing.join(" and ")} before selecting a ${type}.`
// //       );
// //       setErrorId(id);
// //       return;
// //     }
// //     setSelectedId(id);
// //     setErrorId(null);
// //     setRequirementError("");
// //   };

// //   // Pagination
// //   const startIndex = (currentPage - 1) * pageSize;
// //   const paginatedComponents = components.slice(
// //     startIndex,
// //     startIndex + pageSize
// //   );

// //   // Handle page change
// //   const handlePageChange = (page) => {
// //     navigate(`/builder/${type}?page=${page}`);
// //   };

// //   return (
// //     <section className="flex gap-4 justify-around">
// //       <div className="w-1/4">
// //         <Filters
// //           onFilterChange={handleFilterChange}
// //           onSortChange={handleSortChange}
// //           initialFilters={filters}
// //           initialSort={sortBy}
// //         />
// //       </div>
// //       <div className="w-3/4">
// //         <BuilderNavbar />
// //         <NavigationLayout
// //           components={components}
// //           currentPage={currentPage}
// //           pageSize={pageSize}
// //           isLoading={isLoading}
// //           handlePageChange={handlePageChange}
// //         >
// //           <>
// //             {requirementError && (
// //               <div className="text-red-500 text-center my-2">
// //                 {requirementError}
// //               </div>
// //             )}
// //             {type === "full-build" ? (
// //               <div className="p-14 px-20 rounded-3xl bg-black/60 flex flex-col">
// //                 <div className="flex justify-center items-center h-96">
// //                   <span className="text-xl text-white/70">
// //                     Full build view coming soon!
// //                   </span>
// //                 </div>
// //                 <div className="mt-10">
// //                   <Button variant="link" className="text-white text-sm">
// //                     <img src={logo} alt="share" className="w-5 h-5" />
// //                     Share
// //                   </Button>
// //                 </div>
// //               </div>
// //             ) : (
// //               paginatedComponents.map((component) => (
// //                 <ItemCard
// //                   key={component._id || component.id}
// //                   item={component}
// //                   type={type}
// //                   selected={selectedId === (component._id || component.id)}
// //                   onSelect={() => handleSelect(component._id || component.id)}
// //                   onNext={() =>
// //                     handleNextComponent(component._id || component.id)
// //                   }
// //                   showError={errorId === (component._id || component.id)}
// //                 />
// //               ))
// //             )}
// //           </>
// //         </NavigationLayout>
// //       </div>
// //     </section>
// //   );
// // }

// // export default Builder;
// // import React, { useState, useEffect, useCallback } from "react";
// // import { useParams, useSearchParams, useNavigate } from "react-router-dom";
// // import axios from "axios";
// // import ItemCard from "./ItemCard";
// // import NavigationLayout from "./NavigationLayout";
// // import BuilderNavbar from "./BuilderNavbar";
// // import Filters from "../Filters/Filters";
// // import logo from "../../assets/images/logo.svg";
// // import { Button } from "../ui/button";

// // const COMPONENT_ORDER = [
// //   "cpu",
// //   "gpu",
// //   "motherboard",
// //   "case",
// //   "cooling",
// //   "memory",
// //   "storage",
// //   "psu",
// //   "full-build",
// // ];

// // const COMPONENT_REQUIREMENTS = {
// //   cpu: [],
// //   gpu: ["cpu"],
// //   motherboard: ["cpu", "gpu"],
// //   case: ["cpu", "gpu", "motherboard"],
// //   cooling: ["cpu", "gpu", "motherboard", "case"],
// //   memory: ["cpu", "gpu", "motherboard", "case", "cooling"],
// //   storage: ["cpu", "gpu", "motherboard", "case", "cooling", "memory"],
// //   psu: ["cpu", "gpu", "motherboard", "case", "cooling", "memory", "storage"],
// //   "full-build": [
// //     "cpu",
// //     "gpu",
// //     "motherboard",
// //     "case",
// //     "cooling",
// //     "memory",
// //     "storage",
// //     "psu",
// //   ],
// // };

// // function Builder() {
// //   const { type = "cpu" } = useParams();
// //   const [searchParams] = useSearchParams();
// //   const navigate = useNavigate();
// //   const [availableFilters, setAvailableFilters] = useState({});
// //   const [components, setComponents] = useState([]);
// //   const [sortBy, setSortBy] = useState(null);
// //   const [filters, setFilters] = useState({});
// //   const [isLoading, setIsLoading] = useState(false);
// //   const [selectedId, setSelectedId] = useState(null);
// //   const [errorId, setErrorId] = useState(null);
// //   const [requirementError, setRequirementError] = useState("");
// //   const [selectedComponents, setSelectedComponents] = useState({});
// //   const [pendingNextType, setPendingNextType] = useState(null);
// //   const pageSize = 4;
// //   const currentPage = parseInt(searchParams.get("page")) || 1;

// //   // Reset selectedId and errors when type changes
// //   useEffect(() => {
// //     setSelectedId(null);
// //     setErrorId(null);
// //     setRequirementError("");
// //   }, [type]);

// //   // Fetch compatible components for the current type
// //   const getCompatibleComponents = useCallback(
// //     async (
// //       selectedComponentsObj,
// //       targetType,
// //       filterParams = {},
// //       sortOption = null
// //     ) => {
// //       setIsLoading(true);
// //       try {
// //         const { data } = await axios.post(
// //           "http://localhost:4000/api/build/next-components",
// //           {
// //             selectedComponents: selectedComponentsObj,
// //             targetType,
// //             filters: filterParams,
// //             sortBy: sortOption,
// //           },
// //           { withCredentials: true }
// //         );
// //         console.log("API response:", data);
// //         setComponents(data.components || []);
// //         setAvailableFilters(data.availableFilters || {}); // <-- add this
// //       } catch (error) {
// //         setComponents([]);
// //         setAvailableFilters({});
// //       } finally {
// //         setIsLoading(false);
// //       }
// //     },
// //     []
// //   );

// //   // On mount or when type/filters/sort/selectedComponents changes, fetch compatible components
// //   useEffect(() => {
// //     if (type !== "full-build") {
// //       getCompatibleComponents(selectedComponents, type, filters, sortBy);
// //     }
// //   }, [type, getCompatibleComponents, selectedComponents, filters, sortBy]);

// //   // Handler for filters change
// //   const handleFilterChange = useCallback((newFilters) => {
// //     setFilters(newFilters);
// //   }, []);

// //   // Handler for sorting change
// //   const handleSortChange = useCallback((newSortBy) => {
// //     setSortBy(newSortBy);
// //   }, []);

// //   // In handleNextComponent:
// //   const handleNextComponent = useCallback(
// //     (cardId) => {
// //       if (selectedId === cardId) {
// //         setErrorId(null);
// //         setRequirementError("");
// //         const newSelectedComponents = {
// //           ...selectedComponents,
// //           [type]: cardId,
// //         };
// //         setSelectedComponents(newSelectedComponents);

// //         // Instead of navigating immediately, set pendingNextType
// //         const currentIndex = COMPONENT_ORDER.indexOf(type);
// //         if (currentIndex !== -1 && currentIndex < COMPONENT_ORDER.length - 1) {
// //           const nextType = COMPONENT_ORDER[currentIndex + 1];
// //           setPendingNextType(nextType);
// //         }
// //       } else {
// //         setErrorId(cardId);
// //       }
// //     },
// //     [selectedId, type, selectedComponents]
// //   );

// //   // Add this useEffect to handle navigation after state update
// //   useEffect(() => {
// //     if (pendingNextType) {
// //       navigate(`/builder/${pendingNextType}?page=1`);
// //       setPendingNextType(null);
// //     }
// //   }, [pendingNextType, navigate]);
// //   // When a card is selected, check requirements
// //   const handleSelect = (id) => {
// //     const requirements = COMPONENT_REQUIREMENTS[type] || [];
// //     const missing = requirements.filter((req) => !selectedComponents[req]);
// //     if (missing.length > 0) {
// //       setRequirementError(
// //         `Please select ${missing.join(" and ")} before selecting a ${type}.`
// //       );
// //       setErrorId(id);
// //       return;
// //     }
// //     setSelectedId(id);
// //     setErrorId(null);
// //     setRequirementError("");
// //   };

// //   // Pagination
// //   const startIndex = (currentPage - 1) * pageSize;
// //   const paginatedComponents = components.slice(
// //     startIndex,
// //     startIndex + pageSize
// //   );

// //   // Handle page change
// //   const handlePageChange = (page) => {
// //     navigate(`/builder/${type}?page=${page}`);
// //   };

// //   return (
// //     <section className="flex gap-4 justify-around">
// //       <div className="w-1/4">
// //         <Filters
// //           onFilterChange={handleFilterChange}
// //           onSortChange={handleSortChange}
// //           initialFilters={filters}
// //           initialSort={sortBy}
// //           availableFilters={availableFilters} // <-- pass this
// //         />
// //       </div>

// //       <div className="w-3/4">
// //         <BuilderNavbar />
// //         <NavigationLayout
// //           components={components}
// //           currentPage={currentPage}
// //           pageSize={pageSize}
// //           isLoading={isLoading}
// //           handlePageChange={handlePageChange}
// //         >
// //           <>
// //             {requirementError && (
// //               <div className="text-red-500 text-center my-2">
// //                 {requirementError}
// //               </div>
// //             )}
// //             {type === "full-build" ? (
// //               <div className="p-14 px-20 rounded-3xl bg-black/60 flex flex-col">
// //                 <div className="flex justify-center items-center h-96">
// //                   <span className="text-xl text-white/70">
// //                     Full build view coming soon!
// //                   </span>
// //                 </div>
// //                 <div className="mt-10">
// //                   <Button variant="link" className="text-white text-sm">
// //                     <img src={logo} alt="share" className="w-5 h-5" />
// //                     Share
// //                   </Button>
// //                 </div>
// //               </div>
// //             ) : isLoading ? (
// //               <div className="text-center text-gray-400 py-10">Loading...</div>
// //             ) : paginatedComponents.length === 0 ? (
// //               <div className="text-center text-gray-400 py-10">
// //                 No components found matching your filters.
// //               </div>
// //             ) : (
// //               paginatedComponents.map((component) => (
// //                 <ItemCard
// //                   key={component._id || component.id}
// //                   item={component}
// //                   type={type}
// //                   selected={selectedId === (component._id || component.id)}
// //                   onSelect={() => handleSelect(component._id || component.id)}
// //                   onNext={() =>
// //                     handleNextComponent(component._id || component.id)
// //                   }
// //                   showError={errorId === (component._id || component.id)}
// //                 />
// //               ))
// //             )}
// //           </>
// //         </NavigationLayout>
// //       </div>
// //     </section>
// //   );
// // }

// // export default Builder;

// // import React, { useState, useEffect } from "react";
// // import { useParams, useSearchParams, useNavigate } from "react-router-dom";
// // import axios from "axios";
// // import ItemCard from "./ItemCard";
// // import NavigationLayout from "./NavigationLayout";
// // import BuilderNavbar from "./BuilderNavbar";
// // import Filters from "../Filters/Filters";
// // import logo from "../../assets/images/logo.svg";
// // import { Button } from "../ui/button";
// // import { Spin } from "antd"; // Ant Design spinner

// // const COMPONENT_ORDER = [
// //   "cpu",
// //   "gpu",
// //   "motherboard",
// //   "case",
// //   "cooling",
// //   "memory",
// //   "storage",
// //   "psu",
// //   "full-build",
// // ];

// // const COMPONENT_REQUIREMENTS = {
// //   cpu: [],
// //   gpu: ["cpu"],
// //   motherboard: ["cpu", "gpu"],
// //   case: ["cpu", "gpu", "motherboard"],
// //   cooling: ["cpu", "gpu", "motherboard", "case"],
// //   memory: ["cpu", "gpu", "motherboard", "case", "cooling"],
// //   storage: ["cpu", "gpu", "motherboard", "case", "cooling", "memory"],
// //   psu: ["cpu", "gpu", "motherboard", "case", "cooling", "memory", "storage"],
// //   "full-build": [
// //     "cpu",
// //     "gpu",
// //     "motherboard",
// //     "case",
// //     "cooling",
// //     "memory",
// //     "storage",
// //     "psu",
// //   ],
// // };

// // function Builder() {
// //   const { type = "cpu" } = useParams();
// //   const [searchParams] = useSearchParams();
// //   const navigate = useNavigate();
// //   const [availableFilters, setAvailableFilters] = useState({});
// //   const [components, setComponents] = useState([]);
// //   const [sortBy, setSortBy] = useState(null);
// //   const [filters, setFilters] = useState({});
// //   const [isLoading, setIsLoading] = useState(false);
// //   const [selectedId, setSelectedId] = useState(null);
// //   const [errorId, setErrorId] = useState(null);
// //   const [requirementError, setRequirementError] = useState("");
// //   const [selectedComponents, setSelectedComponents] = useState({});
// //   const [pendingNextType, setPendingNextType] = useState(null);
// //   const pageSize = 4;
// //   const currentPage = parseInt(searchParams.get("page")) || 1;

// //   // Reset selectedId and errors when type changes
// //   useEffect(() => {
// //     setSelectedId(null);
// //     setErrorId(null);
// //     setRequirementError("");
// //   }, [type]);

// //   // Reset filters and sort when type changes
// //   useEffect(() => {
// //     setFilters({});
// //     setSortBy(null);
// //   }, [type]);
// //   useEffect(() => {
// //     setAvailableFilters({});
// //     // setComponents([]);
// //     navigate(`/builder/${type}`);
// //   }, [type]);
// //   // Fetch compatible components for the current type
// //   const getCompatibleComponents = async (
// //     selectedComponentsObj,
// //     targetType,
// //     filterParams = {},
// //     sortOption = null
// //   ) => {
// //     setIsLoading(true);
// //     try {
// //       const { data } = await axios.post(
// //         "http://localhost:4000/api/build/next-components",
// //         {
// //           selectedComponents: selectedComponentsObj,
// //           targetType,
// //           filters: filterParams,
// //           sortBy: sortOption,
// //         },
// //         { withCredentials: true }
// //       );
// //       setComponents(data.components || []);
// //       setAvailableFilters(data.availableFilters || {});
// //     } catch (error) {
// //       setComponents([]);
// //       setAvailableFilters({});
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   // On mount or when type/filters/sort/selectedComponents changes, fetch compatible components
// //   useEffect(() => {
// //     if (type !== "full-build") {
// //       setIsLoading(true);
// //       const controller = new AbortController();
// //       const fetchData = async () => {
// //         try {
// //           const { data } = await axios.post(
// //             "http://localhost:4000/api/build/next-components",
// //             {
// //               selectedComponents,
// //               targetType: type,
// //               filters,
// //               sortBy,
// //             },
// //             {
// //               withCredentials: true,
// //               signal: controller.signal,
// //             }
// //           );
// //           setComponents(data.components || []);
// //           setAvailableFilters(data.availableFilters || {});
// //         } catch (error) {
// //           if (axios.isCancel(error)) {
// //             // Request was cancelled, do nothing
// //           } else {
// //             setComponents([]);
// //             setAvailableFilters({});
// //           }
// //         } finally {
// //           setIsLoading(false);
// //         }
// //       };
// //       fetchData();
// //       return () => controller.abort();
// //     }
// //   }, [type, selectedComponents, filters, sortBy]);

// //   // Handler for filters change
// //   const handleFilterChange = (newFilters) => {
// //     setFilters(newFilters);
// //   };

// //   // Handler for sorting change
// //   const handleSortChange = (newSortBy) => {
// //     setSortBy(newSortBy);
// //   };

// //   // In handleNextComponent:
// //   const handleNextComponent = (cardId) => {
// //     if (selectedId === cardId) {
// //       setErrorId(null);
// //       setRequirementError("");
// //       const newSelectedComponents = {
// //         ...selectedComponents,
// //         [type]: cardId,
// //       };
// //       setSelectedComponents(newSelectedComponents);

// //       // Instead of navigating immediately, set pendingNextType
// //       const currentIndex = COMPONENT_ORDER.indexOf(type);
// //       if (currentIndex !== -1 && currentIndex < COMPONENT_ORDER.length - 1) {
// //         const nextType = COMPONENT_ORDER[currentIndex + 1];
// //         setPendingNextType(nextType);
// //       }
// //     } else {
// //       setErrorId(cardId);
// //     }
// //   };

// //   // Add this useEffect to handle navigation after state update
// //   useEffect(() => {
// //     if (pendingNextType) {
// //       navigate(`/builder/${pendingNextType}?page=1`);
// //       setPendingNextType(null);
// //     }
// //   }, [pendingNextType, navigate]);

// //   // When a card is selected, check requirements
// //   const handleSelect = (id) => {
// //     const requirements = COMPONENT_REQUIREMENTS[type] || [];
// //     const missing = requirements.filter((req) => !selectedComponents[req]);
// //     if (missing.length > 0) {
// //       setRequirementError(
// //         `Please select ${missing.join(" and ")} before selecting a ${type}.`
// //       );
// //       setErrorId(id);
// //       return;
// //     }
// //     setSelectedId(id);
// //     setErrorId(null);
// //     setRequirementError("");
// //   };

// //   // Pagination
// //   const startIndex = (currentPage - 1) * pageSize;
// //   const paginatedComponents = components.slice(
// //     startIndex,
// //     startIndex + pageSize
// //   );

// //   // Handle page change
// //   const handlePageChange = (page) => {
// //     navigate(`/builder/${type}?page=${page}`);
// //   };
// //   console.log(
// //     "RENDER type:",
// //     type,
// //     "components:",
// //     components,
// //     "filters:",
// //     availableFilters
// //   );

// //   return (
// //     <section className="flex gap-4 justify-around">
// //       <div className="w-1/4">
// //         <Filters
// //           key={type}
// //           onFilterChange={handleFilterChange}
// //           onSortChange={handleSortChange}
// //           initialFilters={filters}
// //           initialSort={sortBy}
// //           availableFilters={availableFilters}
// //         />
// //       </div>

// //       <div className="w-3/4">
// //         <BuilderNavbar />
// //         <NavigationLayout
// //           components={components}
// //           currentPage={currentPage}
// //           pageSize={pageSize}
// //           isLoading={isLoading}
// //           handlePageChange={handlePageChange}
// //         >
// //           <>
// //             {requirementError && (
// //               <div className="text-red-500 text-center my-2">
// //                 {requirementError}
// //               </div>
// //             )}
// //             {type === "full-build" ? (
// //               <div className="p-14 px-20 rounded-3xl bg-black/60 flex flex-col">
// //                 <div className="flex justify-center items-center h-96">
// //                   <span className="text-xl text-white/70">
// //                     Full build view coming soon!
// //                   </span>
// //                 </div>
// //                 <div className="mt-10">
// //                   <Button variant="link" className="text-white text-sm">
// //                     <img src={logo} alt="share" className="w-5 h-5" />
// //                     Share
// //                   </Button>
// //                 </div>
// //               </div>
// //             ) : isLoading ? (
// //               <div className="flex justify-center items-center py-10">
// //                 <Spin size="large" />
// //               </div>
// //             ) : paginatedComponents.length === 0 ? (
// //               <div className="text-center text-gray-400 py-10">
// //                 No components found matching your filters.
// //               </div>
// //             ) : (
// //               paginatedComponents.map((component) => (
// //                 <ItemCard
// //                   key={component._id || component.id}
// //                   item={component}
// //                   type={type}
// //                   selected={selectedId === (component._id || component.id)}
// //                   onSelect={() => handleSelect(component._id || component.id)}
// //                   onNext={() =>
// //                     handleNextComponent(component._id || component.id)
// //                   }
// //                   showError={errorId === (component._id || component.id)}
// //                 />
// //               ))
// //             )}
// //           </>
// //         </NavigationLayout>
// //       </div>
// //     </section>
// //   );
// // }

// // export default Builder;
// // import React, { useReducer, useEffect, useMemo, useCallback } from "react";
// // import { useParams, useSearchParams, useNavigate } from "react-router-dom";
// // import axios from "axios";
// // import ItemCard from "./ItemCard";
// // import NavigationLayout from "./NavigationLayout";
// // import BuilderNavbar from "./BuilderNavbar";
// // import Filters from "../Filters/Filters";
// // import logo from "../../assets/images/logo.svg";
// // import { Button } from "../ui/button";
// // import { Spin } from "antd";

// // const COMPONENT_ORDER = [
// //   "cpu",
// //   "gpu",
// //   "motherboard",
// //   "case",
// //   "cooling",
// //   "memory",
// //   "storage",
// //   "psu",
// //   "full-build",
// // ];

// // const COMPONENT_REQUIREMENTS = {
// //   cpu: [],
// //   gpu: ["cpu"],
// //   motherboard: ["cpu", "gpu"],
// //   case: ["cpu", "gpu", "motherboard"],
// //   cooling: ["cpu", "gpu", "motherboard", "case"],
// //   memory: ["cpu", "gpu", "motherboard", "case", "cooling"],
// //   storage: ["cpu", "gpu", "motherboard", "case", "cooling", "memory"],
// //   psu: ["cpu", "gpu", "motherboard", "case", "cooling", "memory", "storage"],
// //   "full-build": [
// //     "cpu",
// //     "gpu",
// //     "motherboard",
// //     "case",
// //     "cooling",
// //     "memory",
// //     "storage",
// //     "psu",
// //   ],
// // };

// // // Initial state
// // const initialState = {
// //   components: [],
// //   availableFilters: {},
// //   isLoading: true,
// //   selectedId: null,
// //   errorId: null,
// //   requirementError: "",
// //   selectedComponents: {},
// //   filters: {},
// //   sortBy: null,
// // };

// // // Reducer function
// // function builderReducer(state, action) {
// //   switch (action.type) {
// //     case "RESET_STATE":
// //       return {
// //         ...initialState,
// //         selectedComponents: state.selectedComponents,
// //       };
// //     case "SET_COMPONENTS":
// //       return {
// //         ...state,
// //         components: action.payload.components || [],
// //         availableFilters: action.payload.availableFilters || {},
// //         isLoading: false,
// //       };
// //     case "SET_LOADING":
// //       return { ...state, isLoading: action.payload };
// //     case "SET_FILTERS":
// //       return { ...state, filters: action.payload };
// //     case "SET_SORT":
// //       return { ...state, sortBy: action.payload };
// //     case "SELECT_COMPONENT":
// //       return {
// //         ...state,
// //         selectedId: action.payload,
// //         errorId: null,
// //         requirementError: "",
// //       };
// //     case "SET_REQUIREMENT_ERROR":
// //       return {
// //         ...state,
// //         requirementError: action.payload.message,
// //         errorId: action.payload.errorId,
// //       };
// //     case "NEXT_COMPONENT":
// //       return {
// //         ...state,
// //         selectedComponents: {
// //           ...state.selectedComponents,
// //           [action.payload.type]: action.payload.id,
// //         },
// //         selectedId: null,
// //         errorId: null,
// //         requirementError: "",
// //       };
// //     case "CLEAR_SELECTION":
// //       return {
// //         ...state,
// //         selectedId: null,
// //         errorId: null,
// //         requirementError: "",
// //       };
// //     default:
// //       return state;
// //   }
// // }

// // function Builder() {
// //   const { type = "cpu" } = useParams();
// //   const [searchParams] = useSearchParams();
// //   const navigate = useNavigate();

// //   // Use reducer instead of multiple useState
// //   const [state, dispatch] = useReducer(builderReducer, initialState);

// //   // Pagination
// //   const pageSize = 4;
// //   const currentPage = parseInt(searchParams.get("page")) || 1;

// //   // Fetch components
// //   const fetchComponents = useCallback(async () => {
// //     // Skip fetching for full build
// //     if (type === "full-build") {
// //       dispatch({ type: "SET_LOADING", payload: false });
// //       return;
// //     }

// //     // Reset state and set loading
// //     dispatch({ type: "RESET_STATE" });
// //     dispatch({ type: "SET_LOADING", payload: true });

// //     try {
// //       const { data } = await axios.post(
// //         "http://localhost:4000/api/build/next-components",
// //         {
// //           selectedComponents: state.selectedComponents,
// //           targetType: type,
// //           filters: state.filters,
// //           sortBy: state.sortBy,
// //         },
// //         {
// //           withCredentials: true,
// //           timeout: 10000,
// //         }
// //       );

// //       // Set components
// //       dispatch({
// //         type: "SET_COMPONENTS",
// //         payload: {
// //           components: data.components,
// //           availableFilters: data.availableFilters,
// //         },
// //       });
// //     } catch (error) {
// //       console.error(`Error fetching ${type} components:`, error);
// //       dispatch({
// //         type: "SET_COMPONENTS",
// //         payload: { components: [], availableFilters: {} },
// //       });
// //     }
// //   }, [type, state.selectedComponents, state.filters, state.sortBy]);

// //   // Fetch effect
// //   useEffect(() => {
// //     fetchComponents();
// //   }, [fetchComponents]);

// //   // Handlers
// //   const handleFilterChange = (newFilters) => {
// //     dispatch({ type: "SET_FILTERS", payload: newFilters });
// //   };

// //   const handleSortChange = (newSortBy) => {
// //     dispatch({ type: "SET_SORT", payload: newSortBy });
// //   };

// //   const handleSelect = (id) => {
// //     const requirements = COMPONENT_REQUIREMENTS[type] || [];
// //     const missing = requirements.filter(
// //       (req) => !state.selectedComponents[req]
// //     );

// //     if (missing.length > 0) {
// //       dispatch({
// //         type: "SET_REQUIREMENT_ERROR",
// //         payload: {
// //           message: `Please select ${missing.join(
// //             " and "
// //           )} before selecting a ${type}.`,
// //           errorId: id,
// //         },
// //       });
// //       return;
// //     }

// //     dispatch({ type: "SELECT_COMPONENT", payload: id });
// //   };

// //   const handleNextComponent = (cardId) => {
// //     if (state.selectedId === cardId) {
// //       // Determine next component type
// //       const currentIndex = COMPONENT_ORDER.indexOf(type);
// //       if (currentIndex !== -1 && currentIndex < COMPONENT_ORDER.length - 1) {
// //         const nextType = COMPONENT_ORDER[currentIndex + 1];

// //         // Dispatch next component and navigate
// //         dispatch({
// //           type: "NEXT_COMPONENT",
// //           payload: { type, id: cardId },
// //         });

// //         navigate(`/builder/${nextType}?page=1`);
// //       }
// //     } else {
// //       dispatch({ type: "SELECT_COMPONENT", payload: cardId });
// //     }
// //   };

// //   // Pagination logic
// //   const paginatedComponents = useMemo(() => {
// //     const startIndex = (currentPage - 1) * pageSize;
// //     return state.components.slice(startIndex, startIndex + pageSize);
// //   }, [state.components, currentPage, pageSize]);

// //   const handlePageChange = (page) => {
// //     navigate(`/builder/${type}?page=${page}`);
// //   };

// //   // Detailed logging
// //   console.log(
// //     "RENDER Details:",
// //     "Type:",
// //     type,
// //     "Components Count:",
// //     state.components.length,
// //     "Loading:",
// //     state.isLoading,
// //     "Selected Components:",
// //     Object.keys(state.selectedComponents)
// //   );

// //   return (
// //     <section className="flex gap-4 justify-around">
// //       <div className="w-1/4">
// //         <Filters
// //           key={type}
// //           onFilterChange={handleFilterChange}
// //           onSortChange={handleSortChange}
// //           initialFilters={state.filters}
// //           initialSort={state.sortBy}
// //           availableFilters={state.availableFilters}
// //         />
// //       </div>

// //       <div className="w-3/4">
// //         <BuilderNavbar />
// //         <NavigationLayout
// //           components={state.components}
// //           currentPage={currentPage}
// //           pageSize={pageSize}
// //           isLoading={state.isLoading}
// //           handlePageChange={handlePageChange}
// //         >
// //           <>
// //             {state.requirementError && (
// //               <div className="text-red-500 text-center my-2">
// //                 {state.requirementError}
// //               </div>
// //             )}
// //             {type === "full-build" ? (
// //               <div className="p-14 px-20 rounded-3xl bg-black/60 flex flex-col">
// //                 <div className="flex justify-center items-center h-96">
// //                   <span className="text-xl text-white/70">
// //                     Full build view coming soon!
// //                   </span>
// //                 </div>
// //                 <div className="mt-10">
// //                   <Button variant="link" className="text-white text-sm">
// //                     <img src={logo} alt="share" className="w-5 h-5" />
// //                     Share
// //                   </Button>
// //                 </div>
// //               </div>
// //             ) : state.isLoading ? (
// //               <div className="flex justify-center items-center py-10">
// //                 <Spin size="large" />
// //               </div>
// //             ) : paginatedComponents.length === 0 ? (
// //               <div className="text-center text-gray-400 py-10">
// //                 No components found matching your filters.
// //               </div>
// //             ) : (
// //               paginatedComponents.map((component) => (
// //                 <ItemCard
// //                   key={component._id || component.id}
// //                   item={component}
// //                   type={type}
// //                   selected={
// //                     state.selectedId === (component._id || component.id)
// //                   }
// //                   onSelect={() => handleSelect(component._id || component.id)}
// //                   onNext={() =>
// //                     handleNextComponent(component._id || component.id)
// //                   }
// //                   showError={state.errorId === (component._id || component.id)}
// //                 />
// //               ))
// //             )}
// //           </>
// //         </NavigationLayout>
// //       </div>
// //     </section>
// //   );
// // }

// // export default Builder;
// import React, { useState, useEffect, useCallback, useMemo } from "react";
// import { useParams, useSearchParams, useNavigate } from "react-router-dom";
// import axios from "axios";
// import ItemCard from "./ItemCard";
// import NavigationLayout from "./NavigationLayout";
// import BuilderNavbar from "./BuilderNavbar";
// import Filters from "../Filters/Filters";
// import logo from "../../assets/images/logo.svg";
// import { Button } from "../ui/button";
// import { Spin } from "antd";

// const COMPONENT_ORDER = [
//   "cpu",
//   "gpu",
//   "motherboard",
//   "case",
//   "cooling",
//   "memory",
//   "storage",
//   "psu",
//   "full-build",
// ];

// const COMPONENT_REQUIREMENTS = {
//   cpu: [],
//   gpu: ["cpu"],
//   motherboard: ["cpu", "gpu"],
//   case: ["cpu", "gpu", "motherboard"],
//   cooling: ["cpu", "gpu", "motherboard", "case"],
//   memory: ["cpu", "gpu", "motherboard", "case", "cooling"],
//   storage: ["cpu", "gpu", "motherboard", "case", "cooling", "memory"],
//   psu: ["cpu", "gpu", "motherboard", "case", "cooling", "memory", "storage"],
//   "full-build": [
//     "cpu",
//     "gpu",
//     "motherboard",
//     "case",
//     "cooling",
//     "memory",
//     "storage",
//     "psu",
//   ],
// };

// function Builder() {
//   const { type = "cpu" } = useParams();
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();

//   // State management similar to BrowseComponents
//   const [components, setComponents] = useState([]);
//   const [availableFilters, setAvailableFilters] = useState({});
//   const [isLoading, setIsLoading] = useState(true);
//   const [selectedId, setSelectedId] = useState(null);
//   const [errorId, setErrorId] = useState(null);
//   const [requirementError, setRequirementError] = useState("");
//   const [selectedComponents, setSelectedComponents] = useState({});
//   const [filters, setFilters] = useState({});
//   const [sortBy, setSortBy] = useState(null);

//   const pageSize = 4;
//   const currentPage = parseInt(searchParams.get("page")) || 1;

//   // Fetch components with similar pattern to BrowseComponents
//   const fetchComponents = useCallback(async () => {
//     if (type === "full-build") {
//       setIsLoading(false);
//       return;
//     }

//     setIsLoading(true);
//     setComponents([]);
//     setAvailableFilters({});

//     try {
//       const { data } = await axios.post(
//         "http://localhost:4000/api/build/next-components",
//         {
//           selectedComponents,
//           targetType: type,
//           filters,
//           sortBy,
//         },
//         {
//           withCredentials: true,
//           timeout: 10000,
//         }
//       );

//       setComponents(data.components || []);
//       setAvailableFilters(data.availableFilters || {});
//     } catch (error) {
//       console.error(`Error fetching ${type} components:`, error);
//       setComponents([]);
//       setAvailableFilters({});
//     } finally {
//       setIsLoading(false);
//     }
//   }, [type, selectedComponents, filters, sortBy]);

//   useEffect(() => {
//     fetchComponents();
//   }, [fetchComponents]);

//   // Handler functions similar to BrowseComponents pattern
//   const handleFilterChange = useCallback((newFilters) => {
//     setFilters(newFilters);
//   }, []);

//   const handleSortChange = useCallback((newSortBy) => {
//     setSortBy(newSortBy);
//   }, []);

//   const handleSelect = useCallback(
//     (id) => {
//       const requirements = COMPONENT_REQUIREMENTS[type] || [];
//       const missing = requirements.filter((req) => !selectedComponents[req]);

//       if (missing.length > 0) {
//         setRequirementError(
//           `Please select ${missing.join(" and ")} before selecting a ${type}.`
//         );
//         setErrorId(id);
//         return;
//       }

//       setSelectedId(id);
//       setErrorId(null);
//       setRequirementError("");
//     },
//     [type, selectedComponents]
//   );

//   const handleNextComponent = useCallback(
//     (cardId) => {
//       if (selectedId === cardId) {
//         const currentIndex = COMPONENT_ORDER.indexOf(type);
//         if (currentIndex !== -1 && currentIndex < COMPONENT_ORDER.length - 1) {
//           const nextType = COMPONENT_ORDER[currentIndex + 1];

//           setSelectedComponents((prev) => ({
//             ...prev,
//             [type]: cardId,
//           }));
//           setSelectedId(null);
//           setErrorId(null);
//           setRequirementError("");

//           navigate(`/builder/${nextType}?page=1`);
//         }
//       } else {
//         setSelectedId(cardId);
//       }
//     },
//     [type, selectedId, navigate]
//   );

//   // Pagination logic
//   const paginatedComponents = useMemo(() => {
//     const startIndex = (currentPage - 1) * pageSize;
//     return components.slice(startIndex, startIndex + pageSize);
//   }, [components, currentPage, pageSize]);

//   const handlePageChange = useCallback(
//     (page) => {
//       navigate(`/builder/${type}?page=${page}`);
//     },
//     [navigate, type]
//   );

//   return (
//     <section className="flex gap-4 justify-around">
//       <div className="w-1/4">
//         <Filters
//           key={type}
//           onFilterChange={handleFilterChange}
//           onSortChange={handleSortChange}
//           initialFilters={filters}
//           initialSort={sortBy}
//           availableFilters={availableFilters}
//         />
//       </div>

//       <div className="w-3/4">
//         <BuilderNavbar />
//         <NavigationLayout
//           components={components}
//           currentPage={currentPage}
//           pageSize={pageSize}
//           isLoading={isLoading}
//           handlePageChange={handlePageChange}
//         >
//           <>
//             {requirementError && (
//               <div className="text-red-500 text-center my-2">
//                 {requirementError}
//               </div>
//             )}
//             {type === "full-build" ? (
//               <div className="p-14 px-20 rounded-3xl bg-black/60 flex flex-col">
//                 <div className="flex justify-center items-center h-96">
//                   <span className="text-xl text-white/70">
//                     Full build view coming soon!
//                   </span>
//                 </div>
//                 <div className="mt-10">
//                   <Button variant="link" className="text-white text-sm">
//                     <img src={logo} alt="share" className="w-5 h-5" />
//                     Share
//                   </Button>
//                 </div>
//               </div>
//             ) : isLoading ? (
//               <div className="flex justify-center items-center py-10">
//                 <Spin size="large" />
//               </div>
//             ) : paginatedComponents.length === 0 ? (
//               <div className="text-center text-gray-400 py-10">
//                 No components found matching your filters.
//               </div>
//             ) : (
//               paginatedComponents.map((component) => (
//                 <ItemCard
//                   key={component._id || component.id}
//                   item={component}
//                   type={type}
//                   selected={selectedId === (component._id || component.id)}
//                   onSelect={() => handleSelect(component._id || component.id)}
//                   onNext={() =>
//                     handleNextComponent(component._id || component.id)
//                   }
//                   showError={errorId === (component._id || component.id)}
//                 />
//               ))
//             )}
//           </>
//         </NavigationLayout>
//       </div>
//     </section>
//   );
// }

// export default Builder;
//best working code so far
// import React, {
//   useState,
//   useEffect,
//   useCallback,
//   useMemo,
//   useRef,
// } from "react";
// import { useParams, useSearchParams, useNavigate } from "react-router-dom";
// import axios from "axios";
// import ItemCard from "./ItemCard";
// import NavigationLayout from "./NavigationLayout";
// import BuilderNavbar from "./BuilderNavbar";
// import Filters from "../Filters/Filters";
// import logo from "../../assets/images/logo.svg";
// import { Button } from "../ui/button";
// import { Spin } from "antd";

// const COMPONENT_ORDER = [
//   "cpu",
//   "gpu",
//   "motherboard",
//   "case",
//   "cooling",
//   "memory",
//   "storage",
//   "psu",
//   "full-build",
// ];

// export const COMPONENT_REQUIREMENTS = {
//   cpu: [],
//   gpu: ["cpu"],
//   motherboard: ["cpu", "gpu"],
//   case: ["cpu", "gpu", "motherboard"],
//   cooling: ["cpu", "gpu", "motherboard", "case"],
//   memory: ["cpu", "gpu", "motherboard", "case", "cooling"],
//   storage: ["cpu", "gpu", "motherboard", "case", "cooling", "memory"],
//   psu: ["cpu", "gpu", "motherboard", "case", "cooling", "memory", "storage"],
//   "full-build": [
//     "cpu",
//     "gpu",
//     "motherboard",
//     "case",
//     "cooling",
//     "memory",
//     "storage",
//     "psu",
//   ],
// };

// function Builder() {
//   const { type = "cpu" } = useParams();
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();

//   const [components, setComponents] = useState([]);
//   const [availableFilters, setAvailableFilters] = useState({});
//   const [isLoading, setIsLoading] = useState(true);
//   const [selectedId, setSelectedId] = useState(null);
//   const [errorId, setErrorId] = useState(null);
//   const [requirementError, setRequirementError] = useState("");
//   const [selectedComponents, setSelectedComponents] = useState({});
//   const [filters, setFilters] = useState({});
//   const [sortBy, setSortBy] = useState(null);

//   const nextTypeRef = useRef(null);

//   const pageSize = 4;
//   const currentPage = parseInt(searchParams.get("page")) || 1;

//   const requestIdRef = useRef(0);

//   const fetchComponents = useCallback(async () => {
//     if (type === "full-build") {
//       setIsLoading(false);
//       return;
//     }

//     const currentRequestId = ++requestIdRef.current; // increment and capture the request ID

//     setIsLoading(true);
//     setComponents([]);
//     setAvailableFilters({});

//     try {
//       console.log("Fetching components for type:", type);
//       const { data } = await axios.post(
//         "http://localhost:4000/api/build/next-components",
//         {
//           selectedComponents,
//           targetType: type,
//           filters,
//           sortBy,
//         },
//         {
//           withCredentials: true,
//           timeout: 10000,
//         }
//       );

//       if (requestIdRef.current !== currentRequestId) {
//         // stale response, ignore
//         console.log(`Stale response for ${type}, ignoring`);
//         return;
//       }

//       console.log("API response:", data);
//       setComponents(data.components || []);
//       setAvailableFilters(data.availableFilters || {});
//     } catch (error) {
//       if (requestIdRef.current === currentRequestId) {
//         console.error(`Error fetching ${type} components:`, error);
//         setComponents([]);
//         setAvailableFilters({});
//       }
//     } finally {
//       if (requestIdRef.current === currentRequestId) {
//         setIsLoading(false);
//       }
//     }
//   }, [type, selectedComponents, filters, sortBy]);

//   useEffect(() => {
//     fetchComponents();
//   }, [fetchComponents]);

//   useEffect(() => {
//     setSelectedId(null);
//     setErrorId(null);
//     setRequirementError("");
//   }, [type]);

//   const handleFilterChange = useCallback((newFilters) => {
//     setFilters(newFilters);
//   }, []);

//   const handleSortChange = useCallback((newSortBy) => {
//     setSortBy(newSortBy);
//   }, []);

//   const handleSelect = useCallback(
//     (id) => {
//       const requirements = COMPONENT_REQUIREMENTS[type] || [];
//       const missing = requirements.filter((req) => !selectedComponents[req]);

//       if (missing.length > 0) {
//         console.log("Missing requirements:", missing);
//         setRequirementError(
//           `Please select ${missing.join(" and ")} before selecting a ${type}.`
//         );
//         setErrorId(id);
//         return;
//       }

//       setSelectedId(id);
//       setErrorId(null);
//       setRequirementError("");
//     },
//     [type, selectedComponents]
//   );

//   const handleNextComponent = useCallback(
//     (cardId) => {
//       if (selectedId === cardId) {
//         const currentIndex = COMPONENT_ORDER.indexOf(type);
//         if (currentIndex !== -1 && currentIndex < COMPONENT_ORDER.length - 1) {
//           const nextType = COMPONENT_ORDER[currentIndex + 1];
//           nextTypeRef.current = nextType;
//           setSelectedComponents((prev) => ({
//             ...prev,
//             [type]: cardId,
//           }));
//           setSelectedId(null);
//           setErrorId(null);
//           setRequirementError("");
//         }
//       } else {
//         setSelectedId(cardId);
//       }
//     },
//     [type, selectedId]
//   );

//   useEffect(() => {
//     if (nextTypeRef.current) {
//       console.log("Navigating to:", nextTypeRef.current);
//       navigate(`/builder/${nextTypeRef.current}?page=1`);
//       nextTypeRef.current = null;
//     }
//   }, [selectedComponents, navigate]);

//   const paginatedComponents = useMemo(() => {
//     const startIndex = (currentPage - 1) * pageSize;
//     return components.slice(startIndex, startIndex + pageSize);
//   }, [components, currentPage, pageSize]);

//   const handlePageChange = useCallback(
//     (page) => {
//       navigate(`/builder/${type}?page=${page}`);
//     },
//     [navigate, type]
//   );

//   useEffect(() => {
//     console.log("Paginated components:", paginatedComponents);
//   }, [paginatedComponents]);

//   return (
//     <section className="flex gap-4 justify-around overflow-hidden">
//       <div className="w-1/4">
//         <Filters
//           key={type}
//           onFilterChange={handleFilterChange}
//           onSortChange={handleSortChange}
//           initialFilters={filters}
//           initialSort={sortBy}
//           availableFilters={availableFilters}
//         />
//       </div>

//       <div className="w-3/4">
//         <BuilderNavbar selectedComponents={selectedComponents} />
//         <NavigationLayout
//           components={components}
//           currentPage={currentPage}
//           pageSize={pageSize}
//           isLoading={isLoading}
//           handlePageChange={handlePageChange}
//         >
//           <>
//             {requirementError && (
//               <div className="text-red-500 text-center my-2">
//                 {requirementError}
//               </div>
//             )}
//             {type === "full-build" ? (
//               <div className="p-14 px-20 rounded-3xl bg-black/60 flex flex-col">
//                 <div className="flex justify-center items-center h-96">
//                   <span className="text-xl text-white/70">
//                     Full build view coming soon!
//                   </span>
//                 </div>
//                 <div className="mt-10">
//                   <Button variant="link" className="text-white text-sm">
//                     <img src={logo} alt="share" className="w-5 h-5" />
//                     Share
//                   </Button>
//                 </div>
//               </div>
//             ) : isLoading ? (
//               <div className="flex justify-center items-center py-10">
//                 <Spin size="large" />
//               </div>
//             ) : paginatedComponents.length === 0 ? (
//               <div className="text-center text-gray-400 py-10">
//                 No components found matching your filters.
//               </div>
//             ) : (
//               paginatedComponents.map((component) => (
//                 <ItemCard
//                   key={component._id || component.id}
//                   item={component}
//                   type={type}
//                   selected={selectedId === (component._id || component.id)}
//                   onSelect={() => handleSelect(component._id || component.id)}
//                   onNext={() =>
//                     handleNextComponent(component._id || component.id)
//                   }
//                   showError={errorId === (component._id || component.id)}
//                 />
//               ))
//             )}
//           </>
//         </NavigationLayout>
//       </div>
//     </section>
//   );
// }

// export default Builder;

// import React, {
//   useState,
//   useEffect,
//   useCallback,
//   useMemo,
//   useRef,
// } from "react";
// import { useParams, useSearchParams, useNavigate } from "react-router-dom";
// import axios from "axios";
// import ItemCard from "./ItemCard";
// import NavigationLayout from "./NavigationLayout";
// import BuilderNavbar from "./BuilderNavbar";
// import Filters from "../Filters/Filters";
// import logo from "../../assets/images/logo.svg";
// import { Button } from "../ui/button";
// import { Spin, message } from "antd";
// import FullBuildSummary from "./FullBuildSummary";

// const COMPONENT_ORDER = [
//   "cpu",
//   "gpu",
//   "motherboard",
//   "case",
//   "cooler",
//   "memory",
//   "storage",
//   "psu",
//   "full-build",
// ];

// export const COMPONENT_REQUIREMENTS = {
//   cpu: [],
//   gpu: ["cpu"],
//   motherboard: ["cpu", "gpu"],
//   case: ["cpu", "gpu", "motherboard"],
//   cooler: ["cpu", "gpu", "motherboard", "case"],
//   memory: ["cpu", "gpu", "motherboard", "case", "cooler"],
//   storage: ["cpu", "gpu", "motherboard", "case", "cooler", "memory"],
//   psu: ["cpu", "gpu", "motherboard", "case", "cooler", "memory", "storage"],
//   "full-build": [
//     "cpu",
//     "gpu",
//     "motherboard",
//     "case",
//     "cooler",
//     "memory",
//     "storage",
//     "psu",
//   ],
// };

// function Builder() {
//   const { type = "cpu" } = useParams();
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();

//   const [components, setComponents] = useState([]);
//   const [availableFilters, setAvailableFilters] = useState({});
//   const [isLoading, setIsLoading] = useState(true);
//   const [selectedId, setSelectedId] = useState(null);
//   const [errorId, setErrorId] = useState(null);
//   const [requirementError, setRequirementError] = useState("");
//   const [selectedComponents, setSelectedComponents] = useState({});
//   const [filters, setFilters] = useState({});
//   const [sortBy, setSortBy] = useState(null);

//   // For correct navigation after state update
//   const nextTypeRef = useRef(null);

//   // For full build view
//   const [fullBuild, setFullBuild] = useState(null);
//   const [fullBuildLoading, setFullBuildLoading] = useState(false);

//   const pageSize = 4;
//   const currentPage = parseInt(searchParams.get("page")) || 1;

//   const requestIdRef = useRef(0);

//   // Fetch components
//   const fetchComponents = useCallback(async () => {
//     if (type === "full-build") {
//       setIsLoading(false);
//       return;
//     }

//     const currentRequestId = ++requestIdRef.current;

//     setIsLoading(true);
//     setComponents([]);
//     setAvailableFilters({});

//     try {
//       const { data } = await axios.post(
//         "http://localhost:4000/api/build/next-components",
//         {
//           selectedComponents,
//           targetType: type,
//           filters,
//           sortBy,
//         },
//         {
//           withCredentials: true,
//           timeout: 10000,
//         }
//       );

//       if (requestIdRef.current !== currentRequestId) {
//         return;
//       }

//       setComponents(data.components || []);
//       setAvailableFilters(data.availableFilters || {});
//     } catch (error) {
//       if (requestIdRef.current === currentRequestId) {
//         setComponents([]);
//         setAvailableFilters({});
//       }
//     } finally {
//       if (requestIdRef.current === currentRequestId) {
//         setIsLoading(false);
//       }
//     }
//   }, [type, selectedComponents, filters, sortBy]);

//   useEffect(() => {
//     fetchComponents();
//   }, [fetchComponents]);

//   useEffect(() => {
//     setSelectedId(null);
//     setErrorId(null);
//     setRequirementError("");
//   }, [type]);

//   const handleFilterChange = useCallback((newFilters) => {
//     setFilters(newFilters);
//   }, []);

//   const handleSortChange = useCallback((newSortBy) => {
//     setSortBy(newSortBy);
//   }, []);

//   const handleSelect = useCallback(
//     (id) => {
//       const requirements = COMPONENT_REQUIREMENTS[type] || [];
//       const missing = requirements.filter((req) => !selectedComponents[req]);

//       if (missing.length > 0) {
//         setRequirementError(
//           `Please select ${missing.join(" and ")} before selecting a ${type}.`
//         );
//         setErrorId(id);
//         return;
//       }

//       setSelectedId(id);
//       setErrorId(null);
//       setRequirementError("");
//     },
//     [type, selectedComponents]
//   );

//   //set nextTypeRef and update state, then navigate in useEffect
//   const handleNextComponent = useCallback(
//     async (cardId) => {
//       if (selectedId === cardId) {
//         const currentIndex = COMPONENT_ORDER.indexOf(type);
//         if (currentIndex !== -1 && currentIndex < COMPONENT_ORDER.length - 1) {
//           const nextType = COMPONENT_ORDER[currentIndex + 1];

//           // If nextType is "full-build", call createBuild
//           if (nextType === "full-build") {
//             setFullBuildLoading(true);
//             try {
//               const { data } = await axios.post(
//                 "http://localhost:4000/api/build/createbuild",
//                 {
//                   components: { ...selectedComponents, [type]: cardId },
//                 },
//                 { withCredentials: true }
//               );
//               setFullBuild(data.build);
//               setFullBuildLoading(false);
//               navigate(`/builder/full-build`);
//             } catch (err) {
//               setFullBuildLoading(false);
//               message.error(
//                 err.response?.data?.message ||
//                   "Failed to create build. Please try again."
//               );
//             }
//           } else {
//             nextTypeRef.current = nextType;
//             setSelectedComponents((prev) => ({
//               ...prev,
//               [type]: cardId,
//             }));
//             setSelectedId(null);
//             setErrorId(null);
//             setRequirementError("");
//           }
//         }
//       } else {
//         setSelectedId(cardId);
//       }
//     },
//     [type, selectedId, selectedComponents, navigate]
//   );

//   useEffect(() => {
//     if (nextTypeRef.current) {
//       navigate(`/builder/${nextTypeRef.current}?page=1`);
//       nextTypeRef.current = null;
//     }
//   }, [selectedComponents, navigate]);

//   const paginatedComponents = useMemo(() => {
//     const startIndex = (currentPage - 1) * pageSize;
//     return components.slice(startIndex, startIndex + pageSize);
//   }, [components, currentPage, pageSize]);

//   const handlePageChange = useCallback(
//     (page) => {
//       navigate(`/builder/${type}?page=${page}`);
//     },
//     [navigate, type]
//   );

//   // Render full build summary
//   const renderFullBuild = () => (
//     <FullBuildSummary fullBuild={fullBuild} loading={fullBuildLoading} />
//   );

//   return (
//     <section className="flex gap-4 justify-around overflow-hidden">
//       {type !== "full-build" && (
//         <div className="w-1/4">
//           <Filters
//             key={type}
//             onFilterChange={handleFilterChange}
//             onSortChange={handleSortChange}
//             initialFilters={filters}
//             initialSort={sortBy}
//             availableFilters={availableFilters}
//           />
//         </div>
//       )}

//       <div className={type === "full-build" ? "w-full" : "w-3/4"}>
//         <BuilderNavbar selectedComponents={selectedComponents} />
//         <NavigationLayout
//           components={components}
//           currentPage={currentPage}
//           pageSize={pageSize}
//           isLoading={isLoading}
//           handlePageChange={handlePageChange}
//         >
//           <>
//             {requirementError && (
//               <div className="text-red-500 text-center my-2">
//                 {requirementError}
//               </div>
//             )}
//             {type === "full-build" ? (
//               renderFullBuild()
//             ) : isLoading ? (
//               <div className="flex justify-center items-center py-10">
//                 <Spin size="large" />
//               </div>
//             ) : paginatedComponents.length === 0 ? (
//               <div className="text-center text-gray-400 py-10">
//                 No components found matching your filters.
//               </div>
//             ) : (
//               paginatedComponents.map((component) => (
//                 <ItemCard
//                   key={component._id || component.id}
//                   item={component}
//                   type={type}
//                   selected={selectedId === (component._id || component.id)}
//                   onSelect={() => handleSelect(component._id || component.id)}
//                   onNext={() =>
//                     handleNextComponent(component._id || component.id)
//                   }
//                   showError={errorId === (component._id || component.id)}
//                 />
//               ))
//             )}
//           </>
//         </NavigationLayout>
//       </div>
//     </section>
//   );
// }

// export default Builder;
/// Enhanced Builder.jsx with configure functionality - FIXED PROGRESS STEPS
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

      message.info(
        `Configuring ${type.toUpperCase()} - other components are pre-selected from your build`
      );
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

  // Add title state to Builder component
  const [buildTitle, setBuildTitle] = useState("");

  // Modify the handleNextComponent function
  const handleNextComponent = useCallback(
    async (cardId) => {
      if (configureMode) {
        // In configure mode, update the existing build instead of creating new one
        if (selectedId === cardId) {
          try {
            // Update the specific component in the existing build
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
                originalBuild: data.build, // Pass the updated build as original
              },
            });
          } catch (err) {
            message.error(
              err.response?.data?.message ||
                "Failed to update component. Please try again."
            );
          }
        } else {
          setSelectedId(cardId);
        }
        return;
      }

      // Original next component logic for normal mode
      if (selectedId === cardId) {
        const currentIndex = COMPONENT_ORDER.indexOf(type);
        if (currentIndex !== -1 && currentIndex < COMPONENT_ORDER.length - 1) {
          const nextType = COMPONENT_ORDER[currentIndex + 1];

          if (nextType === "full-build") {
            setFullBuildLoading(true);
            try {
              const { data } = await axios.post(
                "http://localhost:4000/api/build/createbuild",
                {
                  components: { ...selectedComponents, [type]: cardId },
                  title:
                    buildTitle || `My Build ${new Date().toLocaleDateString()}`,
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
    navigate("/profile?tab=1");
  }, [navigate]);

  const renderFullBuild = () => (
    <FullBuildSummary
      fullBuild={fullBuild}
      loading={fullBuildLoading}
      configureMode={configureMode}
      originalBuildId={originalBuildId}
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
          />

          {/* Search Container - Only show for non-full-build pages */}
          {type !== "full-build" && (
            <form
              className="browsecomponents_search-container"
              onSubmit={handleSearchSubmit}
              style={{ marginBottom: "1rem" }}
            >
              <input
                type="text"
                placeholder={`Search ${
                  type === "all" ? "components" : type
                }...`}
                className="browsecomponents_search-input"
                value={searchInput}
                onChange={handleSearchInputChange}
              />
              <button type="submit" className="browsecomponents_search-button">
                <CiSearch size={20} />
              </button>
            </form>
          )}

          {/* Search Info - Only show when there's a search query */}
          {searchQuery && type !== "full-build" && (
            <div
              className="browsecomponents_search-info"
              style={{ marginBottom: "1rem" }}
            >
              <p>
                Showing results for "{searchQuery}"
                {components.length > 0 && ` (${components.length} found)`}
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSearchInput("");
                  const newSearchParams = new URLSearchParams(searchParams);
                  newSearchParams.delete("q");
                  newSearchParams.set("page", "1");
                  setSearchParams(newSearchParams);
                }}
                className="clear-search-btn"
              >
                Clear search
              </button>
            </div>
          )}

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
                      <span className="configure-badge">Configure Mode</span>
                      {type === "full-build"
                        ? "Review Build Changes"
                        : `Updating ${type.toUpperCase()}`}
                    </h3>
                    <p>
                      {type === "full-build"
                        ? "Review your build changes and choose how to save them."
                        : `You're updating a component in your existing build. Select a compatible ${type} to continue.`}
                    </p>
                    <div className="configure-actions">
                      <Button
                        variant="outline"
                        onClick={handleCancelConfigure}
                        className="configure-cancel-btn"
                      >
                        Cancel Update
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
                      <p>Review Build</p>
                    </div>
                    <div className="progress-step">
                      <span>3</span>
                      <p>Save Changes</p>
                    </div>
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
                    buttonText={configureMode ? "Update & Continue" : "Next"}
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
