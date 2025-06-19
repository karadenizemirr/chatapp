import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";

import { compare } from "bcrypt";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

/**
 * Kimlik doğrulama seçenekleri
 */
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login", // Özel giriş sayfası
    signOut: "/auth/logout",
    error: "/auth/error",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials) {
        // Kullanıcı giriş bilgilerini doğrulama
        const parsedCredentials = z
          .object({
            email: z.string().email(),
            password: z.string().min(6),
          })
          .safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const { email, password } = parsedCredentials.data;

        // Kullanıcıyı veritabanında bul
        const user:any = await prisma.user.findUnique({
          where: { email },
        });
        

        // if (!user || !user.passwordHash) {
        //   return null;
        // }

        // Şifreyi doğrula
        //const isValid = await compare(password, user.passwordHash);
        // const isValid = true;
        // if (!isValid) {
        //   return null;
        // }

        // // Kullanıcı aktif değilse veya banlanmışsa giriş yapamaz
        // if (!user.isActive || user.isBanned) {
        //   return null;
        // }

        // Son etkinlik zamanını güncelle
        // await prisma.user.update({
        //   where: { id: user.id },
        //   data: { lastActiveAt: new Date() },
        // });

        // // Kullanıcı aktivite logunu kaydet
        // await prisma.userActivityLog.create({
        //   data: {
        //     userId: user.id,
        //     activityType: "LOGIN",
        //     ipAddress: "", // Request içinden alınabilir
        //     userAgent: "", // Request içinden alınabilir
        //   },
        // });

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          image: user.image,
          isAdmin: user.isAdmin,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin || false;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.isAdmin = token.isAdmin as boolean;
      }
      
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      // Kullanıcı giriş yaptığında son etkinlik zamanını güncelle
      if (user.id) {
        await prisma.user.update({
          where: { id: user.id },
          data: { lastActiveAt: new Date() },
        });
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

/**
 * Geçerli oturumu almak için yardımcı fonksiyon
 */
export const getAuthSession = () => getServerSession(authOptions);

/**
 * NextAuth için tip genişletmeleri
 */
declare module "next-auth" {
  interface User {
    isAdmin: boolean;
    firstName?: string;
    lastName?: string;
  }

  interface Session {
    user: User & {
      id: string;
      isAdmin: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    isAdmin: boolean;
  }
}