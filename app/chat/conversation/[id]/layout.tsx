export default function ChatLayout({
  children,
  sidebar,
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      {sidebar}
      <div className="flex-1">{children}</div>
    </div>
  );
}
