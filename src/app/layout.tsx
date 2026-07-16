import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "EduFlow Academy",
  description: "Découvrez EduFlow Academy en 3D : planning, salles et formations en un coup d'œil.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="font-sans text-slate-900 antialiased dark:text-slate-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
