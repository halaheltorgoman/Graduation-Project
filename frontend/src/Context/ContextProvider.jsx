import React from "react";
import { UserContextProvider } from "./UserContext";

import { SavedComponentsProvider } from "./SavedComponentContext";
import { SavedPostsProvider } from "./SavedPostsContext";

// Separate providers into dependent and independent groups
const independentProviders = [UserContextProvider];

const dependentProviders = [SavedComponentsProvider, SavedPostsProvider];

// Helper function to wrap components with providers
const wrapWithProviders = (providers, children) => {
  return providers.reduce((acc, Provider) => {
    return <Provider>{acc}</Provider>;
  }, children);
};

export const ContextProvider = ({ children }) => {
  return (
    <UserContextProvider>
      {wrapWithProviders(
        independentProviders.slice(1), // Skip UserContextProvider as it's already applied
        wrapWithProviders(dependentProviders, children)
      )}
    </UserContextProvider>
  );
};
