import { cacheLife } from "next/dist/server/use-cache/cache-life";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

const MAX_STORIES = 50;

export const getTopStories = async () => {
  "use cache: remote";
  cacheLife("max");
  cacheTag("top-stories");

  const res = await fetch(
    "https://hacker-news.firebaseio.com/v0/topstories.json"
  );

  if (!res.ok) {
    throw new Error("Failed to fetch top stories");
  }

  const storyIds = await res.json();
  const stories = await Promise.all(
    storyIds.slice(0, MAX_STORIES).map(async (id: number) => {
      const storyRes = await fetch(
        `https://hacker-news.firebaseio.com/v0/item/${id}.json`
      );
      return storyRes.json();
    })
  );

  // TODO: use Zod to validate
  return stories as {
    id: number;
    title: string;
    url: string;
  }[];
};
