import React from "react";
import ItemCard from "./ItemCard";
import NavigationLayout from "./NavigationLayout";

import { coolers } from "../../lib/constants";

function Cooling() {
  return (
    <NavigationLayout>
      <>
        {coolers.map((processor) => (
          <ItemCard key={processor.id} item={processor} />
        ))}
      </>
    </NavigationLayout>
  );
}

export default Cooling;
