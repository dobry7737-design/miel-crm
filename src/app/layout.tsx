import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClientOnlyToaster } from "@/components/ui/client-only-toaster";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "Ferme Agri Bio — Gestion commerciale",
  description:
    "Application de gestion pour la Ferme Agri Bio : tableau de bord, clients, commandes et rapports.",
  keywords: [
    "Ferme Agri Bio",
    "agriculture biologique",
    "CRM",
    "gestion commerciale",
    "ferme",
  ],
  authors: [{ name: "Ferme Agri Bio" }],
  icons: {
    icon: "/logo-miel.png",
  },
  openGraph: {
    title: "Ferme Agri Bio — Gestion commerciale",
    description: "Gestion clients, commandes et rapports pour la ferme en agriculture biologique.",
    type: "website",
    images: [{ url: "/logo-miel.png", alt: "Ferme Agri Bio" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ferme Agri Bio",
    description: "Gestion commerciale — agriculture biologique",
    images: ["/logo-miel.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  /* Hydratation :
     - next-themes : suppressHydrationWarning sur <html>/<body> (className thème).
     - Si la console signale un mismatch sur un <div hidden> avec l’attribut bis_skin_checked,
       c’est presque toujours une extension (Bitdefender, antivirus, etc.) qui modifie le DOM avant
       React — pas le code de l’app. Tester en navigation privée sans extensions ou exclure
       localhost de la protection navigateur. */
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground agribio-app-bg`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          {children}
          <ClientOnlyToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
