"use server";

import { revalidateTag } from "next/cache";
import { getTopStories } from "../lib/getTopStories";
import { getAndCacheTranslatedStory } from "../lib/getAndCacheTranslatedStory";
import { getTranslatedStoryIds } from "@/app/db/redis";

export const revalidateAndGetTopStories = async () => {
  revalidateTag("top-stories");
  const topStories = await getTopStories();
  return topStories;
};

export const translateSingleStory = async (storyId: number) => {
  await getAndCacheTranslatedStory(storyId);
};

export const getExistingStoryIds = async (): Promise<number[]> => {
  const storyIds = await getTranslatedStoryIds();
  return storyIds;
};
