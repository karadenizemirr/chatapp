"use client";

import { useTrpc } from "@/hooks/use-trpc";
import "tw-animate-css";
import {
  UsersIcon,
  TrendingUpIcon,
  CrownIcon,
  CoinsIcon,
  MessageSquareIcon,
  GiftIcon,
  ShieldIcon,
  CalendarIcon,
  DollarSignIcon,
  BarChart3Icon,
  PieChartIcon,
  ActivityIcon,
  MapPinIcon,
  SmartphoneIcon,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";

export default function PanelContainer() {
  const trpc = useTrpc();

  // Tüm dashboard verilerini getir
  const { data: userStats } = trpc.analytics.getUserStats.useQuery();
  const { data: activityStats } = trpc.analytics.getActivityStats.useQuery();
  const { data: revenueStats } = trpc.analytics.getRevenueStats.useQuery();
  const { data: premiumStats } = trpc.analytics.getPremiumStats.useQuery();
  const { data: genderDistribution } = trpc.analytics.getGenderDistribution.useQuery();
  const { data: cityDistribution } = trpc.analytics.getCityDistribution.useQuery();
  const { data: topActiveUsers } = trpc.analytics.getTopActiveUsers.useQuery();
  const { data: deviceStats } = trpc.analytics.getDeviceStats.useQuery();
  const { data: dailyRegistrations } = trpc.analytics.getDailyRegistrations.useQuery();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getGenderText = (gender: string) => {
    const genders = {
      MALE: "Erkek",
      FEMALE: "Kadın",
      OTHER: "Diğer",
    };
    return genders[gender as keyof typeof genders] || gender;
  };

  const getGenderEmoji = (gender: string) => {
    const emojis = {
      MALE: "👨",
      FEMALE: "👩",
      OTHER: "🧑",
    };
    return emojis[gender as keyof typeof emojis] || "👤";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Dashboard"
        description="Genel bakış ve önemli istatistikler"
        badge={{
          text: "Canlı Veriler",
          icon: <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        }}
        stats={[
          { value: userStats?.totalUsers?.toLocaleString() || "0", label: "kullanıcı" },
          { value: formatCurrency(revenueStats?.totalRevenue || 0), label: "gelir" }
        ]}
      />

      {/* Ana İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100 hover:border-blue-200 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Kullanıcı</p>
              <p className="text-3xl font-bold text-blue-600">{userStats?.totalUsers?.toLocaleString() || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                {userStats?.newUsers || 0} yeni (30 gün)
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 hover:border-green-200 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Gelir</p>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(revenueStats?.totalRevenue || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Bu ay: {formatCurrency((revenueStats?.monthlyPremiumRevenue || 0) + (revenueStats?.monthlyCoinRevenue || 0))}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center">
              <DollarSignIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 hover:border-purple-200 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Premium Kullanıcı</p>
              <p className="text-3xl font-bold text-purple-600">{userStats?.premiumUsers || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                {premiumStats?.activeSubscriptions || 0} aktif abonelik
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg flex items-center justify-center">
              <CrownIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 hover:border-orange-200 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aktif Kullanıcı</p>
              <p className="text-3xl font-bold text-orange-600">{userStats?.activeUsers || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                {activityStats?.activeUsersLastWeek || 0} haftalık aktif
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUpIcon className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Aktivite İstatistikleri */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100 hover:border-blue-200 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Mesaj</p>
              <p className="text-2xl font-bold text-blue-600">
                {activityStats?.totalMessages?.toLocaleString() || 0}
              </p>
            </div>
            <MessageSquareIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 hover:border-pink-200 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Hediye</p>
              <p className="text-2xl font-bold text-pink-600">
                {activityStats?.totalGifts?.toLocaleString() || 0}
              </p>
            </div>
            <div className="p-2 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg">
              <GiftIcon className="w-6 h-6 text-pink-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 hover:border-yellow-200 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Harcanan Coin</p>
              <p className="text-2xl font-bold text-yellow-600">
                {activityStats?.totalCoinsSpent?.toLocaleString() || 0}
              </p>
            </div>
            <div className="p-2 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg">
              <CoinsIcon className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 hover:border-red-200 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Fake Kullanıcı</p>
              <p className="text-2xl font-bold text-red-600">{userStats?.fakeUsers || 0}</p>
            </div>
            <div className="p-2 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
              <ShieldIcon className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cinsiyet Dağılımı */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center space-x-2 pb-2 border-b border-gray-100">
            <div className="p-1.5 bg-blue-50 rounded-md">
              <PieChartIcon className="w-5 h-5 text-blue-500" />
            </div>
            <span>Cinsiyet Dağılımı</span>
          </h3>
          <div className="space-y-4">
            {genderDistribution?.map((item) => {
              const total = genderDistribution.reduce((sum, g) => sum + g.count, 0);
              const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
              const barWidth = total > 0 ? (item.count / total) * 100 : 0;
              return (
                <div key={item.gender}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{getGenderEmoji(item.gender)}</span>
                      <span className="font-medium text-gray-900">{getGenderText(item.gender)}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">{item.count.toLocaleString()}</span>
                      <span className="text-sm text-gray-500 ml-2">%{percentage}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${barWidth}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* En Popüler Şehirler */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center space-x-2 pb-2 border-b border-gray-100">
            <div className="p-1.5 bg-green-50 rounded-md">
              <MapPinIcon className="w-5 h-5 text-green-500" />
            </div>
            <span>En Popüler Şehirler</span>
          </h3>
          <div className="space-y-3">
            {cityDistribution?.slice(0, 6).map((item, index) => (
              <div key={item.cityId} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-green-600">#{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{item.cityName}</div>
                    <div className="text-xs text-gray-500">{item.countryCode}</div>
                  </div>
                </div>
                <div className="font-bold text-green-600">{item.count.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* En Aktif Kullanıcılar */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center space-x-2 pb-2 border-b border-gray-100">
            <div className="p-1.5 bg-purple-50 rounded-md">
              <ActivityIcon className="w-5 h-5 text-purple-500" />
            </div>
            <span>En Aktif Kullanıcılar</span>
          </h3>
          <div className="space-y-3">
            {topActiveUsers?.slice(0, 6).map((item, index) => (
              <div key={item.user?.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center">
                    {item.user?.photos?.[0]?.filePath ? (
                      <img
                        src={item.user.photos[0].filePath}
                        alt={`${item.user.firstName} ${item.user.lastName}`}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-xs">
                        {item.user?.firstName?.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 flex items-center space-x-1">
                      <span>{item.user?.firstName} {item.user?.lastName}</span>
                      {item.user?.isPremium && <CrownIcon className="w-3 h-3 text-yellow-500" />}
                      {item.user?.isFake && <span className="text-xs text-orange-500">Fake</span>}
                    </div>
                    <div className="text-xs text-gray-500">#{index + 1}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-purple-600">{item.messageCount}</div>
                  <div className="text-xs text-gray-500">mesaj</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cihaz Dağılımı */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center space-x-2 pb-2 border-b border-gray-100">
            <div className="p-1.5 bg-indigo-50 rounded-md">
              <SmartphoneIcon className="w-5 h-5 text-indigo-500" />
            </div>
            <span>Cihaz Dağılımı</span>
          </h3>
          <div className="space-y-4">
            {deviceStats?.map((item) => {
              const total = deviceStats.reduce((sum, d) => sum + d.count, 0);
              const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
              const barWidth = total > 0 ? (item.count / total) * 100 : 0;
              return (
                <div key={item.deviceType}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <SmartphoneIcon className="w-4 h-4" />
                      <span className="font-medium text-gray-900">
                        {item.deviceType === "IOS" ? "iOS" : "Android"}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">{item.count.toLocaleString()}</span>
                      <span className="text-sm text-gray-500 ml-2">%{percentage}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        item.deviceType === "IOS" ? "bg-blue-500" : "bg-green-500"
                      }`}
                      style={{ width: `${barWidth}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Günlük Kayıt Trendi */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center space-x-2 pb-2 border-b border-gray-100">
          <div className="p-1.5 bg-blue-50 rounded-md">
            <BarChart3Icon className="w-5 h-5 text-blue-500" />
          </div>
          <span>Son Günlük Kayıtlar</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {dailyRegistrations?.slice(-7).map((item) => {
            const date = new Date(item.date);
            const dayName = date.toLocaleDateString('tr-TR', { weekday: 'short' });
            const dayDate = date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
            const maxCount = Math.max(...(dailyRegistrations?.map(d => d.count) || [1]));
            const barHeight = maxCount > 0 ? (item.count / maxCount) * 100 : 0;

            return (
              <div key={item.date} className="text-center">
                <div className="h-20 flex items-end justify-center mb-2">
                  <div
                    className="bg-blue-500 rounded-t-md w-8 transition-all duration-300"
                    style={{ height: `${Math.max(barHeight, 5)}%` }}
                  ></div>
                </div>
                <div className="text-sm font-bold text-gray-900">{item.count}</div>
                <div className="text-xs text-gray-500">{dayName}</div>
                <div className="text-xs text-gray-400">{dayDate}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gelir Özeti */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2 pb-2 border-b border-gray-100">
          <div className="p-1.5 bg-green-50 rounded-md">
            <DollarSignIcon className="w-5 h-5 text-green-500" />
          </div>
          <span>Gelir Özeti</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <CrownIcon className="w-8 h-8 text-white" />
            </div>
            <div className="font-bold text-2xl text-purple-600">
              {formatCurrency(revenueStats?.totalPremiumRevenue || 0)}
            </div>
            <div className="text-sm text-gray-600">Premium Gelir</div>
            <div className="text-xs text-gray-500 mt-1">
              Bu ay: {formatCurrency(revenueStats?.monthlyPremiumRevenue || 0)}
            </div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <CoinsIcon className="w-8 h-8 text-white" />
            </div>
            <div className="font-bold text-2xl text-yellow-600">
              {formatCurrency(revenueStats?.totalCoinRevenue || 0)}
            </div>
            <div className="text-sm text-gray-600">Coin Gelir</div>
            <div className="text-xs text-gray-500 mt-1">
              Bu ay: {formatCurrency(revenueStats?.monthlyCoinRevenue || 0)}
            </div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUpIcon className="w-8 h-8 text-white" />
            </div>
            <div className="font-bold text-2xl text-green-600">
              {formatCurrency(revenueStats?.totalRevenue || 0)}
            </div>
            <div className="text-sm text-gray-600">Toplam Gelir</div>
            <div className="text-xs text-gray-500 mt-1">
              Bu ay: {formatCurrency((revenueStats?.monthlyPremiumRevenue || 0) + (revenueStats?.monthlyCoinRevenue || 0))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}