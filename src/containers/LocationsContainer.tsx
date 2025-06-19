"use client";

import { useState } from "react";
import { DataTable, DataTableColumn } from "@/components/ui/datatable";
import { useTrpc } from "@/hooks/use-trpc";
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  MapPinIcon,
  XIcon,
  CheckIcon,
  EyeOffIcon,
  EyeIcon,
  UsersIcon,
  GlobeIcon,
  TrendingUpIcon,
} from "lucide-react";

interface City {
  id: string;
  name: string;
  countryCode: string;
  isActive: boolean;
  createdAt: string;
  userCount: number;
}

interface CityFormData {
  name: string;
  countryCode: string;
}

const COUNTRIES = [
  { code: "TR", name: "Türkiye", flag: "🇹🇷" },
  { code: "US", name: "Amerika", flag: "🇺🇸" },
  { code: "DE", name: "Almanya", flag: "🇩🇪" },
  { code: "FR", name: "Fransa", flag: "🇫🇷" },
  { code: "GB", name: "İngiltere", flag: "🇬🇧" },
  { code: "IT", name: "İtalya", flag: "🇮🇹" },
  { code: "ES", name: "İspanya", flag: "🇪🇸" },
  { code: "NL", name: "Hollanda", flag: "🇳🇱" },
];

export default function LocationsContainer() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [formData, setFormData] = useState<CityFormData>({
    name: "",
    countryCode: "TR",
  });

  const trpc = useTrpc();

  // Şehirleri getir
  const {
    data: citiesData,
    isLoading,
    refetch,
  } = trpc.location.getAll.useQuery({});

  // İstatistikleri getir
  const { data: statsData } = trpc.location.getStats.useQuery();

  const createMutation = trpc.location.create.useMutation();
  const updateMutation = trpc.location.update.useMutation();
  const deleteMutation = trpc.location.delete.useMutation();
  const toggleActiveMutation = trpc.location.toggleActive.useMutation();

  const cities = citiesData?.cities || [];
  const stats = statsData || {
    totalCities: 0,
    activeCities: 0,
    inactiveCities: 0,
    topCities: [],
  };

  const handleOpenForm = (city?: City) => {
    if (city) {
      setEditingCity(city);
      setFormData({
        name: city.name,
        countryCode: city.countryCode,
      });
    } else {
      setEditingCity(null);
      setFormData({
        name: "",
        countryCode: "TR",
      });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCity(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCity) {
        await updateMutation.mutateAsync({
          id: editingCity.id,
          ...formData,
        });
      } else {
        await createMutation.mutateAsync(formData);
      }
      
      refetch();
      handleCloseForm();
      alert(editingCity ? "Şehir güncellendi!" : "Şehir oluşturuldu!");
    } catch (error: any) {
      alert("Hata: " + error.message);
    }
  };

  const handleDelete = async (city: City) => {
    if (confirm(`"${city.name}" şehrini silmek istediğinizden emin misiniz?`)) {
      try {
        await deleteMutation.mutateAsync({ id: city.id });
        refetch();
        alert("Şehir silindi!");
      } catch (error: any) {
        alert("Hata: " + error.message);
      }
    }
  };

  const handleToggleActive = async (city: City) => {
    try {
      await toggleActiveMutation.mutateAsync({
        id: city.id,
        isActive: !city.isActive,
      });
      refetch();
    } catch (error: any) {
      alert("Hata: " + error.message);
    }
  };

  const getCountryInfo = (countryCode: string) => {
    return COUNTRIES.find(c => c.code === countryCode) || { 
      code: countryCode, 
      name: countryCode, 
      flag: "🌍" 
    };
  };

  const columns: DataTableColumn<City>[] = [
    {
      key: "name",
      title: "Şehir",
      width: "300px",
      render: (value, row) => {
        const country = getCountryInfo(row.countryCode);
        return (
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
              <MapPinIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">{value}</div>
              <div className="text-sm text-gray-500 flex items-center space-x-1">
                <span>{country.flag}</span>
                <span>{country.name}</span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: "userCount",
      title: "Kullanıcı Sayısı",
      align: "center",
      width: "150px",
      render: (value) => (
        <div className="text-center">
          <div className="font-bold text-lg text-blue-600 flex items-center justify-center space-x-1">
            <UsersIcon className="w-4 h-4" />
            <span>{value.toLocaleString()}</span>
          </div>
        </div>
      ),
    },
    {
      key: "countryCode",
      title: "Ülke",
      width: "150px",
      render: (value) => {
        const country = getCountryInfo(value);
        return (
          <div className="flex items-center space-x-2">
            <span className="text-lg">{country.flag}</span>
            <span className="text-sm font-medium text-gray-700">{country.name}</span>
          </div>
        );
      },
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
          <h1 className="text-3xl font-bold text-gray-900">Lokasyon Yönetimi</h1>
          <p className="text-gray-600 mt-1">Şehirleri ve lokasyonları yönetin</p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Yeni Şehir</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Şehir</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCities}</p>
            </div>
            <MapPinIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aktif Şehir</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeCities}</p>
            </div>
            <CheckIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pasif Şehir</p>
              <p className="text-2xl font-bold text-red-600">{stats.inactiveCities}</p>
            </div>
            <EyeOffIcon className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Kullanıcı</p>
              <p className="text-2xl font-bold text-purple-600">
                {cities.reduce((sum, city) => sum + city.userCount, 0).toLocaleString()}
              </p>
            </div>
            <UsersIcon className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Top Cities */}
      {stats.topCities.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <TrendingUpIcon className="w-5 h-5 text-blue-500" />
            <span>En Popüler Şehirler</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {stats.topCities.map((city, index) => {
              const country = getCountryInfo(city.countryCode);
              return (
                <div key={city.id} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">{country.flag}</div>
                  <div className="font-semibold text-gray-900">{city.name}</div>
                  <div className="text-sm text-gray-500">{country.name}</div>
                  <div className="text-lg font-bold text-blue-600 mt-2">
                    {city.userCount} kullanıcı
                  </div>
                  <div className="text-xs text-gray-400">#{index + 1}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingCity ? "Şehir Düzenle" : "Yeni Şehir Oluştur"}
              </h2>
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
                  Şehir Adı *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Örn: İstanbul"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ülke *
                </label>
                <select
                  required
                  value={formData.countryCode}
                  onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                >
                  {COUNTRIES.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Preview */}
              {formData.name && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Önizleme</h4>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                      <MapPinIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{formData.name}</div>
                      <div className="text-sm text-gray-500 flex items-center space-x-1">
                        <span>{getCountryInfo(formData.countryCode).flag}</span>
                        <span>{getCountryInfo(formData.countryCode).name}</span>
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
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50"
                >
                  {editingCity ? "Güncelle" : "Oluştur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Data Table */}
      <DataTable
        data={cities}
        columns={columns}
        loading={isLoading}
        searchable={true}
        filterable={false}
        exportable={true}
        selectable={false}
        pagination={true}
        pageSize={10}
        onRowClick={undefined}
        emptyMessage="Henüz şehir bulunmuyor"
      />
    </div>
  );
}