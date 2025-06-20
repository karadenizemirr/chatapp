"use client";

import { useState } from "react";
import { DataTable, DataTableColumn } from "@/components/ui/datatable";
import { useTrpc } from "@/hooks/use-trpc";
import PageHeader from "@/components/PageHeader";
import {
  MessageSquareIcon,
  ImageIcon,
  MicIcon,
  GiftIcon,
  TrashIcon,
  EyeIcon,
  AlertTriangleIcon,
  ArrowLeftIcon,
  UsersIcon,
  InboxIcon,
  MailIcon,
  BellIcon, CheckIcon
} from "lucide-react";

interface Conversation {
  partner: {
    id: string;
    firstName: string;
    lastName: string;
    photos: Array<{
      id: string;
      filePath: string;
    }>;
    lastActiveAt?: string;
  };
  lastMessage?: {
    id: string;
    senderId: string;
    messageType: string;
    content?: string;
    createdAt: string;
  };
  unreadCount: number;
  lastMessageAt: string;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  messageType: "TEXT" | "IMAGE" | "VOICE" | "GIFT";
  content?: string;
  filePath?: string;
  fileName?: string;
  coinsSpent: number;
  isRead: boolean;
  readAt?: string;
  reported: boolean;
  reportReason?: string;
  createdAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    isPremium: boolean;
    isFake: boolean;
    photos: Array<{
      id: string;
      filePath: string;
    }>;
  };
  receiver: {
    id: string;
    firstName: string;
    lastName: string;
    photos: Array<{
      id: string;
      filePath: string;
    }>;
  };
  gift?: {
    id: string;
    name: string;
    imagePath: string;
    coinCost: number;
  };
}

