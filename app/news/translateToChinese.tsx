import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export async function translateTextToChinese(text: string) {
  const { text: translatedText } = await generateText({
    model: openai("gpt-4o-mini"),
    messages: [
      {
        role: "system",
        content: `You are a professional translator. Translate the following text to authentic Chinese. Keep the translation natural and idiomatic while preserving the original meaning.`,
      },
      {
        role: "user",
        content: text,
      },
    ],
  });

  return translatedText;
}

export async function translatePageToChinese(text: string) {
  console.log("start to translate for page size ", text.length);
  const { text: translatedText } = await generateText({
    model: openai("gpt-4o-mini"),
    messages: [
      {
        role: "system",
        content: `You are a professional translator. Translate the following text to authentic Chinese. Keep the translation natural and idiomatic while preserving the original meaning. The content is copied from a website, so it might contain extraneous texts. Please remove them and focus on delivering a coherent article. If there are any images in the content, preserve their placement and any associated captions or descriptions.`,
      },
      {
        role: "user",
        content: text,
      },
    ],
  });

  return translatedText;
}
