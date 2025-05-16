export default function ChatLayout({
  children,
  sidebar,
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  return (
    <>
      {sidebar}
      <div className="flex-1">{children}</div>
    </>
  );
}
