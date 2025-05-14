import FullHeightContainer from "@/app/components/full-height-container";

export default function ChatLayout({
  children,
  sidebar,
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  return (
    <FullHeightContainer offset={60} className="overflow-y-hidden flex">
      {sidebar}
      <div className="flex-1">{children}</div>
    </FullHeightContainer>
  );
}
