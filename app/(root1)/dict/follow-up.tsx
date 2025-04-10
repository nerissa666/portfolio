"use client";

import dynamic from "next/dynamic";

export const FollowUp = dynamic(
  () => import("./_follow-up").then((mod) => mod.FollowUp),
  {
    ssr: false,
  }
);
