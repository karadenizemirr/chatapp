"use client";

import { useState } from "react";
import { DataTable, DataTableColumn } from "@/components/ui/datatable";
import { useTrpc } from "@/hooks/use-trpc";
import {
  SendIcon,
  BellIcon,
  XIcon,
  CheckIcon,
  UsersIcon,
  MessageSquareIcon,
  GiftIcon,
  CrownIcon,
  HeartIcon,
  SettingsIcon,
  TrashIcon,
  FilterIcon,
  SearchIcon,
  TrendingUpIcon,
  EyeIcon,
  EyeOffIcon,
} from "lucide-react";

interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  notificationType: "MESSAGE" | "GIFT" | "MATCH" | "PREMIUM" | "SYSTEM";
  data?: any;
  isSent: boolean;
  sentAt?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  user: {
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

interface NotificationFormData {
  title: string;
  body: string;
  notificationType: "MESSAGE" | "GIFT" | "MATCH" | "PREMIUM" | "SYSTEM";
  data: string;
}

export default function NotificationSendComponent() {
  const [activeTab, setActiveTab] = useState<"send" | "history">("send");
  const [sendType, setSendType] = useState<"single" | "bulk" | "all">("single");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    userId: "",
    notificationType: "" as "" | "MESSAGE" | "GIFT" | "MATCH" | "PREMIUM" | "SYSTEM",
    isSent: undefined as boolean | undefined,
    isRead: undefined as boolean | undefined,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [formData, setFormData] = useState<NotificationFormData>({
    title: "",
    body: "",
    notificationType: "SYSTEM",
    data: "",
  });
  const [bulkFilters, setBulkFilters] = useState({
    isPremium: undefined as boolean | undefined,
    isFake: undefined as boolean | undefined,
    isActive: true,
  });

  const trpc = useTrpc();

  // Bildirimleri getir
  const {
    data: notificationsData,
    isLoading: notificationsLoading,
    refetch: refetchNotifications,
  } = trpc.notifications.getAll.useQuery({
    limit: 20,
    page: currentPage,
    filters: {
      userId: filters.userId || undefined,
      notificationType: filters.notificationType || undefined,
      isSent: filters.isSent,
      isRead: filters.isRead,
    },
  });

  // İstatistikleri getir
  const { data: statsData } = trpc.notifications.getStats.useQuery();

  // Kullanıcıları getir
  const { data: usersData } = trpc.user.getAll.useQuery(
    { limit: 50 },
    { enabled: sendType === "single" || sendType === "bulk" }
  );

  const sendMutation = trpc.notifications.send.useMutation();
  const sendBulkMutation = trpc.notifications.sendBulk.useMutation();
  const sendToAllMutation = trpc.notifications.sendToAll.useMutation();
  const deleteMutation = trpc.notifications.delete.useMutation();

  const notifications = notificationsData?.notifications || [];
  const totalCount = notificationsData?.totalCount || 0;
  const users = usersData?.users || [];
  const stats = statsData || {
    totalNotifications: 0,
    sentNotifications: 0,
    readNotifications: 0,
    unreadNotifications: 0,
    typeStats: [],
  };

  // Arama ile kullanıcıları filtrele
  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const email = user.email?.toLowerCase() || "";
    return fullName.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
  });

  const handleOpenForm = () => {
    setFormData({
      title: "",
      body: "",
      notificationType: "SYSTEM",
      data: "",
    });
    setSelectedUserIds([]);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSearchTerm("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const data = formData.data ? JSON.parse(formData.data) : undefined;
      
      if (sendType === "single") {
        if (selectedUserIds.length !== 1) {
          alert("Lütfen bir kullanıcı seçin");
          return;
        }
        await sendMutation.mutateAsync({
          userId: selectedUserIds[0],
          title: formData.title,
          body: formData.body,
          notificationType: formData.notificationType,
          data,
        });
        alert("Bildirim gönderildi!");
      } else if (sendType === "bulk") {
        if (selectedUserIds.length === 0) {
          alert("Lütfen en az bir kullanıcı seçin");
          return;
        }
        const result = await sendBulkMutation.mutateAsync({
          userIds: selectedUserIds,
          title: formData.title,
          body: formData.body,
          notificationType: formData.notificationType,
          data,
        });
        alert(`${result.count} kullanıcıya bildirim gönderildi!`);
      } else if (sendType === "all") {
        const result = await sendToAllMutation.mutateAsync({
          title: formData.title,
          body: formData.body,
          notificationType: formData.notificationType,
          data,
          filters: bulkFilters,
        });
        alert(`${result.count} kullanıcıya bildirim gönderildi!`);
      }
      
      refetchNotifications();
      handleCloseForm();
    } catch (error: any) {
      alert("Hata: " + error.message);
    }
  };

  const handleDelete = async (notification: Notification) => {
    if (confirm("Bu bildirimi silmek istediğinizden emin misiniz?")) {
      try {
        await deleteMutation.mutateAsync({ id: notification.id });
        refetchNotifications();
        alert("Bildirim silindi!");
      } catch (error: any) {
        alert("Hata: " + error.message);
      }
    }
  };

  const getNotificationTypeText = (type: string) => {
    const types = {
      MESSAGE: "Mesaj",
      GIFT: "Hediye",
      MATCH: "Eşleşme",
      PREMIUM: "Premium",
      SYSTEM: "Sistem",
    };
    return types[type as keyof typeof types] || type;
  };

  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case "MESSAGE":
        return <MessageSquareIcon className="w-4 h-4 text-blue-500" />;
      case "GIFT":
        return <GiftIcon className="w-4 h-4 text-pink-500" />;
      case "MATCH":
        return <HeartIcon className="w-4 h-4 text-red-500" />;
      case "PREMIUM":
        return <CrownIcon className="w-4 h-4 text-yellow-500" />;
      case "SYSTEM":
        return <SettingsIcon className="w-4 h-4 text-gray-500" />;
      default:
        return <BellIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const columns: DataTableColumn<Notification>[] = [
    {
      key: "user",
      title: "Kullanıcı",
      width: "200px",
      render: (value, row) => {
        const fullName = `${row.user.firstName} ${row.user.lastName}`;
        const profileImage = row.user.photos?.[0]?.filePath;
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
                  {row.user.firstName.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <div className="font-medium text-sm text-gray-900">{fullName}</div>
              <div className="text-xs text-gray-500">{row.user.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: "notificationType",
      title: "Tip",
      width: "120px",
      render: (value) => (
        <div className="flex items-center space-x-2">
          {getNotificationTypeIcon(value)}
          <span className="text-sm font-medium">
            {getNotificationTypeText(value)}
          </span>
        </div>
      ),
    },
    {
      key: "title",
      title: "Başlık",
      width: "200px",
      render: (value) => (
        <div className="text-sm font-medium text-gray-900 truncate">
          {value}
        </div>
      ),
    },
    {
      key: "body",
      title: "İçerik",
      width: "250px",
      render: (value) => (
        <div className="text-sm text-gray-700 truncate">
          {value}
        </div>
      ),
    },
    {
      key: "isSent",
      title: "Durum",
      align: "center",
      width: "100px",
      render: (value, row) => (
        <div className="text-center">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              value ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
            }`}
          >
            {value ? "Gönderildi" : "Bekliyor"}
          </span>
          {value && row.isRead && (
            <div className="text-xs text-blue-600 mt-1">Okundu</div>
          )}
        </div>
      ),
    },
    {
      key: "createdAt",
      title: "Tarih",
      width: "120px",
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
          <h1 className="text-3xl font-bold text-gray-900">Bildirim Yönetimi</h1>
          <p className="text-gray-600 mt-1">Kullanıcılara bildirim gönderin ve geçmişi görüntüleyin</p>
        </div>
        {activeTab === "send" && (
          <button
            onClick={handleOpenForm}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2"
          >
            <SendIcon className="w-5 h-5" />
            <span>Bildirim Gönder</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("send")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "send"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Bildirim Gönder
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "history"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Bildirim Geçmişi
          </button>
        </nav>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Bildirim</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalNotifications}</p>
            </div>
            <BellIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Gönderilen</p>
              <p className="text-2xl font-bold text-green-600">{stats.sentNotifications}</p>
            </div>
            <CheckIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Okunan</p>
              <p className="text-2xl font-bold text-blue-600">{stats.readNotifications}</p>
            </div>
            <EyeIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Okunmayan</p>
              <p className="text-2xl font-bold text-orange-600">{stats.unreadNotifications}</p>
            </div>
            <EyeOffIcon className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Content */}
      {activeTab === "send" ? (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bildirim Gönderme Seçenekleri</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              onClick={() => setSendType("single")}
              className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                sendType === "single"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-center">
                <UsersIcon className="w-12 h-12 mx-auto mb-3 text-blue-500" />
                <h4 className="font-semibold text-gray-900">Tekil Gönderim</h4>
                <p className="text-sm text-gray-600 mt-2">Belirli bir kullanıcıya bildirim gönder</p>
              </div>
            </div>
            <div
              onClick={() => setSendType("bulk")}
              className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                sendType === "bulk"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-center">
                <UsersIcon className="w-12 h-12 mx-auto mb-3 text-green-500" />
                <h4 className="font-semibold text-gray-900">Toplu Gönderim</h4>
                <p className="text-sm text-gray-600 mt-2">Seçili kullanıcılara bildirim gönder</p>
              </div>
            </div>
            <div
              onClick={() => setSendType("all")}
              className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                sendType === "all"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-center">
                <TrendingUpIcon className="w-12 h-12 mx-auto mb-3 text-purple-500" />
                <h4 className="font-semibold text-gray-900">Genel Duyuru</h4>
                <p className="text-sm text-gray-600 mt-2">Tüm kullanıcılara bildirim gönder</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <FilterIcon className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filtreler</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Bildirim Tipi
                </label>
                <select
                  value={filters.notificationType}
                  onChange={(e) =>
                    setFilters({ ...filters, notificationType: e.target.value as any })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Tümü</option>
                  <option value="MESSAGE">Mesaj</option>
                  <option value="GIFT">Hediye</option>
                  <option value="MATCH">Eşleşme</option>
                  <option value="PREMIUM">Premium</option>
                  <option value="SYSTEM">Sistem</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Gönderim Durumu
                </label>
                <select
                  value={filters.isSent === undefined ? "" : filters.isSent.toString()}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      isSent: e.target.value === "" ? undefined : e.target.value === "true",
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Tümü</option>
                  <option value="true">Gönderildi</option>
                  <option value="false">Bekliyor</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Okunma Durumu
                </label>
                <select
                  value={filters.isRead === undefined ? "" : filters.isRead.toString()}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      isRead: e.target.value === "" ? undefined : e.target.value === "true",
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Tümü</option>
                  <option value="true">Okundu</option>
                  <option value="false">Okunmadı</option>
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
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          <DataTable
            data={notifications}
            columns={columns}
            loading={notificationsLoading}
            searchable={false}
            filterable={false}
            exportable={true}
            selectable={false}
            pagination={false}
            onRowClick={undefined}
            emptyMessage="Henüz bildirim bulunmuyor"
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
        </>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Bildirim Gönder</h2>
              <button
                onClick={handleCloseForm}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Notification Form */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Başlık *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Bildirim başlığı"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bildirim Tipi *
                  </label>
                  <select
                    required
                    value={formData.notificationType}
                    onChange={(e) => setFormData({ ...formData, notificationType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="SYSTEM">Sistem</option>
                    <option value="MESSAGE">Mesaj</option>
                    <option value="GIFT">Hediye</option>
                    <option value="MATCH">Eşleşme</option>
                    <option value="PREMIUM">Premium</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  İçerik *
                </label>
                <textarea
                  required
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Bildirim içeriği..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ek Veri (JSON)
                </label>
                <textarea
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                  placeholder='{"key": "value"}'
                />
              </div>

              {/* User Selection */}
              {(sendType === "single" || sendType === "bulk") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kullanıcı Seçimi *
                  </label>
                  <div className="relative mb-2">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Kullanıcı ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                    {filteredUsers.map((user) => (
                      <label key={user.id} className="flex items-center p-3 hover:bg-gray-50 cursor-pointer">
                        <input
                          type={sendType === "single" ? "radio" : "checkbox"}
                          name="selectedUsers"
                          value={user.id}
                          checked={selectedUserIds.includes(user.id)}
                          onChange={(e) => {
                            if (sendType === "single") {
                              setSelectedUserIds(e.target.checked ? [user.id] : []);
                            } else {
                              setSelectedUserIds(prev =>
                                e.target.checked
                                  ? [...prev, user.id]
                                  : prev.filter(id => id !== user.id)
                              );
                            }
                          }}
                          className="mr-3"
                        />
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-xs">
                              {user.firstName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-sm">{user.firstName} {user.lastName}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                  {selectedUserIds.length > 0 && (
                    <div className="mt-2 text-sm text-blue-600">
                      {selectedUserIds.length} kullanıcı seçildi
                    </div>
                  )}
                </div>
              )}

              {/* Bulk Filters */}
              {sendType === "all" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Kullanıcı Filtreleri
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Premium Durumu
                      </label>
                      <select
                        value={bulkFilters.isPremium === undefined ? "" : bulkFilters.isPremium.toString()}
                        onChange={(e) =>
                          setBulkFilters({
                            ...bulkFilters,
                            isPremium: e.target.value === "" ? undefined : e.target.value === "true",
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="">Tümü</option>
                        <option value="true">Premium</option>
                        <option value="false">Normal</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Fake Durumu
                      </label>
                      <select
                        value={bulkFilters.isFake === undefined ? "" : bulkFilters.isFake.toString()}
                        onChange={(e) =>
                          setBulkFilters({
                            ...bulkFilters,
                            isFake: e.target.value === "" ? undefined : e.target.value === "true",
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="">Tümü</option>
                        <option value="false">Gerçek</option>
                        <option value="true">Fake</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Aktiflik Durumu
                      </label>
                      <select
                        value={bulkFilters.isActive.toString()}
                        onChange={(e) =>
                          setBulkFilters({
                            ...bulkFilters,
                            isActive: e.target.value === "true",
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="true">Aktif</option>
                        <option value="false">Pasif</option>
                      </select>
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
                  disabled={sendMutation.isLoading || sendBulkMutation.isLoading || sendToAllMutation.isLoading}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50"
                >
                  Bildirim Gönder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}