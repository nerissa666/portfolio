"use client";

import {
  createContext,
  Suspense,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";
type CtxType = {
  ref: React.RefObject<HTMLFormElement | null>;
};

const Ctx = createContext<CtxType | null>(null);

export function CtxProvider({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLFormElement | null>(null);

  return <Ctx.Provider value={{ ref }}>{children}</Ctx.Provider>;
}

export function useCtxRef() {
  const context = useContext(Ctx);
  if (!context) {
    throw new Error("useCtxRef must be used within a CtxProvider");
  }
  return context.ref;
}

const ClearFormBase = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get("query");

  const ref = useCtxRef();

  useEffect(() => {
    if (query) {
      ref.current?.reset();
    }
  }, [query]);

  return null;
};

export const ClearForm = () => {
  return (
    <Suspense>
      <ClearFormBase />
    </Suspense>
  );
};
