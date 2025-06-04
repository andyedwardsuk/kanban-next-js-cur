"use client";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function AppLayout({
  children,
  title = "Team Kanban Board",
  subtitle = "Organize your team's tasks efficiently",
}: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="w-full px-[50px] pt-[50px] pb-4 flex flex-col min-h-screen">
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
