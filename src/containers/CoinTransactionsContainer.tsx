"use client";

import { useState } from "react";
import { DataTable, DataTableColumn } from "@/components/ui/datatable";
import { useTrpc } from "@/hooks/use-trpc";
import {
  PlusIcon,
  MinusIcon,
  CoinsIcon,
  XIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  FilterIcon,
  SearchIcon,
  TrashIcon,
  GiftIcon,
  ShoppingCartIcon,
  MessageSquareIcon,
  EyeIcon,
} from "lucide-react";

interface CoinTransaction {
  id: string;
  userId: string;
  transactionType: "PURCHASE" | "SPEND" | "REWARD" | "REFUND" | "ADMIN_ADD" | "ADMIN_REMOVE";
  amount: number;
  balanceAfter: number;
  description?: string;
  referenceType?: "MESSAGE" | "GIFT" | "PHOTO_VIEW" | "VOICE_MESSAGE" | "PURCHASE" | "DAILY_BONUS";
  referenceId?: string;
  packageId?: string;
  transactionId?: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    coins: number;
    photos: Array<{
      id: string;
      filePath: string;
    }>;
  };
  package?: {
    id: string;
    name: string;
    coinAmount: number;
    bonusCoins: number;
    price: number;
    currency: string;
  };
}

interface TransactionFormData {
  userId: string;
  amount: number;
  description: string;
  transactionType: "ADMIN_ADD" | "ADMIN_REMOVE" | "REWARD";
}

