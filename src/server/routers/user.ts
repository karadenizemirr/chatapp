import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { Gender, RelationshipType } from "@prisma/client";

/**
 * Kullanıcı yönlendiricisi
 */
export const userRouter = router({
  // Test endpoint
  test: publicProcedure.query(() => {
    return { message: "tRPC çalışıyor!" };
  }),

  // Şehirleri getir
  getCities: publicProcedure.query(async ({ ctx }) => {
    const cities = await ctx.prisma.city.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        countryCode: true
      }
    });

    return { cities };
  }),

  // Fake kullanıcı durumunu değiştir
  toggleFake: publicProcedure
    .input(z.object({ 
      userId: z.string(),
      isFake: z.boolean()
    }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kullanıcı bulunamadı",
        });
      }

      const updatedUser = await ctx.prisma.user.update({
        where: { id: input.userId },
        data: {
          isFake: input.isFake,
        },
      });

      return { success: true, isFake: updatedUser.isFake };
    }),

  // Kullanıcı profili getirme
  getProfile: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          gender: true,
          birthDate: true,
          bio: true,
          relationshipType: true,
          isActive: true,
          isFake: true,
          lastActiveAt: true,
          photos: {
            where: { isVerified: true },
            orderBy: { displayOrder: "asc" },
            select: {
              id: true,
              filePath: true,
              isPrimary: true,
              displayOrder: true,
            },
          },
          city: {
            select: {
              id: true,
              name: true,
              countryCode: true,
            },
          },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kullanıcı bulunamadı",
        });
      }

      return user;
    }),

  // Kullanıcı listesi alma
  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().nullish(),
        gender: z.nativeEnum(Gender).optional(),
        cityId: z.string().optional(),
        ageMin: z.number().min(18).max(100).optional(),
        ageMax: z.number().min(18).max(100).optional(),
        relationshipType: z.nativeEnum(RelationshipType).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, gender, cityId, ageMin, ageMax, relationshipType } = input;
      
      // Yaş filtresi için tarih hesaplaması
      const today = new Date();
      const minBirthDate = ageMax
        ? new Date(today.getFullYear() - ageMax - 1, today.getMonth(), today.getDate())
        : undefined;
      const maxBirthDate = ageMin
        ? new Date(today.getFullYear() - ageMin, today.getMonth(), today.getDate())
        : undefined;

      const users = await ctx.prisma.user.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        where: {},
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          gender: true,
          birthDate: true,
          bio: true,
          relationshipType: true,
          isActive: true,
          isFake: true,
          lastActiveAt: true,
          coins: true,
          photos: {
            take: 1,
            select: {
              id: true,
              filePath: true,
            },
          },
          city: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          id: "desc",
        },
      });

      // Tarihleri string'e çevir
      const serializedUsers = users.map(user => ({
        ...user,
        birthDate: user.birthDate ? user.birthDate.toISOString().split('T')[0] : null,
        lastActiveAt: user.lastActiveAt ? user.lastActiveAt.toISOString() : null,
      }));

      let nextCursor: typeof cursor = undefined;
      if (serializedUsers.length > limit) {
        const nextItem = serializedUsers.pop();
        nextCursor = nextItem?.id;
      }

      return {
        users: serializedUsers,
        nextCursor,
      };
    }),

  // Kullanıcı oluşturma (örnek)
  create: publicProcedure
    .input(
      z.object({
        email: z.string().email().optional(),
        phone: z.string().optional(),
        firstName: z.string().min(2).max(50),
        lastName: z.string().min(2).max(50),
        birthDate: z.date().or(z.string().refine((val) => {
          // YYYY-MM-DD formatındaki string'i Date'e çevirmeyi dene
          try {
            const date = new Date(val);
            return !isNaN(date.getTime());
          } catch {
            return false;
          }
        }, { message: "Geçerli bir tarih formatı değil" }).transform(val => new Date(val))),
        gender: z.nativeEnum(Gender),
        cityId: z.string().optional(),
        bio: z.string().max(500).optional(),
        relationshipType: z.nativeEnum(RelationshipType).default(RelationshipType.DATING),
        isFake: z.boolean().optional().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Email veya telefon zorunlu
      if (!input.email && !input.phone) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email veya telefon gereklidir",
        });
      }

      // Kullanıcı var mı kontrol et
      if (input.email) {
        const existingUser = await ctx.prisma.user.findUnique({
          where: { email: input.email },
        });

        if (existingUser) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Bu email adresi zaten kullanılıyor",
          });
        }
      }

      if (input.phone) {
        const existingUser = await ctx.prisma.user.findUnique({
          where: { phone: input.phone },
        });

        if (existingUser) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Bu telefon numarası zaten kullanılıyor",
          });
        }
      }

      // Kullanıcı oluştur
      const user = await ctx.prisma.user.create({
        data: {
          email: input.email,
          phone: input.phone,
          firstName: input.firstName,
          lastName: input.lastName,
          birthDate: input.birthDate,
          gender: input.gender,
          cityId: input.cityId,
          bio: input.bio,
          relationshipType: input.relationshipType,
          isFake: input.isFake || false,
          lastActiveAt: new Date(),
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          gender: true,
          birthDate: true,
        },
      });

      return user;
    }),

  // Kullanıcı güncellemek (örnek)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        firstName: z.string().min(2).max(50).optional(),
        lastName: z.string().min(2).max(50).optional(),
        cityId: z.string().optional(),
        bio: z.string().max(500).optional(),
        relationshipType: z.nativeEnum(RelationshipType).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Kullanıcı var mı kontrol et
      const existingUser = await ctx.prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kullanıcı bulunamadı",
        });
      }

      // Kullanıcıyı güncelle
      const updatedUser = await ctx.prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          gender: true,
          birthDate: true,
          bio: true,
          relationshipType: true,
          city: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return updatedUser;
    }),

  // Admin profil güncelleme (fake kullanıcılar için)
  updateProfile: publicProcedure
    .input(
      z.object({
        id: z.string(),
        firstName: z.string().min(2).max(50).optional(),
        lastName: z.string().min(2).max(50).optional(),
        email: z.string().email().optional(),
        gender: z.nativeEnum(Gender).optional(),
        birthDate: z.date().or(z.string().refine((val) => {
          try {
            const date = new Date(val);
            return !isNaN(date.getTime());
          } catch {
            return false;
          }
        }, { message: "Geçerli bir tarih formatı değil" }).transform(val => new Date(val))).optional(),
        cityId: z.string().optional(),
        bio: z.string().max(500).optional(),
        relationshipType: z.nativeEnum(RelationshipType).optional(),
        isActive: z.boolean().optional(),
        coins: z.number().min(0).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Kullanıcı var mı kontrol et
      const existingUser = await ctx.prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kullanıcı bulunamadı",
        });
      }

      // Email kontrolü (eğer değiştiriliyorsa)
      if (data.email && data.email !== existingUser.email) {
        const emailExists = await ctx.prisma.user.findUnique({
          where: { email: data.email },
        });

        if (emailExists) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Bu email adresi zaten kullanılıyor",
          });
        }
      }

      // Kullanıcıyı güncelle
      const updatedUser = await ctx.prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          gender: true,
          birthDate: true,
          bio: true,
          relationshipType: true,
          isActive: true,
          isFake: true,
          coins: true,
          city: {
            select: {
              id: true,
              name: true,
            },
          },
          photos: {
            select: {
              id: true,
              filePath: true,
              isPrimary: true,
            },
          },
        },
      });

      return {
        ...updatedUser,
        birthDate: updatedUser.birthDate ? updatedUser.birthDate.toISOString().split('T')[0] : null,
      };
    }),

  // Kullanıcı silme
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.id },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kullanıcı bulunamadı",
        });
      }

      await ctx.prisma.user.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Coin ekleme
  addCoins: publicProcedure
    .input(z.object({ 
      userId: z.string(),
      amount: z.number().min(1)
    }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kullanıcı bulunamadı",
        });
      }

      const updatedUser = await ctx.prisma.user.update({
        where: { id: input.userId },
        data: {
          coins: {
            increment: input.amount,
          },
        },
      });

      return { success: true, newBalance: updatedUser.coins };
    }),

  // Coin çıkarma
  removeCoins: publicProcedure
    .input(z.object({ 
      userId: z.string(),
      amount: z.number().min(1)
    }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kullanıcı bulunamadı",
        });
      }

      const newBalance = Math.max(0, (user.coins || 0) - input.amount);

      const updatedUser = await ctx.prisma.user.update({
        where: { id: input.userId },
        data: {
          coins: newBalance,
        },
      });

      return { success: true, newBalance: updatedUser.coins };
    }),

  // Kullanıcı engelleme/aktiflik durumu değiştirme
  toggleActive: publicProcedure
    .input(z.object({ 
      userId: z.string(),
      isActive: z.boolean()
    }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kullanıcı bulunamadı",
        });
      }

      const updatedUser = await ctx.prisma.user.update({
        where: { id: input.userId },
        data: {
          isActive: input.isActive,
        },
      });

      return { success: true, isActive: updatedUser.isActive };
    }),
});