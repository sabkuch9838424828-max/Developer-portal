import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "NEXORA | AI-Powered Developer Recruitment & Talent Discovery",
  description:
    "Where Technical Talent Meets the Right Opportunity. AI-powered recruitment matching engine connecting developers, student teams, and tech companies with explainable skills-based matching.",
  keywords: [
    "developer recruitment",
    "technical talent discovery",
    "AI job matching",
    "developer portfolio",
    "student tech teams",
    "skill ontology",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#080c14] text-slate-900 dark:text-slate-100 antialiased selection:bg-blue-500 selection:text-white">
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1 w-full">{children}</main>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
