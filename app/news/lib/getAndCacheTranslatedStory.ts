import { getTranslatedStory, storeTranslatedStory } from "@/app/db/redis";
import { getStoryContentEffective } from "../[id]/getStoryContentEffective";
import {
  translatePageToChinese,
  translateTextToChinese,
} from "../translateToChinese";

export const getAndCacheTranslatedStory = async (storyId: string) => {
  let story = await getTranslatedStory(storyId);

  if (!story || !story.translatedContent) {
    // If no cached version exists, fetch and translate
    const storyRes = await fetch(
      `https://hacker-news.firebaseio.com/v0/item/${storyId}.json`
    );

    if (!storyRes.ok) {
      throw new Error("Failed to fetch story");
    }

    const originalStory = await storyRes.json();

    // Get and translate the content
    const [translatedTitle, translatedContent] = await Promise.all([
      translateTextToChinese(originalStory.title),
      translatePageToChinese(await getStoryContentEffective(originalStory.url)),
    ]);

    // Store the translation in Redis
    story = await storeTranslatedStory(
      storyId,
      originalStory.title,
      translatedTitle,
      translatedContent,
      originalStory.url
    );
    console.log("Translated story", storyId);
  }

  return story;
};