export default function CoinTransactionsContainer() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    userId: "",
    transactionType: "" as "" | "PURCHASE" | "SPEND" | "REWARD" | "REFUND" | "ADMIN_ADD" | "ADMIN_REMOVE",
    referenceType: "" as "" | "MESSAGE" | "GIFT" | "PHOTO_VIEW" | "VOICE_MESSAGE" | "PURCHASE" | "DAILY_BONUS",
    packageId: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState<TransactionFormData>({
    userId: "",
    amount: 0,
    description: "",
    transactionType: "ADMIN_ADD",
  });

  const trpc = useTrpc();

  // İşlemleri getir
  const {
    data: transactionsData,
    isLoading,
    refetch,
  } = trpc.coins.getAllTransactions.useQuery({
    limit: 20,
    page: currentPage,
    filters: {
      userId: filters.userId || undefined,
      transactionType: filters.transactionType || undefined,
      referenceType: filters.referenceType || undefined,
      packageId: filters.packageId || undefined,
    },
  });

  // Coin paketleri getir
  const { data: packagesData } = trpc.coins.getAll.useQuery();

  // Kullanıcıları getir
  const { data: usersData } = trpc.user.getAll.useQuery(
    { limit: 50 },
    { enabled: isFormOpen }
  );

  const addCoinsMutation = trpc.coins.addCoins.useMutation();
  const deleteTransactionMutation = trpc.coins.deleteTransaction.useMutation();

  const transactions = transactionsData?.transactions || [];
  const totalCount = transactionsData?.totalCount || 0;
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
      amount: 0,
      description: "",
      transactionType: "ADMIN_ADD",
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
      await addCoinsMutation.mutateAsync(formData);
      refetch();
      handleCloseForm();
      alert("İşlem başarıyla oluşturuldu!");
    } catch (error: any) {
      alert("Hata: " + error.message);
    }
  };

  const handleDelete = async (transaction: CoinTransaction) => {
    if (confirm("Bu işlemi silmek istediğinizden emin misiniz? Kullanıcı bakiyesi geri alınacaktır.")) {
      try {
        await deleteTransactionMutation.mutateAsync({ id: transaction.id });
        refetch();
        alert("İşlem silindi!");
      } catch (error: any) {
        alert("Hata: " + error.message);
      }
    }
  };

  const getTransactionTypeText = (type: string) => {
    const types = {
      PURCHASE: "Satın Alma",
      SPEND: "Harcama",
      REWARD: "Ödül",
      REFUND: "İade",
      ADMIN_ADD: "Admin Ekleme",
      ADMIN_REMOVE: "Admin Çıkarma",
    };
    return types[type as keyof typeof types] || type;
  };

  const getReferenceTypeText = (type?: string) => {
    if (!type) return "-";
    const types = {
      MESSAGE: "Mesaj",
      GIFT: "Hediye",
      PHOTO_VIEW: "Fotoğraf Görüntüleme",
      VOICE_MESSAGE: "Ses Mesajı",
      PURCHASE: "Satın Alma",
      DAILY_BONUS: "Günlük Bonus",
    };
    return types[type as keyof typeof types] || type;
  };

  const getReferenceIcon = (type?: string) => {
    switch (type) {
      case "MESSAGE":
        return <MessageSquareIcon className="w-3 h-3" />;
      case "GIFT":
        return <GiftIcon className="w-3 h-3" />;
      case "PHOTO_VIEW":
        return <EyeIcon className="w-3 h-3" />;
      case "VOICE_MESSAGE":
        return <MessageSquareIcon className="w-3 h-3" />;
      case "PURCHASE":
        return <ShoppingCartIcon className="w-3 h-3" />;
      case "DAILY_BONUS":
        return <GiftIcon className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getTransactionColor = (type: string, amount: number) => {
    if (amount > 0) {
      return "text-green-600";
    } else {
      return "text-red-600";
    }
  };

  const columns: DataTableColumn<CoinTransaction>[] = [
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
              <div className="text-xs text-yellow-600 flex items-center space-x-1">
                <CoinsIcon className="w-3 h-3" />
                <span>{row.user.coins.toLocaleString()} coin</span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: "transactionType",
      title: "İşlem Tipi",
      width: "150px",
      render: (value, row) => {
        const isPositive = row.amount > 0;
        return (
          <div className="flex items-center space-x-2">
            {isPositive ? (
              <TrendingUpIcon className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDownIcon className="w-4 h-4 text-red-500" />
            )}
            <span className="text-sm font-medium">
              {getTransactionTypeText(value)}
            </span>
          </div>
        );
      },
    },
    {
      key: "amount",
      title: "Miktar",
      align: "center",
      width: "120px",
      render: (value, row) => (
        <div className="text-center">
          <div className={`font-bold text-lg ${getTransactionColor(row.transactionType, value)}`}>
            {value > 0 ? "+" : ""}{value.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">
            Bakiye: {row.balanceAfter.toLocaleString()}
          </div>
        </div>
      ),
    },
    {
      key: "referenceType",
      title: "Referans",
      width: "150px",
      render: (value, row) => (
        <div className="flex items-center space-x-2">
          {getReferenceIcon(value)}
          <span className="text-sm text-gray-700">
            {getReferenceTypeText(value)}
          </span>
        </div>
      ),
    },
    {
      key: "package",
      title: "Paket",
      width: "200px",
      render: (value, row) => {
        if (!row.package) return <span className="text-gray-400">-</span>;
        
        return (
          <div>
            <div className="font-medium text-gray-900">{row.package.name}</div>
            <div className="text-sm text-gray-500">
              {row.package.coinAmount + row.package.bonusCoins} coin - {row.package.price} {row.package.currency}
            </div>
          </div>
        );
      },
    },
    {
      key: "description",
      title: "Açıklama",
      width: "200px",
      render: (value) => (
        <div className="text-sm text-gray-700 truncate max-w-xs">
          {value || "Açıklama yok"}
        </div>
      ),
    },
    {
      key: "createdAt",
      title: "Tarih",
      width: "150px",
      render: (value) => (
        <div className="text-sm text-gray-600">
          {new Date(value).toLocaleDateString("tr-TR")}
          <br />
          {new Date(value).toLocaleTimeString("tr-TR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      ),
    },
    {
      key: "actions",
      title: "İşlemler",
      align: "center",
      width: "80px",
      render: (value, row) => (
        <div className="flex items-center justify-center">
          {["ADMIN_ADD", "ADMIN_REMOVE"].includes(row.transactionType) && (
            <button
              onClick={() => handleDelete(row)}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Sil"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Coin İşlemleri</h1>
          <p className="text-gray-600 mt-1">Kullanıcı coin işlemlerini yönetin</p>
        </div>
        <button
          onClick={handleOpenForm}
          className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-2 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 flex items-center space-x-2"
        >
          <CoinsIcon className="w-5 h-5" />
          <span>Coin Ekle/Çıkar</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam İşlem</p>
              <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
            </div>
            <CoinsIcon className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Coin Ekleme</p>
              <p className="text-2xl font-bold text-green-600">
                {transactions.filter(t => t.amount > 0).length}
              </p>
            </div>
            <TrendingUpIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Coin Harcama</p>
              <p className="text-2xl font-bold text-red-600">
                {transactions.filter(t => t.amount < 0).length}
              </p>
            </div>
            <TrendingDownIcon className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Coin</p>
              <p className="text-2xl font-bold text-blue-600">
                {transactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <FilterIcon className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filtreler</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              İşlem Tipi
            </label>
            <select
              value={filters.transactionType}
              onChange={(e) =>
                setFilters({ ...filters, transactionType: e.target.value as any })
              }
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500/20"
            >
              <option value="">Tümü</option>
              <option value="PURCHASE">Satın Alma</option>
              <option value="SPEND">Harcama</option>
              <option value="REWARD">Ödül</option>
              <option value="REFUND">İade</option>
              <option value="ADMIN_ADD">Admin Ekleme</option>
              <option value="ADMIN_REMOVE">Admin Çıkarma</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Referans Tipi
            </label>
            <select
              value={filters.referenceType}
              onChange={(e) =>
                setFilters({ ...filters, referenceType: e.target.value as any })
              }
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500/20"
            >
              <option value="">Tümü</option>
              <option value="MESSAGE">Mesaj</option>
              <option value="GIFT">Hediye</option>
              <option value="PHOTO_VIEW">Fotoğraf Görüntüleme</option>
              <option value="VOICE_MESSAGE">Ses Mesajı</option>
              <option value="PURCHASE">Satın Alma</option>
              <option value="DAILY_BONUS">Günlük Bonus</option>
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
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500/20"
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
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500/20"
            />
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Coin Ekle/Çıkar</h2>
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
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500/20"
                  />
                </div>
                <select
                  required
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500/20"
                >
                  <option value="">Kullanıcı seçin</option>
                  {filteredUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.email}) - {user.coins} coin
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    İşlem Tipi *
                  </label>
                  <select
                    required
                    value={formData.transactionType}
                    onChange={(e) => setFormData({ ...formData, transactionType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500/20"
                  >
                    <option value="ADMIN_ADD">Coin Ekle</option>
                    <option value="ADMIN_REMOVE">Coin Çıkar</option>
                    <option value="REWARD">Ödül Ver</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Miktar *
                  </label>
                  <input
                    type="number"
                    required
                    value={Math.abs(formData.amount)}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      const amount = formData.transactionType === "ADMIN_REMOVE" ? -value : value;
                      setFormData({ ...formData, amount });
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500/20"
                    placeholder="100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500/20"
                  placeholder="İşlem açıklaması..."
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
                  disabled={addCoinsMutation.isLoading}
                  className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 disabled:opacity-50"
                >
                  İşlemi Gerçekleştir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Data Table */}
      <DataTable
        data={transactions}
        columns={columns}
        loading={isLoading}
        searchable={false}
        filterable={false}
        exportable={true}
        selectable={false}
        pagination={false}
        onRowClick={undefined}
        emptyMessage="Henüz coin işlemi bulunmuyor"
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