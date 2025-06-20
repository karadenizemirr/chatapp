
"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { DataTable, DataTableColumn } from "@/components/ui/datatable";
import { useTrpc } from "@/hooks/use-trpc";
import UserProfileDialog from "@/components/ui/UserProfileDialog";
import { PageHeader } from "@/components";
import {
  UserIcon,
  MailIcon,
  PhoneIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  EditIcon,
  TrashIcon,
  CoinsIcon,
  PlusIcon,
  MinusIcon,
  MoreHorizontalIcon,
  ShieldIcon,
  XIcon,
} from "lucide-react";

interface User {
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
  lastActiveAt?: string;
  coins?: number;
  photos: Array<{
    id: string;
    filePath: string;
  }>;
  city?: {
    id: string;
    name: string;
  };
}

export default function UsersContainer() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [showAddCoinDialog, setShowAddCoinDialog] = useState(false);
  const [showRemoveCoinDialog, setShowRemoveCoinDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [coinAmount, setCoinAmount] = useState<string>("");
  const [coinActionUser, setCoinActionUser] = useState<User | null>(null);

  const trpc = useTrpc();
  const { data: testData } = trpc.user.test.useQuery();
  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = trpc.user.getAll.useQuery({
    limit: 50,
  });

  const deleteUserMutation = trpc.user.delete.useMutation();
  const addCoinsMutation = trpc.user.addCoins.useMutation();
  const removeCoinsMutation = trpc.user.removeCoins.useMutation();
  const toggleActiveMutation = trpc.user.toggleActive.useMutation();
  const { data: profileData, isLoading: profileLoading } = trpc.user.getProfile.useQuery(
      { id: selectedUser?.id || "" },
      { enabled: !!selectedUser?.id }
  );

  console.log("tRPC Test:", testData);
  console.log("tRPC Data:", { usersData, isLoading, error });

  const users = usersData?.users || [];

  const handleViewProfile = (user: User) => {
    setSelectedUser(user);
    setIsProfileDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    const isActive = !user.isActive;
    const actionText = isActive ? 'aktif' : 'pasif';

    toast.promise(
        toggleActiveMutation.mutateAsync({ userId: user.id, isActive }),
        {
          loading: `Kullanıcı durumu değiştiriliyor...`,
          success: () => {
            refetch();
            return `${user.firstName} ${user.lastName} ${actionText} hale getirildi`;
          },
          error: (error) => {
            return `İşlem başarısız: ${error.message}`;
          },
        }
    );
  };

  function handleDeleteUser(user: User, confirmDelete?: boolean) {
    // UserProfileDialog içinden çağrıldığında confirm göstermeden siler
    if (confirmDelete === true) {
      performDelete(user);
      return;
    }

    // Alert Dialog ile silme onayı iste
    setCoinActionUser(user);
    setShowDeleteDialog(true);
  }

  // Kullanıcı silme işlemini gerçekleştiren fonksiyon
  function performDelete(user: User) {
    toast.promise(
        deleteUserMutation.mutateAsync({ id: user.id }),
        {
          loading: 'Kullanıcı siliniyor...',
          success: () => {
            refetch();
            // Dialog açıksa kapat
            if (isProfileDialogOpen) {
              setIsProfileDialogOpen(false);
            }
            return `${user.firstName} ${user.lastName} başarıyla silindi`;
          },
          error: (error) => {
            return `Silme işlemi başarısız: ${error.message}`;
          },
        }
    );
  }

  function handleAddCoin(user: User, amount?: number) {
    // Eğer doğrudan miktar verilmişse (UserProfileDialog'dan) onu kullan
    if (typeof amount === 'number') {
      performAddCoin(user, amount);
      return;
    }

    // Dialog için kullanıcıyı ayarla ve dialogu göster
    setCoinActionUser(user);
    setCoinAmount(""); // Miktar alanını temizle
    setShowAddCoinDialog(true);
  }

  // Coin ekleme işlemini gerçekleştiren fonksiyon
  function performAddCoin(user: User, coinAmount: number) {
    if (!isNaN(coinAmount) && coinAmount > 0) {
      toast.promise(
          addCoinsMutation.mutateAsync({ userId: user.id, amount: coinAmount }),
          {
            loading: 'Coin ekleniyor...',
            success: (data) => {
              refetch();
              return `${coinAmount} coin ${user.firstName} ${user.lastName}'a eklendi. Yeni bakiye: ${data.newBalance}`;
            },
            error: (error) => {
              return `Coin ekleme başarısız: ${error.message}`;
            },
          }
      );
    } else {
      toast.error('Geçersiz miktar. Lütfen pozitif bir sayı girin.');
    }
  }

  function handleRemoveCoin(user: User, amount?: number) {
    // Eğer doğrudan miktar verilmişse (UserProfileDialog'dan) onu kullan
    if (typeof amount === 'number') {
      performRemoveCoin(user, amount);
      return;
    }

    // Dialog için kullanıcıyı ayarla ve dialogu göster
    setCoinActionUser(user);
    setCoinAmount(""); // Miktar alanını temizle
    setShowRemoveCoinDialog(true);
  }

  // Coin çıkarma işlemini gerçekleştiren fonksiyon
  function performRemoveCoin(user: User, coinAmount: number) {
    if (!isNaN(coinAmount) && coinAmount > 0) {
      toast.promise(
          removeCoinsMutation.mutateAsync({ userId: user.id, amount: coinAmount }),
          {
            loading: 'Coin çıkarılıyor...',
            success: (data) => {
              refetch();
              return `${coinAmount} coin ${user.firstName} ${user.lastName}'den çıkarıldı. Yeni bakiye: ${data.newBalance}`;
            },
            error: (error) => {
              return `Coin çıkarma başarısız: ${error.message}`;
            },
          }
      );
    } else {
      toast.error('Geçersiz miktar. Lütfen pozitif bir sayı girin.');
    }
  }

  const columns: DataTableColumn<User>[] = [
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
                <div className="w-12 h-12 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center ring-2 ring-white shadow-md">
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
                <div className="font-semibold text-gray-900 truncate">
                  {fullName}
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
          SERIOUS: { label: "Ciddi", color: "bg-purple-100 text-purple-800" },
          FRIENDSHIP: {
            label: "Arkadaşlık",
            color: "bg-blue-100 text-blue-800",
          },
          CASUAL: { label: "Gündelik", color: "bg-green-100 text-green-800" },
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
      key: "coins",
      title: "Coin Bakiyesi",
      sortable: true,
      align: "center",
      width: "120px",
      render: (value, row) => (
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded-full border border-yellow-200">
              <CoinsIcon className="w-4 h-4 text-yellow-600" />
              <span className="font-semibold text-yellow-700">
              {row.coins || 0}
            </span>
            </div>
          </div>
      ),
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
      key: "bio",
      title: "Biyografi",
      render: (value) => (
          <div className="max-w-xs truncate text-sm text-gray-600">
            {value || "Biyografi yok"}
          </div>
      ),
    },
    {
      key: "lastActiveAt",
      title: "Son Aktiflik",
      sortable: true,
      width: "120px",
      render: (value) => {
        if (!value)
          return (
              <span className="text-xs text-gray-400">Hiç aktif olmamış</span>
          );

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

        return (
            <span className={`text-xs font-medium ${colorClass}`}>
            {timeText}
          </span>
        );
      },
    },
    {
      key: "actions",
      title: "İşlemler",
      align: "center",
      width: "200px",
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
                  handleEditUser(row);
                }}
                className={`p-1.5 rounded-lg transition-colors duration-200 group ${
                    row.isActive
                        ? 'text-orange-600 hover:bg-orange-50'
                        : 'text-green-600 hover:bg-green-50'
                }`}
                title={row.isActive ? 'Pasif Yap' : 'Aktif Yap'}
            >
              <ShieldIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
            <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddCoin(row);
                }}
                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200 group"
                title="Coin Ekle"
            >
              <PlusIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
            <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveCoin(row);
                }}
                className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors duration-200 group"
                title="Coin Çıkar"
            >
              <MinusIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
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

  const handleRowClick = (user: User) => {
    console.log("User clicked:", user);
    // Navigate to user detail page
  };

  const handleSelectionChange = (selectedUsers: User[]) => {
    console.log("Selected users:", selectedUsers);
  };

  return (
      <div className="space-y-6">
        {/* Header */}
        <PageHeader 
          title="Kullanıcılar"
          description="Tüm kullanıcıları görüntüleyin ve yönetin"
          stats={[
            { value: isLoading ? "..." : users.length.toString(), label: "kullanıcı" }
          ]}
          actions={(
            <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 px-4 py-2.5 flex items-center gap-2 hover:bg-white/10 transition">
              <UserIcon className="w-4 h-4 text-white/80" />
              <span className="text-sm font-medium text-white">
                Toplam: {isLoading ? "..." : users.length} kullanıcı
              </span>
            </div>
          )}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl p-6 border border-gray-200 ">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Toplam Kullanıcı
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? "..." : users.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Erkek Kullanıcı
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {isLoading
                      ? "..."
                      : users.filter((u) => u.gender === "MALE").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 ">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Kadın Kullanıcı
                </p>
                <p className="text-2xl font-bold text-pink-600">
                  {isLoading
                      ? "..."
                      : users.filter((u) => u.gender === "FEMALE").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Fotoğraflı</p>
                <p className="text-2xl font-bold text-green-600">
                  {isLoading
                      ? "..."
                      : users.filter((u) => u.photos?.length > 0).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Coin</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {isLoading
                      ? "..."
                      : users
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

        {/* Profile Dialog */}
        <UserProfileDialog
            isOpen={isProfileDialogOpen}
            onClose={() => setIsProfileDialogOpen(false)}
            user={profileData || null}
            loading={profileLoading}
            onAddCoins={(userId) => {
              const user = users.find(u => u.id === userId);
              if (user) {
                return (amount: number) => handleAddCoin(user, amount);
              }
            }}
            onRemoveCoins={(userId) => {
              const user = users.find(u => u.id === userId);
              if (user) {
                return (amount: number) => handleRemoveCoin(user, amount);
              }
            }}
            onToggleActive={(userId, isActive) => {
              const user = users.find(u => u.id === userId);
              if (user) {
                const actionText = isActive ? 'aktif' : 'pasif';

                toast.promise(
                    toggleActiveMutation.mutateAsync({ userId, isActive }),
                    {
                      loading: `Kullanıcı durumu değiştiriliyor...`,
                      success: () => {
                        refetch();
                        return `${user.firstName} ${user.lastName} ${actionText} hale getirildi`;
                      },
                      error: (error) => {
                        return `İşlem başarısız: ${error.message}`;
                      },
                    }
                );
              }
            }}
            onDelete={(userId) => {
              const user = users.find(u => u.id === userId);
              if (user) {
                handleDeleteUser(user, true);
              }
            }}
        />

        {/* Data Table */}
        <DataTable
            data={users}
            columns={columns}
            loading={isLoading}
            searchable={true}
            filterable={true}
            exportable={true}
            selectable={true}
            pagination={true}
            pageSize={10}
            onRowClick={undefined}
            onSelectionChange={handleSelectionChange}
            emptyMessage="Henüz kullanıcı bulunmuyor"
        />

        {/* Coin Ekleme Dialog */}
        <AlertDialog open={showAddCoinDialog} onOpenChange={setShowAddCoinDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Coin Ekle</AlertDialogTitle>
              <AlertDialogDescription>
                {coinActionUser && `${coinActionUser.firstName} ${coinActionUser.lastName} kullanıcısına eklenecek coin miktarını girin.`}
                <div className="mt-4">
                  <input
                      type="number"
                      value={coinAmount}
                      onChange={(e) => setCoinAmount(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Coin miktarı"
                      min="1"
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowAddCoinDialog(false)}>İptal</AlertDialogCancel>
              <AlertDialogAction
                  onClick={() => {
                    if (coinActionUser && coinAmount) {
                      const amount = Number(coinAmount);
                      if (!isNaN(amount) && amount > 0) {
                        performAddCoin(coinActionUser, amount);
                        setShowAddCoinDialog(false);
                      } else {
                        toast.error('Geçersiz miktar. Lütfen pozitif bir sayı girin.');
                      }
                    }
                  }}
                  className="bg-green-600 hover:bg-green-700"
              >
                Ekle
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Coin Çıkarma Dialog */}
        <AlertDialog open={showRemoveCoinDialog} onOpenChange={setShowRemoveCoinDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Coin Çıkar</AlertDialogTitle>
              <AlertDialogDescription>
                {coinActionUser && `${coinActionUser.firstName} ${coinActionUser.lastName} kullanıcısından çıkarılacak coin miktarını girin.`}
                <div className="mt-4">
                  <input
                      type="number"
                      value={coinAmount}
                      onChange={(e) => setCoinAmount(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Coin miktarı"
                      min="1"
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowRemoveCoinDialog(false)}>İptal</AlertDialogCancel>
              <AlertDialogAction
                  onClick={() => {
                    if (coinActionUser && coinAmount) {
                      const amount = Number(coinAmount);
                      if (!isNaN(amount) && amount > 0) {
                        performRemoveCoin(coinActionUser, amount);
                        setShowRemoveCoinDialog(false);
                      } else {
                        toast.error('Geçersiz miktar. Lütfen pozitif bir sayı girin.');
                      }
                    }
                  }}
                  className="bg-orange-600 hover:bg-orange-700"
              >
                Çıkar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Kullanıcı Silme Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Kullanıcıyı Sil</AlertDialogTitle>
              <AlertDialogDescription>
                {coinActionUser && `${coinActionUser.firstName} ${coinActionUser.lastName} kullanıcısını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>İptal</AlertDialogCancel>
              <AlertDialogAction
                  onClick={() => {
                    if (coinActionUser) {
                      performDelete(coinActionUser);
                      setShowDeleteDialog(false);
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700"
              >
                Kullanıcıyı Sil
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
  );
}