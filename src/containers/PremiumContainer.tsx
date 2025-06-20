"use client";

import { useState } from "react";
import { DataTable, DataTableColumn } from "@/components/ui/datatable";
import { useTrpc } from "@/hooks/use-trpc";
import PageHeader from "@/components/PageHeader";
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  CrownIcon,
  XIcon,
  CheckIcon,
  EyeOffIcon,
  EyeIcon,
  PackageIcon,
  CoinsIcon,
  CalendarIcon,
  TimerIcon,
  ListOrderedIcon,
  ListChecksIcon,
  BadgeCheckIcon,
  MessageSquareIcon
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
      width: "220px",
      render: (value, row) => (
        <div className="flex items-center space-x-3 p-1">
          <div className="relative group">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform">
              <CrownIcon className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center">
              <div className="w-3.5 h-3.5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full"></div>
            </div>
          </div>
          <div>
            <div className="font-bold text-gray-900 text-base">{value}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-md">
                {getDurationText(row.durationType, row.durationValue)}
              </span>
              <span className="text-xs text-gray-500">
                #{row.id.slice(0, 6)}
              </span>
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
          <div className="font-bold text-xl bg-gradient-to-br from-green-500 to-emerald-700 bg-clip-text text-transparent">
            {value}
          </div>
          <div className="text-xs font-medium text-gray-500 mt-0.5">
            {row.currency}
          </div>
        </div>
      ),
    },
    {
      key: "features",
      title: "Özellikler",
      width: "280px",
      render: (value) => (
        <div className="bg-gradient-to-r from-white to-gray-50/80 rounded-xl p-3 border border-gray-100 hover:from-primary/5 hover:to-white hover:border-primary/20 transition-all duration-300">
          <div className="space-y-2">
            {value.slice(0, 3).map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-green-100 rounded-md flex items-center justify-center">
                  <CheckIcon className="w-3.5 h-3.5 text-green-600" />
                </div>
                <span className="text-sm text-gray-800">{feature}</span>
              </div>
            ))}
            {value.length > 3 && (
              <div className="flex items-center justify-end mt-1">
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                  +{value.length - 3} özellik daha
                </span>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "isActive",
      title: "Durum",
      align: "center",
      width: "100px",
      render: (value) => (
        <div>
          {value ? (
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckIcon className="w-4 h-4 text-green-600" />
              </div>
              <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-green-100 text-green-800">
                Aktif
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <EyeOffIcon className="w-4 h-4 text-orange-600" />
              </div>
              <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-orange-100 text-orange-800">
                Pasif
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "displayOrder",
      title: "Sıra",
      align: "center",
      width: "80px",
      render: (value) => (
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-700">
            {value}
          </div>
          <span className="text-xs text-gray-500 mt-1">Sıra No</span>
        </div>
      ),
    },
    {
      key: "createdAt",
      title: "Oluşturulma",
      width: "120px",
      render: (value) => {
        const date = new Date(value);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        return (
          <div className="flex flex-col items-center gap-1">
            <div className={`text-xs px-2 py-0.5 rounded-full ${isToday ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'}`}>
              {isToday ? 'Bugün' : date.toLocaleDateString("tr-TR")}
            </div>
            <div className="text-sm text-gray-600">
              {date.toLocaleTimeString("tr-TR", {
                hour: "2-digit",
                minute: "2-digit"
              })}
            </div>
          </div>
        );
      },
    },
    {
      key: "actions",
      title: "İşlemler",
      align: "center",
      width: "150px",
      render: (value, row) => (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => handleToggleActive(row)}
            className={`p-2 rounded-xl transition-all ${row.isActive ? 
              "bg-orange-100 text-orange-600 hover:bg-orange-200" : 
              "bg-green-100 text-green-600 hover:bg-green-200"}`}
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
            className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-xl transition-all"
            title="Düzenle"
          >
            <EditIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-xl transition-all"
            title="Sil"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 bg-gradient-to-br from-gray-50 to-white rounded-3xl p-6">
      {/* Header */}
      <PageHeader
        title="Premium Paketler"
        description="Premium paketleri yönetin ve düzenleyin"
        badge={{
          text: "Premium",
          icon: <CrownIcon className="w-3 h-3 text-yellow-300" />
        }}
        stats={[
          {
            value: packages.length.toString(),
            label: "toplam paket"
          },
          {
            value: packages.filter(p => p.isActive).length.toString(),
            label: "aktif paket"
          }
        ]}
        actions={
          <button
            onClick={() => handleOpenForm()}
            className="px-4 py-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 flex items-center gap-2 hover:bg-white/20 transition duration-300 text-white"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Yeni Paket</span>
          </button>
        }
        avatarText="P"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="group bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-5 border border-indigo-100 hover:border-primary/20 transition-all duration-300 hover:from-indigo-100 hover:to-white">
          <div className="flex items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                  <PackageIcon className="w-4 h-4 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-700">Tüm Paketler</p>
              </div>
              <p className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {packages.length}
              </p>
              <p className="text-xs text-gray-500 mt-1">Toplam premium paket sayısı</p>
            </div>
          </div>
        </div>

        <div className="group bg-gradient-to-br from-green-50 to-white rounded-2xl p-5 border border-green-100 hover:border-green-200 transition-all duration-300 hover:from-green-100 hover:to-white">
          <div className="flex items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-lg flex items-center justify-center">
                  <CheckIcon className="w-4 h-4 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-700">Aktif Paketler</p>
              </div>
              <p className="text-3xl font-bold text-green-600">
                {packages.filter(p => p.isActive).length}
              </p>
              <p className="text-xs text-green-600/70 mt-1">Yayında olan paketler</p>
            </div>
          </div>
        </div>

        <div className="group bg-gradient-to-br from-orange-50 to-white rounded-2xl p-5 border border-orange-100 hover:border-orange-200 transition-all duration-300 hover:from-orange-100 hover:to-white">
          <div className="flex items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg flex items-center justify-center">
                  <EyeOffIcon className="w-4 h-4 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-700">Pasif Paketler</p>
              </div>
              <p className="text-3xl font-bold text-orange-600">
                {packages.filter(p => !p.isActive).length}
              </p>
              <p className="text-xs text-orange-600/70 mt-1">Yayında olmayan paketler</p>
            </div>
          </div>
        </div>

        <div className="group bg-gradient-to-br from-yellow-50 to-white rounded-2xl p-5 border border-yellow-100 hover:border-yellow-200 transition-all duration-300 hover:from-yellow-100 hover:to-white">
          <div className="flex items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center">
                  <CoinsIcon className="w-4 h-4 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-700">Ortalama Fiyat</p>
              </div>
              <p className="text-3xl font-bold text-yellow-600">
                {packages.length > 0 
                  ? Math.round(packages.reduce((sum, p) => sum + p.price, 0) / packages.length)
                  : 0
                }<span className="text-lg ml-1">TL</span>
              </p>
              <p className="text-xs text-yellow-600/70 mt-1">Tüm paketlerin ortalaması</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden shadow-xl animate-in fade-in-0 zoom-in-95 duration-300">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-secondary/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                  <CrownIcon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingPackage ? "Paket Düzenle" : "Yeni Paket Oluştur"}
                </h2>
              </div>
              <button
                onClick={handleCloseForm}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                    <CrownIcon className="w-3.5 h-3.5 text-primary" />
                    Paket Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                    placeholder="Premium Plus"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                    <CoinsIcon className="w-3.5 h-3.5 text-yellow-500" />
                    Fiyat *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all pr-12"
                      placeholder="99.90"
                    />
                    <div className="absolute right-0 top-0 bottom-0 px-3 flex items-center text-gray-500 pointer-events-none bg-gray-50 rounded-r-xl border-l border-gray-200">
                      TL
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                  <MessageSquareIcon className="w-3.5 h-3.5 text-blue-500" />
                  Açıklama
                </label>
                <div className="relative">
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all resize-none bg-gradient-to-r from-white to-gray-50/50"
                    placeholder="Bu paket hakkında detaylı bilgi..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5 text-purple-500" />
                    Süre Tipi *
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={formData.durationType}
                      onChange={(e) => setFormData({ ...formData, durationType: e.target.value as any })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all pr-10 bg-white"
                    >
                      <option value="WEEKLY">Haftalık</option>
                      <option value="MONTHLY">Aylık</option>
                      <option value="YEARLY">Yıllık</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      <div className="w-4 h-4 border-t-2 border-r-2 border-gray-400 transform rotate-45 translate-y-1/2 -translate-x-1/2"></div>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                    <TimerIcon className="w-3.5 h-3.5 text-indigo-500" />
                    Süre Değeri *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.durationValue}
                    onChange={(e) => setFormData({ ...formData, durationValue: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                    <ListOrderedIcon className="w-3.5 h-3.5 text-teal-500" />
                    Görüntüleme Sırası
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                  <ListChecksIcon className="w-3.5 h-3.5 text-green-500" />
                  Paket Özellikleri
                </label>
                <div className="flex space-x-2 mb-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      placeholder="Yeni özellik ekle..."
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all pl-10"
                      onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                    />
                    <div className="absolute left-0 inset-y-0 flex items-center pl-3 pointer-events-none">
                      <PlusIcon className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addFeature}
                    className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:opacity-90 transition-colors flex items-center gap-2"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>Ekle</span>
                  </button>
                </div>
                <div className="p-4 rounded-xl border border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <div className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                    <BadgeCheckIcon className="w-4 h-4 text-primary" />
                    <span>Eklenen Özellikler ({formData.features.length})</span>
                  </div>
                  {formData.features.length === 0 ? (
                    <div className="py-4 text-center text-gray-400 text-sm italic bg-gray-50/50 rounded-lg">
                      Henüz özellik eklenmedi
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {formData.features.map((feature, index) => (
                        <div key={index} className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-gradient-to-r from-gray-50 to-white border border-gray-100 group hover:border-primary/20 transition-all">
                          <span className="text-sm text-gray-700 font-medium flex items-center gap-2">
                            <CheckIcon className="w-3.5 h-3.5 text-green-500" />
                            {feature}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFeature(index)}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          >
                            <XIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <XIcon className="w-4 h-4" />
                  <span>İptal</span>
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isLoading || updateMutation.isLoading}
                  className="px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
                >
                  {editingPackage ? (
                    <>
                      <EditIcon className="w-4 h-4" />
                      <span>Güncelle</span>
                    </>
                  ) : (
                    <>
                      <PlusIcon className="w-4 h-4" />
                      <span>Oluştur</span>
                    </>
                  )}
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
        <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <CrownIcon className="w-4 h-4 text-yellow-500" />
            Premium Paketler Listesi
          </h3>
        </div>
        <div className="p-2">
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
      </div>
    </div>
  );
}