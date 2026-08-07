import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AAM — Assistances Assurances Mali",
  description: "Plateforme de courtage en assurances — Comparateur de devis, Dashboards multi-profils et Back-office.",
  keywords: ["AAM", "assurance", "courtage", "comparateur", "Mali", "CIMA", "devis", "sinistres"],
  authors: [{ name: "AAM" }],
  icons: {
    icon: "/logo-aam.jpg",
    apple: "/logo-aam.jpg",
  },
  openGraph: {
    title: "AAM — Assistances Assurances Mali",
    description: "Assurance, simplifiée. Comparez les offres de 11 compagnies agréées CIMA.",
    siteName: "AAM",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AAM — Assistances Assurances Mali",
    description: "Assurance, simplifiée.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
            <Toaster />
            <SonnerToaster position="bottom-right" richColors closeButton />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
