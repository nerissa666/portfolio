import { Header } from "./header";
import { Menu } from "./menu";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="absolute top-0 left-0 w-full">
        <Header />
      </div>

      <div className="flex justify-center items-center min-h-screen font-mono">
        {children}
      </div>

      <Menu />
    </div>
  );
}
