import { MarkdownParser } from "./markdown-parser";

export const UserMessageWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="mb-4 pb-2">
      <div className="border-l-2 border-gray-200 pl-4">
        <div className="text-xs font-medium text-gray-500 mb-1.5">User</div>
        <div className="prose prose-gray max-w-none">
          <div className="whitespace-pre-line max-w-none text-gray-800">
            {children}
          </div>
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
    <div className="mb-4 pb-2">
      <div className="pl-4 border-l-4 border-amber-300">
        <div className="flex items-center mb-3 text-xs text-amber-700 font-medium">
          Tool
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
