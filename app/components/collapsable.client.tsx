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
    <div className="mb-2">
      <button
        onClick={toggleCollapse}
        className="w-full flex items-center gap-2 p-2 text-left text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="h-3 w-3 text-gray-400 flex-shrink-0" />
        )}
        <span
          className={`text-sm font-medium border-b border-dotted border-gray-300 ${
            isCollapsed ? "italic" : ""
          }`}
        >
          {title}
        </span>
      </button>
      {!isCollapsed && (
        <div className="pl-5 py-2 text-sm text-gray-600">{children}</div>
      )}
    </div>
  );
}
