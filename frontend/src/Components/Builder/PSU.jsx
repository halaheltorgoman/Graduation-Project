import React from "react";
import ItemCard from "./ItemCard";
import NavigationLayout from "./NavigationLayout";

import { powerSupplies } from "../../lib/constants";

function PSU() {
  return (
    <NavigationLayout>
      <>
        {powerSupplies.map((processor) => (
          <ItemCard key={processor.id} item={processor} />
        ))}
      </>
    </NavigationLayout>
  );
}

export default PSU;
