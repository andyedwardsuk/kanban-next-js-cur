"use client";

import { ModeToggle } from "@/components/mode-toggle";
import Link from "next/link";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="flex justify-between items-center mb-6">
      <Link href="/" className="hover:opacity-80 transition-opacity">
        <h1 className="text-3xl font-bold">{title}</h1>
      </Link>
      <div className="flex items-center gap-4">
        <ModeToggle />
      </div>
    </header>
  );
}
