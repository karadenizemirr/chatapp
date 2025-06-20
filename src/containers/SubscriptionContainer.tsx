"use client";

import { useState } from "react";
import { DataTable, DataTableColumn } from "@/components/ui/datatable";
import { useTrpc } from "@/hooks/use-trpc";
import PageHeader from "@/components/PageHeader";
import {
  PlusIcon,
  CrownIcon,
  XIcon,
  CheckIcon,
  RefreshCwIcon,
  UserIcon,
  CalendarIcon,
  CreditCardIcon,
  FilterIcon,
  SearchIcon,
  BadgeCheckIcon,
  BellIcon,
  UserPlusIcon,
  TrendingUpIcon
} from "lucide-react";

interface Subscription {
  id: string;
  userId: string;
  packageId: string;
  transactionId?: string;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
  isAutoRenewable: boolean;
  paymentMethod: "GOOGLE_PLAY" | "APP_STORE" | "CREDIT_CARD" | "MANUAL";
  amountPaid?: number;
  currency: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    isPremium: boolean;
    photos: Array<{
      id: string;
      filePath: string;
    }>;
  };
  package: {
    id: string;
    name: string;
    price: number;
    currency: string;
    durationType: "WEEKLY" | "MONTHLY" | "YEARLY";
    durationValue: number;
  };
}

interface SubscriptionFormData {
  userId: string;
  packageId: string;
  paymentMethod: "GOOGLE_PLAY" | "APP_STORE" | "CREDIT_CARD" | "MANUAL";
  transactionId: string;
  amountPaid: number;
}

