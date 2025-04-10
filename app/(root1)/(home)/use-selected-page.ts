"use client";

import { useSelectedLayoutSegment } from "next/navigation";

export const useSelectedPage = () => {
  let segment = useSelectedLayoutSegment();
  if (segment === null) {
    segment = "home";
  }
  return segment;
};
