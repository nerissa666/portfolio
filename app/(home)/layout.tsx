import { ThemeProvider } from "next-themes";
import { Header } from "./header";

import { Menu } from "./menu";
import { ThemeToggleHeader } from "@/components/ui/theme-toggle-header";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ThemeToggleHeader />

      <div className="absolute top-0 left-0 w-full">
        <Header />
      </div>

      <div className="flex justify-center items-center min-h-screen font-mono">
        {children}
      </div>

      <Menu />
    </ThemeProvider>
  );
}
