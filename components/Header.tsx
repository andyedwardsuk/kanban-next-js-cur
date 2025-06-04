"use client";

import { ModeToggle } from "@/components/mode-toggle";
import Image from "next/image";
import Link from "next/link";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({
  title,
  subtitle = "Organize your team's tasks efficiently",
}: HeaderProps) {
  return (
    <header className="flex justify-between items-start mb-8">
      <div className="flex items-center">
        <div className="h-[50px] w-auto relative flex-shrink-0 -mt-[80px] pr-2">
          <div className="absolute inset-0 rounded-full bg-orange-200/20 blur-sm scale-125"></div>
          <Image
            src="/PineappleLogic_Logo.svg"
            alt="Pineapple Logic Logo"
            width={50}
            height={50}
            className="object-contain relative z-10 filter brightness-90 contrast-90"
          />
        </div>
        <div className="ml-[70px]">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <h1 className="text-4xl font-bold">{title}</h1>
          </Link>
          {subtitle && (
            <p className="text-lg text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="flex items-center -mt-[25px]">
        <ModeToggle />
      </div>
    </header>
  );
}
