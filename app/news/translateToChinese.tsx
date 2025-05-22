import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export async function translateTextToChinese(text: string) {
  const { text: translatedText } = await generateText({
    model: openai("gpt-4o"),
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
  const { text: translatedText } = await generateText({
    model: openai("gpt-4o"),
    messages: [
      {
        role: "system",
        content: `You are a professional translator. Translate the following text to authentic Chinese. Keep the translation natural and idiomatic while preserving the original meaning. The content is copied from a website, so it might contain extraneous texts. Please remove them and focus on delivering a coherent article.`,
      },
      {
        role: "user",
        content: text,
      },
    ],
  });

  return translatedText;
}
