import { Pagination } from "antd";
import { Button } from "../../Components/ui/button";
import ArrowLeft from "../../assets/icons/arrow_left_icon.svg";
import ArrowRight from "../../assets/icons/arrow_right_icon.svg";

const NavigationLayout = ({
  children,
  currentPage,
  pageSize,
  components,
  handlePageChange,
  isLoading,
}) => {
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
        <Pagination
          align="end"
          current={currentPage}
          pageSize={pageSize}
          total={components.length}
          onChange={handlePageChange}
          showSizeChanger={false}
          disabled={isLoading}
        />
      </div>
    </section>
  );
};
export default NavigationLayout;
