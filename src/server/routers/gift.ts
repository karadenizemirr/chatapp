import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

/**
 * Hediye yönlendiricisi
 */
export const giftRouter = router({
  // Tüm hediyeleri getir
  getAll: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        isActive: z.boolean().default(true),
      })
    )
    .query(async ({ ctx, input }) => {
      const gifts = await ctx.prisma.gift.findMany({
        where: {
          category: input.category,
          isActive: input.isActive,
        },
        orderBy: {
          displayOrder: "asc",
        },
      });

      return gifts;
    }),

  // Hediye detayını getir
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const gift = await ctx.prisma.gift.findUnique({
        where: { id: input.id },
      });

      if (!gift) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Hediye bulunamadı",
        });
      }

      return gift;
    }),

  // Hediye gönder (message router dışında doğrudan hediye gönderimi için)
  send: protectedProcedure
    .input(
      z.object({
        giftId: z.string(),
        receiverId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Hediye bilgilerini al
      const gift = await ctx.prisma.gift.findUnique({
        where: { id: input.giftId },
        select: { id: true, coinCost: true, isActive: true },
      });

      if (!gift || !gift.isActive) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Hediye bulunamadı veya aktif değil",
        });
      }

      // Alıcı kullanıcıyı kontrol et
      const receiver = await ctx.prisma.user.findUnique({
        where: { id: input.receiverId },
        select: { id: true, isActive: true },
      });

      if (!receiver || !receiver.isActive) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Alıcı kullanıcı bulunamadı veya aktif değil",
        });
      }

      // Kullanıcının yeterli coini var mı kontrol et
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { coins: true },
      });

      if (!user || user.coins < gift.coinCost) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Yeterli coin yok",
        });
      }

      // Hediye mesajı oluştur
      const message = await ctx.prisma.message.create({
        data: {
          senderId: ctx.session.user.id,
          receiverId: input.receiverId,
          messageType: "GIFT",
          giftId: input.giftId,
          coinsSpent: gift.coinCost,
        },
      });

      // Coin işlemini kaydet
      await ctx.prisma.coinTransaction.create({
        data: {
          userId: ctx.session.user.id,
          transactionType: "SPEND",
          amount: -gift.coinCost,
          balanceAfter: user.coins - gift.coinCost,
          description: "Hediye gönderimi",
          referenceType: "GIFT",
          referenceId: input.giftId,
        },
      });

      // Kullanıcının coin miktarını güncelle
      await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: { coins: { decrement: gift.coinCost } },
      });

      // Hediye işlemini kaydet
      const transaction = await ctx.prisma.giftTransaction.create({
        data: {
          giftId: input.giftId,
          senderId: ctx.session.user.id,
          receiverId: input.receiverId,
          messageId: message.id,
          coinsSpent: gift.coinCost,
        },
        include: {
          gift: true,
        },
      });

      return transaction;
    }),

  // Kullanıcının aldığı hediyeleri listele
  getReceived: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;

      const transactions = await ctx.prisma.giftTransaction.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        where: {
          receiverId: ctx.session.user.id,
        },
        orderBy: {
          sentAt: "desc",
        },
        include: {
          gift: true,
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              photos: {
                where: { isPrimary: true },
                take: 1,
                select: {
                  id: true,
                  filePath: true,
                },
              },
            },
          },
        },
      });

      let nextCursor: typeof cursor = undefined;
      if (transactions.length > limit) {
        const nextItem = transactions.pop();
        nextCursor = nextItem?.id;
      }

      return {
        transactions,
        nextCursor,
      };
    }),

  // Kullanıcının gönderdiği hediyeleri listele
  getSent: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;

      const transactions = await ctx.prisma.giftTransaction.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        where: {
          senderId: ctx.session.user.id,
        },
        orderBy: {
          sentAt: "desc",
        },
        include: {
          gift: true,
          receiver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              photos: {
                where: { isPrimary: true },
                take: 1,
                select: {
                  id: true,
                  filePath: true,
                },
              },
            },
          },
        },
      });

      let nextCursor: typeof cursor = undefined;
      if (transactions.length > limit) {
        const nextItem = transactions.pop();
        nextCursor = nextItem?.id;
      }

      return {
        transactions,
        nextCursor,
      };
    }),

  // Admin: Tüm hediyeleri getir (aktif/pasif dahil)
  getAllForAdmin: publicProcedure.query(async ({ ctx }) => {
    const gifts = await ctx.prisma.gift.findMany({
      orderBy: { displayOrder: "asc" },
    });

    return {
      gifts: gifts.map(gift => ({
        ...gift,
        createdAt: gift.createdAt.toISOString(),
        updatedAt: gift.updatedAt.toISOString(),
      }))
    };
  }),

  // Admin: Hediye oluştur
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        imagePath: z.string().min(1),
        coinCost: z.number().min(0),
        category: z.string().optional(),
        displayOrder: z.number().default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const gift = await ctx.prisma.gift.create({
        data: input,
      });

      return {
        ...gift,
        createdAt: gift.createdAt.toISOString(),
        updatedAt: gift.updatedAt.toISOString(),
      };
    }),

  // Admin: Hediye güncelle
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(100).optional(),
        imagePath: z.string().optional(),
        coinCost: z.number().min(0).optional(),
        category: z.string().optional(),
        isActive: z.boolean().optional(),
        displayOrder: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const existingGift = await ctx.prisma.gift.findUnique({
        where: { id },
      });

      if (!existingGift) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Hediye bulunamadı",
        });
      }

      const updatedGift = await ctx.prisma.gift.update({
        where: { id },
        data,
      });

      return {
        ...updatedGift,
        createdAt: updatedGift.createdAt.toISOString(),
        updatedAt: updatedGift.updatedAt.toISOString(),
      };
    }),

  // Admin: Hediye sil
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existingGift = await ctx.prisma.gift.findUnique({
        where: { id: input.id },
      });

      if (!existingGift) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Hediye bulunamadı",
        });
      }

      // İlgili işlemleri kontrol et
      const relatedTransactions = await ctx.prisma.giftTransaction.count({
        where: { giftId: input.id },
      });

      if (relatedTransactions > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Bu hediyeye ait işlemler bulunmaktadır. Hediye silinemez.",
        });
      }

      await ctx.prisma.gift.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Admin: Hediye durumunu değiştir
  toggleActive: publicProcedure
    .input(
      z.object({
        id: z.string(),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updatedGift = await ctx.prisma.gift.update({
        where: { id: input.id },
        data: { isActive: input.isActive },
      });

      return {
        ...updatedGift,
        createdAt: updatedGift.createdAt.toISOString(),
        updatedAt: updatedGift.updatedAt.toISOString(),
      };
    }),

  // Admin: Hediye işlemlerini getir
  getTransactions: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        page: z.number().min(1).default(1),
        filters: z.object({
          giftId: z.string().optional(),
          senderId: z.string().optional(),
          receiverId: z.string().optional(),
        }).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, page, filters } = input;
      const skip = (page - 1) * limit;

      const where: any = {};
      if (filters?.giftId) {
        where.giftId = filters.giftId;
      }
      if (filters?.senderId) {
        where.senderId = filters.senderId;
      }
      if (filters?.receiverId) {
        where.receiverId = filters.receiverId;
      }

      const totalCount = await ctx.prisma.giftTransaction.count({ where });

      const transactions = await ctx.prisma.giftTransaction.findMany({
        skip,
        take: limit,
        where,
        orderBy: { sentAt: "desc" },
        include: {
          gift: {
            select: {
              id: true,
              name: true,
              imagePath: true,
              coinCost: true,
              category: true,
            },
          },
          sender: {
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
          receiver: {
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
        transactions: transactions.map(transaction => ({
          ...transaction,
          sentAt: transaction.sentAt.toISOString(),
        })),
        totalCount,
      };
    }),
});