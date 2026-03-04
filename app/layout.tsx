import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/Navigation";

export const metadata: Metadata = {
  title: "meetMIT — Real connections, agentic precision",
  description:
    "AI-powered affinity matching that turns free moments into meaningful in-person meets for campus communities.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <Navigation />
        <main className="min-h-screen">{children}</main>
        <footer className="border-t border-white/10 py-8 text-center text-night-400 text-sm">
          <p>
            meetMIT &mdash; crafting legends, not filling calendars.
          </p>
        </footer>
      </body>
    </html>
  );
}
