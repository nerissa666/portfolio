import { CACHE_ONE_YEAR } from "next/dist/lib/constants";
import { unstable_cache } from "next/dist/server/web/spec-extension/unstable-cache";

export const getTopStories = unstable_cache(
  async () => {
    const res = await fetch(
      "https://hacker-news.firebaseio.com/v0/topstories.json"
    );

    if (!res.ok) {
      throw new Error("Failed to fetch top stories");
    }

    const storyIds = await res.json();
    const stories = await Promise.all(
      storyIds.slice(0, 50).map(async (id: number) => {
        const storyRes = await fetch(
          `https://hacker-news.firebaseio.com/v0/item/${id}.json`
        );
        return storyRes.json();
      })
    );

    return stories;
  },
  ["top-stories"],
  { revalidate: CACHE_ONE_YEAR }
);
