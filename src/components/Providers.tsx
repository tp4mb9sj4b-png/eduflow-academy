"use client";

import { SessionProvider } from "next-auth/react";
import { SWRConfig } from "swr";
import { ThemeProvider } from "./ThemeProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <SWRConfig value={{ revalidateOnFocus: true, dedupingInterval: 3000 }}>{children}</SWRConfig>
      </ThemeProvider>
    </SessionProvider>
  );
}
