import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import {compare, hash} from "bcrypt";

/**
 * Kimlik doğrulama yönlendiricisi
 */
export const authRouter = router({
  // Mevcut kullanıcıyı getir
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session;
  }),

  // Kullanıcı kayıt
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email("Geçerli bir e-posta adresi giriniz"),
        password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
        firstName: z.string().min(2, "Ad en az 2 karakter olmalıdır"),
        lastName: z.string().min(2, "Soyad en az 2 karakter olmalıdır"),
        birthDate: z.date({
          required_error: "Doğum tarihi gereklidir",
        }),
        gender: z.enum(["MALE", "FEMALE", "OTHER"], {
          required_error: "Cinsiyet seçimi gereklidir",
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { email, password, firstName, lastName, birthDate, gender } = input;

      // E-posta adresi kontrol et
      const existingUser = await ctx.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Bu e-posta adresi zaten kullanılıyor",
        });
      }

      // Şifreyi hash'le
      const passwordHash = await hash(password, 10);

      // Kullanıcı oluştur
      const user = await ctx.prisma.user.create({
        data: {
          email,
          passwordHash,
          firstName,
          lastName,
          birthDate,
          gender,
          lastActiveAt: new Date(),
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      });

      return {
        status: "success",
        message: "Hesabınız başarıyla oluşturuldu. Şimdi giriş yapabilirsiniz.",
        user,
      };
    }),

  // Kullanıcı şifre değişikliği
  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(6, "Yeni şifre en az 6 karakter olmalıdır"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { currentPassword, newPassword } = input;

      // Kullanıcıyı bul
      const user = await ctx.prisma.user.findUnique({
        where: { id: userId },
        select: { passwordHash: true },
      });

      if (!user?.passwordHash) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kullanıcı bulunamadı veya şifre oluşturulmamış",
        });
      }

      // Mevcut şifreyi doğrula
      const isPasswordValid = await compare(currentPassword, user.passwordHash);
      if (!isPasswordValid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Mevcut şifre hatalı",
        });
      }

      // Yeni şifreyi hash'le ve güncelle
      const newPasswordHash = await hash(newPassword, 10);
      await ctx.prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash },
      });

      return {
        status: "success",
        message: "Şifreniz başarıyla güncellendi",
      };
    }),
    
  // Kullanıcının kendi profilini getir
  getMyProfile: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    
    const user = await ctx.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        birthDate: true,
        gender: true,
        bio: true,
        relationshipType: true,
        image: true,
        isPremium: true,
        coins: true,
        city: {
          select: {
            id: true,
            name: true,
          },
        },
        photos: {
          orderBy: { displayOrder: 'asc' },
          select: {
            id: true,
            filePath: true,
            isPrimary: true,
            isVerified: true,
            displayOrder: true,
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
  
  // Kullanıcı profil güncelleme
  updateProfile: protectedProcedure
    .input(
      z.object({
        firstName: z.string().min(2).optional(),
        lastName: z.string().min(2).optional(),
        bio: z.string().max(500).optional(),
        cityId: z.string().optional(),
        relationshipType: z.enum(["FRIENDSHIP", "DATING", "BOTH"]).optional(),
        image: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      const updatedUser = await ctx.prisma.user.update({
        where: { id: userId },
        data: input,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          bio: true,
          image: true,
          relationshipType: true,
          city: {
            select: {
              id: true, 
              name: true
            }
          },
        },
      });
      
      return {
        status: "success",
        message: "Profiliniz başarıyla güncellendi",
        user: updatedUser,
      };
    }),
});