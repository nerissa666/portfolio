"use server";

import { revalidateTag } from "next/cache";
import { getTopStories } from "../lib/getTopStories";
import { getAndCacheTranslatedStory } from "../lib/getAndCacheTranslatedStory";
import { getTranslatedStoryIds } from "@/app/db/redis";
import { cleanAllTranslations } from "@/app/db/redis";

export const revalidateAndGetTopStories = async () => {
  revalidateTag("top-stories");
  revalidateTag("news-home");
  const topStories = await getTopStories();
  return topStories;
};

export const translateSingleStory = async (storyId: number) => {
  revalidateTag("news-home");
  await getAndCacheTranslatedStory(storyId);
};

export const getExistingStoryIds = async (): Promise<number[]> => {
  const storyIds = await getTranslatedStoryIds();
  return storyIds;
};

export async function cleanAllTranslationsAction() {
  revalidateTag("top-stories");
  revalidateTag("news-home");
  await cleanAllTranslations();
}
