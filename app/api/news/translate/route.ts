import { NextResponse } from "next/server";
import { translateSingleStory } from "@/app/news/admin2/actions";

export async function POST(request: Request) {
  try {
    const { storyId } = await request.json();

    if (typeof storyId !== "number") {
      return NextResponse.json({ error: "Invalid story ID" }, { status: 400 });
    }

    await translateSingleStory(storyId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json(
      { error: "Failed to translate story" },
      { status: 500 }
    );
  }
}
