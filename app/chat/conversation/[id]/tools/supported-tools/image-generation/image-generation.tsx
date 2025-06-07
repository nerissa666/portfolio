import { z } from "zod";
import type { ExecuteFunction } from "../tools";
import { openai } from "@ai-sdk/openai";
import { experimental_generateImage as generateImage } from "ai";

// Parameter Schema
const paramsSchema = z.object({
  prompt: z
    .string()
    .min(1)
    .max(1000)
    .describe("The description of the image to generate"),
});

export type ParamsType = z.infer<typeof paramsSchema>;

// Tool Specifications
export const specs = {
  description:
    "Generate an image using OpenAI's DALL-E model based on a text prompt",
  parameters: paramsSchema,
};

// Execute Function
export const execute: ExecuteFunction<ParamsType> = async ({
  args,
  completeToolCallRsc,
}) => {
  const { prompt } = args;

  try {
    const { image } = await generateImage({
      model: openai.image("dall-e-2"),
      prompt,
      size: "512x512",
    });

    if (!image) {
      throw new Error("No image returned from OpenAI");
    }

    // Store the result in the database
    const node = await completeToolCallRsc(true);

    return (
      <div className="p-4 border rounded-md bg-white shadow-md">
        <div className="space-y-4">
          <p className="text-gray-700">
            Generated image based on prompt: &ldquo;{prompt}&rdquo;
          </p>

          <img src={`data:image/png;base64,${image.base64}`} alt={prompt} />
        </div>
        {node}
      </div>
    );
  } catch (error) {
    console.error("Error generating image:", error);
    return (
      <div className="p-4 border rounded-md bg-red-50 text-red-700">
        <p>Failed to generate image. Please try again.</p>
      </div>
    );
  }
};
