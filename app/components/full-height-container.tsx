"use client";

import { ReactNode, useRef, useLayoutEffect } from "react";

interface FullHeightContainerProps {
  children: ReactNode;
  offset?: number;
  className?: string;
}

export default function FullHeightContainer({
  children,
  offset = 0,
  className = "",
}: FullHeightContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const windowHeight = window.innerHeight;
        containerRef.current.style.height = `${windowHeight - offset}px`;
      }
    };

    // Set initial height
    updateHeight();

    // Update height on resize
    window.addEventListener("resize", updateHeight);

    // Handle orientation change specifically for mobile devices
    window.addEventListener("orientationchange", updateHeight);

    return () => {
      window.removeEventListener("resize", updateHeight);
      window.removeEventListener("orientationchange", updateHeight);
    };
  }, [offset]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
