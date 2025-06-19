"use client";

import { useState } from "react";
import { DataTable, DataTableColumn } from "@/components/ui/datatable";
import { useTrpc } from "@/hooks/use-trpc";
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  GiftIcon,
  XIcon,
  CheckIcon,
  EyeOffIcon,
  EyeIcon,
  CoinsIcon,
  ImageIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react";

interface Gift {
  id: string;
  name: string;
  imagePath: string;
  coinCost: number;
  category?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface GiftTransaction {
  id: string;
  giftId: string;
  senderId: string;
  receiverId: string;
  messageId?: string;
  coinsSpent: number;
  sentAt: string;
  gift: {
    id: string;
    name: string;
    imagePath: string;
    coinCost: number;
    category?: string;
  };
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    photos: Array<{
      id: string;
      filePath: string;
    }>;
  };
  receiver: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    photos: Array<{
      id: string;
      filePath: string;
    }>;
  };
}

interface GiftFormData {
  name: string;
  imagePath: string;
  coinCost: number;
  category: string;
  displayOrder: number;
}

export default function GiftsContainer() {
  const [activeTab, setActiveTab] = useState<"gifts" | "transactions">("gifts");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGift, setEditingGift] = useState<Gift | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<GiftFormData>({
    name: "",
    imagePath: "",
    coinCost: 0,
    category: "",
    displayOrder: 0,
  });

  const trpc = useTrpc();

  // Hediyeleri getir
  const {
    data: giftsData,
    isLoading: giftsLoading,
    refetch: refetchGifts,
  } = trpc.gift.getAllForAdmin.useQuery();

  // Hediye işlemlerini getir
  const {
    data: transactionsData,
    isLoading: transactionsLoading,
    refetch: refetchTransactions,
  } = trpc.gift.getTransactions.useQuery({
    limit: 20,
    page: currentPage,
  });

  const createMutation = trpc.gift.create.useMutation();
  const updateMutation = trpc.gift.update.useMutation();
  const deleteMutation = trpc.gift.delete.useMutation();
  const toggleActiveMutation = trpc.gift.toggleActive.useMutation();

  const gifts = giftsData?.gifts || [];
  const transactions = transactionsData?.transactions || [];
  const totalTransactions = transactionsData?.totalCount || 0;

  const handleOpenForm = (gift?: Gift) => {
    if (gift) {
      setEditingGift(gift);
      setFormData({
        name: gift.name,
        imagePath: gift.imagePath,
        coinCost: gift.coinCost,
        category: gift.category || "",
        displayOrder: gift.displayOrder,
      });
    } else {
      setEditingGift(null);
      setFormData({
        name: "",
        imagePath: "",
        coinCost: 0,
        category: "",
        displayOrder: 0,
      });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingGift(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingGift) {
        await updateMutation.mutateAsync({
          id: editingGift.id,
          ...formData,
        });
      } else {
        await createMutation.mutateAsync(formData);
      }
      
      refetchGifts();
      handleCloseForm();
      alert(editingGift ? "Hediye güncellendi!" : "Hediye oluşturuldu!");
    } catch (error: any) {
      alert("Hata: " + error.message);
    }
  };

  const handleDelete = async (gift: Gift) => {
    if (confirm(`"${gift.name}" hediyesini silmek istediğinizden emin misiniz?`)) {
      try {
        await deleteMutation.mutateAsync({ id: gift.id });
        refetchGifts();
        alert("Hediye silindi!");
      } catch (error: any) {
        alert("Hata: " + error.message);
      }
    }
  };

  const handleToggleActive = async (gift: Gift) => {
    try {
      await toggleActiveMutation.mutateAsync({
        id: gift.id,
        isActive: !gift.isActive,
      });
      refetchGifts();
    } catch (error: any) {
      alert("Hata: " + error.message);
    }
  };

  // Gift columns
  const giftColumns: DataTableColumn<Gift>[] = [
    {
      key: "name",
      title: "Hediye",
      width: "300px",
      render: (value, row) => (
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl flex items-center justify-center">
            {row.imagePath ? (
              <img
                src={row.imagePath}
                alt={value}
                className="w-12 h-12 rounded-xl object-cover"
              />
            ) : (
              <GiftIcon className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <div className="font-semibold text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">
              {row.category || "Kategori yok"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "coinCost",
      title: "Coin Maliyeti",
      align: "center",
      width: "150px",
      render: (value) => (
        <div className="text-center">
          <div className="font-bold text-lg text-yellow-600 flex items-center justify-center space-x-1">
            <CoinsIcon className="w-4 h-4" />
            <span>{value.toLocaleString()}</span>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      title: "Kategori",
      width: "150px",
      render: (value) => (
        <div className="text-sm text-gray-700">
          {value || "Kategori yok"}
        </div>
      ),
    },
    {
      key: "displayOrder",
      title: "Sıra",
      align: "center",
      width: "80px",
      render: (value) => (
        <span className="text-sm font-medium text-gray-600">{value}</span>
      ),
    },
    {
      key: "isActive",
      title: "Durum",
      align: "center",
      width: "100px",
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {value ? "Aktif" : "Pasif"}
        </span>
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
      width: "150px",
      render: (value, row) => (
        <div className="flex items-center justify-center space-x-1">
          <button
            onClick={() => handleToggleActive(row)}
            className={`p-1.5 rounded-lg transition-colors ${
              row.isActive
                ? "text-orange-600 hover:bg-orange-50"
                : "text-green-600 hover:bg-green-50"
            }`}
            title={row.isActive ? "Pasif Yap" : "Aktif Yap"}
          >
            {row.isActive ? (
              <EyeOffIcon className="w-4 h-4" />
            ) : (
              <EyeIcon className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => handleOpenForm(row)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Düzenle"
          >
            <EditIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Sil"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // Transaction columns
  const transactionColumns: DataTableColumn<GiftTransaction>[] = [
    {
      key: "gift",
      title: "Hediye",
      width: "200px",
      render: (value, row) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg flex items-center justify-center">
            {row.gift.imagePath ? (
              <img
                src={row.gift.imagePath}
                alt={row.gift.name}
                className="w-10 h-10 rounded-lg object-cover"
              />
            ) : (
              <GiftIcon className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <div className="font-medium text-gray-900">{row.gift.name}</div>
            <div className="text-xs text-gray-500">{row.gift.category}</div>
          </div>
        </div>
      ),
    },
    {
      key: "sender",
      title: "Gönderen",
      width: "200px",
      render: (value, row) => {
        const fullName = `${row.sender.firstName} ${row.sender.lastName}`;
        const profileImage = row.sender.photos?.[0]?.filePath;
        return (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={fullName}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-xs">
                  {row.sender.firstName.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <div className="font-medium text-sm text-gray-900">{fullName}</div>
              <div className="text-xs text-gray-500">{row.sender.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: "receiver",
      title: "Alan",
      width: "200px",
      render: (value, row) => {
        const fullName = `${row.receiver.firstName} ${row.receiver.lastName}`;
        const profileImage = row.receiver.photos?.[0]?.filePath;
        return (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={fullName}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-xs">
                  {row.receiver.firstName.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <div className="font-medium text-sm text-gray-900">{fullName}</div>
              <div className="text-xs text-gray-500">{row.receiver.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: "coinsSpent",
      title: "Harcanan Coin",
      align: "center",
      width: "120px",
      render: (value) => (
        <div className="text-center">
          <div className="font-bold text-yellow-600 flex items-center justify-center space-x-1">
            <CoinsIcon className="w-3 h-3" />
            <span>{value.toLocaleString()}</span>
          </div>
        </div>
      ),
    },
    {
      key: "sentAt",
      title: "Gönderilme Tarihi",
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
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hediye Yönetimi</h1>
          <p className="text-gray-600 mt-1">Hediyeleri ve hediye işlemlerini yönetin</p>
        </div>
        {activeTab === "gifts" && (
          <button
            onClick={() => handleOpenForm()}
            className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-pink-600 hover:to-pink-700 transition-all duration-200 flex items-center space-x-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Yeni Hediye</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("gifts")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "gifts"
                ? "border-pink-500 text-pink-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Hediyeler
          </button>
          <button
            onClick={() => setActiveTab("transactions")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "transactions"
                ? "border-pink-500 text-pink-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Hediye İşlemleri
          </button>
        </nav>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Hediye</p>
              <p className="text-2xl font-bold text-gray-900">{gifts.length}</p>
            </div>
            <GiftIcon className="w-8 h-8 text-pink-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aktif Hediye</p>
              <p className="text-2xl font-bold text-green-600">
                {gifts.filter(g => g.isActive).length}
              </p>
            </div>
            <CheckIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam İşlem</p>
              <p className="text-2xl font-bold text-blue-600">{totalTransactions}</p>
            </div>
            <TrendingUpIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Coin</p>
              <p className="text-2xl font-bold text-yellow-600">
                {transactions.reduce((sum, t) => sum + t.coinsSpent, 0).toLocaleString()}
              </p>
            </div>
            <CoinsIcon className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingGift ? "Hediye Düzenle" : "Yeni Hediye Oluştur"}
              </h2>
              <button
                onClick={handleCloseForm}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hediye Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500/20"
                    placeholder="Örn: Kırmızı Gül"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coin Maliyeti *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.coinCost}
                    onChange={(e) => setFormData({ ...formData, coinCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500/20"
                    placeholder="10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resim Yolu *
                </label>
                <input
                  type="text"
                  required
                  value={formData.imagePath}
                  onChange={(e) => setFormData({ ...formData, imagePath: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500/20"
                  placeholder="/images/gifts/rose.png"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500/20"
                    placeholder="Çiçekler"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sıra
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500/20"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Preview */}
              {formData.imagePath && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Önizleme</h4>
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl flex items-center justify-center">
                      <img
                        src={formData.imagePath}
                        alt={formData.name}
                        className="w-16 h-16 rounded-xl object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{formData.name || "Hediye Adı"}</div>
                      <div className="text-sm text-gray-500">{formData.category || "Kategori"}</div>
                      <div className="text-sm text-yellow-600 flex items-center space-x-1">
                        <CoinsIcon className="w-3 h-3" />
                        <span>{formData.coinCost} coin</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

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
                  disabled={createMutation.isLoading || updateMutation.isLoading}
                  className="px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg hover:from-pink-600 hover:to-pink-700 transition-all duration-200 disabled:opacity-50"
                >
                  {editingGift ? "Güncelle" : "Oluştur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Content */}
      {activeTab === "gifts" ? (
        <DataTable
          data={gifts}
          columns={giftColumns}
          loading={giftsLoading}
          searchable={true}
          filterable={false}
          exportable={true}
          selectable={false}
          pagination={true}
          pageSize={10}
          onRowClick={undefined}
          emptyMessage="Henüz hediye bulunmuyor"
        />
      ) : (
        <>
          <DataTable
            data={transactions}
            columns={transactionColumns}
            loading={transactionsLoading}
            searchable={false}
            filterable={false}
            exportable={true}
            selectable={false}
            pagination={false}
            onRowClick={undefined}
            emptyMessage="Henüz hediye işlemi bulunmuyor"
          />

          {/* Pagination */}
          {totalTransactions > 20 && (
            <div className="flex justify-center items-center space-x-2 mt-4">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Önceki
              </button>
              <span className="text-sm text-gray-600">
                Sayfa {currentPage} / {Math.ceil(totalTransactions / 20)}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= Math.ceil(totalTransactions / 20)}
                className="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Sonraki
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}