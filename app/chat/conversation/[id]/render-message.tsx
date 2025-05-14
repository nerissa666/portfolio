import { marked } from "marked";

export const UserMessageWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="flex items-start mb-4">
      <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 mr-3 flex items-center justify-center text-sm font-semibold">
        U
      </div>
      <div className="max-w-[85%] bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
        <div className="whitespace-pre-line">{children}</div>
      </div>
    </div>
  );
};

export const AssistantMessageWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="flex items-start mb-4">
      <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex-shrink-0 mr-3 flex items-center justify-center text-sm font-semibold">
        AI
      </div>
      <div className="max-w-[85%] bg-blue-50 p-3 rounded-lg shadow-sm border-l-4 border-blue-300 hover:shadow-md transition-shadow duration-200">
        <div className="prose">{children}</div>
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
    <div className="flex items-start mb-4 pl-11">
      <div className="max-w-[85%] bg-amber-50 p-3 rounded-lg shadow-sm border-l-4 border-amber-300 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center mb-1 text-xs text-amber-700 font-medium">
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
        <div className="prose">{children}</div>
      </div>
    </div>
  );
};

export const ParseToMarkdown = async ({
  block,
  "data-message-id": messageId,
}: {
  block: string;
  "data-message-id"?: string;
}) => {
  const html = await marked(block);

  return (
    <>
      <div
        data-message-id={messageId}
        className="animate-fade-in motion-safe:animate-fadeIn"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  );
};
