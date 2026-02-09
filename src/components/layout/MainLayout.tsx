import type { ReactNode } from "react";

interface MainLayoutProps {
  sidebar?: ReactNode;
  children: ReactNode;
}

export function MainLayout({ sidebar, children }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-background text-foreground">
      {sidebar && (
        <aside className="w-64 border-r border-border flex-shrink-0 overflow-y-auto p-4">
          {sidebar}
        </aside>
      )}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
