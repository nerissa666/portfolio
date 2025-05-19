import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import "highlight.js/styles/github.css";
import "katex/dist/katex.min.css";

interface MarkdownParserProps {
  content: string;
  className?: string;
}

export const MarkdownParser = ({
  content,
  className = "",
}: MarkdownParserProps) => {
  // Convert \[...\] to $$...$$ for display math and \(...\) to $...$ for inline math
  const preprocessedContent = content
    .replace(/\\\[([\s\S]*?)\\\]/g, "$$$$$1$$$$")
    .replace(/\\\(([\s\S]*?)\\\)/g, "$$$1$$");

  const result = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeKatex)
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .processSync(preprocessedContent);

  console.log({
    before: content,
    preprocessed: preprocessedContent,
    after: result,
  });

  return (
    <div
      className={`prose prose-slate max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: String(result) }}
    />
  );
};
