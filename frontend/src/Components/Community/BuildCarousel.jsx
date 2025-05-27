// import React from "react";
// import { Carousel } from "antd";
// import "./BuildCarousel.css"; // Import the CSS below
// const BuildCarousel = ({ components }) => {
//   if (!components) return null;
//   const images = Object.values(components)
//     .map((comp) => comp?.image_source)
//     .filter(Boolean);

//   if (images.length === 0) return null;

//   return (
//     <div style={{ width: "100%", maxWidth: 400, margin: "0 auto" }}>
//       <Carousel arrows infinite={false}>
//         {images.map((src, idx) => (
//           <div key={idx}>
//             <img
//               src={src}
//               alt={`Component ${idx}`}
//               style={{
//                 width: "100%",
//                 height: "260px",

//                 borderRadius: "16px",
//                 display: "block",
//                 margin: "0 auto",
//               }}
//             />
//           </div>
//         ))}
//       </Carousel>
//     </div>
//   );
// };

// export default BuildCarousel;
import React from "react";
import { Carousel } from "antd";
import "./BuildCarousel.css";

const BuildCarousel = ({ components }) => {
  if (!components) return null;

  const images = Object.values(components)
    .map((comp) => comp?.image_source)
    .filter(Boolean);

  if (images.length === 0) return null;

  return (
    <div className="custom-carousel-container">
      <Carousel arrows infinite={false} dots>
        {images.map((src, idx) => (
          <div key={idx}>
            <img
              src={src}
              alt={`Component ${idx}`}
              className="custom-carousel-image"
            />
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default BuildCarousel;
