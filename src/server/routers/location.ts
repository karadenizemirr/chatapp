import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

/**
 * Lokasyon yönlendiricisi
 */
export const locationRouter = router({
  // Tüm şehirleri getir
  getAll: publicProcedure
    .input(
      z.object({
        countryCode: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const cities = await ctx.prisma.city.findMany({
        where: {
          countryCode: input.countryCode,
          isActive: input.isActive,
        },
        orderBy: { name: "asc" },
        include: {
          _count: {
            select: {
              users: true,
            },
          },
        },
      });

      return {
        cities: cities.map(city => ({
          ...city,
          createdAt: city.createdAt.toISOString(),
          userCount: city._count.users,
        }))
      };
    }),

  // Şehir oluştur
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        countryCode: z.string().default("TR"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Aynı isimde şehir var mı kontrol et
      const existingCity = await ctx.prisma.city.findFirst({
        where: {
          name: input.name,
          countryCode: input.countryCode,
        },
      });

      if (existingCity) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Bu şehir zaten mevcut",
        });
      }

      const city = await ctx.prisma.city.create({
        data: input,
      });

      return {
        ...city,
        createdAt: city.createdAt.toISOString(),
      };
    }),

  // Şehir güncelle
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(100).optional(),
        countryCode: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const existingCity = await ctx.prisma.city.findUnique({
        where: { id },
      });

      if (!existingCity) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Şehir bulunamadı",
        });
      }

      // Aynı isimde başka şehir var mı kontrol et
      if (data.name) {
        const duplicateCity = await ctx.prisma.city.findFirst({
          where: {
            name: data.name,
            countryCode: data.countryCode || existingCity.countryCode,
            id: { not: id },
          },
        });

        if (duplicateCity) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Bu şehir adı zaten kullanılıyor",
          });
        }
      }

      const updatedCity = await ctx.prisma.city.update({
        where: { id },
        data,
      });

      return {
        ...updatedCity,
        createdAt: updatedCity.createdAt.toISOString(),
      };
    }),

  // Şehir sil
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existingCity = await ctx.prisma.city.findUnique({
        where: { id: input.id },
        include: {
          _count: {
            select: {
              users: true,
            },
          },
        },
      });

      if (!existingCity) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Şehir bulunamadı",
        });
      }

      // Kullanıcıları olan şehir silinemez
      if (existingCity._count.users > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Bu şehirde kayıtlı kullanıcılar bulunmaktadır. Şehir silinemez.",
        });
      }

      await ctx.prisma.city.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Şehir durumunu değiştir
  toggleActive: publicProcedure
    .input(
      z.object({
        id: z.string(),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updatedCity = await ctx.prisma.city.update({
        where: { id: input.id },
        data: { isActive: input.isActive },
      });

      return {
        ...updatedCity,
        createdAt: updatedCity.createdAt.toISOString(),
      };
    }),

  // Şehir istatistikleri
  getStats: publicProcedure.query(async ({ ctx }) => {
    const totalCities = await ctx.prisma.city.count();
    const activeCities = await ctx.prisma.city.count({
      where: { isActive: true },
    });
    const inactiveCities = await ctx.prisma.city.count({
      where: { isActive: false },
    });

    // En çok kullanıcıya sahip şehirler
    const topCities = await ctx.prisma.city.findMany({
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: {
        users: {
          _count: "desc",
        },
      },
      take: 5,
    });

    return {
      totalCities,
      activeCities,
      inactiveCities,
      topCities: topCities.map(city => ({
        ...city,
        createdAt: city.createdAt.toISOString(),
        userCount: city._count.users,
      })),
    };
  }),
});