import "./globals.css";
import { Inter } from "next/font/google";
import { TRPCProvider } from "@/lib/trpc/Provider";
import { SessionProvider } from "@/components/SessionProvider";
import { getAuthSession } from "@/auth";
import {Toaster} from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Chat App",
  description: "Modern dating application",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();
  
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider session={session}>
          <TRPCProvider>
            <Toaster />
              {children}
          </TRPCProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
