import React from "react";
import { Message } from "./message";
import { IMessage } from "../_types/message-type";

interface RenderMessagesProps {
  messages: IMessage[];
  language: "zh" | "en";
}

export const RenderMessages: React.FC<RenderMessagesProps> = ({
  messages,
  language,
}) => {
  return (
    <>
      {messages.map((message, index) => (
        <Message key={index} message={message} language={language} />
      ))}
      <div className="h-12" />
    </>
  );
};
