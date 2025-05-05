import { Button } from "../../Components/ui/button";
// import { FaArrowLeft } from "react-icons/fa6";
import ArrowLeft from "../../assets/icons/arrow_left_icon.svg";
import ArrowRight from "../../assets/icons/arrow_right_icon.svg";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../Components/ui/pagination";

const NavigationLayout = ({ children }) => {
  return (
    <section>
      <div className="flex">
        <div>
          <Button
            variant="outline"
            size="icon"
            className="bg-transparent w-11 border-2 rounded-lg"
          >
            <img src={ArrowLeft} alt="arrow-left" />
          </Button>
        </div>
        <div className="flex-1 px-24">{children}</div>
        <div>
          <Button
            variant="outline"
            size="icon"
            className="bg-transparent w-11 border-2 rounded-lg"
          >
            <img src={ArrowRight} alt="arrow-right" />
          </Button>
        </div>
      </div>
      <div className="flex justify-end items-center mt-16">
        <Pagination className="w-fit m-0">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">99</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </section>
  );
};
export default NavigationLayout;
