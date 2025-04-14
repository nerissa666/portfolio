"use client";

import { useLayoutEffect } from "react";

export const DeleteAllNodesWithMessageId = ({
  messageId,
}: {
  messageId: string;
}) => {
  useLayoutEffect(() => {
    const nodes = document.querySelectorAll(`[data-message-id="${messageId}"]`);
    nodes.forEach((node) => node.remove());
  }, [messageId]);
  return null;
};
