"use client";

import React, { createContext, useContext, ReactNode, useEffect } from "react";

type NewResponseContextType = {
  triggerNewResponse: () => Promise<void>;
};

const NewResponseContext = createContext<NewResponseContextType>({
  triggerNewResponse: async () => {},
});

export function NewResponseProvider({
  children,
  triggerNewResponse,
}: {
  children: ReactNode;
  triggerNewResponse: () => Promise<void>;
}) {
  return (
    <NewResponseContext.Provider
      value={{
        triggerNewResponse,
      }}
    >
      {children}
    </NewResponseContext.Provider>
  );
}

// Render this component will ask LLM to produce a new response based on the existing messages.
export function GetNewResponse() {
  const context = useContext(NewResponseContext);
  if (context === undefined) {
    throw new Error("useNewResponse must be used within a NewResponseProvider");
  }

  const [isLoading, setIsLoading] = React.useState(true);
  const [hasTriggered, setHasTriggered] = React.useState(false);

  useEffect(() => {
    // This component might be firing multiple times because:
    // 1. The context object reference changes, causing effect to re-run
    // 2. React.StrictMode in development causing double-mounting
    // 3. Multiple instances of this component being rendered simultaneously

    let isMounted = true;

    const fetchNewResponse = async () => {
      // Only trigger a new response if we haven't already
      if (!hasTriggered) {
        try {
          setHasTriggered(true);
          if (isMounted) {
            await context.triggerNewResponse();
          }
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchNewResponse();

    return () => {
      isMounted = false;
    };
  }, [context, hasTriggered]);

  if (isLoading) {
    return null;
  }

  return null;
}
