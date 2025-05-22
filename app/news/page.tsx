import { Suspense } from "react";
import Link from "next/link";
import { translateTextToChinese } from "./translateToChinese";
import { getTranslatedStory, storeTranslatedStory } from "@/app/db/redis";

import { unstable_cache } from "next/cache";
import { getAndCacheTranslatedStory } from "./lib/getAndCacheTranslatedStory";
import plimit from "p-limit";
import { cacheLife } from "next/dist/server/use-cache/cache-life";

const limit = plimit(3);

const getTopStories = unstable_cache(
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

    // translate all stories and cache to Redis
    await Promise.all(
      stories.map((story) =>
        limit(() => getAndCacheTranslatedStory(story.id.toString()))
      )
    );

    return stories;
  },
  ["top-stories"],
  { revalidate: 86400 } // 24 hours in seconds
);

export default async function NewsPage() {
  "use cache";
  cacheLife({
    revalidate: 86400,
  });

  const stories = await getTopStories();
  const translatedStories = await Promise.all(
    stories.map(async (story) => {
      // Try to get cached translation first
      let translatedStory = await getTranslatedStory(story.id.toString());

      if (!translatedStory) {
        // If no cached version exists, translate and store
        const translatedTitle = await translateTextToChinese(story.title);
        translatedStory = await storeTranslatedStory(
          story.id.toString(),
          story.title,
          translatedTitle,
          "", // We don't need the content for the list view
          story.url
        );
      }

      return {
        ...story,
        translatedTitle: translatedStory.translatedTitle,
      };
    })
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold leading-tight mb-6 text-gray-900">
        Hacker News Top Stories
      </h1>
      <Suspense fallback={<div>Loading stories...</div>}>
        <ul className="space-y-2">
          {translatedStories.map((story, index) => (
            <li key={story.id} className="block p-2 hover:bg-gray-50 rounded">
              <div className="flex items-center">
                <span className="text-gray-500 w-8">{index + 1}.</span>
                <Link
                  href={`/news/${story.id}`}
                  className="flex-1 hover:text-blue-600"
                >
                  {story.translatedTitle}
                </Link>
              </div>
              {story.url && (
                <a
                  href={story.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-500 ml-8 hover:underline"
                >
                  {new URL(story.url).hostname}
                </a>
              )}
            </li>
          ))}
        </ul>
      </Suspense>
    </div>
  );
}
