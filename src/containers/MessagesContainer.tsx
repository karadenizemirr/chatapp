"use client";

import { useState } from "react";
import { DataTable, DataTableColumn } from "@/components/ui/datatable";
import { useTrpc } from "@/hooks/use-trpc";
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
        return <MessageSquareIcon className="w-4 h-4 text-blue-600" />;
      case "IMAGE":
        return <ImageIcon className="w-4 h-4 text-green-600" />;
      case "VOICE":
        return <MicIcon className="w-4 h-4 text-purple-600" />;
      case "GIFT":
        return <GiftIcon className="w-4 h-4 text-yellow-600" />;
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
            <div className="w-12 h-12 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center">
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
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-gray-900">{fullName}</div>
              <div className="text-sm text-gray-500">ID: {row.partner.id.slice(0, 8)}</div>
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
        if (!row.lastMessage) return <span className="text-gray-400">Mesaj yok</span>;
        
        return (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              {getMessageTypeIcon(row.lastMessage.messageType)}
              <span className="text-sm text-gray-700 truncate">
                {row.lastMessage.content || `${row.lastMessage.messageType} mesajı`}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {new Date(row.lastMessage.createdAt).toLocaleString("tr-TR")}
            </div>
          </div>
        );
      },
    },
    {
      key: "unreadCount",
      title: "Okunmamış",
      align: "center",
      width: "100px",
      render: (value) => (
        <div className="flex justify-center">
          {value > 0 ? (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {value}
            </span>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      key: "lastMessageAt",
      title: "Son Aktivite",
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

  // Message columns
  const messageColumns: DataTableColumn<Message>[] = [
    {
      key: "messageType",
      title: "Tip",
      align: "center",
      width: "60px",
      render: (value) => (
        <div className="flex justify-center">
          {getMessageTypeIcon(value)}
        </div>
      ),
    },
    {
      key: "sender",
      title: "Gönderen",
      width: "150px",
      render: (value, row) => {
        const fullName = `${row.sender?.firstName} ${row.sender?.lastName}`;
        return (
          <div className="text-sm">
            <div className="font-medium">{fullName}</div>
            <div className="text-xs text-gray-500">
              {row.sender?.isPremium && "👑 "}
              {row.sender?.isFake && "🚫 "}
              ID: {row.sender?.id.slice(0, 8)}
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
            <div className="text-sm text-gray-700 truncate">
              {row.content || "Metin yok"}
            </div>
          );
        } else if (row.messageType === "IMAGE") {
          return (
            <div className="text-sm text-gray-600 flex items-center space-x-1">
              <ImageIcon className="w-4 h-4" />
              <span>{row.fileName || "Resim"}</span>
            </div>
          );
        } else if (row.messageType === "VOICE") {
          return (
            <div className="text-sm text-gray-600 flex items-center space-x-1">
              <MicIcon className="w-4 h-4" />
              <span>Ses mesajı</span>
            </div>
          );
        } else if (row.messageType === "GIFT" && row.gift) {
          return (
            <div className="text-sm text-gray-600 flex items-center space-x-1">
              <GiftIcon className="w-4 h-4" />
              <span>{row.gift.name}</span>
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
      width: "80px",
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
          }`}
        >
          {value ? "Okundu" : "Okunmadı"}
        </span>
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
        <div className="flex items-center justify-center space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewMessage(row);
            }}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Detayları Görüntüle"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteMessage(row);
            }}
            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Sil"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {selectedConversation && (
            <button
              onClick={handleBackToConversations}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedConversation 
                ? `${selectedConversation.partner.firstName} ${selectedConversation.partner.lastName} - Mesajlar`
                : "Konuşmalar"
              }
            </h1>
            <p className="text-gray-600 text-sm">
              {selectedConversation 
                ? "Bu konuşmadaki mesajları görüntüleyin"
                : "Tüm konuşmaları görüntüleyin"
              }
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg px-3 py-2 border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-2">
            {selectedConversation ? (
              <>
                <MessageSquareIcon className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  {messages.length} mesaj
                </span>
              </>
            ) : (
              <>
                <UsersIcon className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  {conversations.length} konuşma
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Message Detail Dialog */}
      {isDetailDialogOpen && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Mesaj Detayları</h2>
              <button
                onClick={() => setIsDetailDialogOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-2">Gönderen</h4>
                  <div className="text-sm space-y-1">
                    <div>{selectedMessage.sender.firstName} {selectedMessage.sender.lastName}</div>
                    <div className="text-gray-500">ID: {selectedMessage.sender.id}</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-2">Alan</h4>
                  <div className="text-sm space-y-1">
                    <div>{selectedMessage.receiver.firstName} {selectedMessage.receiver.lastName}</div>
                    <div className="text-gray-500">ID: {selectedMessage.receiver.id}</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2">Mesaj Bilgileri</h4>
                <div className="text-sm space-y-2">
                  <div className="flex items-center space-x-2">
                    {getMessageTypeIcon(selectedMessage.messageType)}
                    <span>Tip: {selectedMessage.messageType}</span>
                  </div>
                  <div>Tarih: {new Date(selectedMessage.createdAt).toLocaleString("tr-TR")}</div>
                  <div>Durum: {selectedMessage.isRead ? "Okundu" : "Okunmadı"}</div>
                </div>
              </div>
              
              {selectedMessage.content && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-2">İçerik</h4>
                  <p className="text-sm text-gray-600">{selectedMessage.content}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
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
  );
}