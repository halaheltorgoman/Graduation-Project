import React from "react";
import ItemCard from "./ItemCard";
import NavigationLayout from "./NavigationLayout";

import { storages } from "../../lib/constants";

function Storage() {
  return (
    <NavigationLayout>
      <>
        {storages.map((processor) => (
          <ItemCard key={processor.id} item={processor} />
        ))}
      </>
    </NavigationLayout>
  );
}

export default Storage;