export default function MessagesContainer() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const trpc = useTrpc();
  
  // Conversation listesi
  const {
    data: conversationsData,
    isLoading: conversationsLoading,
  } = trpc.message.getConversations.useQuery({
    limit: 50,
  });

  // Seçilen conversation'ın mesajları
  const {
    data: messagesData,
    isLoading: messagesLoading,
    refetch: refetchMessages,
  } = trpc.message.getMessages.useQuery(
    {
      userId: selectedConversation?.partner.id || "",
      limit: 100,
    },
    {
      enabled: !!selectedConversation?.partner.id,
    }
  );

  const deleteMessagesMutation = trpc.message.deleteMessages.useMutation();

  const conversations = conversationsData?.conversations || [];
  const messages = messagesData?.messages || [];

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleBackToConversations = () => {
    setSelectedConversation(null);
  };

  const handleViewMessage = (message: Message) => {
    setSelectedMessage(message);
    setIsDetailDialogOpen(true);
  };

  const handleDeleteMessage = (message: Message) => {
    if (confirm("Bu mesajı silmek istediğinizden emin misiniz?")) {
      deleteMessagesMutation.mutate(
        { messageIds: [message.id] },
        {
          onSuccess: () => {
            refetchMessages();
            alert("Mesaj başarıyla silindi");
          },
          onError: (error) => {
            alert("Hata: " + error.message);
          },
        }
      );
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case "TEXT":
        return <MessageSquareIcon className="w-4 h-4 text-primary" />;
      case "IMAGE":
        return <ImageIcon className="w-4 h-4 text-green-600" />;
      case "VOICE":
        return <MicIcon className="w-4 h-4 text-purple-600" />;
      case "GIFT":
        return <GiftIcon className="w-4 h-4 text-amber-500" />;
      default:
        return <MessageSquareIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  // Conversation columns
  const conversationColumns: DataTableColumn<Conversation>[] = [
    {
      key: "partner",
      title: "Kullanıcı",
      width: "300px",
      render: (value, row) => {
        const fullName = `${row.partner.firstName} ${row.partner.lastName}`;
        const profileImage = row.partner.photos?.[0]?.filePath;
        return (
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center ring-2 ring-white">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={fullName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold">
                    {row.partner.firstName.charAt(0)}
                  </span>
                )}
              </div>
              {row.unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full ring-2 ring-white">
                  {row.unreadCount}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-gray-900">{fullName}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded-md text-gray-600">ID: {row.partner.id.slice(0, 8)}</span>
                {row.partner.lastActiveAt && (
                  <span className="text-xs text-green-600 flex items-center">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
                    Son görülme: {new Date(row.partner.lastActiveAt).toLocaleDateString("tr-TR")}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: "lastMessage",
      title: "Son Mesaj",
      width: "400px",
      render: (value, row) => {
        if (!row.lastMessage) return (
          <div className="flex items-center justify-center p-2 bg-gray-50 rounded-lg">
            <span className="text-gray-400 text-sm italic">Henüz mesaj yok</span>
          </div>
        );

        return (
          <div className="p-3 bg-gradient-to-r from-primary/5 to-white rounded-xl border border-gray-100 hover:border-primary/20 transition-colors">
            <div className="flex items-center space-x-2 mb-1.5">
              <div className="bg-primary/10 p-1.5 rounded-full">
                {getMessageTypeIcon(row.lastMessage.messageType)}
              </div>
              <span className="text-sm font-medium text-gray-800 truncate flex-1">
                {row.lastMessage.content || `${row.lastMessage.messageType} mesajı`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                {new Date(row.lastMessage.createdAt).toLocaleString("tr-TR")}
              </div>
              {row.unreadCount > 0 && (
                <div className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                  Okunmadı
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "unreadCount",
      title: "Durum",
      align: "center",
      width: "110px",
      render: (value) => (
        <div className="flex justify-center">
          {value > 0 ? (
            <span className="bg-gradient-to-r from-primary to-secondary text-white text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5">
              <BellIcon className="w-3.5 h-3.5" />
              {value} yeni
            </span>
          ) : (
            <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5">
              <CheckIcon className="w-3.5 h-3.5" />
              Okundu
            </span>
          )}
        </div>
      ),
    },
    {
      key: "lastMessageAt",
      title: "Son Aktivite",
      width: "150px",
      render: (value) => {
        const date = new Date(value);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
        const isToday = date.toDateString() === now.toDateString();

        return (
          <div className="flex flex-col items-center gap-1">
            <div className={`text-xs px-2.5 py-1 rounded-full ${isToday ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
              {isToday ? 'Bugün' : new Date(value).toLocaleDateString("tr-TR")}
            </div>
            <div className="text-sm text-gray-500">
              {new Date(value).toLocaleTimeString("tr-TR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
            <div className="text-xs text-gray-400">
              {diffInHours < 1 ? 'Az önce' : 
               diffInHours < 24 ? `${diffInHours} saat önce` : 
               `${Math.floor(diffInHours / 24)} gün önce`}
            </div>
          </div>
        );
      },
    },
  ];

  // Message columns
  const messageColumns: DataTableColumn<Message>[] = [
    {
      key: "messageType",
      title: "Tip",
      align: "center",
      width: "70px",
      render: (value) => (
        <div className="flex justify-center">
          <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center">
            {getMessageTypeIcon(value)}
          </div>
        </div>
      ),
    },
    {
      key: "sender",
      title: "Gönderen",
      width: "180px",
      render: (value, row) => {
        const fullName = `${row.sender?.firstName} ${row.sender?.lastName}`;
        return (
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center">
              {row.sender?.photos?.[0]?.filePath ? (
                <img
                  src={row.sender.photos[0].filePath}
                  alt={fullName}
                  className="w-9 h-9 rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-sm">
                  {row.sender?.firstName.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <div className="font-medium text-gray-900">{fullName}</div>
              <div className="flex items-center gap-1 mt-0.5">
                {row.sender?.isPremium && (
                  <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-md flex items-center">
                    👑 Premium
                  </span>
                )}
                {row.sender?.isFake && (
                  <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-800 rounded-md flex items-center">
                    Fake
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: "content",
      title: "İçerik",
      width: "300px",
      render: (value, row) => {
        if (row.messageType === "TEXT") {
          return (
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary/20 hover:bg-primary/5 transition-colors">
              <p className="text-sm text-gray-700 line-clamp-2">
                {row.content || "Metin yok"}
              </p>
            </div>
          );
        } else if (row.messageType === "IMAGE") {
          return (
            <div className="p-3 bg-green-50 rounded-xl border border-green-100 hover:border-green-200 transition-colors flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">{row.fileName || "Resim"}</div>
                <div className="text-xs text-gray-500 mt-0.5">Görsel Dosyası</div>
              </div>
            </div>
          );
        } else if (row.messageType === "VOICE") {
          return (
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 hover:border-purple-200 transition-colors flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <MicIcon className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">Ses Mesajı</div>
                <div className="text-xs text-gray-500 mt-0.5">Ses Kaydı</div>
              </div>
            </div>
          );
        } else if (row.messageType === "GIFT" && row.gift) {
          return (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 hover:border-amber-200 transition-colors flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <GiftIcon className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">{row.gift.name}</div>
                <div className="text-xs text-amber-600 mt-0.5">{row.gift.coinCost} coin değerinde</div>
              </div>
            </div>
          );
        }
        return <span className="text-sm text-gray-400">-</span>;
      },
    },
    {
      key: "isRead",
      title: "Durum",
      align: "center",
      width: "100px",
      render: (value, row) => {
        const readDate = row.readAt ? new Date(row.readAt) : null;

        return (
          <div className="flex flex-col items-center gap-1">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                value ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
              }`}
            >
              {value ? (
                <>
                  <CheckIcon className="w-3 h-3" /> Okundu
                </>
              ) : (
                <>
                  <AlertTriangleIcon className="w-3 h-3" /> Okunmadı
                </>
              )}
            </span>
            {readDate && (
              <span className="text-xs text-gray-500">
                {readDate.toLocaleString("tr-TR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  day: "2-digit",
                  month: "2-digit"
                })}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "createdAt",
      title: "Tarih",
      width: "120px",
      render: (value) => {
        const date = new Date(value);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        return (
          <div className="flex flex-col items-center gap-1">
            <div className={`text-xs px-2.5 py-1 rounded-full ${isToday ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'}`}>
              {isToday ? 'Bugün' : new Date(value).toLocaleDateString("tr-TR")}
            </div>
            <div className="text-sm font-medium text-gray-700">
              {new Date(value).toLocaleTimeString("tr-TR", {
                hour: "2-digit",
                minute: "2-digit",
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
      width: "100px",
      render: (value, row) => (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewMessage(row);
            }}
            className="p-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-full transition-colors"
            title="Detayları Görüntüle"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteMessage(row);
            }}
            className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full transition-colors"
            title="Sil"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen rounded-xl p-6">
      {/* Header */}
      <PageHeader
        title={selectedConversation 
          ? `${selectedConversation.partner.firstName} ${selectedConversation.partner.lastName} - Mesajlar`
          : "Mesaj Yönetimi"}
        description={selectedConversation 
          ? "Bu konuşmadaki mesajları görüntüleyin"
          : "Tüm konuşmaları yönetin ve takip edin"}
        badge={{
          text: selectedConversation ? "Aktif Konuşma" : "Tüm Konuşmalar",
          icon: selectedConversation ? <MessageSquareIcon className="w-3 h-3 text-white" /> : <InboxIcon className="w-3 h-3 text-white" />
        }}
        stats={[
          {
            value: selectedConversation ? messages.length.toString() : conversations.length.toString(),
            label: selectedConversation ? "mesaj" : "konuşma"
          },
          {
            value: selectedConversation ? "1" : conversations.filter(c => c.unreadCount > 0).length.toString(),
            label: "okunmamış"
          }
        ]}
        actions={
          <>
            {selectedConversation && (
              <button
                onClick={handleBackToConversations}
                className="px-4 py-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 flex items-center gap-2 hover:bg-white/20 transition duration-300 text-white"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                <span>Geri Dön</span>
              </button>
            )}
          </>
        }
        avatarText={selectedConversation ? selectedConversation.partner.firstName.charAt(0) : "M"}
      />

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">

      {/* Message Detail Dialog */}
      {isDetailDialogOpen && selectedMessage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-secondary/5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold">
                    {selectedMessage.messageType === "TEXT" ? "T" : 
                     selectedMessage.messageType === "IMAGE" ? "I" : 
                     selectedMessage.messageType === "VOICE" ? "V" : "G"}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Mesaj Detayları</h2>
                </div>
                <button
                  onClick={() => setIsDetailDialogOpen(false)}
                  className="p-2 hover:bg-white/80 rounded-full transition-colors"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="space-y-6">
                {/* Üst bilgi kartları */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-4 rounded-xl border border-primary/10">
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <MailIcon className="w-4 h-4 text-primary" /> Gönderen
                    </h4>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center">
                        {selectedMessage.sender.photos?.[0]?.filePath ? (
                          <img
                            src={selectedMessage.sender.photos[0].filePath}
                            alt={`${selectedMessage.sender.firstName}`}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-bold">{selectedMessage.sender.firstName.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {selectedMessage.sender.firstName} {selectedMessage.sender.lastName}
                          {selectedMessage.sender.isPremium && <span className="ml-1 text-yellow-500">👑</span>}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <span className="px-1.5 py-0.5 bg-gray-100 rounded-md text-xs">ID: {selectedMessage.sender.id.slice(0, 8)}</span>
                          {selectedMessage.sender.isFake && (
                            <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded-md text-xs">Fake</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <InboxIcon className="w-4 h-4 text-gray-500" /> Alıcı
                    </h4>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        {selectedMessage.receiver.photos?.[0]?.filePath ? (
                          <img
                            src={selectedMessage.receiver.photos[0].filePath}
                            alt={`${selectedMessage.receiver.firstName}`}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-500 font-bold">{selectedMessage.receiver.firstName.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {selectedMessage.receiver.firstName} {selectedMessage.receiver.lastName}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          <span className="px-1.5 py-0.5 bg-gray-100 rounded-md text-xs">ID: {selectedMessage.receiver.id.slice(0, 8)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mesaj bilgileri */}
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                    <MessageSquareIcon className="w-4 h-4 text-primary" /> Mesaj Detayları
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Mesaj Türü:</span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                          {getMessageTypeIcon(selectedMessage.messageType)}
                          {selectedMessage.messageType}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Durum:</span>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${selectedMessage.isRead ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                          {selectedMessage.isRead ? (
                            <>
                              <BellIcon className="w-3 h-3" /> Okundu
                            </>
                          ) : (
                            <>
                              <BellIcon className="w-3 h-3" /> Okunmadı
                            </>
                          )}
                        </span>
                      </div>

                      {selectedMessage.gift && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Hediye:</span>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                            <GiftIcon className="w-3 h-3" />
                            {selectedMessage.gift.name} ({selectedMessage.gift.coinCost} coin)
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Gönderim Tarihi:</span>
                        <span className="text-sm text-gray-700">
                          {new Date(selectedMessage.createdAt).toLocaleString("tr-TR")}
                        </span>
                      </div>

                      {selectedMessage.readAt && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Okunma Tarihi:</span>
                          <span className="text-sm text-gray-700">
                            {new Date(selectedMessage.readAt).toLocaleString("tr-TR")}
                          </span>
                        </div>
                      )}

                      {selectedMessage.reported && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Rapor Nedeni:</span>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                            <AlertTriangleIcon className="w-3 h-3" />
                            {selectedMessage.reportReason || "Belirtilmemiş"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mesaj içeriği */}
                {selectedMessage.content && (
                  <div className="bg-gradient-to-r from-primary/5 to-white p-5 rounded-xl border border-primary/10">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <MessageSquareIcon className="w-4 h-4 text-primary" /> Mesaj İçeriği
                    </h4>
                    <div className="bg-white p-4 rounded-xl border border-gray-100">
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.content}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setIsDetailDialogOpen(false)}
                className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="p-1"> {/* Inner padding for table */}
        {selectedConversation ? (
          <DataTable
            data={messages}
            columns={messageColumns}
            loading={messagesLoading}
            searchable={false}
            filterable={false}
            exportable={true}
            selectable={false}
            pagination={false}
            onRowClick={undefined}
            emptyMessage="Bu konuşmada mesaj bulunamadı"
          />
        ) : (
          <DataTable
            data={conversations}
            columns={conversationColumns}
            loading={conversationsLoading}
            searchable={true}
            filterable={false}
            exportable={false}
            selectable={false}
            pagination={false}
            onRowClick={handleSelectConversation}
            emptyMessage="Konuşma bulunamadı"
          />
        )}
      </div>
      </div> {/* Close the white bg container */}
    </div>
  );
}