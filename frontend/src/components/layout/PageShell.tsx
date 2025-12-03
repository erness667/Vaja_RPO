import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
  maxWidthClass?: string;
};

export function PageShell({
  children,
  maxWidthClass = "max-w-md",
}: PageShellProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 px-4 py-8">
      <div
        className={`w-full ${maxWidthClass} rounded-2xl bg-slate-900/80 border border-slate-700/60 shadow-2xl shadow-slate-900/60 backdrop-blur-xl p-8 max-h-[90vh] overflow-y-auto`}
      >
        {children}
      </div>
    </div>
  );
}


