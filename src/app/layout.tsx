import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";

const inter = Inter({ subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Transaction Analytics",
  description: "Transaction analytics dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} ${jetbrainsMono.className} font-mono`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
