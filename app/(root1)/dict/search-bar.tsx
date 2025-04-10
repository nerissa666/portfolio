"use client";

import { DICT_HOME } from "./consts";
import Form from "next/form";
import { useCtxRef } from "./Ctx";

export const SearchBar = () => {
  const ref = useCtxRef();
  return (
    <Form action={DICT_HOME} className="mb-4 sm:mb-6" ref={ref}>
      <div className="flex gap-2">
        <input
          autoFocus
          type="text"
          name="query"
          placeholder="Look up a word/phrase..."
          className="flex-1 rounded-lg border border-gray-300 px-4 sm:px-6 py-2 sm:py-3 bg-white text-gray-800 placeholder-gray-500 shadow-sm transition-all duration-200 hover:border-gray-400 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none font-serif text-base sm:text-lg"
        />
      </div>
    </Form>
  );
};
