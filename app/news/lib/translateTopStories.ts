"use server";

import { getTranslatedStory, storeTranslatedStory } from "@/app/db/redis";
import {
  translateTextToChinese,
  translatePageToChinese,
} from "../translateToChinese";
import { getTopStories } from "./getTopStories";
import { getStoryContentEffective } from "../[id]/getStoryContentEffective";

export async function translateTopStories() {
  console.log("Starting translateTopStories");
  const stories = await getTopStories();
  console.log(`Got ${stories.length} stories to translate`);

  return Promise.all(
    stories.map(async (story) => {
      console.log(`Processing story ${story.id}: ${story.title}`);

      // Try to get cached translation first
      let translatedStory = await getTranslatedStory(story.id);

      if (!translatedStory || !translatedStory.translatedTitle) {
        console.log(
          `No cached translation found for story ${story.id}, translating...`
        );
        // If no cached version exists, translate and store
        try {
          const [translatedTitle, translatedContent] = await Promise.all([
            translateTextToChinese(story.title),
            translatePageToChinese(await getStoryContentEffective(story.url)),
          ]);
          console.log(
            `Successfully translated title and content for story ${story.id}`
          );

          translatedStory = await storeTranslatedStory(
            story.id,
            story.title,
            translatedTitle,
            translatedContent,
            story.url
          );
          console.log(`Stored translation for story ${story.id}`);
        } catch (error) {
          console.error(`Error translating story ${story.id}:`, error);
          translatedStory = await storeTranslatedStory(
            story.id,
            story.title,
            "N/A",
            "N/A",
            story.url
          );
          console.log(`Stored error placeholder for story ${story.id}`);
        }
      } else {
        console.log(`Found cached translation for story ${story.id}`);
      }

      return {
        ...story,
        translatedTitle: translatedStory.translatedTitle,
        translatedContent: translatedStory.translatedContent,
      };
    })
  );
}
