"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";

export const AssistantMessageWrapperV2 = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrapperRef.current) {
      return; // Exit if wrapper not found
    }

    // Check if children contains a div with id="spinner"
    const checkForSpinner = () => {
      const spinnerElements =
        wrapperRef.current?.querySelectorAll('[id="spinner"]');
      const hasSpinner = spinnerElements && spinnerElements.length > 0;
      setIsLoading(Boolean(hasSpinner));
    };

    // Initial check
    checkForSpinner();

    // Set up a mutation observer to detect when the spinner is added or removed
    // but only within our wrapper
    const observer = new MutationObserver(checkForSpinner);

    // Start observing the wrapper with the configured parameters
    observer.observe(wrapperRef.current, {
      childList: true,
      subtree: true,
    });

    // Clean up the observer when component unmounts
    return () => observer.disconnect();
  }, [setIsLoading]);

  return (
    <div ref={wrapperRef}>
      <AssistantMessageWrapperV2_Content isLoading={isLoading}>
        {children}
      </AssistantMessageWrapperV2_Content>
    </div>
  );
};

const AssistantMessageWrapperV2_Content = ({
  children,
  isLoading,
}: {
  children: React.ReactNode;
  isLoading: boolean;
}) => {
  // Use a key to force re-render when isLoading changes
  // This prevents the "Failed to execute 'removeChild' on 'Node'" error
  // that can occur when React tries to update the DOM during transitions
  const key = isLoading ? "loading" : "loaded";

  return (
    <div className="mb-4 pb-2" key={key}>
      <div className="border-l-2 border-blue-200 pl-4">
        <div className="text-xs font-medium text-gray-500 mb-1.5">Response</div>
        <div className="prose prose-gray max-w-none">
          <div className="prose max-w-none">
            {children}
            {isLoading && (
              <div className="mt-3 flex items-center space-x-2 text-gray-600">
                <div className="h-2.5 w-2.5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-medium">Processing...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
