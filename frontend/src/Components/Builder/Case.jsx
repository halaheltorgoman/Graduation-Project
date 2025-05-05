import React from "react";
import ItemCard from "./ItemCard";
import NavigationLayout from "./NavigationLayout";

import { cases } from "../../lib/constants";

function Case() {
  return (
    <NavigationLayout>
      <>
        {cases.map((processor) => (
          <ItemCard key={processor.id} item={processor} />
        ))}
      </>
    </NavigationLayout>
  );
}

export default Case;
