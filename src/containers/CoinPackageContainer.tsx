"use client";

import { useState } from "react";
import { DataTable, DataTableColumn } from "@/components/ui/datatable";
import { useTrpc } from "@/hooks/use-trpc";
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  CoinsIcon,
  XIcon,
  CheckIcon,
  EyeOffIcon,
  EyeIcon,
  GiftIcon,
} from "lucide-react";

interface CoinPackage {
  id: string;
  name: string;
  coinAmount: number;
  price: number;
  currency: string;
  bonusCoins: number;
  description?: string;
  imagePath?: string;
  sku?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface PackageFormData {
  name: string;
  coinAmount: number;
  price: number;
  currency: string;
  bonusCoins: number;
  description: string;
  imagePath: string;
  sku: string;
  displayOrder: number;
}

export default function CoinPackageContainer() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<CoinPackage | null>(null);
  const [formData, setFormData] = useState<PackageFormData>({
    name: "",
    coinAmount: 0,
    price: 0,
    currency: "TRY",
    bonusCoins: 0,
    description: "",
    imagePath: "",
    sku: "",
    displayOrder: 0,
  });

  const trpc = useTrpc();
  const {
    data: packagesData,
    isLoading,
    refetch,
  } = trpc.coins.getAll.useQuery();

  const createMutation = trpc.coins.create.useMutation();
  const updateMutation = trpc.coins.update.useMutation();
  const deleteMutation = trpc.coins.delete.useMutation();
  const toggleActiveMutation = trpc.coins.toggleActive.useMutation();

  const packages = packagesData?.packages || [];

