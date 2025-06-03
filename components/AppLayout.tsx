"use client";

import { Header } from "@/components/Header";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function AppLayout({
  children,
  title = "Team Kanban Board",
}: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto p-4">
        <Header title={title} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
