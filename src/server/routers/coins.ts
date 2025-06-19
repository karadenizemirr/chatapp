import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

/**
 * Coin paket yönlendiricisi
 */
export const coinsRouter = router({
  // Tüm coin paketleri getir
  getAll: publicProcedure.query(async ({ ctx }) => {
    const packages = await ctx.prisma.coinPackage.findMany({
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

  // Coin paketi oluştur
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        coinAmount: z.number().min(1),
        price: z.number().min(0),
        currency: z.string().default("TRY"),
        bonusCoins: z.number().min(0).default(0),
        description: z.string().optional(),
        imagePath: z.string().optional(),
        sku: z.string().optional(),
        displayOrder: z.number().default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const coinPackage = await ctx.prisma.coinPackage.create({
        data: input,
      });

      return {
        ...coinPackage,
        createdAt: coinPackage.createdAt.toISOString(),
        updatedAt: coinPackage.updatedAt.toISOString(),
      };
    }),

  // Coin paketi güncelle
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(100).optional(),
        coinAmount: z.number().min(1).optional(),
        price: z.number().min(0).optional(),
        currency: z.string().optional(),
        bonusCoins: z.number().min(0).optional(),
        description: z.string().optional(),
        imagePath: z.string().optional(),
        sku: z.string().optional(),
        isActive: z.boolean().optional(),
        displayOrder: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const existingPackage = await ctx.prisma.coinPackage.findUnique({
        where: { id },
      });

      if (!existingPackage) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Coin paketi bulunamadı",
        });
      }

      const updatedPackage = await ctx.prisma.coinPackage.update({
        where: { id },
        data,
      });

      return {
        ...updatedPackage,
        createdAt: updatedPackage.createdAt.toISOString(),
        updatedAt: updatedPackage.updatedAt.toISOString(),
      };
    }),

  // Coin paketi sil
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existingPackage = await ctx.prisma.coinPackage.findUnique({
        where: { id: input.id },
      });

      if (!existingPackage) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Coin paketi bulunamadı",
        });
      }

      // İlgili işlemleri kontrol et
      const relatedTransactions = await ctx.prisma.coinTransaction.count({
        where: { packageId: input.id },
      });

      if (relatedTransactions > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Bu pakete ait işlemler bulunmaktadır. Paket silinemez.",
        });
      }

      await ctx.prisma.coinPackage.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Coin paketi durumunu değiştir
  toggleActive: publicProcedure
    .input(
      z.object({
        id: z.string(),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updatedPackage = await ctx.prisma.coinPackage.update({
        where: { id: input.id },
        data: { isActive: input.isActive },
      });

      return {
        ...updatedPackage,
        createdAt: updatedPackage.createdAt.toISOString(),
        updatedAt: updatedPackage.updatedAt.toISOString(),
      };
    }),

  // Tüm coin işlemlerini getir
  getAllTransactions: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        page: z.number().min(1).default(1),
        filters: z.object({
          userId: z.string().optional(),
          transactionType: z.enum(["PURCHASE", "SPEND", "REWARD", "REFUND", "ADMIN_ADD", "ADMIN_REMOVE"]).or(z.literal("")).optional(),
          referenceType: z.enum(["MESSAGE", "GIFT", "PHOTO_VIEW", "VOICE_MESSAGE", "PURCHASE", "DAILY_BONUS"]).or(z.literal("")).optional(),
          packageId: z.string().optional(),
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
      if (filters?.transactionType) {
        where.transactionType = filters.transactionType;
      }
      if (filters?.referenceType) {
        where.referenceType = filters.referenceType;
      }
      if (filters?.packageId) {
        where.packageId = filters.packageId;
      }

      const totalCount = await ctx.prisma.coinTransaction.count({ where });

      const transactions = await ctx.prisma.coinTransaction.findMany({
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
              coins: true,
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
              coinAmount: true,
              bonusCoins: true,
              price: true,
              currency: true,
            },
          },
        },
      });

      return {
        transactions: transactions.map(transaction => ({
          ...transaction,
          createdAt: transaction.createdAt.toISOString(),
        })),
        totalCount,
      };
    }),

  // Manuel coin ekleme/çıkarma
  addCoins: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        amount: z.number(),
        description: z.string().optional(),
        transactionType: z.enum(["ADMIN_ADD", "ADMIN_REMOVE", "REWARD"]).default("ADMIN_ADD"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
        select: { id: true, coins: true },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kullanıcı bulunamadı",
        });
      }

      // Negatif miktar için yeterli coin kontrolü
      if (input.amount < 0 && user.coins < Math.abs(input.amount)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Kullanıcının yeterli coini bulunmamaktadır",
        });
      }

      const newBalance = user.coins + input.amount;

      // Transaction oluştur
      const transaction = await ctx.prisma.coinTransaction.create({
        data: {
          userId: input.userId,
          transactionType: input.transactionType,
          amount: input.amount,
          balanceAfter: newBalance,
          description: input.description || `Manuel ${input.amount > 0 ? 'ekleme' : 'çıkarma'}`,
        },
      });

      // Kullanıcı bakiyesini güncelle
      await ctx.prisma.user.update({
        where: { id: input.userId },
        data: { coins: newBalance },
      });

      return {
        ...transaction,
        createdAt: transaction.createdAt.toISOString(),
      };
    }),

  // Coin işlemi sil (sadece admin işlemleri)
  deleteTransaction: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const transaction = await ctx.prisma.coinTransaction.findUnique({
        where: { id: input.id },
        include: { user: true },
      });

      if (!transaction) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Işlem bulunamadı",
        });
      }

      // Sadece admin işlemlerini sil
      if (!['ADMIN_ADD', 'ADMIN_REMOVE'].includes(transaction.transactionType)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Sadece admin işlemleri silinebilir",
        });
      }

      // Kullanıcı bakiyesini geri al
      const newBalance = transaction.user.coins - transaction.amount;
      
      if (newBalance < 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Işlem geri alındığında kullanıcı bakiyesi negatif olacaktır",
        });
      }

      // Işlemi sil
      await ctx.prisma.coinTransaction.delete({
        where: { id: input.id },
      });

      // Kullanıcı bakiyesini güncelle
      await ctx.prisma.user.update({
        where: { id: transaction.userId },
        data: { coins: newBalance },
      });

      return { success: true };
    }),
});