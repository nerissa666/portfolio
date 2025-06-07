"use client";

import dynamic from "next/dynamic";

interface NewsChatProps {
  title: string;
  content: string;
}

export const NewsChat = dynamic<NewsChatProps>(
  () => import("./_news-chat").then((mod) => mod.NewsChat),
  {
    ssr: false,
  }
);
