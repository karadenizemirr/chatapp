import { z } from "zod";
import { router, publicProcedure } from "../trpc";

/**
 * Analitik yönlendiricisi
 */
export const analyticsRouter = router({
  // Genel kullanıcı istatistikleri
  getUserStats: publicProcedure.query(async ({ ctx }) => {
    const totalUsers = await ctx.prisma.user.count();
    const activeUsers = await ctx.prisma.user.count({
      where: { isActive: true },
    });
    const premiumUsers = await ctx.prisma.user.count({
      where: { isPremium: true },
    });
    const fakeUsers = await ctx.prisma.user.count({
      where: { isFake: true },
    });
    const bannedUsers = await ctx.prisma.user.count({
      where: { isBanned: true },
    });

    // Son 30 gün kayıt olan kullanıcılar
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newUsers = await ctx.prisma.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    return {
      totalUsers,
      activeUsers,
      premiumUsers,
      fakeUsers,
      bannedUsers,
      newUsers,
    };
  }),

  // Cinsiyet dağılımı
  getGenderDistribution: publicProcedure.query(async ({ ctx }) => {
    const genderStats = await ctx.prisma.user.groupBy({
      by: ['gender'],
      _count: {
        id: true,
      },
    });

    return genderStats.map(stat => ({
      gender: stat.gender,
      count: stat._count.id,
    }));
  }),

  // Şehir dağılımı
  getCityDistribution: publicProcedure.query(async ({ ctx }) => {
    const cityStats = await ctx.prisma.user.groupBy({
      by: ['cityId'],
      _count: {
        id: true,
      },
      where: {
        cityId: {
          not: null,
        },
      },
    });

    const citiesWithNames = await Promise.all(
      cityStats.map(async (stat) => {
        const city = await ctx.prisma.city.findUnique({
          where: { id: stat.cityId! },
          select: { name: true, countryCode: true },
        });
        return {
          cityId: stat.cityId,
          cityName: city?.name || "Bilinmeyen",
          countryCode: city?.countryCode || "TR",
          count: stat._count.id,
        };
      })
    );

    return citiesWithNames.sort((a, b) => b.count - a.count).slice(0, 10);
  }),

  // Yaş dağılımı
  getAgeDistribution: publicProcedure.query(async ({ ctx }) => {
    const users = await ctx.prisma.user.findMany({
      select: {
        birthDate: true,
      },
    });

    const ageGroups = {
      "18-24": 0,
      "25-34": 0,
      "35-44": 0,
      "45-54": 0,
      "55+": 0,
    };

    const currentDate = new Date();
    
    users.forEach(user => {
      const age = Math.floor((currentDate.getTime() - user.birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      
      if (age >= 18 && age <= 24) {
        ageGroups["18-24"]++;
      } else if (age >= 25 && age <= 34) {
        ageGroups["25-34"]++;
      } else if (age >= 35 && age <= 44) {
        ageGroups["35-44"]++;
      } else if (age >= 45 && age <= 54) {
        ageGroups["45-54"]++;
      } else if (age >= 55) {
        ageGroups["55+"]++;
      }
    });

    return Object.entries(ageGroups).map(([range, count]) => ({
      ageRange: range,
      count,
    }));
  }),

  // Günlük kayıt istatistikleri (Son 30 gün)
  getDailyRegistrations: publicProcedure.query(async ({ ctx }) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // MongoDB için basit aggregation kullan
    const users = await ctx.prisma.user.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        createdAt: true,
      },
    });

    // Günlük gruplandırma
    const dailyGroups: { [key: string]: number } = {};
    
    users.forEach(user => {
      const date = user.createdAt.toISOString().split('T')[0];
      dailyGroups[date] = (dailyGroups[date] || 0) + 1;
    });

    return Object.entries(dailyGroups)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }),

  // Aktivite istatistikleri
  getActivityStats: publicProcedure.query(async ({ ctx }) => {
    const totalMessages = await ctx.prisma.message.count();
    const totalGifts = await ctx.prisma.giftTransaction.count();
    const totalCoinsSpent = await ctx.prisma.coinTransaction.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        amount: {
          lt: 0,
        },
      },
    });

    // Son 7 gün aktif kullanıcılar
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const activeUsersLastWeek = await ctx.prisma.user.count({
      where: {
        lastActiveAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    return {
      totalMessages,
      totalGifts,
      totalCoinsSpent: Math.abs(totalCoinsSpent._sum.amount || 0),
      activeUsersLastWeek,
    };
  }),

  // Premium kullanıcı istatistikleri
  getPremiumStats: publicProcedure.query(async ({ ctx }) => {
    const totalPremiumUsers = await ctx.prisma.user.count({
      where: { isPremium: true },
    });

    const activeSubscriptions = await ctx.prisma.userPremiumSubscription.count({
      where: { isActive: true },
    });

    const totalRevenue = await ctx.prisma.userPremiumSubscription.aggregate({
      _sum: {
        amountPaid: true,
      },
    });

    // Paket dağılımı
    const packageStats = await ctx.prisma.userPremiumSubscription.groupBy({
      by: ['packageId'],
      _count: {
        id: true,
      },
      where: {
        isActive: true,
      },
    });

    const packagesWithNames = await Promise.all(
      packageStats.map(async (stat) => {
        const premiumPackage = await ctx.prisma.premiumPackage.findUnique({
          where: { id: stat.packageId },
          select: { name: true, price: true },
        });
        return {
          packageId: stat.packageId,
          packageName: premiumPackage?.name || "Bilinmeyen",
          price: premiumPackage?.price || 0,
          count: stat._count.id,
        };
      })
    );

    return {
      totalPremiumUsers,
      activeSubscriptions,
      totalRevenue: totalRevenue._sum.amountPaid || 0,
      packageDistribution: packagesWithNames,
    };
  }),

  // En aktif kullanıcılar
  getTopActiveUsers: publicProcedure.query(async ({ ctx }) => {
    // En çok mesaj gönderen kullanıcılar
    const topMessageSenders = await ctx.prisma.message.groupBy({
      by: ['senderId'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    });

    const usersWithMessageCount = await Promise.all(
      topMessageSenders.map(async (stat) => {
        const user = await ctx.prisma.user.findUnique({
          where: { id: stat.senderId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            isPremium: true,
            isFake: true,
            photos: {
              where: { isPrimary: true },
              select: { filePath: true },
              take: 1,
            },
          },
        });
        return {
          user,
          messageCount: stat._count.id,
        };
      })
    );

    return usersWithMessageCount.filter(item => item.user !== null);
  }),

  // Cihaz dağılımı
  getDeviceStats: publicProcedure.query(async ({ ctx }) => {
    const deviceStats = await ctx.prisma.deviceToken.groupBy({
      by: ['deviceType'],
      _count: {
        id: true,
      },
    });

    return deviceStats.map(stat => ({
      deviceType: stat.deviceType,
      count: stat._count.id,
    }));
  }),

  // Gelir istatistikleri
  getRevenueStats: publicProcedure.query(async ({ ctx }) => {
    // Premium abonelik geliri
    const premiumRevenue = await ctx.prisma.userPremiumSubscription.aggregate({
      _sum: {
        amountPaid: true,
      },
    });

    // Coin satış geliri
    const coinRevenue = await ctx.prisma.coinTransaction.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        transactionType: "PURCHASE",
      },
    });

    // Bu ay geliri
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const monthlyPremiumRevenue = await ctx.prisma.userPremiumSubscription.aggregate({
      _sum: {
        amountPaid: true,
      },
      where: {
        createdAt: {
          gte: currentMonth,
        },
      },
    });

    // Bu ay coin geliri
    const monthlyCoinRevenue = await ctx.prisma.coinTransaction.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        transactionType: "PURCHASE",
        createdAt: {
          gte: currentMonth,
        },
      },
    });

    return {
      totalPremiumRevenue: premiumRevenue._sum.amountPaid || 0,
      totalCoinRevenue: Math.abs(coinRevenue._sum.amount || 0),
      monthlyPremiumRevenue: monthlyPremiumRevenue._sum.amountPaid || 0,
      monthlyCoinRevenue: Math.abs(monthlyCoinRevenue._sum.amount || 0),
      totalRevenue: (premiumRevenue._sum.amountPaid || 0) + Math.abs(coinRevenue._sum.amount || 0),
    };
  }),

  // Aylık gelir trendi (Son 12 ay)
  getMonthlyRevenueTrend: publicProcedure.query(async ({ ctx }) => {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    // Premium abonelik geliri (aylık)
    const premiumSubscriptions = await ctx.prisma.userPremiumSubscription.findMany({
      where: {
        createdAt: {
          gte: twelveMonthsAgo,
        },
      },
      select: {
        createdAt: true,
        amountPaid: true,
      },
    });

    // Coin satış geliri (aylık)
    const coinTransactions = await ctx.prisma.coinTransaction.findMany({
      where: {
        transactionType: "PURCHASE",
        createdAt: {
          gte: twelveMonthsAgo,
        },
      },
      select: {
        createdAt: true,
        amount: true,
      },
    });

    // Aylık gruplandırma
    const monthlyRevenue: { [key: string]: { premium: number; coin: number } } = {};

    // Premium gelirlerini gruplandır
    premiumSubscriptions.forEach(sub => {
      const monthKey = sub.createdAt.toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyRevenue[monthKey]) {
        monthlyRevenue[monthKey] = { premium: 0, coin: 0 };
      }
      monthlyRevenue[monthKey].premium += sub.amountPaid || 0;
    });

    // Coin gelirlerini gruplandır
    coinTransactions.forEach(transaction => {
      const monthKey = transaction.createdAt.toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyRevenue[monthKey]) {
        monthlyRevenue[monthKey] = { premium: 0, coin: 0 };
      }
      monthlyRevenue[monthKey].coin += Math.abs(transaction.amount);
    });

    return Object.entries(monthlyRevenue)
      .map(([month, revenue]) => ({
        month,
        premiumRevenue: revenue.premium,
        coinRevenue: revenue.coin,
        totalRevenue: revenue.premium + revenue.coin,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }),

  // En çok gelir getiren paketler
  getTopRevenuePackages: publicProcedure.query(async ({ ctx }) => {
    // Premium paket gelirleri
    const premiumPackageRevenue = await ctx.prisma.userPremiumSubscription.groupBy({
      by: ['packageId'],
      _sum: {
        amountPaid: true,
      },
      _count: {
        id: true,
      },
    });

    const premiumPackagesWithNames = await Promise.all(
      premiumPackageRevenue.map(async (stat) => {
        const premiumPackage = await ctx.prisma.premiumPackage.findUnique({
          where: { id: stat.packageId },
          select: { name: true, price: true },
        });
        return {
          type: 'premium' as const,
          packageId: stat.packageId,
          packageName: premiumPackage?.name || "Bilinmeyen",
          price: premiumPackage?.price || 0,
          totalRevenue: stat._sum.amountPaid || 0,
          salesCount: stat._count.id,
        };
      })
    );

    // Coin paket gelirleri
    const coinPackageRevenue = await ctx.prisma.coinTransaction.groupBy({
      by: ['packageId'],
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
      where: {
        transactionType: "PURCHASE",
        packageId: {
          not: null,
        },
      },
    });

    const coinPackagesWithNames = await Promise.all(
      coinPackageRevenue.map(async (stat) => {
        const premiumPackage = await ctx.prisma.coinPackage.findUnique({
          where: { id: stat.packageId! },
          select: { name: true, price: true },
        });
        return {
          type: 'coin' as const,
          packageId: stat.packageId!,
          packageName: premiumPackage?.name || "Bilinmeyen",
          price: premiumPackage?.price || 0,
          totalRevenue: Math.abs(stat._sum.amount || 0),
          salesCount: stat._count.id,
        };
      })
    );

    // Tüm paketleri birleştir ve gelire göre sırala
    const allPackages = [...premiumPackagesWithNames, ...coinPackagesWithNames]
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);

    return allPackages;
  }),

  // Günlük gelir trendi (Son 30 gün)
  getDailyRevenueTrend: publicProcedure.query(async ({ ctx }) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Premium abonelik geliri (günlük)
    const premiumSubscriptions = await ctx.prisma.userPremiumSubscription.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        createdAt: true,
        amountPaid: true,
      },
    });

    // Coin satış geliri (günlük)
    const coinTransactions = await ctx.prisma.coinTransaction.findMany({
      where: {
        transactionType: "PURCHASE",
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        createdAt: true,
        amount: true,
      },
    });

    // Günlük gruplandırma
    const dailyRevenue: { [key: string]: { premium: number; coin: number } } = {};

    // Premium gelirlerini gruplandır
    premiumSubscriptions.forEach(sub => {
      const dateKey = sub.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD
      if (!dailyRevenue[dateKey]) {
        dailyRevenue[dateKey] = { premium: 0, coin: 0 };
      }
      dailyRevenue[dateKey].premium += sub.amountPaid || 0;
    });

    // Coin gelirlerini gruplandır
    coinTransactions.forEach(transaction => {
      const dateKey = transaction.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD
      if (!dailyRevenue[dateKey]) {
        dailyRevenue[dateKey] = { premium: 0, coin: 0 };
      }
      dailyRevenue[dateKey].coin += Math.abs(transaction.amount);
    });

    return Object.entries(dailyRevenue)
      .map(([date, revenue]) => ({
        date,
        premiumRevenue: revenue.premium,
        coinRevenue: revenue.coin,
        totalRevenue: revenue.premium + revenue.coin,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }),

  // En çok harcama yapan kullanıcılar
  getTopSpendingUsers: publicProcedure.query(async ({ ctx }) => {
    // Premium harcamaları
    const premiumSpending = await ctx.prisma.userPremiumSubscription.groupBy({
      by: ['userId'],
      _sum: {
        amountPaid: true,
      },
    });

    // Coin harcamaları
    const coinSpending = await ctx.prisma.coinTransaction.groupBy({
      by: ['userId'],
      _sum: {
        amount: true,
      },
      where: {
        transactionType: "PURCHASE",
      },
    });

    // Kullanıcı harcamalarını birleştir
    const userSpending: { [userId: string]: number } = {};

    premiumSpending.forEach(spending => {
      userSpending[spending.userId] = (userSpending[spending.userId] || 0) + (spending._sum.amountPaid || 0);
    });

    coinSpending.forEach(spending => {
      userSpending[spending.userId] = (userSpending[spending.userId] || 0) + Math.abs(spending._sum.amount || 0);
    });

    // En çok harcayan 10 kullanıcı
    const topSpenders = Object.entries(userSpending)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    const usersWithSpending = await Promise.all(
      topSpenders.map(async ([userId, totalSpent]) => {
        const user = await ctx.prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            isPremium: true,
            photos: {
              where: { isPrimary: true },
              select: { filePath: true },
              take: 1,
            },
          },
        });
        return {
          user,
          totalSpent,
        };
      })
    );

    return usersWithSpending.filter(item => item.user !== null);
  }),
});