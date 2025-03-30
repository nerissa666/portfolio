import { ReactNode } from "react";

export const ChatLayout = ({
  messages,
  control,
}: {
  messages: ReactNode;
  control: ReactNode;
}) => {
  return (
    <div className="fixed inset-0 flex flex-col bg-gray-950">
      <div className="flex-1 overflow-hidden">
        <div className="h-full mx-auto w-full max-w-3xl">
          <div className="h-full overflow-y-auto p-4 pb-[50vh] text-gray-100">
            {messages}
          </div>
        </div>
      </div>

      <div className="p-4 bg-gray-950 border-t border-gray-800 fixed bottom-0 left-0 right-0">
        <div className="mx-auto w-full max-w-3xl">{control}</div>
      </div>
    </div>
  );
};
