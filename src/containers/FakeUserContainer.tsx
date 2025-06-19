"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useTrpc } from "@/hooks/use-trpc";
import { DataTable, DataTableColumn } from "@/components/ui/datatable";
import UserProfileDialog from "@/components/ui/UserProfileDialog";
import {
  UserIcon,
  MailIcon,
  CalendarIcon,
  PlusIcon,
  RefreshCwIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  TrashIcon,
  ShieldIcon,
  CoinsIcon,
  ImageIcon,
  SearchIcon
} from "lucide-react";

// Sahte kullanıcı tipi
interface FakeUser {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  birthDate: string;
  bio?: string;
  relationshipType: string;
  isActive: boolean;
  isFake: boolean;
  lastActiveAt?: string;
  coins?: number;
  photos: Array<{
    id: string;
    filePath: string;
    isPrimary: boolean;
  }>;
  city?: {
    id: string;
    name: string;
  };
}

// Sahte kullanıcı oluşturma formu için tip
interface FakeUserFormData {
  firstName: string;
  lastName: string;
  email: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  birthDate: string;
  bio: string;
  cityId?: string;
  relationshipType: "DATING" | "FRIENDSHIP" | "BOTH";
}

export default function FakeUserContainer() {
  // State tanımlamaları
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<FakeUser | null>(null);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [formData, setFormData] = useState<FakeUserFormData>({
    firstName: "",
    lastName: "",
    email: "",
    gender: "FEMALE",
    birthDate: "",
    bio: "",
    relationshipType: "DATING"
  });

  // tRPC hooks
  const trpc = useTrpc();

  // Tüm kullanıcıları getir, ama sadece fake olanları filtrele
  const { data, isLoading, error, refetch } = trpc.user.getAll.useQuery({
    limit: 100,
  });

  // Şehirleri getir
  const { data: citiesData } = trpc.user.getCities?.useQuery?.() || { data: null };

  // Kullanıcı silme mutation
  const deleteUserMutation = trpc.user.delete.useMutation();

  // Kullanıcı oluşturma mutation
  const createUserMutation = trpc.user.create.useMutation();

  // Fake user durumu değiştirme mutation
  const toggleFakeMutation = trpc.user.toggleFake?.useMutation?.();

  // Sadece fake kullanıcıları filtrele
  const fakeUsers = useMemo(() => {
    return (data?.users || []).filter(user => user.isFake);
  }, [data]);

  // Profil görüntüleme
  const handleViewProfile = (user: FakeUser) => {
    setSelectedUser(user);
    setIsProfileDialogOpen(true);
  };

  // Profil güncelleme
  const handleUpdateProfile = async (userId: string, data: any) => {
    try {
      await trpc.user.updateProfile.mutateAsync({
        id: userId,
        ...data
      });
      toast.success("Profil başarıyla güncellendi");
      refetch();
      // Seçili kullanıcıyı güncelle
      if (selectedUser && selectedUser.id === userId) {
        const updatedUsers = fakeUsers.map(u => 
          u.id === userId ? { ...u, ...data } : u
        );
        const updatedUser = updatedUsers.find(u => u.id === userId);
        if (updatedUser) {
          setSelectedUser(updatedUser);
        }
      }
    } catch (error: any) {
      toast.error(`Profil güncellenirken hata oluştu: ${error.message}`);
    }
  };

  // Kullanıcı silme
  const handleDeleteUser = (user: FakeUser) => {
    if (confirm(`${user.firstName} ${user.lastName} kullanıcısını silmek istediğinizden emin misiniz?`)) {
      toast.promise(deleteUserMutation.mutateAsync({ id: user.id }), {
        loading: "Kullanıcı siliniyor...",
        success: () => {
          refetch();
          return "Kullanıcı başarıyla silindi";
        },
        error: "Kullanıcı silinirken bir hata oluştu"
      });
    }
  };

  // Form verilerini güncelle
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fake kullanıcı oluştur
  const handleCreateFakeUser = (e: React.FormEvent) => {
    e.preventDefault();

    // Doğum tarihini Date nesnesine çevir
    // Doğru ISO formatında bir tarih oluştur (YYYY-MM-DD)
    const [year, month, day] = formData.birthDate.split('-').map(Number);
    const birthDate = new Date(year, month - 1, day); // JavaScript'te aylar 0'dan başlar

    toast.promise(
      createUserMutation.mutateAsync({
        ...formData,
        birthDate,
        // Fake user flag'i API tarafında ayarlanmalı
        isFake: true
      }),
      {
        loading: "Fake kullanıcı oluşturuluyor...",
        success: () => {
          refetch();
          setIsCreateFormOpen(false);
          setFormData({
            firstName: "",
            lastName: "",
            email: "",
            gender: "FEMALE",
            birthDate: "",
            bio: "",
            relationshipType: "DATING"
          });
          return "Fake kullanıcı başarıyla oluşturuldu";
        },
        error: (error) => {
          console.error("Kullanıcı oluşturma hatası:", error);
          return `Fake kullanıcı oluşturulurken bir hata oluştu: ${error?.message || 'Bilinmeyen hata'}`;
        }
      }
    );
  };

  // DataTable sütunları
  const columns: DataTableColumn<FakeUser>[] = [
    {
      key: "firstName",
      title: "Kullanıcı",
      sortable: true,
      width: "250px",
      render: (value, row) => {
        const fullName = `${row.firstName} ${row.lastName}`;
        const profileImage = row.photos?.[0]?.filePath;
        return (
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center ring-2 ring-white shadow-md">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={fullName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-lg">
                    {value?.charAt(0)?.toUpperCase()}
                  </span>
                )}
              </div>
              <div
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                  row.isActive ? "bg-green-500" : "bg-gray-400"
                }`}
              ></div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-gray-900 truncate flex items-center gap-1">
                {fullName}
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-full">Fake</span>
              </div>
              <div className="text-xs text-gray-500 flex items-center space-x-1 mt-1">
                <MailIcon className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{row.email || "Email yok"}</span>
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                ID: {row.id.slice(0, 8)}...
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: "birthDate",
      title: "Yaş",
      sortable: true,
      align: "center",
      render: (value) => {
        if (!value) return "-";
        const age = new Date().getFullYear() - new Date(value).getFullYear();
        return `${age} yaş`;
      },
    },
    {
      key: "gender",
      title: "Cinsiyet",
      sortable: true,
      filterable: true,
      align: "center",
      render: (value) => {
        const genderMap = {
          MALE: { label: "Erkek", color: "bg-blue-100 text-blue-800" },
          FEMALE: { label: "Kadın", color: "bg-pink-100 text-pink-800" },
          OTHER: { label: "Diğer", color: "bg-gray-100 text-gray-800" },
        };
        const gender = genderMap[value as keyof typeof genderMap];
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              gender?.color || "bg-gray-100 text-gray-800"
            }`}
          >
            {gender?.label || value}
          </span>
        );
      },
    },
    {
      key: "city",
      title: "Konum",
      sortable: true,
      filterable: true,
      render: (value, row) => row.city?.name || "-",
    },
    {
      key: "relationshipType",
      title: "İlişki Türü",
      sortable: true,
      filterable: true,
      render: (value) => {
        const typeMap = {
          DATING: { label: "Flört", color: "bg-pink-100 text-pink-800" },
          FRIENDSHIP: { label: "Arkadaşlık", color: "bg-blue-100 text-blue-800" },
          BOTH: { label: "Her İkisi", color: "bg-purple-100 text-purple-800" },
        };
        const type = typeMap[value as keyof typeof typeMap];
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              type?.color || "bg-gray-100 text-gray-800"
            }`}
          >
            {type?.label || value}
          </span>
        );
      },
    },
    {
      key: "photos",
      title: "Fotoğraf",
      align: "center",
      width: "80px",
      render: (value, row) => (
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-1">
            {row.photos?.length > 0 ? (
              <>
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                <span className="text-xs text-gray-600">
                  {row.photos.length}
                </span>
              </>
            ) : (
              <XCircleIcon className="w-4 h-4 text-red-500" />
            )}
          </div>
        </div>
      ),
    },
    {
      key: "isActive",
      title: "Durum",
      sortable: true,
      align: "center",
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
      key: "lastActiveAt",
      title: "Son Aktiflik",
      sortable: true,
      width: "120px",
      render: (value) => {
        if (!value)
          return <span className="text-xs text-gray-400">Hiç aktif olmamış</span>;

        const date = new Date(value);
        const now = new Date();
        const diffInHours = Math.floor(
          (now.getTime() - date.getTime()) / (1000 * 60 * 60)
        );

        let timeText = "";
        let colorClass = "text-gray-600";

        if (diffInHours < 1) {
          timeText = "Az önce";
          colorClass = "text-green-600";
        } else if (diffInHours < 24) {
          timeText = `${diffInHours}s önce`;
          colorClass = "text-blue-600";
        } else if (diffInHours < 168) {
          timeText = `${Math.floor(diffInHours / 24)}g önce`;
          colorClass = "text-yellow-600";
        } else {
          timeText = date.toLocaleDateString("tr-TR");
          colorClass = "text-gray-600";
        }

        return <span className={`text-xs font-medium ${colorClass}`}>{timeText}</span>;
      },
    },
    {
      key: "actions",
      title: "İşlemler",
      align: "center",
      width: "120px",
      render: (value, row) => (
        <div className="flex items-center justify-center space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewProfile(row);
            }}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 group"
            title="Profili Görüntüle"
          >
            <EyeIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteUser(row);
            }}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 group"
            title="Sil"
          >
            <TrashIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
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
          <h1 className="text-3xl font-bold text-gray-900">Sahte Kullanıcılar</h1>
          <p className="text-gray-600 mt-1">
            Sahte kullanıcıları yönetin ve yenilerini oluşturun
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors duration-200"
          >
            <RefreshCwIcon className="w-4 h-4 text-gray-600" />
            <span>Yenile</span>
          </button>
          <button
            onClick={() => setIsCreateFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-lg shadow-sm hover:from-amber-600 hover:to-amber-700 transition-all duration-200"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Yeni Fake Kullanıcı</span>
          </button>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Toplam Fake Kullanıcı
              </p>
              <p className="text-2xl font-bold text-amber-600">
                {isLoading ? "..." : fakeUsers.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Fotoğraflı Fake Profiller
              </p>
              <p className="text-2xl font-bold text-green-600">
                {isLoading
                  ? "..."
                  : fakeUsers.filter((u) => u.photos?.length > 0).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Toplam Fake Coin
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                {isLoading
                  ? "..."
                  : fakeUsers
                      .reduce((sum, u) => sum + (u.coins || 0), 0)
                      .toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <CoinsIcon className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Yeni Fake Kullanıcı Oluşturma */}
      {isCreateFormOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Yeni Fake Kullanıcı</h2>
                <button
                  onClick={() => setIsCreateFormOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <XCircleIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateFakeUser}>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ad</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Soyad</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cinsiyet</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    required
                  >
                    <option value="FEMALE">Kadın</option>
                    <option value="MALE">Erkek</option>
                    <option value="OTHER">Diğer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Doğum Tarihi</label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    max={new Date().toISOString().split('T')[0]} // Bugünden ileri tarih seçilemesin
                    required
                    title="Doğum tarihi (YYYY-AA-GG formatında)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">İlişki Türü</label>
                  <select
                    name="relationshipType"
                    value={formData.relationshipType}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    required
                  >
                    <option value="DATING">Flört</option>
                    <option value="FRIENDSHIP">Arkadaşlık</option>
                    <option value="BOTH">Her İkisi</option>
                  </select>
                </div>

                {citiesData?.cities && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Şehir</label>
                    <select
                      name="cityId"
                      value={formData.cityId || ""}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    >
                      <option value="">Şehir Seçin</option>
                      {citiesData.cities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Biyografi</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 min-h-[100px]"
                    placeholder="Kullanıcı hakkında kısa bir açıklama..."
                  ></textarea>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3 rounded-b-2xl">
                <button
                  type="button"
                  onClick={() => setIsCreateFormOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-colors"
                >
                  Fake Kullanıcı Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profil Dialogu */}
      <UserProfileDialog
        isOpen={isProfileDialogOpen}
        onClose={() => setIsProfileDialogOpen(false)}
        user={selectedUser}
        loading={false}
        onDelete={(userId) => {
          const user:any = fakeUsers.find(u => u.id === userId);
          if (user) {
            handleDeleteUser(user);
            setIsProfileDialogOpen(false);
          }
        }}
        onUpdateProfile={handleUpdateProfile}
        cities={citiesData?.cities}
      />

      {/* Veri Tablosu */}
      <DataTable
        data={fakeUsers}
        columns={columns}
        loading={isLoading}
        searchable={true}
        filterable={true}
        exportable={true}
        pagination={true}
        pageSize={10}
        className=""  
        emptyMessage="Henüz fake kullanıcı bulunmuyor"
      />

      {/* Kullanıcı yoksa boş ekran */}
      {!isLoading && fakeUsers.length === 0 && (
        <div className="bg-white rounded-xl p-10 border border-gray-200 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <UserIcon className="w-8 h-8 text-amber-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Henüz fake kullanıcı yok</h3>
          <p className="text-gray-600 max-w-md mb-6">
            Sahte profiller oluşturarak uygulamanızı test edebilir ve kullanıcı deneyimini geliştirebilirsiniz.
          </p>
          <button
            onClick={() => setIsCreateFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-lg shadow-sm hover:from-amber-600 hover:to-amber-700 transition-all duration-200"
          >
            <PlusIcon className="w-4 h-4" />
            <span>İlk Fake Kullanıcıyı Oluştur</span>
          </button>
        </div>
      )}
    </div>
  );
}