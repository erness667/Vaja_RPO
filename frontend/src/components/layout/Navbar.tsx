"use client";

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { HiSun, HiMoon } from "react-icons/hi2";
import { HiUser, HiUserAdd, HiPlus } from "react-icons/hi";

export function Navbar() {
  const { theme, systemTheme, resolvedTheme, setTheme } = useTheme();

  const currentTheme = resolvedTheme ?? (theme === "system" ? systemTheme : theme);
  const isDark = currentTheme === "dark";
  const nextTheme = isDark ? "light" : "dark";

  const toggleDarkMode = () => {
    setTheme(nextTheme ?? "light");
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            
            <Image
              src="/logo.png"
              alt="SUPERCARS Logo"
              width={200}
              height={70}
              className="h-16 w-auto object-contain"
              priority
            />
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-3">
            {/* Objavi oglas Button */}
            <Link
              href="/create"
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md transition-colors shadow-sm"
            >
              <HiPlus className="w-5 h-5" />
              Objavi oglas
            </Link>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <HiSun className="w-6 h-6" />
              ) : (
                <HiMoon className="w-6 h-6" />
              )}
            </button>

            {/* Login Button */}
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <HiUser className="w-5 h-5" />
              Login
            </Link>

            {/* Register Button */}
            <Link
              href="/register"
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md transition-colors shadow-sm"
            >
              <HiUserAdd className="w-5 h-5" />
              Register
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
