import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { MessageType } from "@prisma/client";

/**
 * Mesaj yönlendiricisi - Schema'ya tam uyumlu
 */
export const messageRouter = router({
  // Admin için tüm mesajları getir
  getAllMessages: publicProcedure
    .input(
      z.object({
        filters: z.object({
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          messageType: z.enum(["TEXT", "IMAGE", "VOICE", "GIFT", "ALL"]).optional(),
          onlyReported: z.boolean().default(false),
          onlyPremiumUsers: z.boolean().default(false),
          onlyFakeUsers: z.boolean().default(false),
          userId: z.string().optional()
        }).optional(),
        limit: z.number().min(1).max(100).default(10),
        page: z.number().min(1).default(1)
      })
    )
    .query(async ({ ctx, input }) => {
      const { filters, limit, page } = input;
      const skip = (page - 1) * limit;

      // Where koşulları
      const where: any = {};

      // Tarih filtreleri
      if (filters?.startDate || filters?.endDate) {
        where.createdAt = {};
        if (filters.startDate) {
          where.createdAt.gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          where.createdAt.lte = new Date(filters.endDate);
        }
      }

      // Mesaj tipi filtresi
      if (filters?.messageType && filters.messageType !== "ALL") {
        where.messageType = filters.messageType;
      }

      // Raporlanan mesajlar
      if (filters?.onlyReported) {
        where.reported = true;
      }

      // Belirli kullanıcı
      if (filters?.userId) {
        where.OR = [
          { senderId: filters.userId },
          { receiverId: filters.userId }
        ];
      }

      // Toplam sayı
      const totalCount = await ctx.prisma.message.count({ where });

      // Mesajları getir
      const messages = await ctx.prisma.message.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          conversationId: true,
          senderId: true,
          receiverId: true,
          messageType: true,
          content: true,
          filePath: true,
          fileName: true,
          coinsSpent: true,
          isRead: true,
          readAt: true,
          reported: true,
          reportReason: true,
          createdAt: true,
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              isPremium: true,
              isFake: true,
              photos: {
                where: { isPrimary: true },
                select: { id: true, filePath: true },
                take: 1
              }
            }
          },
          receiver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              photos: {
                where: { isPrimary: true },
                select: { id: true, filePath: true },
                take: 1
              }
            }
          },
          gift: {
            select: {
              id: true,
              name: true,
              imagePath: true,
              coinCost: true
            }
          }
        }
      });

      // Tarihleri serialize et
      const serializedMessages = messages.map(message => ({
        ...message,
        createdAt: message.createdAt.toISOString(),
        readAt: message.readAt?.toISOString() || null,
        reportedAt: message.reportedAt?.toISOString() || null,
      }));

      return {
        messages: serializedMessages,
        totalCount
      };
    }),

  // Kullanıcı arama
  searchUsers: publicProcedure
    .input(
      z.object({
        searchTerm: z.string().min(2),
        limit: z.number().min(1).max(20).default(5)
      })
    )
    .query(async ({ ctx, input }) => {
      const { searchTerm, limit } = input;

      const users = await ctx.prisma.user.findMany({
        where: {
          OR: [
            { firstName: { contains: searchTerm, mode: "insensitive" } },
            { lastName: { contains: searchTerm, mode: "insensitive" } },
            { email: { contains: searchTerm, mode: "insensitive" } }
          ]
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          isPremium: true,
          isFake: true,
          photos: {
            where: { isPrimary: true },
            select: { id: true, filePath: true },
            take: 1
          }
        },
        take: limit
      });

      return { users };
    }),

  // Mesaj silme
  deleteMessages: publicProcedure
    .input(
      z.object({
        messageIds: z.array(z.string())
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { messageIds } = input;

      const result = await ctx.prisma.message.deleteMany({
        where: {
          id: { in: messageIds }
        }
      });

      return { count: result.count };
    }),

  // Mesaj gönderme
  send: protectedProcedure
    .input(
      z.object({
        receiverId: z.string(),
        messageType: z.nativeEnum(MessageType).default(MessageType.TEXT),
        content: z.string().optional(),
        filePath: z.string().optional(),
        fileName: z.string().optional(),
        fileSize: z.number().optional(),
        mimeType: z.string().optional(),
        giftId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Validasyonlar
      if (input.messageType === MessageType.TEXT && !input.content) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Metin mesajı için içerik gereklidir",
        });
      }

      // Conversation bul veya oluştur
      let conversation = await ctx.prisma.conversation.findFirst({
        where: {
          participantIds: {
            hasEvery: [ctx.session.user.id, input.receiverId]
          }
        }
      });

      if (!conversation) {
        conversation = await ctx.prisma.conversation.create({
          data: {
            participantIds: [ctx.session.user.id, input.receiverId],
            lastMessageAt: new Date()
          }
        });
      }

      // Mesaj oluştur
      const message = await ctx.prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: ctx.session.user.id,
          receiverId: input.receiverId,
          messageType: input.messageType,
          content: input.content,
          filePath: input.filePath,
          fileName: input.fileName,
          fileSize: input.fileSize,
          mimeType: input.mimeType,
          giftId: input.giftId,
        },
      });

      // Conversation'ın lastMessageAt'ini güncelle
      await ctx.prisma.conversation.update({
        where: { id: conversation.id },
        data: { lastMessageAt: new Date() }
      });

      return {
        ...message,
        createdAt: message.createdAt.toISOString(),
        readAt: message.readAt?.toISOString() || null
      };
    }),

  // Mesajları getir
  getMessages: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().nullish(),
        filterByFake: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId, limit, cursor, filterByFake } = input;
      const messages = await ctx.prisma.message.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        where: {
          OR: [
            {
              senderId: ctx.session.user.id,
              receiverId: userId,
              isDeletedBySender: false,
            },
            {
              senderId: userId,
              receiverId: ctx.session.user.id,
              isDeletedByReceiver: false,
            },
          ],
          ...(filterByFake ? {
            sender: {
              isFake: true
            }
          } : {}),
        },
        orderBy: { createdAt: "desc" },
        include: {
          gift: {
            select: {
              id: true,
              name: true,
              imagePath: true,
              coinCost: true,
            },
          },
          sender: {
            select: {
              id:true,
              firstName: true,
              lastName: true,
              isFake: true,
              isPremium: true,
              photos: {
                where: { isPrimary: true },
                select: { id: true, filePath: true },
                take: 1
              }
            },
          },
          receiver: {
            select: {
              id:true,
              firstName: true,
              lastName: true,
              photos: {
                where: { isPrimary: true },
                select: { id: true, filePath: true },
                take: 1
              }
            },
          },
        },
      });

      let nextCursor: typeof cursor = undefined;
      if (messages.length > limit) {
        const nextItem = messages.pop();
        nextCursor = nextItem?.id;
      }

      // Tarihleri serialize et
      const serializedMessages = messages.reverse().map(message => ({
        ...message,
        createdAt: message.createdAt.toISOString(),
        readAt: message.readAt?.toISOString() || null,
      }));

      return {
        messages: serializedMessages,
        nextCursor,
      };
    }),

  // Konuşmalar listesi
  getConversations: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;
      const userId = ctx.session.user.id;

      const conversations = await ctx.prisma.conversation.findMany({
        where: {
          participantIds: {
            has: userId
          }
        },
        orderBy: { lastMessageAt: "desc" },
        take: limit + 1,
        skip: cursor ? parseInt(cursor) : 0
      });

      const result = await Promise.all(conversations.slice(0, limit).map(async (conv) => {
        const partnerId = conv.participantIds.find(id => id !== userId)!;

        const partner = await ctx.prisma.user.findUnique({
          where: { id: partnerId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            isFake:true,
            photos: {
              where: { isPrimary: true },
              select: { id: true, filePath: true },
              take: 1,
            },
            lastActiveAt: true,
          },
        });

        const unreadCount = await ctx.prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: partnerId,
            receiverId: userId,
            isRead: false
          }
        });

        const lastMessage = await ctx.prisma.message.findFirst({
          where: {
            conversationId: conv.id,
            OR: [
              { senderId: userId, isDeletedBySender: false },
              { receiverId: userId, isDeletedByReceiver: false }
            ]
          },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            senderId: true,
            messageType: true,
            content: true,
            createdAt: true,
            sender: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          },
        });

        return {
          partner,
          lastMessage: lastMessage ? {
            ...lastMessage,
            createdAt: lastMessage.createdAt.toISOString()
          } : null,
          unreadCount,
          lastMessageAt: conv.lastMessageAt.toISOString(),
        };
      }));

      let nextCursor: typeof cursor = undefined;
      if (conversations.length > limit) {
        nextCursor = String(Number(cursor || 0) + limit);
      }

      return {
        conversations: result,
        nextCursor,
      };
    }),

  // Okunmamış mesaj sayısı
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const count = await ctx.prisma.message.count({
      where: {
        receiverId: ctx.session.user.id,
        isRead: false,
        isDeletedByReceiver: false
      },
    });

    return { count };
  }),
});