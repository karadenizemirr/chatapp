import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/routers/_app";
import { createTRPCContext } from "@/server/trpc";
import { getAuthSession } from "@/auth";

const handler = async (req: Request) => {
  // Auth session'ı al
  const session = await getAuthSession();
  
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ 
      req: req as any, 
      auth: session
    }),
  });
};

export { handler as GET, handler as POST };