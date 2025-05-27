// import { Pagination } from "antd";
// import { Button } from "../../Components/ui/button";
// import { FaArrowRight } from "react-icons/fa6";
// import { FaArrowLeft } from "react-icons/fa6";

// import { Spin } from "antd"; // Ant Design spinner

// const NavigationLayout = ({
//   children,
//   currentPage,
//   pageSize,
//   components,
//   handlePageChange,
//   isLoading,
// }) => {
//   return (
//     <section>
//       <div className="flex">
//         <div>
//           <Button
//             variant="outline"
//             size="icon"
//             className="bg-transparent w-11 border-2 rounded-lg"
//             disabled={isLoading}
//           >
//             {isLoading ? <Spin size="small" /> : <FaArrowLeft />}
//           </Button>
//         </div>
//         <div className="flex-1 px-24">{children}</div>
//         <div>
//           <Button
//             variant="outline"
//             size="icon"
//             className="bg-transparent w-11 border-2 rounded-lg"
//             disabled={isLoading}
//           >
//             {isLoading ? <Spin size="small" /> : <FaArrowRight />}
//           </Button>
//         </div>
//       </div>
//       <div className="flex justify-end items-center mt-16">
//         <Pagination
//           align="end"
//           current={currentPage}
//           pageSize={pageSize}
//           total={components.length}
//           onChange={handlePageChange}
//           showSizeChanger={false}
//           disabled={isLoading}
//         />
//       </div>
//     </section>
//   );
// };
// export default NavigationLayout;
// import React from "react";
// import { Pagination } from "antd";
// import BuildShimmer from "./BuildShimmer"; // You'll need to create this component

// const NavigationLayout = ({
//   children,
//   components,
//   currentPage,
//   pageSize,
//   isLoading,
//   handlePageChange,
// }) => {
//   return (
//     <div className="navigation-layout ">
//       <div className="components-grid flex-1 px-24">
//         {isLoading
//           ? // Use shimmer loading effect when loading
//             Array.from({ length: pageSize }).map((_, index) => (
//               <BuildShimmer key={index} />
//             ))
//           : // Render children (which contains the component cards) when not loading
//             children}
//       </div>
//       {components.length > 0 && (
//         <div className="pagination-container mt-6 flex justify-center">
//           <Pagination
//             current={currentPage}
//             pageSize={pageSize}
//             total={components.length}
//             onChange={handlePageChange}
//             showSizeChanger={false}
//             disabled={isLoading}
//           />
//         </div>
//       )}
//     </div>
//   );
// };

// export default NavigationLayout;
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
    <div className="navigation-layout ">
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
          />
        </div>
      )}
    </div>
  );
};

export default NavigationLayout;
