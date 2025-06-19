"use client";

import { useState } from "react";
import { DataTable, DataTableColumn } from "@/components/ui/datatable";
import { useTrpc } from "@/hooks/use-trpc";
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  CrownIcon,
  XIcon,
  CheckIcon,
  EyeOffIcon,
  EyeIcon,
} from "lucide-react";

interface PremiumPackage {
  id: string;
  name: string;
  description?: string;
  durationType: "WEEKLY" | "MONTHLY" | "YEARLY";
  durationValue: number;
  price: number;
  currency: string;
  features: string[];
  imagePath?: string;
  sku?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface PackageFormData {
  name: string;
  description: string;
  durationType: "WEEKLY" | "MONTHLY" | "YEARLY";
  durationValue: number;
  price: number;
  currency: string;
  features: string[];
  imagePath: string;
  sku: string;
  displayOrder: number;
}

export default function PremiumContainer() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PremiumPackage | null>(null);
  const [formData, setFormData] = useState<PackageFormData>({
    name: "",
    description: "",
    durationType: "MONTHLY",
    durationValue: 1,
    price: 0,
    currency: "TRY",
    features: [],
    imagePath: "",
    sku: "",
    displayOrder: 0,
  });
  const [newFeature, setNewFeature] = useState("");

  const trpc = useTrpc();
  const {
    data: packagesData,
    isLoading,
    refetch,
  } = trpc.premium.getAll.useQuery();

  const createMutation = trpc.premium.create.useMutation();
  const updateMutation = trpc.premium.update.useMutation();
  const deleteMutation = trpc.premium.delete.useMutation();
  const toggleActiveMutation = trpc.premium.toggleActive.useMutation();

  const packages = packagesData?.packages || [];

  const handleOpenForm = (pkg?: PremiumPackage) => {
    if (pkg) {
      setEditingPackage(pkg);
      setFormData({
        name: pkg.name,
        description: pkg.description || "",
        durationType: pkg.durationType,
        durationValue: pkg.durationValue,
        price: pkg.price,
        currency: pkg.currency,
        features: pkg.features,
        imagePath: pkg.imagePath || "",
        sku: pkg.sku || "",
        displayOrder: pkg.displayOrder,
      });
    } else {
      setEditingPackage(null);
      setFormData({
        name: "",
        description: "",
        durationType: "MONTHLY",
        durationValue: 1,
        price: 0,
        currency: "TRY",
        features: [],
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
    setNewFeature("");
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

  const handleDelete = async (pkg: PremiumPackage) => {
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

  const handleToggleActive = async (pkg: PremiumPackage) => {
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

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()],
      });
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  const getDurationText = (type: string, value: number) => {
    const typeMap = {
      WEEKLY: "Hafta",
      MONTHLY: "Ay", 
      YEARLY: "Yıl",
    };
    return `${value} ${typeMap[type as keyof typeof typeMap]}`;
  };

  const columns: DataTableColumn<PremiumPackage>[] = [
    {
      key: "name",
      title: "Paket Adı",
      width: "200px",
      render: (value, row) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
            <CrownIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">
              {getDurationText(row.durationType, row.durationValue)}
            </div>
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
        </div>
      ),
    },
    {
      key: "features",
      title: "Özellikler",
      width: "300px",
      render: (value) => (
        <div className="space-y-1">
          {value.slice(0, 3).map((feature, index) => (
            <div key={index} className="flex items-center space-x-2">
              <CheckIcon className="w-3 h-3 text-green-500" />
              <span className="text-sm text-gray-700">{feature}</span>
            </div>
          ))}
          {value.length > 3 && (
            <div className="text-xs text-gray-500">
              +{value.length - 3} özellik daha
            </div>
          )}
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
      key: "displayOrder",
      title: "Sıra",
      align: "center",
      width: "80px",
      render: (value) => (
        <span className="text-sm font-medium text-gray-600">{value}</span>
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
          <h1 className="text-3xl font-bold text-gray-900">Premium Paketler</h1>
          <p className="text-gray-600 mt-1">Premium paketleri yönetin</p>
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
            <CrownIcon className="w-8 h-8 text-yellow-500" />
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
                  />
                </div>
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
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Süre Tipi *
                  </label>
                  <select
                    required
                    value={formData.durationType}
                    onChange={(e) => setFormData({ ...formData, durationType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500/20"
                  >
                    <option value="WEEKLY">Haftalık</option>
                    <option value="MONTHLY">Aylık</option>
                    <option value="YEARLY">Yıllık</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Süre Değeri *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.durationValue}
                    onChange={(e) => setFormData({ ...formData, durationValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500/20"
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
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Özellikler
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Yeni özellik ekle..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500/20"
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    Ekle
                  </button>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                      <span className="text-sm">{feature}</span>
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
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
        emptyMessage="Henüz premium paket bulunmuyor"
      />
    </div>
  );
}