"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface CollapsableProps {
  title: string;
  children: React.ReactNode;
  defaultCollapsed?: boolean;
}

export default function Collapsable({
  title,
  children,
  defaultCollapsed = true,
}: CollapsableProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <button
        onClick={toggleCollapse}
        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <span className="font-medium">{title}</span>
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>
      {!isCollapsed && <div className="p-3 border-t">{children}</div>}
    </div>
  );
}
