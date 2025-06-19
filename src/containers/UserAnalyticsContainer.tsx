"use client";

import { useTrpc } from "@/hooks/use-trpc";
import {
  UsersIcon,
  TrendingUpIcon,
  CrownIcon,
  ShieldIcon,
  MapPinIcon,
  CalendarIcon,
  MessageSquareIcon,
  GiftIcon,
  CoinsIcon,
  SmartphoneIcon,
  TabletIcon,
  PieChartIcon,
  BarChartIcon,
} from "lucide-react";

export default function UserAnalyticsContainer() {
  const trpc = useTrpc();

  // Tüm analitik verilerini getir
  const { data: userStats } = trpc.analytics.getUserStats.useQuery();
  const { data: genderDistribution } = trpc.analytics.getGenderDistribution.useQuery();
  const { data: cityDistribution } = trpc.analytics.getCityDistribution.useQuery();
  const { data: ageDistribution } = trpc.analytics.getAgeDistribution.useQuery();
  const { data: activityStats } = trpc.analytics.getActivityStats.useQuery();
  const { data: premiumStats } = trpc.analytics.getPremiumStats.useQuery();
  const { data: topActiveUsers } = trpc.analytics.getTopActiveUsers.useQuery();
  const { data: deviceStats } = trpc.analytics.getDeviceStats.useQuery();

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

  const getDeviceIcon = (deviceType: string) => {
    return deviceType === "IOS" ? (
      <SmartphoneIcon className="w-4 h-4" />
    ) : (
      <TabletIcon className="w-4 h-4" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Kullanıcı Analitiği</h1>
        <p className="text-gray-600 mt-1">Kullanıcı istatistikleri ve analiz raporları</p>
      </div>

      {/* Genel İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Kullanıcı</p>
              <p className="text-2xl font-bold text-gray-900">{userStats?.totalUsers || 0}</p>
            </div>
            <UsersIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aktif Kullanıcı</p>
              <p className="text-2xl font-bold text-green-600">{userStats?.activeUsers || 0}</p>
            </div>
            <TrendingUpIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Premium Kullanıcı</p>
              <p className="text-2xl font-bold text-yellow-600">{userStats?.premiumUsers || 0}</p>
            </div>
            <CrownIcon className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Fake Kullanıcı</p>
              <p className="text-2xl font-bold text-orange-600">{userStats?.fakeUsers || 0}</p>
            </div>
            <ShieldIcon className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Yasaklı Kullanıcı</p>
              <p className="text-2xl font-bold text-red-600">{userStats?.bannedUsers || 0}</p>
            </div>
            <ShieldIcon className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Yeni Kullanıcı</p>
              <p className="text-sm text-gray-500">(30 gün)</p>
              <p className="text-2xl font-bold text-purple-600">{userStats?.newUsers || 0}</p>
            </div>
            <CalendarIcon className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Aktivite İstatistikleri */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Mesaj</p>
              <p className="text-2xl font-bold text-blue-600">{activityStats?.totalMessages?.toLocaleString() || 0}</p>
            </div>
            <MessageSquareIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Hediye</p>
              <p className="text-2xl font-bold text-pink-600">{activityStats?.totalGifts?.toLocaleString() || 0}</p>
            </div>
            <GiftIcon className="w-8 h-8 text-pink-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Harcanan Coin</p>
              <p className="text-2xl font-bold text-yellow-600">{activityStats?.totalCoinsSpent?.toLocaleString() || 0}</p>
            </div>
            <CoinsIcon className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Haftalık Aktif</p>
              <p className="text-2xl font-bold text-green-600">{activityStats?.activeUsersLastWeek || 0}</p>
            </div>
            <TrendingUpIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cinsiyet Dağılımı */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <PieChartIcon className="w-5 h-5 text-blue-500" />
            <span>Cinsiyet Dağılımı</span>
          </h3>
          <div className="space-y-4">
            {genderDistribution?.map((item) => {
              const total = genderDistribution.reduce((sum, g) => sum + g.count, 0);
              const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
              return (
                <div key={item.gender} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getGenderEmoji(item.gender)}</span>
                    <span className="font-medium text-gray-900">{getGenderText(item.gender)}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{item.count.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">%{percentage}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Yaş Dağılımı */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <BarChartIcon className="w-5 h-5 text-green-500" />
            <span>Yaş Dağılımı</span>
          </h3>
          <div className="space-y-4">
            {ageDistribution?.map((item) => {
              const total = ageDistribution.reduce((sum, a) => sum + a.count, 0);
              const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
              const barWidth = total > 0 ? (item.count / total) * 100 : 0;
              return (
                <div key={item.ageRange}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900">{item.ageRange} yaş</span>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">{item.count.toLocaleString()}</span>
                      <span className="text-sm text-gray-500 ml-2">%{percentage}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${barWidth}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* En Popüler Şehirler */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <MapPinIcon className="w-5 h-5 text-blue-500" />
            <span>En Popüler Şehirler</span>
          </h3>
          <div className="space-y-3">
            {cityDistribution?.slice(0, 8).map((item, index) => (
              <div key={item.cityId} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">#{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{item.cityName}</div>
                    <div className="text-xs text-gray-500">{item.countryCode}</div>
                  </div>
                </div>
                <div className="font-bold text-blue-600">{item.count.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Premium İstatistikleri */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <CrownIcon className="w-5 h-5 text-yellow-500" />
            <span>Premium İstatistikleri</span>
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Toplam Premium Kullanıcı</span>
              <span className="font-bold text-yellow-600">{premiumStats?.totalPremiumUsers || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Aktif Abonelik</span>
              <span className="font-bold text-green-600">{premiumStats?.activeSubscriptions || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Toplam Gelir</span>
              <span className="font-bold text-blue-600">{premiumStats?.totalRevenue?.toLocaleString() || 0} TRY</span>
            </div>
            
            {premiumStats?.packageDistribution && premiumStats.packageDistribution.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Paket Dağılımı</h4>
                <div className="space-y-2">
                  {premiumStats.packageDistribution.map((pkg) => (
                    <div key={pkg.packageId} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{pkg.packageName}</span>
                      <span className="font-medium text-gray-900">{pkg.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* En Aktif Kullanıcılar */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <TrendingUpIcon className="w-5 h-5 text-green-500" />
            <span>En Aktif Kullanıcılar</span>
          </h3>
          <div className="space-y-3">
            {topActiveUsers?.slice(0, 8).map((item, index) => (
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
                    <div className="font-medium text-gray-900">
                      {item.user?.firstName} {item.user?.lastName}
                      {item.user?.isPremium && <CrownIcon className="w-3 h-3 text-yellow-500 inline ml-1" />}
                      {item.user?.isFake && <span className="text-xs text-orange-500 ml-1">Fake</span>}
                    </div>
                    <div className="text-xs text-gray-500">#{index + 1}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-600">{item.messageCount}</div>
                  <div className="text-xs text-gray-500">mesaj</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cihaz Dağılımı */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <SmartphoneIcon className="w-5 h-5 text-purple-500" />
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
                      {getDeviceIcon(item.deviceType)}
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
    </div>
  );
}