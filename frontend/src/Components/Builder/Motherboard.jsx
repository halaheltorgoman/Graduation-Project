import React from "react";
import ItemCard from "./ItemCard";
import NavigationLayout from "./NavigationLayout";

import { motherboards } from "../../lib/constants";

function Motherboard() {
  return (
    <NavigationLayout>
      <>
        {motherboards.map((processor) => (
          <ItemCard key={processor.id} item={processor} />
        ))}
      </>
    </NavigationLayout>
  );
}

export default Motherboard;
