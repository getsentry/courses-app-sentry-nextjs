import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getServerSession } from "next-auth";
import { auth } from "@/auth";
import { Navbar } from "@/components/Navbar";
import { Providers as AuthProvider } from "@/components/Providers";
import { Session } from "next-auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Course Management System",
  description: "Create and view courses",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = (await getServerSession(auth)) as Session | null;

  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider session={session}>
          {session?.user && <Navbar user={session.user} />}
          <div className="min-h-screen bg-gray-50">
            <div className="pt-16">
              {children}
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
