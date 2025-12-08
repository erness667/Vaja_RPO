"use client";

import { PageShell } from "@/components/layout/PageShell";
import { useColorMode } from "@/components/ui/color-mode";

export function RegisterForm() {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  
  const textColor = isDark ? "#f1f5f9" : "#1f2937";
  const labelColor = isDark ? "#cbd5e1" : "#4b5563";
  const inputBg = isDark ? "rgba(15, 23, 42, 0.6)" : "#ffffff";
  const inputBorder = isDark ? "#475569" : "#d1d5db";
  const inputText = isDark ? "#f1f5f9" : "#111827";
  const buttonBg = "#2563eb";
  const buttonHover = "#1d4ed8";

  const inputStyle = {
    display: "block" as const,
    width: "100%",
    borderRadius: "8px",
    border: `1px solid ${inputBorder}`,
    backgroundColor: inputBg,
    padding: "8px 12px",
    fontSize: "14px",
    color: inputText,
    outline: "none",
  };

  const labelStyle = {
    display: "block" as const,
    fontSize: "14px",
    fontWeight: "500" as const,
    color: labelColor,
  };

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
          Create account
        </h1>
        <p style={{
          marginTop: "8px",
          fontSize: "14px",
          color: isDark ? "#94a3b8" : "#6b7280",
        }}>
          Sign up with a username and password to get started.
        </p>
      </div>

      <form style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label htmlFor="name" style={labelStyle}>
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="given-name"
            required
            style={inputStyle}
            placeholder="Enter your name"
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
          <label htmlFor="surname" style={labelStyle}>
            Surname
          </label>
          <input
            id="surname"
            name="surname"
            type="text"
            autoComplete="family-name"
            required
            style={inputStyle}
            placeholder="Enter your surname"
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
          <label htmlFor="email" style={labelStyle}>
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            style={inputStyle}
            placeholder="Enter your email"
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
          <label htmlFor="phone" style={labelStyle}>
            Phone Number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            style={inputStyle}
            placeholder="Enter your phone number"
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
          <label htmlFor="username" style={labelStyle}>
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            style={inputStyle}
            placeholder="Choose a username"
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
          <label htmlFor="password" style={labelStyle}>
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            style={inputStyle}
            placeholder="Create a password"
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
          Register
        </button>
      </form>
    </PageShell>
  );
}
