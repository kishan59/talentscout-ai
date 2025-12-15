import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from "next/font/google";
import "./globals.css";
import ServerAwake from "@/components/ServerAwake";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "TalentScout AI",
  description: "Cyberpunk ATS System",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} bg-cyber-black text-white antialiased`}>
          <ServerAwake />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}