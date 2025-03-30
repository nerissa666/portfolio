import React from "react";

// Language selector component
export const LanguageSelector = React.memo(
  ({
    language,
    onLanguageChange,
  }: {
    language: "zh" | "en";
    onLanguageChange: (lang: "zh" | "en") => void;
  }) => (
    <div className="mb-3 flex items-center justify-end gap-2">
      <label
        htmlFor="language-select"
        className="text-sm text-gray-300 font-medium"
      >
        {language === "zh" ? "语言：" : "Language:"}
      </label>
      <select
        id="language-select"
        value={language}
        onChange={(e) => onLanguageChange(e.target.value as "zh" | "en")}
        className="text-sm px-3 py-1.5 rounded-md border border-gray-200
            focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none
            bg-white hover:border-blue-500 transition-colors text-gray-700
            cursor-pointer"
      >
        <option value="zh">中文</option>
        <option value="en">English</option>
      </select>
    </div>
  )
);

LanguageSelector.displayName = "LanguageSelector";
