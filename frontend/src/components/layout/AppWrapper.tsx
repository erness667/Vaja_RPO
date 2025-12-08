"use client";

import { Navbar } from "./Navbar";
import { useColorMode } from "@/components/ui/color-mode";

export function AppWrapper({ children }: { children: React.ReactNode }) {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  
  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: isDark ? "#111827" : "#f5f5f5",
      color: isDark ? "#f3f4f6" : "#111827",
      transition: "background-color 0.3s ease, color 0.3s ease",
    }}>
      <Navbar />
      <main style={{ width: "100%", position: "relative" }}>
        {children}
      </main>
    </div>
  );
}

