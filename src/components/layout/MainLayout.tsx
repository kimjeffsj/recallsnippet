import type { ReactNode } from "react";
import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";
import { SettingsDialog } from "@/components/settings/SettingsDialog";
import { useAppState, useAppDispatch } from "@/contexts/AppContext";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { settingsOpen } = useAppState();
  const dispatch = useAppDispatch();

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <AppHeader />
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={(open) =>
          dispatch({ type: "SET_SETTINGS_OPEN", open })
        }
      />
    </div>
  );
}
