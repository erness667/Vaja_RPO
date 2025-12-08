"use client";

import Image from "next/image";
import Link from "next/link";
import { HiUser, HiUserAdd, HiPlus, HiSun, HiMoon } from "react-icons/hi";
import { useColorMode } from "@/components/ui/color-mode";

export function Navbar() {
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === "dark";

  return (
    <nav style={{
      backgroundColor: isDark ? "#111827" : "white",
      borderBottom: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    }}>
      <div style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "0 1rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        height: "80px",
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center" }}>
          <Image
            src="/logo.png"
            alt="SUPERCARS Logo"
            width={200}
            height={70}
            style={{ height: "4rem", width: "auto", objectFit: "contain" }}
            priority
          />
        </Link>

        {/* Navigation Links */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Link
            href="/create"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              backgroundColor: "#2563eb",
              color: "white",
              borderRadius: "6px",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            <HiPlus style={{ width: "20px", height: "20px" }} />
            Objavi oglas
          </Link>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleColorMode}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px",
              backgroundColor: "transparent",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              color: isDark ? "#f3f4f6" : "#374151",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDark ? "#374151" : "#f3f4f6";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <HiSun style={{ width: "20px", height: "20px" }} />
            ) : (
              <HiMoon style={{ width: "20px", height: "20px" }} />
            )}
          </button>

          <Link
            href="/login"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              color: isDark ? "#f3f4f6" : "#374151",
              borderRadius: "6px",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            <HiUser style={{ width: "20px", height: "20px" }} />
            Login
          </Link>

          <Link
            href="/register"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              backgroundColor: "#2563eb",
              color: "white",
              borderRadius: "6px",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            <HiUserAdd style={{ width: "20px", height: "20px" }} />
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
}
