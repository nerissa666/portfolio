import { getNotesById } from "@/app/db/redis";
import { notFound } from "next/navigation";
import { MarkdownParser } from "../../conversation/[id]/markdown-parser";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function NotesPage({ params }: PageProps) {
  const { id } = await params;
  const notes = await getNotesById(id);

  if (!notes) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <MarkdownParser content={notes.markdown} />
    </div>
  );
}
