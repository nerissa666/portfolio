"use client";

import { NewsChat } from "./news-chat";

export const NewsChatWrapper = ({
  title,
  content,
}: {
  title: string;
  content: string;
}) => {
  return <NewsChat title={title} content={content} />;
};
