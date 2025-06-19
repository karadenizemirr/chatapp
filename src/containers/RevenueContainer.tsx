"use client";

import { useMemo } from "react";
import { useTrpc } from "@/hooks/use-trpc";
import {
  DollarSignIcon,
  TrendingUpIcon,
  CrownIcon,
  CoinsIcon,
  CalendarIcon,
  PackageIcon,
  UsersIcon,
  BarChartIcon,
  LineChartIcon,
  PieChartIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  TrendingDownIcon,
  LayoutDashboardIcon,
} from "lucide-react";

  // Veri tiplerini tanımlama
  type RevenuePackage = {
  packageId: string;
  packageName: string;
  type: 'premium' | 'coin';
  price: number;
  salesCount: number;
  totalRevenue: number;
  };

  type SpendingUser = {
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    isPremium?: boolean;
    photos?: Array<{filePath: string}>;
  };
  totalSpent: number;
  };

  type MonthlyTrendItem = {
  month: string;
  totalRevenue: number;
  premiumRevenue: number;
  coinRevenue: number;
  };

  type DailyTrendItem = {
  date: string;
  totalRevenue: number;
  premiumRevenue: number;
  coinRevenue: number;
  };

  export default function RevenueContainer() {
  const trpc = useTrpc();

  // Tüm gelir analitik verilerini getir
  const { data: revenueStats, isLoading: statsLoading } = trpc.analytics.getRevenueStats.useQuery();
  const { data: monthlyTrend, isLoading: monthlyLoading } = trpc.analytics.getMonthlyRevenueTrend.useQuery();
  const { data: dailyTrend, isLoading: dailyLoading } = trpc.analytics.getDailyRevenueTrend.useQuery();
  const { data: topPackages, isLoading: packagesLoading } = trpc.analytics.getTopRevenuePackages.useQuery();
  const { data: topSpenders, isLoading: spendersLoading } = trpc.analytics.getTopSpendingUsers.useQuery();

  // İstek durumları
  const isLoading = statsLoading || monthlyLoading || dailyLoading || packagesLoading || spendersLoading;

  // Genel hesaplamalar
  const monthlyTotal = useMemo(() => {
    return (revenueStats?.monthlyPremiumRevenue || 0) + (revenueStats?.monthlyCoinRevenue || 0);
  }, [revenueStats]);

  // Büyüme oranı hesaplama
  const growthRate = useMemo(() => {
    if (!monthlyTrend || monthlyTrend.length < 2) return 0;

    const currentMonth = monthlyTrend[monthlyTrend.length - 1]?.totalRevenue || 0;
    const previousMonth = monthlyTrend[monthlyTrend.length - 2]?.totalRevenue || 1;

    return Math.round(((currentMonth / previousMonth) - 1) * 100);
  }, [monthlyTrend]);

  // Premium ve Coin yüzdeleri
  const premiumPercentage = useMemo(() => {
    if (!revenueStats?.totalRevenue || revenueStats.totalRevenue === 0) return 0;
    return Math.round((revenueStats.totalPremiumRevenue / revenueStats.totalRevenue) * 100);
  }, [revenueStats]);

  const coinPercentage = useMemo(() => {
    if (!revenueStats?.totalRevenue || revenueStats.totalRevenue === 0) return 0;
    return Math.round((revenueStats.totalCoinRevenue / revenueStats.totalRevenue) * 100);
  }, [revenueStats]);

  // Yardımcı fonksiyonlar
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getMonthName = (monthStr: string) => {
    const months = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    const month = parseInt(monthStr.split('-')[1]) - 1;
    return months[month] || monthStr;
  };

  const getPackageTypeIcon = (type: string) => {
    return type === 'premium' ? (
      <CrownIcon className="w-4 h-4 text-yellow-500" />
    ) : (
      <CoinsIcon className="w-4 h-4 text-yellow-500" />
    );
  };

  const getPackageTypeText = (type: string) => {
    return type === 'premium' ? 'Premium' : 'Coin';
  };

      // Loading durumunda gösterilecek skeleton
      if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl p-6 h-32"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array(2).fill(0).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl p-6 h-64"></div>
          ))}
        </div>
      </div>
    );
      }

      return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-6 rounded-2xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <LayoutDashboardIcon className="mr-2 h-8 w-8 text-primary" />
              Gelir Analitiği
            </h1>
            <p className="text-gray-600 mt-1">Gelir istatistikleri ve finansal analiz raporları</p>
          </div>
          <div className="mt-4 md:mt-0 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 flex items-center">
            <span className="text-sm font-medium text-gray-600 mr-2">Büyüme:</span>
            <span className={`font-bold text-sm flex items-center ${growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {growthRate >= 0 ? (
                <ArrowUpIcon className="w-4 h-4 mr-1" />
              ) : (
                <ArrowDownIcon className="w-4 h-4 mr-1" />
              )}
              {Math.abs(growthRate)}%
            </span>
          </div>
        </div>

        {/* Genel Gelir İstatistikleri */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Gelir</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(revenueStats?.totalRevenue || 0)}
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-full">
                <DollarSignIcon className="w-7 h-7 text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Premium Gelir</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(revenueStats?.totalPremiumRevenue || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">{premiumPercentage}% toplam gelir</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-full">
                <CrownIcon className="w-7 h-7 text-yellow-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Coin Gelir</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(revenueStats?.totalCoinRevenue || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">{coinPercentage}% toplam gelir</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-full">
                <CoinsIcon className="w-7 h-7 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bu Ay Premium</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(revenueStats?.monthlyPremiumRevenue || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {revenueStats?.monthlyPremiumRevenue && monthlyTotal ? 
                    Math.round((revenueStats.monthlyPremiumRevenue / monthlyTotal) * 100) : 0}% aylık
                </p>
              </div>
              <div className="bg-purple-50 p-3 rounded-full">
                <CalendarIcon className="w-7 h-7 text-purple-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bu Ay Coin</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {formatCurrency(revenueStats?.monthlyCoinRevenue || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {revenueStats?.monthlyCoinRevenue && monthlyTotal ? 
                    Math.round((revenueStats.monthlyCoinRevenue / monthlyTotal) * 100) : 0}% aylık
                </p>
              </div>
              <div className="bg-indigo-50 p-3 rounded-full">
                <TrendingUpIcon className="w-7 h-7 text-indigo-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aylık Gelir Trendi */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <div className="bg-blue-50 p-2 rounded-lg mr-3">
              <LineChartIcon className="w-5 h-5 text-blue-500" />
            </div>
            <span>Aylık Gelir Trendi</span>
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full ml-2">
              Son 6 Ay
            </span>
          </h3>

          <div className="space-y-5">
            {monthlyTrend?.slice(-6).map((item, index) => {
              const maxRevenue = Math.max(...(monthlyTrend?.map(m => m.totalRevenue) || [1]));
              const barWidth = maxRevenue > 0 ? (item.totalRevenue / maxRevenue) * 100 : 0;

              // Önceki aydan değişim
              let change = 0;
              let changePercent = 0;
              if (index > 0 && monthlyTrend) {
                const prevMonth = monthlyTrend[monthlyTrend.length - 6 + index - 1];
                if (prevMonth && prevMonth.totalRevenue > 0) {
                  change = item.totalRevenue - prevMonth.totalRevenue;
                  changePercent = Math.round((change / prevMonth.totalRevenue) * 100);
                }
              }

              return (
                <div key={item.month} className="hover:bg-gray-50 p-3 -mx-3 rounded-lg transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 flex items-center">
                      {getMonthName(item.month)}
                      <span className="text-gray-500 text-sm ml-1">{item.month.split('-')[0]}</span>
                    </span>
                    <div className="flex items-center">
                      {change !== 0 && (
                        <span className={`text-xs font-medium flex items-center mr-2 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {change > 0 ? <ArrowUpIcon className="w-3 h-3 mr-1" /> : <ArrowDownIcon className="w-3 h-3 mr-1" />}
                          {Math.abs(changePercent)}%
                        </span>
                      )}
                      <span className="font-bold text-blue-600">
                        {formatCurrency(item.totalRevenue)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-400 to-blue-600 h-3.5 rounded-full transition-all duration-300 relative"
                      style={{ width: `${barWidth}%` }}
                    >
                      {barWidth > 50 && (
                        <span className="absolute text-[10px] text-white right-2 top-0 font-medium">
                          {Math.round(barWidth)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span className="flex items-center">
                      <CrownIcon className="w-3 h-3 text-yellow-500 mr-1" />
                      Premium: {formatCurrency(item.premiumRevenue)}
                    </span>
                    <span className="flex items-center">
                      <CoinsIcon className="w-3 h-3 text-blue-500 mr-1" />
                      Coin: {formatCurrency(item.coinRevenue)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Günlük Gelir Trendi */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <div className="bg-purple-50 p-2 rounded-lg mr-3">
              <BarChartIcon className="w-5 h-5 text-purple-500" />
            </div>
            <span>Günlük Gelir Trendi</span>
            <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full ml-2">
              Son 7 Gün
            </span>
          </h3>

          <div className="space-y-5">
            {dailyTrend?.slice(-7).map((item, index) => {
              const maxRevenue = Math.max(...(dailyTrend?.map(d => d.totalRevenue) || [1]));
              const barWidth = maxRevenue > 0 ? (item.totalRevenue / maxRevenue) * 100 : 0;
              const date = new Date(item.date);
              const dayName = date.toLocaleDateString('tr-TR', { weekday: 'short' });
              const dayDate = date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });

              // Önceki günden değişim
              let change = 0;
              let changePercent = 0;
              if (index > 0 && dailyTrend) {
                const prevDay = dailyTrend[dailyTrend.length - 7 + index - 1];
                if (prevDay && prevDay.totalRevenue > 0) {
                  change = item.totalRevenue - prevDay.totalRevenue;
                  changePercent = Math.round((change / prevDay.totalRevenue) * 100);
                }
              }

              const isToday = new Date().toLocaleDateString() === date.toLocaleDateString();

              return (
                <div key={item.date} className={`hover:bg-gray-50 p-3 -mx-3 rounded-lg transition-colors ${isToday ? 'border-l-4 border-purple-400 pl-2' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 flex items-center">
                      {dayName}
                      <span className="text-gray-500 text-sm ml-1">{dayDate}</span>
                      {isToday && <span className="ml-1 text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">Bugün</span>}
                    </span>
                    <div className="flex items-center">
                      {change !== 0 && (
                        <span className={`text-xs font-medium flex items-center mr-2 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {change > 0 ? <ArrowUpIcon className="w-3 h-3 mr-1" /> : <ArrowDownIcon className="w-3 h-3 mr-1" />}
                          {Math.abs(changePercent)}%
                        </span>
                      )}
                      <span className="font-bold text-purple-600">
                        {formatCurrency(item.totalRevenue)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-400 to-purple-600 h-3.5 rounded-full transition-all duration-300 relative"
                      style={{ width: `${barWidth}%` }}
                    >
                      {barWidth > 50 && (
                        <span className="absolute text-[10px] text-white right-2 top-0 font-medium">
                          {Math.round(barWidth)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span className="flex items-center">
                      <CrownIcon className="w-3 h-3 text-yellow-500 mr-1" />
                      Premium: {formatCurrency(item.premiumRevenue)}
                    </span>
                    <span className="flex items-center">
                      <CoinsIcon className="w-3 h-3 text-blue-500 mr-1" />
                      Coin: {formatCurrency(item.coinRevenue)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* En Çok Gelir Getiren Paketler */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <div className="bg-green-50 p-2 rounded-lg mr-3">
              <PackageIcon className="w-5 h-5 text-green-500" />
            </div>
            <span>En Çok Gelir Getiren Paketler</span>
            <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full ml-2">
              Top 8
            </span>
          </h3>

          <div className="space-y-3">
            {topPackages?.slice(0, 8).map((item, index) => {
              // Toplam gelire göre yüzde hesaplama
              const totalMaxRevenue = Math.max(...(topPackages?.map(p => p.totalRevenue) || [1]));
              const percentOfMax = Math.round((item.totalRevenue / totalMaxRevenue) * 100);

              return (
                <div 
                  key={`${item.type}-${item.packageId}`} 
                  className="flex items-center justify-between p-3 -mx-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-7 h-7 ${index < 3 ? 'bg-gradient-to-br from-green-400 to-green-600' : 'bg-green-100'} rounded-full flex items-center justify-center shadow-sm`}>
                      <span className={`text-xs font-bold ${index < 3 ? 'text-white' : 'text-green-600'}`}>#{index + 1}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`p-1.5 rounded-full ${item.type === 'premium' ? 'bg-yellow-50' : 'bg-blue-50'}`}>
                        {getPackageTypeIcon(item.type)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{item.packageName}</div>
                        <div className="text-xs text-gray-500 flex items-center">
                          <span className={`inline-block w-2 h-2 rounded-full mr-1 ${item.type === 'premium' ? 'bg-yellow-500' : 'bg-blue-500'}`}></span>
                          {getPackageTypeText(item.type)} • {item.salesCount} satış
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600 flex items-center space-x-1">
                      <span>{formatCurrency(item.totalRevenue)}</span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{percentOfMax}%</span>
                    </div>
                    <div className="text-xs text-gray-500">{formatCurrency(item.price)} birim fiyat</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* En Çok Harcama Yapan Kullanıcılar */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <div className="bg-blue-50 p-2 rounded-lg mr-3">
              <UsersIcon className="w-5 h-5 text-blue-500" />
            </div>
            <span>En Çok Harcama Yapan Kullanıcılar</span>
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full ml-2">
              Top 8
            </span>
          </h3>

          <div className="space-y-3">
            {topSpenders?.slice(0, 8).map((item, index) => {
              // Toplam harcamaya göre yüzde hesaplama
              const maxSpent = Math.max(...(topSpenders?.map(s => s.totalSpent) || [1]));
              const percentOfMax = Math.round((item.totalSpent / maxSpent) * 100);

              return (
                <div 
                  key={item.user?.id} 
                  className="flex items-center justify-between p-3 -mx-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-7 h-7 ${index < 3 ? 'bg-gradient-to-br from-blue-400 to-blue-600' : 'bg-blue-100'} rounded-full flex items-center justify-center shadow-sm`}>
                      <span className={`text-xs font-bold ${index < 3 ? 'text-white' : 'text-blue-600'}`}>#{index + 1}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center shadow-sm overflow-hidden">
                          {item.user?.photos?.[0]?.filePath ? (
                            <img
                              src={item.user.photos[0].filePath}
                              alt={`${item.user.firstName} ${item.user.lastName}`}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-bold text-sm">
                              {item.user?.firstName?.charAt(0)}
                            </span>
                          )}
                        </div>
                        {item.user?.isPremium && (
                          <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5 shadow-sm border border-white">
                            <CrownIcon className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {item.user?.firstName} {item.user?.lastName}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center">
                          <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1"></span>
                          Müşteri ID: {item.user?.id.substring(0, 6)}...
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-600 flex items-center space-x-1">
                      <span>{formatCurrency(item.totalSpent)}</span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{percentOfMax}%</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.user?.isPremium ? 'Premium Üye' : 'Standart Üye'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Gelir Dağılımı Özeti */}
      <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-2xl p-8 border border-indigo-100 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-8 flex items-center">
          <div className="bg-indigo-100 p-2 rounded-lg mr-3">
            <PieChartIcon className="w-6 h-6 text-indigo-500" />
          </div>
          <span>Gelir Dağılımı Özeti</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-50 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                <CrownIcon className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="text-center">
              <div className="font-bold text-3xl text-yellow-600 mb-1">
                {premiumPercentage}%
              </div>
              <div className="text-sm font-medium text-gray-600 mb-2">Premium Gelir Oranı</div>
              <div className="flex items-center justify-center gap-2">
                <div className="px-2 py-1 bg-yellow-50 rounded-md text-xs text-yellow-700">
                  {formatCurrency(revenueStats?.totalPremiumRevenue || 0)}
                </div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-50 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <CoinsIcon className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="text-center">
              <div className="font-bold text-3xl text-blue-600 mb-1">
                {coinPercentage}%
              </div>
              <div className="text-sm font-medium text-gray-600 mb-2">Coin Gelir Oranı</div>
              <div className="flex items-center justify-center gap-2">
                <div className="px-2 py-1 bg-blue-50 rounded-md text-xs text-blue-700">
                  {formatCurrency(revenueStats?.totalCoinRevenue || 0)}
                </div>
                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-50 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                {growthRate >= 0 ? (
                  <TrendingUpIcon className="w-8 h-8 text-white" />
                ) : (
                  <TrendingDownIcon className="w-8 h-8 text-white" />
                )}
              </div>
            </div>
            <div className="text-center">
              <div className={`font-bold text-3xl mb-1 ${growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {growthRate >= 0 ? '+' : ''}{growthRate}%
              </div>
              <div className="text-sm font-medium text-gray-600 mb-2">Aylık Büyüme</div>
              <div className="flex items-center justify-center gap-2">
                <div className="px-2 py-1 bg-green-50 rounded-md text-xs text-green-700">
                  Önceki aya göre
                </div>
                <div className={`h-3 w-3 rounded-full ${growthRate >= 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-50 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <CalendarIcon className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="text-center">
              <div className="font-bold text-3xl text-purple-600 mb-1">
                {formatCurrency(monthlyTotal)}
              </div>
              <div className="text-sm font-medium text-gray-600 mb-2">Bu Ay Toplam</div>
              <div className="flex items-center justify-center gap-2">
                <div className="px-2 py-1 bg-purple-50 rounded-md text-xs text-purple-700">
                  {new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
                </div>
                <div className="h-3 w-3 rounded-full bg-purple-500"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}