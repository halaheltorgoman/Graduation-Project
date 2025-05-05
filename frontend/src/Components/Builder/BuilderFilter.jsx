import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import closeIcon from "../../assets/icons/close_icon.svg";
import filterIcon from "../../assets/icons/filter_icon.svg";

const BuilderFilter = () => {
  return (
    <aside>
      <div className="flex gap-2 items-center">
        <img src={filterIcon} alt="filter icon" className="w-6 h-6" />
        <h2 className="text-2xl font-normal">Filters</h2>
      </div>

      <div className="flex justify-between items-center mt-8">
        <p className="font-light text-lg">Applied Filters</p>
        <p className="text-xs font-normal text-primary underline">Clear All</p>
      </div>

      <div className="flex mt-6">
        <div className="flex items-center gap-1 bg-background p-1 rounded-sm">
          <p className="text-xs">AMD</p>
          <img
            src={closeIcon}
            alt="close icon"
            className="w-3 h-3 cursor-pointer"
          />
        </div>
      </div>

      <Accordion
        className="w-72 mt-12 bg-background px-2 rounded-lg"
        type="single"
        collapsible
      >
        <AccordionItem value="item-1">
          <AccordionTrigger>Manufacturer</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3.5">
              <div className="flex items-center space-x-3">
                <Checkbox id="all" />
                <Label htmlFor="all">All</Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox id="intel" />
                <Label htmlFor="intel">Intel</Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox id="amd" />
                <Label htmlFor="amd">AMD</Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Accordion
        className="w-72 mt-4 bg-background px-2 rounded-lg"
        type="single"
        collapsible
      >
        <AccordionItem value="item-2">
          <AccordionTrigger>Series</AccordionTrigger>
          {/* <AccordionContent>
          </AccordionContent> */}
        </AccordionItem>
      </Accordion>

      <Accordion
        className="w-72 mt-4 bg-background px-2 rounded-lg"
        type="single"
        collapsible
      >
        <AccordionItem value="item-3">
          <AccordionTrigger>Cores</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3.5">
              <div className="flex items-center space-x-3">
                <Checkbox id="basic" />
                <Label htmlFor="basic">
                  <span className="text-primary">Basic Tasks:</span> 2-4 cores
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox id="gaming" />
                <Label htmlFor="gaming">
                  <span className="text-primary">Gaming:</span> 6-12 cores
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox id="content-creation" />
                <Label htmlFor="content-creation">
                  <span className="text-primary">Content Creation:</span> 8-16
                  cores
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox id="workstation" />
                <Label htmlFor="workstation">
                  <span className="text-primary">Workstation/Server:</span>{" "}
                  16-128 cores
                </Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Accordion
        className="w-72 mt-4 bg-background px-2 rounded-lg"
        type="single"
        collapsible
      >
        <AccordionItem value="item-3">
          <AccordionTrigger>Filter by price</AccordionTrigger>
          <AccordionContent>
            <div className="flex gap-2.5">
              <p className="p-2 text-center border rounded-sm flex-1">$50</p>
              <p className="p-2 text-center border rounded-sm flex-1">$100</p>
              <p className="flex items-center justify-center rounded-sm bg-white text-black text-xs p-2">
                OK
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="w-72 mt-4 bg-background px-2 rounded-lg p-3 flex items-center">
        <h3 className="font-normal flex">Your Budget: </h3>
        <p className="p-2 text-center border rounded-sm text-xs mx-6 min-w-28">
          $100
        </p>
      </div>

      <Separator className="mt-11 bg-background" />

      <h2 className="text-2xl font-normal mt-10">Sort by</h2>

      <Accordion
        className="w-72 mt-4 bg-background px-2 rounded-lg"
        type="single"
        collapsible
      >
        <AccordionItem value="item-3">
          <AccordionTrigger>Avg Price</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-2">
              <Button>Low to Hight</Button>
              <Button variant="secondary">Hight to Low</Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Accordion
        className="w-72 mt-4 bg-background px-2 rounded-lg"
        type="single"
        collapsible
      >
        <AccordionItem value="item-2">
          <AccordionTrigger>Rating</AccordionTrigger>
          {/* <AccordionContent>
          </AccordionContent> */}
        </AccordionItem>
      </Accordion>

      <Accordion
        className="w-72 mt-4 bg-background px-2 rounded-lg"
        type="single"
        collapsible
      >
        <AccordionItem value="item-2">
          <AccordionTrigger>Age</AccordionTrigger>
          {/* <AccordionContent>
          </AccordionContent> */}
        </AccordionItem>
      </Accordion>
    </aside>
  );
};
export default BuilderFilter;