  const handleOpenForm = (pkg?: CoinPackage) => {
    if (pkg) {
      setEditingPackage(pkg);
      setFormData({
        name: pkg.name,
        coinAmount: pkg.coinAmount,
        price: pkg.price,
        currency: pkg.currency,
        bonusCoins: pkg.bonusCoins,
        description: pkg.description || "",
        imagePath: pkg.imagePath || "",
        sku: pkg.sku || "",
        displayOrder: pkg.displayOrder,
      });
    } else {
      setEditingPackage(null);
      setFormData({
        name: "",
        coinAmount: 0,
        price: 0,
        currency: "TRY",
        bonusCoins: 0,
        description: "",
        imagePath: "",
        sku: "",
        displayOrder: 0,
      });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingPackage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingPackage) {
        await updateMutation.mutateAsync({
          id: editingPackage.id,
          ...formData,
        });
      } else {
        await createMutation.mutateAsync(formData);
      }
      
      refetch();
      handleCloseForm();
      alert(editingPackage ? "Paket güncellendi!" : "Paket oluşturuldu!");
    } catch (error: any) {
      alert("Hata: " + error.message);
    }
  };

  const handleDelete = async (pkg: CoinPackage) => {
    if (confirm(`"${pkg.name}" paketini silmek istediğinizden emin misiniz?`)) {
      try {
        await deleteMutation.mutateAsync({ id: pkg.id });
        refetch();
        alert("Paket silindi!");
      } catch (error: any) {
        alert("Hata: " + error.message);
      }
    }
  };

  const handleToggleActive = async (pkg: CoinPackage) => {
    try {
      await toggleActiveMutation.mutateAsync({
        id: pkg.id,
        isActive: !pkg.isActive,
      });
      refetch();
    } catch (error: any) {
      alert("Hata: " + error.message);
    }
  };

  const getTotalCoins = (coinAmount: number, bonusCoins: number) => {
    return coinAmount + bonusCoins;
  };

  const getCoinPerTRY = (coinAmount: number, bonusCoins: number, price: number) => {
    if (price === 0) return 0;
    return ((coinAmount + bonusCoins) / price).toFixed(2);
  };

  const columns: DataTableColumn<CoinPackage>[] = [
    {
      key: "name",
      title: "Paket Adı",
      width: "200px",
      render: (value, row) => (
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center">
            <CoinsIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">
              Sıra: {row.displayOrder}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "coinAmount",
      title: "Coin Miktarı",
      align: "center",
      width: "150px",
      render: (value, row) => (
        <div className="text-center">
          <div className="font-bold text-lg text-yellow-600">
            {value.toLocaleString()} 
          </div>
          {row.bonusCoins > 0 && (
            <div className="flex items-center justify-center space-x-1 mt-1">
              <GiftIcon className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-600">
                +{row.bonusCoins} bonus
              </span>
            </div>
          )}
          <div className="text-xs text-gray-500 mt-1">
            Toplam: {getTotalCoins(value, row.bonusCoins).toLocaleString()}
          </div>
        </div>
      ),
    },
    {
      key: "price",
      title: "Fiyat",
      align: "center",
      width: "120px",
      render: (value, row) => (
        <div className="text-center">
          <div className="font-bold text-lg text-green-600">
            {value} {row.currency}
          </div>
          <div className="text-xs text-gray-500">
            {getCoinPerTRY(row.coinAmount, row.bonusCoins, value)} coin/TRY
          </div>
        </div>
      ),
    },
    {
      key: "description",
      title: "Açıklama",
      width: "250px",
      render: (value) => (
        <div className="text-sm text-gray-700 truncate max-w-xs">
          {value || "Açıklama yok"}
        </div>
      ),
    },
    {
      key: "sku",
      title: "SKU",
      width: "120px",
      render: (value) => (
        <div className="text-sm text-gray-600 font-mono">
          {value || "-"}
        </div>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Coin Paketleri</h1>
          <p className="text-gray-600 mt-1">Coin paketlerini yönetin</p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-2 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Yeni Paket</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Paket</p>
              <p className="text-2xl font-bold text-gray-900">{packages.length}</p>
            </div>
            <CoinsIcon className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aktif Paket</p>
              <p className="text-2xl font-bold text-green-600">
                {packages.filter(p => p.isActive).length}
              </p>
            </div>
            <CheckIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pasif Paket</p>
              <p className="text-2xl font-bold text-red-600">
                {packages.filter(p => !p.isActive).length}
              </p>
            </div>
            <EyeOffIcon className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ortalama Fiyat</p>
              <p className="text-2xl font-bold text-blue-600">
                {packages.length > 0 
                  ? Math.round(packages.reduce((sum, p) => sum + p.price, 0) / packages.length)
                  : 0
                } TRY
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingPackage ? "Paket Düzenle" : "Yeni Paket Oluştur"}
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
                    Paket Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500/20"
                    placeholder="Örn: Başlangıç Paketi"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coin Miktarı *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.coinAmount}
                    onChange={(e) => setFormData({ ...formData, coinAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500/20"
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fiyat *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500/20"
                    placeholder="9.99"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bonus Coin
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.bonusCoins}
                    onChange={(e) => setFormData({ ...formData, bonusCoins: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500/20"
                    placeholder="10"
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
                  placeholder="Paket açıklaması..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Para Birimi
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500/20"
                  >
                    <option value="TRY">TRY</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500/20"
                    placeholder="coin_100"
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
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500/20"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resim Yolu
                </label>
                <input
                  type="text"
                  value={formData.imagePath}
                  onChange={(e) => setFormData({ ...formData, imagePath: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500/20"
                  placeholder="/images/coins/package1.png"
                />
              </div>

              {/* Özet */}
              {formData.coinAmount > 0 && formData.price > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">Paket Özeti</h4>
                  <div className="text-sm text-yellow-700 space-y-1">
                    <div>Toplam Coin: {getTotalCoins(formData.coinAmount, formData.bonusCoins).toLocaleString()}</div>
                    <div>Coin/TRY Oranı: {getCoinPerTRY(formData.coinAmount, formData.bonusCoins, formData.price)}</div>
                    {formData.bonusCoins > 0 && (
                      <div>Bonus: +{formData.bonusCoins} coin (%{((formData.bonusCoins / formData.coinAmount) * 100).toFixed(1)} ekstra)</div>
                    )}
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
                  className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 disabled:opacity-50"
                >
                  {editingPackage ? "Güncelle" : "Oluştur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Data Table */}
      <DataTable
        data={packages}
        columns={columns}
        loading={isLoading}
        searchable={true}
        filterable={false}
        exportable={true}
        selectable={false}
        pagination={true}
        pageSize={10}
        onRowClick={undefined}
        emptyMessage="Henüz coin paketi bulunmuyor"
      />
    </div>
  );
}