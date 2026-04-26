"use client";

import { APP_NAME, NETWORK_LABEL } from "@/lib/constants";

interface NavbarProps {
  isConnected: boolean;
  onToggleTheme: () => void;
  isDarkMode: boolean;
}

export default function Navbar({ isConnected, onToggleTheme, isDarkMode }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/50 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-cyan-400/20 p-2 ring-1 ring-cyan-300/35">
            <div className="h-full w-full rounded bg-cyan-300/80" />
          </div>
          <div>
            <p className="font-semibold tracking-wide text-white">{APP_NAME}</p>
            <p className="text-xs text-slate-300">Stellar White Belt Challenge</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full border border-cyan-300/30 bg-cyan-500/15 px-3 py-1 text-xs font-medium text-cyan-100">
            {NETWORK_LABEL}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              isConnected ? "bg-emerald-500/20 text-emerald-200" : "bg-rose-500/20 text-rose-200"
            }`}
          >
            {isConnected ? "Wallet Connected" : "Disconnected"}
          </span>
          <button
            type="button"
            className="rounded-full border border-slate-500/45 px-3 py-1 text-xs text-slate-100 transition hover:border-cyan-300/45 hover:text-cyan-100"
            onClick={onToggleTheme}
          >
            {isDarkMode ? "Light" : "Dark"}
          </button>
        </div>
      </div>
    </header>
  );
}
