import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import rehypeHighlight from "rehype-highlight";
import React from "react";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github.css";
import "../markdown.css";

// Markdown component with memoization since it's pure
export const MarkdownContent = React.memo(
  ({ content }: { content: string }) => {
    const processedContent = content
      .replace(/\\\(/g, "$$")
      .replace(/\\\)/g, "$$")
      .replace(/\\\[/g, "$$")
      .replace(/\\\]/g, "$$");

    return (
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeHighlight]}
        className="markdown"
      >
        {processedContent}
      </ReactMarkdown>
    );
  }
);
