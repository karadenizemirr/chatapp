import { router } from "../trpc";
import { userRouter } from "./user";
import { messageRouter } from "./message";
import { giftRouter } from "./gift";
import { authRouter } from "./auth";
import { premiumRouter } from "./premium";
import { coinsRouter } from "./coins";
import { locationRouter } from "./location";
import { notificationsRouter } from "./notifications";
import { analyticsRouter } from "./analytics";

/**
 * Ana tRPC yönlendiricisi
 */
export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  message: messageRouter,
  gift: giftRouter,
  premium: premiumRouter,
  coins: coinsRouter,
  location: locationRouter,
  notifications: notificationsRouter,
  analytics: analyticsRouter,
});

// Uygulama yönlendiricisinin tipi
export type AppRouter = typeof appRouter;