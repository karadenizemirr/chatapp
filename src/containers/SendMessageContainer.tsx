"use client";

import { useState, useRef, useEffect } from "react";
import { useTrpc } from "@/hooks/use-trpc";
import { gsap } from "gsap";
import {
  SendIcon,
  SearchIcon,
  UserIcon,
  MessageSquareIcon,
  ImageIcon,
  MicIcon,
  GiftIcon,
  XIcon,
  CheckIcon,
  ClockIcon,
} from "lucide-react";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  isPremium: boolean;
  isFake: boolean;
  photos: Array<{
    id: string;
    filePath: string;
  }>;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  messageType: "TEXT" | "IMAGE" | "VOICE" | "GIFT";
  content?: string;
  filePath?: string;
  fileName?: string;
  coinsSpent: number;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  gift?: {
    id: string;
    name: string;
    imagePath: string;
    coinCost: number;
  };
}

export default function SendMessageContainer() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const trpc = useTrpc();

  // Tüm kullanıcıları getir
  const { data: allUsersData } = trpc.user.getAll.useQuery({
    limit: 50
  });

  // Seçilen kullanıcı ile mesajlar
  const {
    data: messagesData,
    isLoading: messagesLoading,
    refetch: refetchMessages,
  } = trpc.message.getMessages.useQuery(
    {
      userId: selectedUser?.id || "",
      limit: 50,
    },
    {
      enabled: !!selectedUser?.id,
      refetchInterval: 3000, // 3 saniyede bir yenile
    }
  );

  // Mesaj gönderme
  const sendMessageMutation = trpc.message.send.useMutation();

  const messages = messagesData?.messages || [];
  const allUsers = allUsersData?.users || [];
  
  // Fake kullanıcıları filtrele
  const realUsers = allUsers.filter(user => !user.isFake);
  
  // Arama terimine göre kullanıcıları filtrele
  const filteredUsers = realUsers.filter(user => {
    if (searchTerm.length < 2) return false;
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const email = user.email?.toLowerCase() || "";
    const searchLower = searchTerm.toLowerCase();
    return fullName.includes(searchLower) || email.includes(searchLower);
  });

  // Arama sonuçları değiştiğinde kullanıcı kartlarını animasyonla göster
  useEffect(() => {
    if (searchTerm.length >= 2) {
      gsap.fromTo('.user-item', 
        { opacity: 0, y: 15, stagger: 0.03 },
        { opacity: 1, y: 0, stagger: 0.03, duration: 0.3, ease: "power1.out" }
      );
    }
  }, [filteredUsers.length]);

  // Mesajları en alta kaydır ve son mesajı animasyonla göster
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    // Son mesajı animasyonla göster
    const lastMessage = document.querySelector('.message-item:last-child');
    if (lastMessage && messages.length > 0) {
      gsap.fromTo(
        lastMessage, 
        { scale: 0.95, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
      );
    }
  };

  useEffect(() => {
    scrollToBottom();

    // Mesajları animasyonlu göster
    if (messages.length > 0) {
      gsap.fromTo('.message-item', 
        { opacity: 0, y: 20, stagger: 0.05 },
        { opacity: 1, y: 0, stagger: 0.05, duration: 0.4, ease: "power2.out" }
      );
    }
  }, [messages]);

  // Custom scrollbar styles injection
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: rgba(0, 0, 0, 0.1);
        border-radius: 20px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background-color: rgba(0, 0, 0, 0.2);
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Komponent ilk yüklendiğinde GSAP animasyonları
  useEffect(() => {
    // Sol panel animasyonu
    gsap.fromTo(".left-panel",
      { x: -50, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.6, ease: "power2.out" }
    );

    // Sağ panel animasyonu
    gsap.fromTo(".right-panel",
      { x: 50, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.6, ease: "power2.out", delay: 0.2 }
    );

    // Arama kutusu animasyonu
    gsap.fromTo(".search-container",
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: "power2.out", delay: 0.4 }
    );

    // Boş durum animasyonu
    gsap.fromTo(".empty-state .bg-white", 
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.7, ease: "elastic.out(1, 0.5)", delay: 0.6 }
    );
  }, []);

  const handleSelectUser = (user: User) => {
    // Kullanıcı seçildiğinde geçiş animasyonu
    if (selectedUser) {
      // Eğer zaten bir kullanıcı seçiliyse, önce geçiş animasyonu
      gsap.to(".selected-user-card", {
        opacity: 0,
        y: -20,
        duration: 0.3,
        onComplete: () => {
          setSelectedUser(user);
          setSearchTerm("");
          // Yeni kullanıcı için animasyon
          setTimeout(() => {
            gsap.fromTo(".selected-user-card", 
              { opacity: 0, y: 20 },
              { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
            );
          }, 100);
        }
      });
    } else {
      // İlk kez kullanıcı seçimi
      setSelectedUser(user);
      setSearchTerm("");
      setTimeout(() => {
        gsap.fromTo(".selected-user-card", 
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
        );
      }, 100);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedUser || !messageText.trim() || isSending) return;

    setIsSending(true);
    try {
      // Mevcut textarea içeriğini animasyonla temizleme
      const textarea = document.querySelector('.message-input-textarea') as HTMLElement;
      if (textarea) {
        gsap.to(textarea, {
          scale: 0.98,
          opacity: 0.7,
          duration: 0.2,
          ease: "power2.in"
        });
      }

      await sendMessageMutation.mutateAsync({
        receiverId: selectedUser.id,
        messageType: "TEXT",
        content: messageText.trim(),
      });

      setMessageText("");

      // Textarea'yı normale döndürme
      if (textarea) {
        gsap.to(textarea, {
          scale: 1,
          opacity: 1,
          duration: 0.3,
          ease: "power2.out"
        });
      }

      // Yeni mesajı animasyonla gösterme işlemini refetch sonrasına bırakıyoruz
      refetchMessages().then(() => {
        // Yeni mesaj animasyonu
        const latestMessage = document.querySelector('.message-item:last-child');
        if (latestMessage) {
          gsap.fromTo(latestMessage, 
            { opacity: 0, y: 20, scale: 0.95 },
            { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out" }
          );
        }
      });
    } catch (error) {
      console.error("Mesaj gönderme hatası:", error);
      alert("Mesaj gönderilemedi!");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case "TEXT":
        return <MessageSquareIcon className="w-3 h-3" />;
      case "IMAGE":
        return <ImageIcon className="w-3 h-3" />;
      case "VOICE":
        return <MicIcon className="w-3 h-3" />;
      case "GIFT":
        return <GiftIcon className="w-3 h-3" />;
      default:
        return <MessageSquareIcon className="w-3 h-3" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return "Az önce";
    } else if (diffInHours < 24) {
      return `${diffInHours}s önce`;
    } else {
      return date.toLocaleDateString("tr-TR");
    }
  };

  return (
    <div className="h-[90vh] flex bg-gradient-to-br from-indigo-50/40 to-purple-50/30 overflow-hidden p-3">
      {/* Sol Panel - Kullanıcı Arama */}
      <div className="w-80 bg-white/90 backdrop-blur-md border border-white/50 rounded-2xl flex flex-col mr-3 left-panel overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-gray-100/50 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <MessageSquareIcon className="w-5 h-5 text-primary" />
            </div>
            Mesaj Gönder
          </h2>
          <p className="text-sm text-gray-600 mt-2 ml-1">Kullanıcı seçin ve mesaj gönderin</p>
        </div>

        {/* Arama */}
        <div className="px-4 pt-4 pb-2 search-container">
          <div className="relative group">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-8 h-8 flex items-center justify-center group-focus-within:text-primary transition-colors duration-200">
              <SearchIcon className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Kullanıcı ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 bg-gray-50/70 border-0 rounded-xl focus:ring-0 focus:bg-white/90 transition-all duration-200 outline-none placeholder:text-gray-400"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Seçilen Kullanıcı */}
        {selectedUser && (
          <div className="px-4 pb-3 pt-1">
            <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-4 border border-white/50 backdrop-blur-sm selected-user-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center ring-2 ring-white shadow-md">
                    {selectedUser.photos?.[0] ? (
                      <img
                        src={selectedUser.photos[0].filePath}
                        alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-lg">
                        {selectedUser.firstName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 flex items-center gap-1">
                      {selectedUser.firstName} {selectedUser.lastName}
                      {selectedUser.isPremium && <span className="text-amber-500">👑</span>}
                    </div>
                    <div className="text-sm flex items-center gap-1 mt-0.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        Seçili
                      </span>
                      {selectedUser.isFake && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Fake
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-1.5 bg-white/80 hover:bg-white rounded-full transition-colors shadow-sm"
                  aria-label="Kullanıcı seçimini kaldır"
                >
                  <XIcon className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Kullanıcı Listesi */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="px-4 pb-4">
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 py-2 px-1">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <div className="text-sm font-medium text-gray-700 flex items-center">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary mr-2 text-xs">
                    {searchTerm.length >= 2 ? filteredUsers.length : realUsers.length}
                  </span>
                  {searchTerm.length >= 2 
                    ? "Arama Sonuçları" 
                    : "Tüm Kullanıcılar"
                  }
                </div>
                {(searchTerm.length >= 2 ? filteredUsers : realUsers).length > 0 && (
                  <div className="text-xs text-primary">
                    <span className="flex items-center">
                      <MessageSquareIcon className="w-3 h-3 mr-1" /> Mesaj gönder
                    </span>
                  </div>
                )}
              </div>
            </div>

            {(searchTerm.length >= 2 ? filteredUsers : realUsers).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                <UserIcon className="w-16 h-16 text-gray-300 mb-2" />
                <p className="text-center">
                  {searchTerm.length >= 2 
                    ? "Arama sonucu bulunamadı" 
                    : "Kullanıcı listesi yükleniyor..."}
                </p>
                {searchTerm.length >= 2 && (
                  <p className="text-sm text-center mt-1">
                    Farklı bir arama terimi deneyin
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2 mt-1">
                {(searchTerm.length >= 2 ? filteredUsers : realUsers).map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className="w-full flex items-center space-x-3 p-3 hover:bg-gradient-to-r hover:from-primary/5 hover:to-white rounded-xl transition-all duration-200 text-left group border border-transparent hover:border-primary/10 user-item"
                  >
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center group-hover:shadow-md transition-all duration-200">
                        {user.photos?.[0] ? (
                          <img
                            src={user.photos[0].filePath}
                            alt={`${user.firstName} ${user.lastName}`}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-bold text-lg">
                            {user.firstName.charAt(0)}
                          </span>
                        )}
                      </div>
                      {user.isPremium && (
                        <span className="absolute -top-1 -right-1 bg-amber-400 text-amber-800 text-xs w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
                          👑
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate flex items-center">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="flex items-center mt-0.5 space-x-1">
                        {user.isFake && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Fake
                          </span>
                        )}
                        <span className="text-xs text-gray-500 truncate">
                          ID: {user.id.slice(0, 8)}
                        </span>
                      </div>
                    </div>
                    <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <MessageSquareIcon className="w-5 h-5" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sağ Panel - Sohbet */}
      <div className="flex-1 flex flex-col bg-white/90 backdrop-blur-md rounded-2xl border border-white/50 overflow-hidden right-panel">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-white/10 p-5 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-md ring-2 ring-white">
                      {selectedUser.photos?.[0] ? (
                        <img
                          src={selectedUser.photos[0].filePath}
                          alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                          className="w-14 h-14 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold text-xl">
                          {selectedUser.firstName.charAt(0)}
                        </span>
                      )}
                    </div>
                    {selectedUser.isPremium && (
                      <span className="absolute -top-1 -right-1 bg-amber-400 text-amber-800 text-xs w-6 h-6 flex items-center justify-center rounded-full shadow-sm">
                        👑
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-xl text-gray-900">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </div>
                    <div className="flex items-center space-x-2 mt-0.5">
                      {selectedUser.isFake ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <XIcon className="w-3 h-3 mr-1" /> Fake Kullanıcı
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckIcon className="w-3 h-3 mr-1" /> Gerçek Kullanıcı
                        </span>
                      )}
                      {isTyping && (
                        <span className="inline-flex items-center text-xs text-primary">
                          <span className="animate-pulse">Yazıyor...</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Sohbeti kapat"
                  >
                    <XIcon className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-br from-gray-50/50 to-white/80 custom-scrollbar">
              {messagesLoading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="flex flex-col items-center loading-container">
                    <div className="animate-spin rounded-full h-10 w-10 border-3 border-primary border-t-transparent mb-3"></div>
                    <p className="text-gray-500">Mesajlar yükleniyor...</p>
                    {/* GSAP animasyonuyla yükleme durumunu canlandırma */}
                    <script dangerouslySetInnerHTML={{ __html: `
                      gsap.to('.loading-container', {
                        opacity: 0.7,
                        yoyo: true, 
                        repeat: -1,
                        duration: 0.8
                      });
                    `}} />
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center py-10 text-gray-500">
                  <div className="text-center bg-white/70 backdrop-blur-sm p-8 rounded-2xl border border-white/50 max-w-sm">
                    <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquareIcon className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Henüz mesaj yok</h3>
                    <p className="text-gray-600 mb-4">Bu kullanıcı ile henüz bir mesajlaşma başlatmadınız.</p>
                    <p className="text-sm text-primary font-medium">İlk mesajı göndererek sohbeti başlatın!</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pb-2">
                  <div className="text-center">
                    <span className="inline-block px-3 py-1 text-xs text-gray-500 bg-white rounded-full shadow-sm border border-gray-100">
                      {new Date(messages[0].createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}                      
                    </span>
                  </div>

                  {messages.map((message, index) => {
                    const isMyMessage = message.senderId !== selectedUser.id;
                    const showAvatar = !isMyMessage && (index === 0 || messages[index - 1].senderId !== message.senderId);
                    const nextIsSame = index < messages.length - 1 && messages[index + 1].senderId === message.senderId;

                    return (
                      <div
                        key={message.id}
                        className={`flex message-item ${isMyMessage ? "justify-end" : "justify-start"}`}
                      >
                        {!isMyMessage && showAvatar && (
                          <div className="mr-2 flex-shrink-0">
                            <div className="w-8 h-8 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center shadow-sm">
                              {selectedUser.photos?.[0] ? (
                                <img
                                  src={selectedUser.photos[0].filePath}
                                  alt={`${selectedUser.firstName}`}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-white font-bold text-xs">
                                  {selectedUser.firstName.charAt(0)}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        {!isMyMessage && !showAvatar && <div className="w-8 mr-2"></div>}

                        <div
                          className={`relative max-w-xs lg:max-w-md px-4 py-3 ${
                            isMyMessage
                              ? "bg-gradient-to-r from-primary to-secondary text-white rounded-2xl rounded-br-md" + (!nextIsSame ? "" : " rounded-br-2xl")
                              : "bg-white/90 backdrop-blur-sm border border-white/70 rounded-2xl rounded-bl-md" + (!nextIsSame ? "" : " rounded-bl-2xl")
                          }`}
                        >
                          {message.messageType !== "TEXT" && (
                            <div className="absolute -top-3 left-0 bg-gray-700 text-white text-xs px-2 py-0.5 rounded-full">
                              {message.messageType}
                            </div>
                          )}

                          {message.messageType === "TEXT" && (
                            <p className="text-sm leading-relaxed">{message.content}</p>
                          )}

                          {message.messageType === "IMAGE" && (
                            <div className="flex items-center space-x-2">
                              <ImageIcon className="w-5 h-5" />
                              <span className="text-sm font-medium">
                                {message.fileName || "Resim"}
                              </span>
                            </div>
                          )}

                          {message.messageType === "VOICE" && (
                            <div className="flex items-center space-x-2">
                              <MicIcon className="w-5 h-5" />
                              <span className="text-sm font-medium">Ses mesajı</span>
                            </div>
                          )}

                          {message.messageType === "GIFT" && message.gift && (
                            <div className="flex items-center space-x-2">
                              <GiftIcon className="w-5 h-5" />
                              <div>
                                <div className="text-sm font-medium">{message.gift.name}</div>
                                <div className="text-xs">{message.gift.coinCost} coin</div>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-end mt-1 space-x-1">
                            <span className="text-xs opacity-75">
                              {formatTime(message.createdAt)}
                            </span>
                            {isMyMessage && (
                              <div>
                                {message.isRead ? (
                                  <CheckIcon className="w-3.5 h-3.5 text-white" />
                                ) : (
                                  <ClockIcon className="w-3.5 h-3.5 opacity-75" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white/80 backdrop-blur-md border-t border-white/20 p-4 rounded-b-2xl">
              <div className="bg-gradient-to-r from-gray-50/80 to-white/80 rounded-xl p-2 border border-white/50">
                <div className="flex items-end space-x-2">
                  <div className="flex space-x-1 text-gray-500">
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Resim gönder">
                      <ImageIcon className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Hediye gönder">
                      <GiftIcon className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1">
                    <textarea
                      value={messageText}
                      onChange={(e) => {
                        setMessageText(e.target.value);
                        // Typing effect simulation
                        if (e.target.value && !isTyping) {
                          setIsTyping(true);
                          setTimeout(() => setIsTyping(false), 2000);
                        }
                      }}
                      onKeyPress={handleKeyPress}
                      placeholder="Mesajınızı yazın..."
                      rows={1}
                      className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border-0 rounded-xl focus:ring-0 focus:bg-white transition-all duration-200 resize-none message-input-textarea placeholder:text-gray-400"
                      style={{ minHeight: "45px", maxHeight: "120px" }}
                    />
                  </div>

                  <button
                    onClick={(e) => {
                      // Tıklama animasyonu
                      if (messageText.trim() && !isSending) {
                        const btn = e.currentTarget;
                        gsap.timeline()
                          .to(btn, { scale: 0.9, duration: 0.1 })
                          .to(btn, { scale: 1, duration: 0.2, ease: "back.out" })
                          .then(() => handleSendMessage());
                      } else {
                        handleSendMessage();
                      }
                    }}
                    disabled={!messageText.trim() || isSending}
                    className="p-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0 send-button hover:translate-y-[-2px] active:translate-y-[0px]"
                  >
                    {isSending ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <SendIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <div className="flex justify-between items-center px-3 mt-2">
                  <div className="text-xs text-gray-500">
                    <span className="bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded text-xs mr-1">Enter</span>
                    ile gönder, 
                    <span className="bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded text-xs mx-1">Shift+Enter</span>
                    ile yeni satır
                  </div>
                  <div className="text-xs text-gray-400">
                    {messageText.length > 0 ? `${messageText.length} karakter` : ""}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Kullanıcı Seçilmemiş */
                      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-indigo-50/20 to-purple-50/10 empty-state">
            <div className="text-center bg-white/80 backdrop-blur-md p-10 rounded-3xl border border-white/50 max-w-md mx-4">
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/50">
                <MessageSquareIcon className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Mesaj Göndermek İçin Kullanıcı Seçin
              </h3>
              <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                Sol panelden bir kullanıcı arayın ve sohbet başlatmak için seçin
              </p>
              <div className="inline-flex items-center justify-center px-4 py-2 space-x-2 text-sm text-primary bg-primary/5 rounded-full border border-primary/10">
                <SearchIcon className="w-4 h-4" />
                <span>En az 2 karakter girerek arama yapın</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}