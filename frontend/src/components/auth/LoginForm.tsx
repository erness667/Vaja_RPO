"use client";

import { PageShell } from "@/components/layout/PageShell";
import { useColorMode } from "@/components/ui/color-mode";

export function LoginForm() {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  
  const textColor = isDark ? "#f1f5f9" : "#1f2937";
  const labelColor = isDark ? "#cbd5e1" : "#4b5563";
  const inputBg = isDark ? "rgba(15, 23, 42, 0.6)" : "#ffffff";
  const inputBorder = isDark ? "#475569" : "#d1d5db";
  const inputText = isDark ? "#f1f5f9" : "#111827";
  const placeholderColor = isDark ? "#64748b" : "#9ca3af";
  const buttonBg = "#2563eb";
  const buttonHover = "#1d4ed8";

  return (
    <PageShell>
      <div style={{ marginBottom: "32px", textAlign: "center" }}>
        <h1 style={{
          fontSize: "30px",
          fontWeight: "600",
          letterSpacing: "-0.025em",
          color: textColor,
          marginBottom: "8px",
        }}>
          Sign in
        </h1>
        <p style={{
          marginTop: "8px",
          fontSize: "14px",
          color: isDark ? "#94a3b8" : "#6b7280",
        }}>
          Enter your credentials to access your account.
        </p>
      </div>

      <form style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label
            htmlFor="username"
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "500",
              color: labelColor,
            }}
          >
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            style={{
              display: "block",
              width: "100%",
              borderRadius: "8px",
              border: `1px solid ${inputBorder}`,
              backgroundColor: inputBg,
              padding: "8px 12px",
              fontSize: "14px",
              color: inputText,
              outline: "none",
            }}
            placeholder="Enter your username"
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#2563eb";
              e.currentTarget.style.boxShadow = "0 0 0 2px rgba(37, 99, 235, 0.2)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = inputBorder;
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label
            htmlFor="password"
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "500",
              color: labelColor,
            }}
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            style={{
              display: "block",
              width: "100%",
              borderRadius: "8px",
              border: `1px solid ${inputBorder}`,
              backgroundColor: inputBg,
              padding: "8px 12px",
              fontSize: "14px",
              color: inputText,
              outline: "none",
            }}
            placeholder="Enter your password"
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#2563eb";
              e.currentTarget.style.boxShadow = "0 0 0 2px rgba(37, 99, 235, 0.2)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = inputBorder;
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            marginTop: "16px",
            display: "inline-flex",
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "8px",
            backgroundColor: buttonBg,
            padding: "10px 16px",
            fontSize: "14px",
            fontWeight: "600",
            color: "white",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 6px rgba(37, 99, 235, 0.3)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = buttonHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = buttonBg;
          }}
          onFocus={(e) => {
            e.currentTarget.style.outline = "2px solid #2563eb";
            e.currentTarget.style.outlineOffset = "2px";
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = "none";
          }}
        >
          Login
        </button>
      </form>
    </PageShell>
  );
}

