"use client";

import { useState } from "react";
import { DataTable, DataTableColumn } from "@/components/ui/datatable";
import { useTrpc } from "@/hooks/use-trpc";
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Premium Abonelikler</h1>
          <p className="text-gray-600 mt-1">Kullanıcı aboneliklerini yönetin</p>
        </div>
        <button
          onClick={handleOpenForm}
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Yeni Abonelik</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Abonelik</p>
              <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
            </div>
            <UserIcon className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aktif Abonelik</p>
              <p className="text-2xl font-bold text-green-600">
                {subscriptions.filter(s => s.isActive && !isExpired(s.expiresAt)).length}
              </p>
            </div>
            <CheckIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Süresi Dolmuş</p>
              <p className="text-2xl font-bold text-orange-600">
                {subscriptions.filter(s => isExpired(s.expiresAt)).length}
              </p>
            </div>
            <CalendarIcon className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Gelir</p>
              <p className="text-2xl font-bold text-blue-600">
                {subscriptions.reduce((sum, s) => sum + (s.amountPaid || 0), 0).toFixed(2)} TRY
              </p>
            </div>
            <CreditCardIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <FilterIcon className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filtreler</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Durum
            </label>
            <select
              value={filters.isActive === undefined ? "" : filters.isActive.toString()}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  isActive: e.target.value === "" ? undefined : e.target.value === "true",
                })
              }
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="">Tümü</option>
              <option value="true">Aktif</option>
              <option value="false">Pasif</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Paket
            </label>
            <select
              value={filters.packageId}
              onChange={(e) =>
                setFilters({ ...filters, packageId: e.target.value })
              }
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="">Tüm Paketler</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Kullanıcı ID
            </label>
            <input
              type="text"
              value={filters.userId}
              onChange={(e) =>
                setFilters({ ...filters, userId: e.target.value })
              }
              placeholder="Kullanıcı ID'si..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Yeni Abonelik Oluştur</h2>
              <button
                onClick={handleCloseForm}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kullanıcı *
                </label>
                <div className="relative mb-2">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Kullanıcı ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
                <select
                  required
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20"
                >
                  <option value="">Kullanıcı seçin</option>
                  {filteredUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Premium Paket *
                </label>
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
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20"
                >
                  <option value="">Paket seçin</option>
                  {packages.filter(p => p.isActive).map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} - {pkg.price} {pkg.currency}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ödeme Yöntemi *
                  </label>
                  <select
                    required
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20"
                  >
                    <option value="MANUAL">Manuel</option>
                    <option value="CREDIT_CARD">Kredi Kartı</option>
                    <option value="GOOGLE_PLAY">Google Play</option>
                    <option value="APP_STORE">App Store</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ödenen Tutar
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.amountPaid}
                    onChange={(e) => setFormData({ ...formData, amountPaid: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  İşlem ID
                </label>
                <input
                  type="text"
                  value={formData.transactionId}
                  onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                  placeholder="Ödeme işlem ID'si..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isLoading}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
                >
                  Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Data Table */}
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
        emptyMessage="Henüz abonelik bulunmuyor"
      />

      {/* Pagination */}
      {totalCount > 20 && (
        <div className="flex justify-center items-center space-x-2 mt-4">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Önceki
          </button>
          <span className="text-sm text-gray-600">
            Sayfa {currentPage} / {Math.ceil(totalCount / 20)}
          </span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage >= Math.ceil(totalCount / 20)}
            className="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Sonraki
          </button>
        </div>
      )}
    </div>
  );
}