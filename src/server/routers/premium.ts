import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { DurationType } from "@prisma/client";

/**
 * Premium paket yönlendiricisi
 */
export const premiumRouter = router({
  // Tüm premium paketleri getir
  getAll: publicProcedure.query(async ({ ctx }) => {
    const packages = await ctx.prisma.premiumPackage.findMany({
      orderBy: { displayOrder: "asc" },
    });

    return {
      packages: packages.map(pkg => ({
        ...pkg,
        createdAt: pkg.createdAt.toISOString(),
        updatedAt: pkg.updatedAt.toISOString(),
      }))
    };
  }),

  // Premium paket oluştur
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().optional(),
        durationType: z.nativeEnum(DurationType),
        durationValue: z.number().min(1),
        price: z.number().min(0),
        currency: z.string().default("TRY"),
        features: z.array(z.string()),
        imagePath: z.string().optional(),
        sku: z.string().optional(),
        displayOrder: z.number().default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const coinPackage = await ctx.prisma.premiumPackage.create({
        data: input,
      });

      return {
        ...coinPackage,
        createdAt: coinPackage.createdAt.toISOString(),
        updatedAt: coinPackage.updatedAt.toISOString(),
      };
    }),

  // Premium paket güncelle
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
        durationType: z.nativeEnum(DurationType).optional(),
        durationValue: z.number().min(1).optional(),
        price: z.number().min(0).optional(),
        currency: z.string().optional(),
        features: z.array(z.string()).optional(),
        imagePath: z.string().optional(),
        sku: z.string().optional(),
        isActive: z.boolean().optional(),
        displayOrder: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const existingPackage = await ctx.prisma.premiumPackage.findUnique({
        where: { id },
      });

      if (!existingPackage) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Premium paket bulunamadı",
        });
      }

      const updatedPackage = await ctx.prisma.premiumPackage.update({
        where: { id },
        data,
      });

      return {
        ...updatedPackage,
        createdAt: updatedPackage.createdAt.toISOString(),
        updatedAt: updatedPackage.updatedAt.toISOString(),
      };
    }),

  // Premium paket sil
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existingPackage = await ctx.prisma.premiumPackage.findUnique({
        where: { id: input.id },
      });

      if (!existingPackage) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Premium paket bulunamadı",
        });
      }

      // Aktif abonelikleri kontrol et
      const activeSubscriptions = await ctx.prisma.userPremiumSubscription.count({
        where: {
          packageId: input.id,
          isActive: true,
        },
      });

      if (activeSubscriptions > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Bu pakete ait aktif abonelikler bulunmaktadır. Önce abonelikleri iptal edin.",
        });
      }

      await ctx.prisma.premiumPackage.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Premium paket durumunu değiştir
  toggleActive: publicProcedure
    .input(
      z.object({
        id: z.string(),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updatedPackage = await ctx.prisma.premiumPackage.update({
        where: { id: input.id },
        data: { isActive: input.isActive },
      });

      return {
        ...updatedPackage,
        createdAt: updatedPackage.createdAt.toISOString(),
        updatedAt: updatedPackage.updatedAt.toISOString(),
      };
    }),

  // Tüm abonelikleri getir
  getAllSubscriptions: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        page: z.number().min(1).default(1),
        filters: z.object({
          isActive: z.boolean().optional(),
          packageId: z.string().optional(),
          userId: z.string().optional(),
        }).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, page, filters } = input;
      const skip = (page - 1) * limit;

      const where: any = {};
      if (filters?.isActive !== undefined) {
        where.isActive = filters.isActive;
      }
      if (filters?.packageId) {
        where.packageId = filters.packageId;
      }
      if (filters?.userId) {
        where.userId = filters.userId;
      }

      const totalCount = await ctx.prisma.userPremiumSubscription.count({ where });

      const subscriptions = await ctx.prisma.userPremiumSubscription.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              isPremium: true,
              photos: {
                where: { isPrimary: true },
                select: { id: true, filePath: true },
                take: 1,
              },
            },
          },
          package: {
            select: {
              id: true,
              name: true,
              price: true,
              currency: true,
              durationType: true,
              durationValue: true,
            },
          },
        },
      });

      return {
        subscriptions: subscriptions.map(sub => ({
          ...sub,
          startsAt: sub.startsAt.toISOString(),
          expiresAt: sub.expiresAt.toISOString(),
          createdAt: sub.createdAt.toISOString(),
        })),
        totalCount,
      };
    }),

  // Abonelik oluştur
  createSubscription: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        packageId: z.string(),
        paymentMethod: z.enum(["GOOGLE_PLAY", "APP_STORE", "CREDIT_CARD", "MANUAL"]),
        transactionId: z.string().optional(),
        amountPaid: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const coinPackage = await ctx.prisma.premiumPackage.findUnique({
        where: { id: input.packageId },
      });

      if (!coinPackage) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Premium paket bulunamadı",
        });
      }

      const user = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kullanıcı bulunamadı",
        });
      }

      // Süre hesaplama
      const now = new Date();
      const expiresAt = new Date(now);
      
      switch (coinPackage.durationType) {
        case "WEEKLY":
          expiresAt.setDate(expiresAt.getDate() + (7 * coinPackage.durationValue));
          break;
        case "MONTHLY":
          expiresAt.setMonth(expiresAt.getMonth() + coinPackage.durationValue);
          break;
        case "YEARLY":
          expiresAt.setFullYear(expiresAt.getFullYear() + coinPackage.durationValue);
          break;
      }

      // Mevcut aktif abonelikleri pasif yap
      await ctx.prisma.userPremiumSubscription.updateMany({
        where: {
          userId: input.userId,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });

      // Yeni abonelik oluştur
      const subscription = await ctx.prisma.userPremiumSubscription.create({
        data: {
          userId: input.userId,
          packageId: input.packageId,
          transactionId: input.transactionId,
          startsAt: now,
          expiresAt,
          paymentMethod: input.paymentMethod,
          amountPaid: input.amountPaid || coinPackage.price,
          currency: coinPackage.currency,
        },
      });

      // Kullanıcının premium durumunu güncelle
      await ctx.prisma.user.update({
        where: { id: input.userId },
        data: { isPremium: true },
      });

      return {
        ...subscription,
        startsAt: subscription.startsAt.toISOString(),
        expiresAt: subscription.expiresAt.toISOString(),
        createdAt: subscription.createdAt.toISOString(),
      };
    }),

  // Abonelik iptal et
  cancelSubscription: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const subscription = await ctx.prisma.userPremiumSubscription.findUnique({
        where: { id: input.id },
        include: { user: true },
      });

      if (!subscription) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Abonelik bulunamadı",
        });
      }

      // Aboneliği pasif yap
      const updatedSubscription = await ctx.prisma.userPremiumSubscription.update({
        where: { id: input.id },
        data: {
          isActive: false,
          isAutoRenewable: false,
        },
      });

      // Kullanıcının başka aktif aboneliği var mı kontrol et
      const activeSubscriptions = await ctx.prisma.userPremiumSubscription.count({
        where: {
          userId: subscription.userId,
          isActive: true,
        },
      });

      // Eğer başka aktif abonelik yoksa premium durumunu kaldır
      if (activeSubscriptions === 0) {
        await ctx.prisma.user.update({
          where: { id: subscription.userId },
          data: { isPremium: false },
        });
      }

      return {
        ...updatedSubscription,
        startsAt: updatedSubscription.startsAt.toISOString(),
        expiresAt: updatedSubscription.expiresAt.toISOString(),
        createdAt: updatedSubscription.createdAt.toISOString(),
      };
    }),

  // Abonelik yenile
  renewSubscription: publicProcedure
    .input(
      z.object({
        id: z.string(),
        paymentMethod: z.enum(["GOOGLE_PLAY", "APP_STORE", "CREDIT_CARD", "MANUAL"]),
        transactionId: z.string().optional(),
        amountPaid: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const subscription = await ctx.prisma.userPremiumSubscription.findUnique({
        where: { id: input.id },
        include: { package: true },
      });

      if (!subscription) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Abonelik bulunamadı",
        });
      }

      // Yeni bitiş tarihi hesapla
      const newExpiresAt = new Date(subscription.expiresAt);
      
      switch (subscription.package.durationType) {
        case "WEEKLY":
          newExpiresAt.setDate(newExpiresAt.getDate() + (7 * subscription.package.durationValue));
          break;
        case "MONTHLY":
          newExpiresAt.setMonth(newExpiresAt.getMonth() + subscription.package.durationValue);
          break;
        case "YEARLY":
          newExpiresAt.setFullYear(newExpiresAt.getFullYear() + subscription.package.durationValue);
          break;
      }

      // Aboneliği güncelle
      const updatedSubscription = await ctx.prisma.userPremiumSubscription.update({
        where: { id: input.id },
        data: {
          expiresAt: newExpiresAt,
          isActive: true,
          transactionId: input.transactionId,
          amountPaid: input.amountPaid || subscription.package.price,
        },
      });

      return {
        ...updatedSubscription,
        startsAt: updatedSubscription.startsAt.toISOString(),
        expiresAt: updatedSubscription.expiresAt.toISOString(),
        createdAt: updatedSubscription.createdAt.toISOString(),
      };
    }),
});