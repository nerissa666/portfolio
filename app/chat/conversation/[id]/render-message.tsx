import { MarkdownParser } from "./markdown-parser";

export const UserMessageWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="mb-12 pb-8 border-b border-gray-100 last:border-b-0 last:mb-0 last:pb-0">
      <div className="text-sm font-medium text-gray-500 mb-3">You</div>
      <div className="prose prose-gray max-w-none">
        <div className="whitespace-pre-line max-w-none text-gray-800">
          {children}
        </div>
      </div>
    </div>
  );
};

export const ToolCallWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="mb-12 pb-8 border-b border-gray-100 last:border-b-0 last:mb-0 last:pb-0">
      <div className="pl-4 border-l-4 border-amber-300">
        <div className="flex items-center mb-3 text-xs text-amber-700 font-medium">
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          Tool Call
        </div>
        <div className="prose prose-amber max-w-none text-gray-800">
          {children}
        </div>
      </div>
    </div>
  );
};

// export const NoParseToMarkdown = async ({
//   block,
//   "data-message-id": messageId,
// }: {
//   block: string;
//   "data-message-id"?: string;
// }) => {
//   return (
//     <>
//       <div
//         data-message-id={messageId}
//         className="animate-fade-in motion-safe:animate-fadeIn max-w-none whitespace-pre-wrap"
//       >
//         {block}
//       </div>
//     </>
//   );
// };

export const ParseToMarkdown = async ({
  block,
  "data-message-id": messageId,
}: {
  block: string;
  "data-message-id"?: string;
}) => {
  return (
    <div
      data-message-id={messageId}
      className="animate-fade-in motion-safe:animate-fadeIn max-w-none"
    >
      <MarkdownParser content={block} />
    </div>
  );
};
