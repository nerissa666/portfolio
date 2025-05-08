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

  if (isLoading) {
    return (
      <div className="flex items-start mb-4" key={key}>
        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex-shrink-0 mr-3 flex items-center justify-center text-sm font-semibold">
          AI
        </div>
        <div
          className="relative max-w-[85%] p-[3px] rounded-lg overflow-hidden"
          style={{
            background: `
            linear-gradient(
              90deg, 
              #ff0000, #ffa500, #ffff00, #008000, #0000ff, #4b0082, #ee82ee, #ff0000
            )
          `,
            backgroundSize: "200% 100%",
            animation: "rainbowBorder 2s linear infinite",
          }}
        >
          <div className="relative bg-blue-50 p-3 rounded-lg">
            <div className="markdown-content prose prose-indigo prose-sm max-w-none">
              {children}
            </div>
          </div>

          {/* Inline styles for the animation */}
          <style>{`
            @keyframes rainbowBorder {
              0% {
                background-position: 0% 50%;
              }
              100% {
                background-position: 200% 50%;
              }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start mb-4" key={key}>
      <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex-shrink-0 mr-3 flex items-center justify-center text-sm font-semibold">
        AI
      </div>
      <div className="max-w-[85%] bg-blue-50 p-3 rounded-lg shadow-sm border-l-4 border-blue-300 hover:shadow-md transition-shadow duration-200">
        <div className="markdown-content prose prose-indigo prose-sm max-w-none">
          {children}
        </div>
      </div>
    </div>
  );
};
