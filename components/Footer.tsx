"use client";

import Link from "next/link";
import { useState } from "react";

export function Footer() {
  const [isGlowing, setIsGlowing] = useState(false);

  return (
    <footer className="py-3 mt-auto -mb-[10px]">
      <div className="text-xs text-muted-foreground text-center">
        <Link
          href="mailto:andy@andyedwards.uk"
          className={`px-1 rounded transition-all duration-300 ${
            isGlowing ? "golden-glow-animation" : ""
          }`}
          onMouseEnter={() => setIsGlowing(true)}
          onMouseLeave={() => setIsGlowing(false)}
        >
          Copyright &copy; 2025 Pineapple Logic. All rights reserved.
        </Link>
      </div>
    </footer>
  );
}
