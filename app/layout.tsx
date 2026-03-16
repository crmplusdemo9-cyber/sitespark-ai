import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "SiteSpark AI — Build Your Website in 30 Seconds",
  description:
    "AI-powered one-page website builder. Describe your business, get a stunning site instantly. Free to start, custom domains from $8/yr.",
  keywords: ["website builder", "AI", "one-page", "portfolio", "landing page"],
  openGraph: {
    title: "SiteSpark AI — Build Your Website in 30 Seconds",
    description: "AI-powered one-page website builder. Describe your business, get a stunning site instantly.",
    type: "website",
    url: "https://sitespark.dev",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "SiteSpark AI — Build Your Website in 30 Seconds",
    description: "AI-powered one-page website builder.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="antialiased">
      <body className="min-h-screen bg-white text-gray-900">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: "12px",
              background: "#1a1a2e",
              color: "#fff",
              fontSize: "14px",
            },
          }}
        />
      </body>
    </html>
  );
}
