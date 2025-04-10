"use client";

import dynamic from "next/dynamic";

export const QueryHistory = dynamic(
  () => import("./_persistence").then((mod) => mod.QueryHistory),
  {
    ssr: false,
  }
);

export const SaveQuery = dynamic(
  () => import("./_persistence").then((mod) => mod.SaveQuery),
  {
    ssr: false,
  }
);
