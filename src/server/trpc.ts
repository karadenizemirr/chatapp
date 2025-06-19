import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/auth";
import type { NextRequest } from "next/server";
import type { Session } from "next-auth";

/**
 * tRPC için context tipini tanımlama
 */
export async function createTRPCContext({
  req,
  auth,
}: {
  req: NextRequest | null;
  auth?: Session | null;
}) {
  // Oturum bilgisini al
  const session = auth ?? (await getServerSession(authOptions));

  return {
    prisma,
    session,
    req,
  };
}

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

/**
 * tRPC API'sini başlatma
 */
const t = initTRPC.context<TRPCContext>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * tRPC API için reusable builder'lar
 */
export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Protected procedure - yalnızca oturum açmış kullanıcılar tarafından erişilebilir
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ 
      code: "UNAUTHORIZED",
      message: "Bu işlem için giriş yapmanız gerekmektedir" 
    });
  }
  
  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

/**
 * Admin procedure - yalnızca admin kullanıcılar tarafından erişilebilir
 */
export const adminProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user?.isAdmin) {
    throw new TRPCError({ 
      code: "FORBIDDEN",
      message: "Bu işlem için admin yetkisi gerekmektedir" 
    });
  }
  
  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});