export default function SubscriptionContainer() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    isActive: undefined as boolean | undefined,
    packageId: "",
    userId: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState<SubscriptionFormData>({
    userId: "",
    packageId: "",
    paymentMethod: "MANUAL",
    transactionId: "",
    amountPaid: 0,
  });

  const trpc = useTrpc();

  // Abonelikleri getir
  const {
    data: subscriptionsData,
    isLoading,
    refetch,
  } = trpc.premium.getAllSubscriptions.useQuery({
    limit: 20,
    page: currentPage,
    filters,
  });

  // Premium paketleri getir
  const { data: packagesData } = trpc.premium.getAll.useQuery();

  // Kullanıcı arama
  const { data: usersData } = trpc.user.getAll.useQuery(
    { limit: 50 },
    { enabled: isFormOpen }
  );

  const createMutation = trpc.premium.createSubscription.useMutation();
  const cancelMutation = trpc.premium.cancelSubscription.useMutation();
  const renewMutation = trpc.premium.renewSubscription.useMutation();

  const subscriptions = subscriptionsData?.subscriptions || [];
  const totalCount = subscriptionsData?.totalCount || 0;
  const packages = packagesData?.packages || [];
  const users = usersData?.users || [];

  // Arama ile kullanıcıları filtrele
  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const email = user.email?.toLowerCase() || "";
    return fullName.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
  });

  const handleOpenForm = () => {
    setFormData({
      userId: "",
      packageId: "",
      paymentMethod: "MANUAL",
      transactionId: "",
      amountPaid: 0,
    });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSearchTerm("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createMutation.mutateAsync(formData);
      refetch();
      handleCloseForm();
      alert("Abonelik oluşturuldu!");
    } catch (error: any) {
      alert("Hata: " + error.message);
    }
  };

  const handleCancel = async (subscription: Subscription) => {
    if (confirm(`${subscription.user.firstName} ${subscription.user.lastName} kullanıcısının aboneliğini iptal etmek istediğinizden emin misiniz?`)) {
      try {
        await cancelMutation.mutateAsync({ id: subscription.id });
        refetch();
        alert("Abonelik iptal edildi!");
      } catch (error: any) {
        alert("Hata: " + error.message);
      }
    }
  };

  const handleRenew = async (subscription: Subscription) => {
    try {
      await renewMutation.mutateAsync({
        id: subscription.id,
        paymentMethod: "MANUAL",
      });
      refetch();
      alert("Abonelik yenilendi!");
    } catch (error: any) {
      alert("Hata: " + error.message);
    }
  };

  const getPaymentMethodText = (method: string) => {
    const methods = {
      GOOGLE_PLAY: "Google Play",
      APP_STORE: "App Store",
      CREDIT_CARD: "Kredi Kartı",
      MANUAL: "Manuel",
    };
    return methods[method as keyof typeof methods] || method;
  };

  const getDurationText = (type: string, value: number) => {
    const typeMap = {
      WEEKLY: "Hafta",
      MONTHLY: "Ay",
      YEARLY: "Yıl",
    };
    return `${value} ${typeMap[type as keyof typeof typeMap]}`;
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const columns: DataTableColumn<Subscription>[] = [
    {
      key: "user",
      title: "Kullanıcı",
      width: "250px",
      render: (value, row) => {
        const fullName = `${row.user.firstName} ${row.user.lastName}`;
        const profileImage = row.user.photos?.[0]?.filePath;
        return (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={fullName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-bold">
                  {row.user.firstName.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <div className="font-semibold text-gray-900">{fullName}</div>
              <div className="text-sm text-gray-500">{row.user.email}</div>
              {row.user.isPremium && (
                <div className="flex items-center space-x-1 mt-1">
                  <CrownIcon className="w-3 h-3 text-yellow-500" />
                  <span className="text-xs text-yellow-600">Premium</span>
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "package",
      title: "Paket",
      width: "200px",
      render: (value, row) => (
        <div>
          <div className="font-semibold text-gray-900">{row.package.name}</div>
          <div className="text-sm text-gray-500">
            {getDurationText(row.package.durationType, row.package.durationValue)}
          </div>
          <div className="text-sm font-medium text-green-600">
            {row.package.price} {row.package.currency}
          </div>
        </div>
      ),
    },
    {
      key: "startsAt",
      title: "Başlangıç",
      width: "120px",
      render: (value) => (
        <div className="text-sm text-gray-600">
          {new Date(value).toLocaleDateString("tr-TR")}
        </div>
      ),
    },
    {
      key: "expiresAt",
      title: "Bitiş",
      width: "120px",
      render: (value, row) => {
        const expired = isExpired(value);
        return (
          <div className={`text-sm ${expired ? "text-red-600" : "text-gray-600"}`}>
            {new Date(value).toLocaleDateString("tr-TR")}
            {expired && (
              <div className="text-xs text-red-500">Süresi dolmuş</div>
            )}
          </div>
        );
      },
    },
    {
      key: "isActive",
      title: "Durum",
      align: "center",
      width: "100px",
      render: (value, row) => {
        const expired = isExpired(row.expiresAt);
        let status = "Pasif";
        let className = "bg-red-100 text-red-800";
        
        if (value && !expired) {
          status = "Aktif";
          className = "bg-green-100 text-green-800";
        } else if (value && expired) {
          status = "Süresi Dolmuş";
          className = "bg-orange-100 text-orange-800";
        }

        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
            {status}
          </span>
        );
      },
    },
    {
      key: "paymentMethod",
      title: "Ödeme",
      width: "120px",
      render: (value, row) => (
        <div>
          <div className="text-sm text-gray-900">{getPaymentMethodText(value)}</div>
          {row.amountPaid && (
            <div className="text-xs text-gray-500">
              {row.amountPaid} {row.currency}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "createdAt",
      title: "Oluşturulma",
      width: "120px",
      render: (value) => (
        <div className="text-sm text-gray-600">
          {new Date(value).toLocaleDateString("tr-TR")}
        </div>
      ),
    },
    {
      key: "actions",
      title: "İşlemler",
      align: "center",
      width: "120px",
      render: (value, row) => (
        <div className="flex items-center justify-center space-x-1">
          {row.isActive && (
            <button
              onClick={() => handleRenew(row)}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Yenile"
            >
              <RefreshCwIcon className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => handleCancel(row)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="İptal Et"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

      // İstatistik değerlerini hesapla
      const activeSubscriptions = subscriptions.filter(s => s.isActive && !isExpired(s.expiresAt)).length;
      const expiredSubscriptions = subscriptions.filter(s => isExpired(s.expiresAt)).length;
      const totalRevenue = subscriptions.reduce((sum, s) => sum + (s.amountPaid || 0), 0).toFixed(2);

      // Yeni abonelik butonu
      const addNewButton = (
    <button
      onClick={handleOpenForm}
      className="px-4 py-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 flex items-center gap-2 hover:bg-white/20 transition duration-300 text-white font-medium"
    >
      <PlusIcon className="w-4 h-4" />
      <span>Yeni Abonelik</span>
    </button>
      );

      return (
    <div className="space-y-6">
      {/* PageHeader Komponenti */}
      <PageHeader 
        title="Premium Abonelikler"
        description="Kullanıcı aboneliklerini yönetin ve takip edin"
        badge={{
          text: "Pro Panel",
          icon: <CrownIcon className="w-3 h-3 text-yellow-300" />
        }}
        stats={[
          { value: totalCount.toString(), label: "Toplam" },
          { value: activeSubscriptions.toString(), label: "Aktif" },
          { value: `${totalRevenue} TRY`, label: "Gelir" }
        ]}
        actions={addNewButton}
        avatarText="S"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 transition-all duration-200 hover:border-primary/20 border border-gray-100 hover:translate-y-[-2px]">
          <div className="flex items-center gap-4">
            <div className="bg-primary/5 p-3 rounded-xl">
              <UserIcon className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Toplam Abonelik</p>
              <div className="flex items-end gap-1">
                <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
                <p className="text-xs text-gray-500 mb-1">kullanıcı</p>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center text-xs text-primary">
              <BadgeCheckIcon className="w-3.5 h-3.5 mr-1" />
              <span>Toplam aktif kullanıcı sayısı</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 transition-all duration-200 hover:border-green-500/20 border border-gray-100 hover:translate-y-[-2px]">
          <div className="flex items-center gap-4">
            <div className="bg-green-50 p-3 rounded-xl">
              <CheckIcon className="w-7 h-7 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Aktif Abonelik</p>
              <div className="flex items-end gap-1">
                <p className="text-2xl font-bold text-green-600">{activeSubscriptions}</p>
                <p className="text-xs text-gray-500 mb-1">kullanıcı</p>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center text-xs text-green-600">
              <UserPlusIcon className="w-3.5 h-3.5 mr-1" />
              <span>{((activeSubscriptions / totalCount) * 100).toFixed(1)}% aktif oran</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 transition-all duration-200 hover:border-orange-500/20 border border-gray-100 hover:translate-y-[-2px]">
          <div className="flex items-center gap-4">
            <div className="bg-orange-50 p-3 rounded-xl">
              <BellIcon className="w-7 h-7 text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Süresi Dolmuş</p>
              <div className="flex items-end gap-1">
                <p className="text-2xl font-bold text-orange-600">{expiredSubscriptions}</p>
                <p className="text-xs text-gray-500 mb-1">abonelik</p>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center text-xs text-orange-600">
              <CalendarIcon className="w-3.5 h-3.5 mr-1" />
              <span>Son 30 günde süresi dolan abonelikler</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 transition-all duration-200 hover:border-blue-500/20 border border-gray-100 hover:translate-y-[-2px]">
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-xl">
              <CreditCardIcon className="w-7 h-7 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Toplam Gelir</p>
              <div className="flex items-end gap-1">
                <p className="text-2xl font-bold text-blue-600">{totalRevenue}</p>
                <p className="text-xs text-gray-500 mb-1">TRY</p>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center text-xs text-blue-600">
              <TrendingUpIcon className="w-3.5 h-3.5 mr-1" />
              <span>Bu ay +{(totalRevenue / 12).toFixed(2)} TRY</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <FilterIcon className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-base font-medium text-gray-800">Filtreler</h3>
          </div>
          <button 
            onClick={() => setFilters({isActive: undefined, packageId: "", userId: ""})} 
            className="text-xs text-primary hover:text-primary/70 font-medium transition-colors"
          >
            Filtreleri Temizle
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Abonelik Durumu
            </label>
            <div className="relative">
              <select
                value={filters.isActive === undefined ? "" : filters.isActive.toString()}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    isActive: e.target.value === "" ? undefined : e.target.value === "true",
                  })
                }
                className="w-full appearance-none bg-gray-50 px-4 py-3 text-sm rounded-xl border-0 focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="">Tüm Durumlar</option>
                <option value="true">Aktif Abonelikler</option>
                <option value="false">Pasif Abonelikler</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Premium Paket
            </label>
            <div className="relative">
              <select
                value={filters.packageId}
                onChange={(e) =>
                  setFilters({ ...filters, packageId: e.target.value })
                }
                className="w-full appearance-none bg-gray-50 px-4 py-3 text-sm rounded-xl border-0 focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="">Tüm Paketler</option>
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name} - {pkg.price} {pkg.currency}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Kullanıcı ID
            </label>
            <div className="relative">
              <input
                type="text"
                value={filters.userId}
                onChange={(e) =>
                  setFilters({ ...filters, userId: e.target.value })
                }
                placeholder="Kullanıcı ID'si ile ara..."
                className="w-full bg-gray-50 px-4 py-3 text-sm rounded-xl border-0 focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <SearchIcon className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative">
            <div className="absolute top-4 right-4">
              <button
                onClick={handleCloseForm}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Kapat"
              >
                <XIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="mb-8">
              <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
                <CrownIcon className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Yeni Premium Abonelik</h2>
              <p className="text-gray-500 mt-1">Kullanıcı için yeni bir premium abonelik oluşturun</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kullanıcı Seçimi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mb-3">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <SearchIcon className="text-gray-400 w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      placeholder="İsim veya e-posta ile ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-primary/20 text-gray-900 placeholder-gray-400"
                    />
                  </div>

                  <div className="bg-gray-50 rounded-xl overflow-hidden">
                    <select
                      required
                      value={formData.userId}
                      onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                      className="w-full px-4 py-3 bg-transparent border-0 focus:ring-2 focus:ring-primary/20 appearance-none"
                      style={{backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem'}}
                    >
                      <option value="">Kullanıcı seçin</option>
                      {filteredUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.firstName} {user.lastName} {user.email ? `(${user.email})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  {filteredUsers.length === 0 && searchTerm && (
                    <p className="text-sm text-orange-500 mt-2 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Arama kriterinize uyan kullanıcı bulunamadı
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Premium Paket <span className="text-red-500">*</span>
                  </label>
                  <div className="bg-gray-50 rounded-xl overflow-hidden">
                    <select
                      required
                      value={formData.packageId}
                      onChange={(e) => {
                        const selectedPackage = packages.find(p => p.id === e.target.value);
                        setFormData({ 
                          ...formData, 
                          packageId: e.target.value,
                          amountPaid: selectedPackage?.price || 0
                        });
                      }}
                      className="w-full px-4 py-3 bg-transparent border-0 focus:ring-2 focus:ring-primary/20 appearance-none"
                      style={{backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem'}}
                    >
                      <option value="">Paket seçin</option>
                      {packages.filter(p => p.isActive).map((pkg) => (
                        <option key={pkg.id} value={pkg.id}>
                          {pkg.name} - {pkg.price} {pkg.currency} ({getDurationText(pkg.durationType, pkg.durationValue)})
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.packageId && (
                    <div className="mt-2 p-3 bg-primary/5 rounded-xl">
                      <div className="text-xs font-medium text-gray-500">Seçilen Paket Detayları:</div>
                      {(() => {
                        const pkg = packages.find(p => p.id === formData.packageId);
                        if (pkg) {
                          return (
                            <div className="flex justify-between mt-1">
                              <span className="text-sm font-medium text-gray-900">{pkg.name}</span>
                              <span className="text-sm font-medium text-primary">{pkg.price} {pkg.currency}</span>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ödeme Yöntemi <span className="text-red-500">*</span>
                  </label>
                  <div className="bg-gray-50 rounded-xl overflow-hidden">
                    <select
                      required
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                      className="w-full px-4 py-3 bg-transparent border-0 focus:ring-2 focus:ring-primary/20 appearance-none"
                      style={{backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem'}}
                    >
                      <option value="MANUAL">Manuel</option>
                      <option value="CREDIT_CARD">Kredi Kartı</option>
                      <option value="GOOGLE_PLAY">Google Play</option>
                      <option value="APP_STORE">App Store</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ödenen Tutar
                  </label>
                  <div className="relative bg-gray-50 rounded-xl overflow-hidden">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.amountPaid}
                      onChange={(e) => setFormData({ ...formData, amountPaid: Number(e.target.value) })}
                      className="w-full px-4 py-3 bg-transparent border-0 focus:ring-2 focus:ring-primary/20"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">TRY</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İşlem ID
                </label>
                <div className="bg-gray-50 rounded-xl overflow-hidden">
                  <input
                    type="text"
                    value={formData.transactionId}
                    onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                    placeholder="Ödeme işlem ID'si..."
                    className="w-full px-4 py-3 bg-transparent border-0 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 ml-1">İsteğe bağlı, ödeme referans kodu veya işlem ID'si</p>
              </div>

              <div className="pt-4">
                <div className="flex flex-col sm:flex-row sm:justify-end sm:space-x-3 space-y-3 sm:space-y-0">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="px-5 py-3 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium flex justify-center"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isLoading}
                    className="px-5 py-3 bg-gradient-to-r from-primary to-primary/90 text-white rounded-xl hover:from-primary/90 hover:to-primary/80 transition-all duration-200 disabled:opacity-50 font-medium flex justify-center items-center gap-1"
                  >
                    {createMutation.isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        İşleniyor...
                      </>
                    ) : (
                      <>
                        <PlusIcon className="w-4 h-4" />
                        Abonelik Oluştur
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {isLoading && (
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        <DataTable
          data={subscriptions}
          columns={columns}
          loading={isLoading}
          searchable={false}
          filterable={false}
          exportable={true}
          selectable={false}
          pagination={false}
          onRowClick={undefined}
          emptyMessage={
            <div className="flex flex-col items-center justify-center py-12">
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                <CrownIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Abonelik Bulunamadı</h3>
              <p className="text-gray-500 text-center max-w-md">
                Henüz sistemde abonelik kaydı bulunmuyor veya filtrelere uygun sonuç yok.
              </p>
              <button 
                onClick={handleOpenForm}
                className="mt-4 px-4 py-2 bg-primary/10 text-primary rounded-lg font-medium text-sm hover:bg-primary/20 transition-colors flex items-center gap-2"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Yeni Abonelik Ekle</span>
              </button>
            </div>
          }
        />
      </div>

      {/* Pagination */}
      {totalCount > 20 && (
        <div className="flex justify-between items-center mt-6 bg-white rounded-xl border border-gray-100 p-4">
          <div className="text-sm text-gray-500">
            Toplam <span className="font-medium text-gray-900">{totalCount}</span> abonelik içinden
            <span className="font-medium text-gray-900"> {(currentPage - 1) * 20 + 1}-{Math.min(currentPage * 20, totalCount)}</span> arası gösteriliyor
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-gray-50 transition-colors"
              aria-label="Önceki Sayfa"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>

            <div className="flex items-center gap-1">
              {Array.from({length: Math.min(5, Math.ceil(totalCount / 20))}, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={`page-${pageNum}`}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      currentPage === pageNum 
                        ? 'bg-primary text-white' 
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {Math.ceil(totalCount / 20) > 5 && (
                <>
                  <span className="text-gray-400">...</span>
                  <button
                    onClick={() => setCurrentPage(Math.ceil(totalCount / 20))}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      currentPage === Math.ceil(totalCount / 20) 
                        ? 'bg-primary text-white' 
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {Math.ceil(totalCount / 20)}
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= Math.ceil(totalCount / 20)}
              className="p-2 text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-gray-50 transition-colors"
              aria-label="Sonraki Sayfa"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}