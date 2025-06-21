import React from "react";
import { Pagination } from "antd";
import { useParams } from "react-router-dom";
import BuildShimmer from "./BuildShimmer"; // You'll need to create this component

const NavigationLayout = ({
  children,
  components,
  currentPage,
  pageSize,
  isLoading,
  handlePageChange,
}) => {
  const { type } = useParams();

  return (
    <div className="navigation-layout">
      <div className="components-grid flex-1 px-24">
        {isLoading
          ? Array.from({ length: pageSize }).map((_, index) => (
              <BuildShimmer key={index} />
            ))
          : children}
      </div>
      {components.length > 0 && type !== "full-build" && (
        <div className="pagination-container mt-6 flex justify-center">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={components.length}
            onChange={handlePageChange}
            showSizeChanger={false}
            disabled={isLoading}
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} of ${total} components`
            }
          />
        </div>
      )}
    </div>
  );
};

export default NavigationLayout;
