"use client";

import { useFormStatus } from "react-dom";

export const RenderFromPending = ({
  pendingNode,
  notPendingNode,
}: {
  pendingNode: React.ReactNode;
  notPendingNode: React.ReactNode;
}) => {
  const { pending } = useFormStatus();
  return pending ? pendingNode : notPendingNode;
};
