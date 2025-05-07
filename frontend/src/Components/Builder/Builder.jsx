import React, { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ItemCard from "./ItemCard";
import NavigationLayout from "./NavigationLayout";
import BuilderNavbar from "./BuilderNavbar";
import Filters from "../Filters/Filters";
import synchronize from "../../assets/icons/synchronize_icon.svg";
import shareIcon from "../../assets/icons/share_icon.svg";

import { data } from "../../lib/constants";
import { Button } from "../ui/button";

function Builder() {
  const { type = "cpu" } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [components, setComponents] = useState([]);
  const [sortBy, setSortBy] = useState(null);
  const [filters, setFilters] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const pageSize = 4;
  const currentPage = parseInt(searchParams.get("page")) || 1;

  const getComponents = useCallback(
    async (componentType) => {
      if (type !== "full-build") {
        setIsLoading(true);
        try {
          const params = {
            page: currentPage,
            pageSize,
            ...filters,
          };
          if (sortBy) params.sortBy = sortBy;

          const { data } = await axios.get(
            `http://localhost:4000/api/components/${componentType}`,
            { params }
          );
          setComponents(data);
        } catch (error) {
          console.error("Error fetching components:", error);
        } finally {
          setIsLoading(false);
        }
      }
    },
    [currentPage, filters, sortBy, type]
  );

  const handleFilterChange = useCallback(
    (newFilters) => {
      setFilters(newFilters);
      navigate(`/builder/${type}?page=1`);
    },
    [navigate, type]
  );

  const handleSortChange = useCallback(
    (sortValue) => {
      setSortBy(sortValue);
      navigate(`/builder/${type}?page=1`);
    },
    [navigate, type]
  );

  const handlePageChange = useCallback(
    (page) => {
      navigate(`/builder/${type}?page=${page}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [navigate, type]
  );

  useEffect(() => {
    setFilters({});
    setSortBy(null);
    if (type !== "full-build") navigate(`/builder/${type}?page=1`);
  }, [type, navigate]);

  useEffect(() => {
    getComponents(type);
  }, [type, getComponents]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedComponents = components.slice(
    startIndex,
    startIndex + pageSize
  );

  return (
    <section className="flex gap-4 justify-around">
      <div className="w-1/4">
        <Filters
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          initialFilters={filters}
          initialSort={sortBy}
        />
      </div>
      <div className="w-3/4">
        <BuilderNavbar />
        <NavigationLayout
          components={components}
          currentPage={currentPage}
          pageSize={pageSize}
          isLoading={isLoading}
          handlePageChange={handlePageChange}
        >
          <>
            {type === "full-build" ? (
              <div className="p-14 px-20 rounded-3xl bg-black/60 flex flex-col">
                <div className="flex gap-10">
                  <div className="w-1/12 flex items-center justify-center text-xl text-white/70">
                    CPU
                  </div>
                  <div className="flex-1 py-6 flex items-center justify-between border-b border-[#E0E0E0]">
                    <div className="flex items-center gap-2">
                      <img
                        src="/images/builder/processor1.png"
                        alt="processor"
                        className="aspect-square w-24"
                      />
                      <p className="text-lg font-light">AMD Ryzen 5 5500</p>
                    </div>
                    <div className="border h-14 w-14 flex items-center justify-center mr-16">
                      <img src={synchronize} alt="sync" className="w-8 h-8" />
                    </div>
                  </div>
                </div>
                <div className="flex gap-10">
                  <div className="w-1/12 flex items-center justify-center text-xl text-white/70">
                    GPU
                  </div>
                  <div className="flex-1 py-6 flex items-center justify-between border-b border-[#E0E0E0]">
                    <div className="flex items-center gap-2">
                      <img
                        src="/images/builder/gpu1.png"
                        alt="gpu"
                        className="aspect-square w-24"
                      />
                      <p className="text-lg font-light">
                        AMD Radeon™ RX 7800 XT
                      </p>
                    </div>
                    <div className="border h-14 w-14 flex items-center justify-center mr-16">
                      <img src={synchronize} alt="sync" className="w-8 h-8" />
                    </div>
                  </div>
                </div>
                <div className="flex gap-10">
                  <div className="w-1/12 flex items-center justify-center text-xl text-white/70">
                    MB
                  </div>
                  <div className="flex-1 py-6 flex items-center justify-between border-b border-[#E0E0E0]">
                    <div className="flex items-center gap-2">
                      <img
                        src="/images/builder/motherboard1.png"
                        alt="processor"
                        className="aspect-square w-24"
                      />
                      <p className="text-lg font-light">MSI MAG B550</p>
                    </div>
                    <div className="border h-14 w-14 flex items-center justify-center mr-16">
                      <img src={synchronize} alt="sync" className="w-8 h-8" />
                    </div>
                  </div>
                </div>
                <div className="flex gap-10">
                  <div className="w-1/12 flex items-center justify-center text-xl text-white/70">
                    Case
                  </div>
                  <div className="flex-1 py-6 flex items-center justify-between border-b border-[#E0E0E0]">
                    <div className="flex items-center gap-2">
                      <img
                        src="/images/builder/case1.png"
                        alt="processor"
                        className="aspect-square w-24"
                      />
                      <p className="text-lg font-light">NZXT H9 Flow </p>
                    </div>
                    <div className="border h-14 w-14 flex items-center justify-center mr-16">
                      <img src={synchronize} alt="sync" className="w-8 h-8" />
                    </div>
                  </div>
                </div>
                <div className="flex gap-10">
                  <div className="w-1/12 flex items-center justify-center text-xl text-white/70">
                    Cooling
                  </div>
                  <div className="flex-1 py-6 flex items-center justify-between border-b border-[#E0E0E0]">
                    <div className="flex items-center gap-2">
                      <img
                        src="/images/builder/cooler1.png"
                        alt="processor"
                        className="aspect-square w-24"
                      />
                      <p className="text-lg font-light">
                        Cooler Master Hyper 212{" "}
                      </p>
                    </div>
                    <div className="border h-14 w-14 flex items-center justify-center mr-16">
                      <img src={synchronize} alt="sync" className="w-8 h-8" />
                    </div>
                  </div>
                </div>
                <div className="flex gap-10">
                  <div className="w-1/12 flex items-center justify-center text-xl text-white/70">
                    Memory
                  </div>
                  <div className="flex-1 py-6 flex items-center justify-between border-b border-[#E0E0E0]">
                    <div className="flex items-center gap-2">
                      <img
                        src="/images/builder/memory1.png"
                        alt="processor"
                        className="aspect-square w-24"
                      />
                      <p className="text-lg font-light">
                        G.SKILL Ripjaws V Series{" "}
                      </p>
                    </div>
                    <div className="border h-14 w-14 flex items-center justify-center mr-16">
                      <img src={synchronize} alt="sync" className="w-8 h-8" />
                    </div>
                  </div>
                </div>
                <div className="flex gap-10">
                  <div className="w-1/12 flex items-center justify-center text-xl text-white/70">
                    Storage
                  </div>
                  <div className="flex-1 py-6 flex items-center justify-between border-b border-[#E0E0E0]">
                    <div className="flex items-center gap-2">
                      <img
                        src="/images/builder/storage1.png"
                        alt="processor"
                        className="aspect-square w-24"
                      />
                      <p className="text-lg font-light">SAMSUNG 990 PRO </p>
                    </div>
                    <div className="border h-14 w-14 flex items-center justify-center mr-16">
                      <img src={synchronize} alt="sync" className="w-8 h-8" />
                    </div>
                  </div>
                </div>
                <div className="flex gap-10">
                  <div className="w-1/12 flex items-center justify-center text-xl text-white/70">
                    PSU
                  </div>
                  <div className="flex-1 py-6 flex items-center justify-between border-b border-[#E0E0E0]">
                    <div className="flex items-center gap-2">
                      <img
                        src="/images/builder/psu1.png"
                        alt="processor"
                        className="aspect-square w-24"
                      />
                      <p className="text-lg font-light">CORSAIR RM850e</p>
                    </div>
                    <div className="border h-14 w-14 flex items-center justify-center mr-16">
                      <img src={synchronize} alt="sync" className="w-8 h-8" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between mt-16">
                  <div className="text-xl text-primary space-y-2">
                    <p>+ Name your build</p>
                    <p>+ Pick a category for you build</p>
                  </div>
                  <div>
                    <Button
                      size="lg"
                      className="text-2xl rounded-[60px] px-28 py-4 bg-[#621C74]"
                    >
                      Save
                    </Button>
                  </div>
                </div>
                <div className="mt-10">
                  <Button variant="link" className="text-white text-sm">
                    <img src={shareIcon} alt="share" className="w-5 h-5" />
                    Share
                  </Button>
                </div>
              </div>
            ) : (
              data[type].map((processor) => (
                <ItemCard key={processor.id} item={processor} type={type} />
              ))
            )}
          </>
        </NavigationLayout>
      </div>
    </section>
  );
}

export default Builder;
