import React from "react";
import ItemCard from "./ItemCard";
import NavigationLayout from "./NavigationLayout";

import { memories } from "../../lib/constants";

function Memory() {
  return (
    <NavigationLayout>
      <>
        {memories.map((processor) => (
          <ItemCard key={processor.id} item={processor} />
        ))}
      </>
    </NavigationLayout>
  );
}

export default Memory;
