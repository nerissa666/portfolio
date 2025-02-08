"use client";

import dynamic from "next/dynamic";

export const Pronounce = dynamic(
  () => import("./_pronounce").then((mod) => mod.Pronounce),
  {
    ssr: false,
  }
);
