import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { NotificationType } from "@prisma/client";

/**
 * Bildirim yönlendiricisi
 */
export const notificationsRouter = router({
  // Tüm bildirimleri getir (Admin)
  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        page: z.number().min(1).default(1),
        filters: z.object({
          userId: z.string().optional(),
          notificationType: z.nativeEnum(NotificationType).or(z.literal("")).optional(),
          isSent: z.boolean().optional(),
          isRead: z.boolean().optional(),
        }).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, page, filters } = input;
      const skip = (page - 1) * limit;

      const where: any = {};
      if (filters?.userId) {
        where.userId = filters.userId;
      }
      if (filters?.notificationType && filters.notificationType !== "") {
        where.notificationType = filters.notificationType;
      }
      if (filters?.isSent !== undefined) {
        where.isSent = filters.isSent;
      }
      if (filters?.isRead !== undefined) {
        where.isRead = filters.isRead;
      }

      const totalCount = await ctx.prisma.notification.count({ where });

      const notifications = await ctx.prisma.notification.findMany({
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
              photos: {
                where: { isPrimary: true },
                select: { id: true, filePath: true },
                take: 1,
              },
            },
          },
        },
      });

      return {
        notifications: notifications.map(notification => ({
          ...notification,
          createdAt: notification.createdAt.toISOString(),
          sentAt: notification.sentAt?.toISOString() || null,
          readAt: notification.readAt?.toISOString() || null,
        })),
        totalCount,
      };
    }),

  // Bildirim gönder (Tekil)
  send: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        title: z.string().min(1).max(100),
        body: z.string().min(1).max(500),
        notificationType: z.nativeEnum(NotificationType).default(NotificationType.SYSTEM),
        data: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
        select: { id: true, isActive: true },
      });

      if (!user || !user.isActive) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kullanıcı bulunamadı veya aktif değil",
        });
      }

      const notification = await ctx.prisma.notification.create({
        data: {
          userId: input.userId,
          title: input.title,
          body: input.body,
          notificationType: input.notificationType,
          data: input.data,
          isSent: true,
          sentAt: new Date(),
        },
      });

      return {
        ...notification,
        createdAt: notification.createdAt.toISOString(),
        sentAt: notification.sentAt?.toISOString() || null,
        readAt: notification.readAt?.toISOString() || null,
      };
    }),

  // Toplu bildirim gönder
  sendBulk: publicProcedure
    .input(
      z.object({
        userIds: z.array(z.string()).min(1),
        title: z.string().min(1).max(100),
        body: z.string().min(1).max(500),
        notificationType: z.nativeEnum(NotificationType).default(NotificationType.SYSTEM),
        data: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Kullanıcıları kontrol et
      const users = await ctx.prisma.user.findMany({
        where: {
          id: { in: input.userIds },
          isActive: true,
        },
        select: { id: true },
      });

      if (users.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Aktif kullanıcı bulunamadı",
        });
      }

      // Toplu bildirim oluştur
      const notifications = await ctx.prisma.notification.createMany({
        data: users.map(user => ({
          userId: user.id,
          title: input.title,
          body: input.body,
          notificationType: input.notificationType,
          data: input.data,
          isSent: true,
          sentAt: new Date(),
        })),
      });

      return {
        count: notifications.count,
        totalUsers: users.length,
      };
    }),

  // Tüm kullanıcılara bildirim gönder
  sendToAll: publicProcedure
    .input(
      z.object({
        title: z.string().min(1).max(100),
        body: z.string().min(1).max(500),
        notificationType: z.nativeEnum(NotificationType).default(NotificationType.SYSTEM),
        data: z.record(z.any()).optional(),
        filters: z.object({
          isPremium: z.boolean().optional(),
          isFake: z.boolean().optional(),
          isActive: z.boolean().default(true),
        }).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { filters, ...notificationData } = input;

      // Kullanıcı filtresi
      const userWhere: any = {
        isActive: filters?.isActive ?? true,
      };
      if (filters?.isPremium !== undefined) {
        userWhere.isPremium = filters.isPremium;
      }
      if (filters?.isFake !== undefined) {
        userWhere.isFake = filters.isFake;
      }

      // Kullanıcıları getir
      const users = await ctx.prisma.user.findMany({
        where: userWhere,
        select: { id: true },
      });

      if (users.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kriterlere uygun kullanıcı bulunamadı",
        });
      }

      // Toplu bildirim oluştur
      const notifications = await ctx.prisma.notification.createMany({
        data: users.map(user => ({
          userId: user.id,
          title: notificationData.title,
          body: notificationData.body,
          notificationType: notificationData.notificationType,
          data: notificationData.data,
          isSent: true,
          sentAt: new Date(),
        })),
      });

      return {
        count: notifications.count,
        totalUsers: users.length,
      };
    }),

  // Bildirim sil
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existingNotification = await ctx.prisma.notification.findUnique({
        where: { id: input.id },
      });

      if (!existingNotification) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Bildirim bulunamadı",
        });
      }

      await ctx.prisma.notification.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Bildirim istatistikleri
  getStats: publicProcedure.query(async ({ ctx }) => {
    const totalNotifications = await ctx.prisma.notification.count();
    const sentNotifications = await ctx.prisma.notification.count({
      where: { isSent: true },
    });
    const readNotifications = await ctx.prisma.notification.count({
      where: { isRead: true },
    });
    const unreadNotifications = await ctx.prisma.notification.count({
      where: { isRead: false, isSent: true },
    });

    // Bildirim tiplerine göre dağılım
    const typeStats = await ctx.prisma.notification.groupBy({
      by: ['notificationType'],
      _count: {
        id: true,
      },
    });

    return {
      totalNotifications,
      sentNotifications,
      readNotifications,
      unreadNotifications,
      typeStats: typeStats.map(stat => ({
        type: stat.notificationType,
        count: stat._count.id,
      })),
    };
  }),
});