import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "../ui/button";
import compareIcon from "../../assets/icons/compare_icon.svg";
import shareIcon from "../../assets/icons/share_icon.svg";
import { Rating, ThinRoundedStar } from "@smastrom/react-rating";

const ItemCard = ({ item }) => {
  const [activeImage, setActiveImage] = useState(0);

  return (
    <div className="p-6 mb-8 last:mb-0 rounded-3xl bg-black/60 flex gap-6">
      <div className="flex-1">
        <div className="flex gap-6">
          <div className="space-y-4">
            {item.images?.map((image, index) => (
              <div
                key={index}
                onClick={() => setActiveImage(index)}
                className={`${
                  index === activeImage ? "border-b-2 border-purple-500" : ""
                } p-1 cursor-pointer`}
              >
                <img
                  className="w-12 h-12 object-contain"
                  src={image}
                  alt={item.name}
                />
              </div>
            ))}
          </div>
          <div className="flex-1 relative">
            <button className="absolute top-2 right-2 p-2 hover:bg-purple-500/20 rounded-full transition-colors">
              <Heart className="w-6 h-6 text-primary" />
            </button>
            <div className="px-8 py-16 border-b">
              <img
                className="w-full h-full object-contain"
                src={item.images?.[activeImage]}
                alt={item.name}
              />
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-3">Description</h3>
              <ul className="text-sm text-gray-400 list-disc pl-5">
                {item.description.map((text, index) => (
                  <li key={index}>{text}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold mb-2">{item.name}</h2>
            <div className="flex">
              <span className="text-sm text-gray-400">
                {item.rating.value} ({item.rating.count})
              </span>
              <Rating />
            </div>
          </div>
          <p className="text-xl text-gray-300">
            ${item.price?.toFixed(2)}{" "}
            <span className="text-sm text-gray-400">Average Price</span>
          </p>
        </div>

        <div>
          <div>
            <h3 className="text-lg font-semibold mb-3">Specifications</h3>
            <ul className="space-y-2 list-disc pl-5">
              {item.specifications.map((spec) => (
                <li key={spec.title}>
                  <span>{spec.title}:</span>{" "}
                  <span className="text-gray-400">{spec.description}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-6 text-lg font-semibold mb-3">
            For More Info Visit :{" "}
            <a href={item.website.url} target="_blank" className="underline">
              {item.website.title}
            </a>
          </p>

          <Button className="mt-14 rounded-[60px] px-14 bg-[#621C74]">
            Next
          </Button>
        </div>

        <div className="flex flex-col gap-4 w-fit items-start my-4">
          <Button variant="link" className="text-white">
            <img src={compareIcon} alt="compare" className="w-4 h-4" />
            Compare
          </Button>
          <Button variant="link" className="text-white">
            <img src={shareIcon} alt="share" className="w-4 h-4" />
            Share
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
