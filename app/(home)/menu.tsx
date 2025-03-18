"use client";

import { unstable_ViewTransition as ViewTransition } from "react";

import Link from "next/link";
import { useSelectedPage } from "./use-selected-page";
export function Menu() {
  return (
    <div className="fixed bottom-8 right-8 text-center">
      {[
        { href: "/", label: "home" },
        { href: "/work", label: "work" },
        { href: "/article", label: "article" },
        { href: "/app", label: "app" },
      ].map((link, index) => (
        <HeroLink key={index} link={link} />
      ))}
    </div>
  );
}

const HeroLink = ({ link }: { link: { href: string; label: string } }) => {
  const selectedPage = useSelectedPage();

  if (selectedPage === link.label) {
    return null;
  }

  return (
    <ViewTransition name={link.label}>
      <Link
        href={link.href}
        className="block relative overflow-hidden group py-1 uppercase font-bold tracking-tight w-[80px]"
      >
        <span className="relative z-10 transition-colors duration-200 group-hover:text-white dark:group-hover:text-black">
          {link.label}
        </span>
        <span className="absolute inset-0 w-0 bg-black dark:bg-white transition-all duration-200 ease-out group-hover:w-full" />
      </Link>
    </ViewTransition>
  );
};
