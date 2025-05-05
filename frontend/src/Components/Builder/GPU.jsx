import React from "react";
import ItemCard from "./ItemCard";
import NavigationLayout from "./NavigationLayout";

import { gpus } from "../../lib/constants";

function GPU() {
  return (
    <NavigationLayout>
      <>
        {gpus.map((processor) => (
          <ItemCard key={processor.id} item={processor} />
        ))}
      </>
    </NavigationLayout>
  );
}

export default GPU;
