import "./globals.css";
import { TRPCProvider } from "@/lib/trpc/Provider";
import { SessionProvider } from "@/components/SessionProvider";
import { getAuthSession } from "@/auth";
import {Toaster} from "sonner";
import {Poppins} from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
})

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
      <body className={poppins.className}>
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
