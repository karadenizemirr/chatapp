
"use client";

import { useState, useRef, useEffect } from "react";
import {
  CalendarIcon,
  CoinsIcon,
  HeartIcon,
  MapPinIcon,
  MessageCircleIcon,
  PhoneIcon,
  UserIcon,
  MailIcon,
  XIcon,
  ImageIcon,
  ShieldIcon,
  ClockIcon,
  EditIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  AlertTriangleIcon,
  PlusIcon,
  MinusIcon
} from "lucide-react";
import { gsap } from "gsap";

interface UserPhoto {
  id: string;
  filePath: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  isPrimary: boolean;
  displayOrder: number;
  isVerified: boolean;
  uploadedAt: string;
}

interface City {
  id: string;
  name: string;
  countryCode: string;
}

interface UserProfile {
  id: string;
  uuid?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  birthDate: string;
  bio?: string;
  relationshipType: "FRIENDSHIP" | "DATING" | "BOTH";
  isActive: boolean;
  isPremium?: boolean;
  isFake?: boolean;
  isBanned?: boolean;
  banReason?: string;
  banExpiresAt?: string;
  lastActiveAt?: string;
  emailVerifiedAt?: string;
  phoneVerifiedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  coins?: number;
  photos: UserPhoto[];
  city?: City;
  isAdmin?: boolean;
}

interface UserProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any;
  loading: boolean;
  onAddCoins?: (userId: string) => void;
  onRemoveCoins?: (userId: string) => void;
  onToggleActive?: (userId: string, isActive: boolean) => void;
  onDelete?: (userId: string) => void;
  onToggleBan?: (userId: string, isBanned: boolean, reason?: string) => void;
  onTogglePremium?: (userId: string, isPremium: boolean) => void;
  onToggleFake?: (userId: string, isFake: boolean) => void;
  onUpdateProfile?: (userId: string, data: any) => void;
  cities?: Array<{ id: string; name: string; }>;
}

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
  inputLabel?: string;
  inputPlaceholder?: string;
  inputType?: string;
  inputInitialValue?: string;
  onInputConfirm?: (value: string) => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
                                                                 isOpen,
                                                                 title,
                                                                 message,
                                                                 confirmLabel = 'Onayla',
                                                                 cancelLabel = 'İptal',
                                                                 onConfirm,
                                                                 onCancel,
                                                                 type = 'warning',
                                                                 inputLabel,
                                                                 inputPlaceholder,
                                                                 inputType = 'text',
                                                                 inputInitialValue = '',
                                                                 onInputConfirm
                                                               }) => {
  const [inputValue, setInputValue] = useState(inputInitialValue);
  const dialogRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setInputValue(inputInitialValue);
      document.body.style.overflow = 'hidden';
      gsap.fromTo(
          bgRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.2 }
      );

      gsap.fromTo(
          dialogRef.current,
          { y: 20, opacity: 0, scale: 0.95 },
          { y: 0, opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' }
      );
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, inputInitialValue]);

  const handleClose = () => {
    gsap.to(bgRef.current, { opacity: 0, duration: 0.2 });
    gsap.to(dialogRef.current, {
      y: 20,
      opacity: 0,
      scale: 0.95,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: onCancel
    });
  };

  const handleConfirm = () => {
    if (onInputConfirm && inputValue) {
      onInputConfirm(inputValue);
    } else {
      onConfirm();
    }
  };

  if (!isOpen) return null;

  const iconColor = {
    danger: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500'
  }[type];

  const bgColor = {
    danger: 'bg-red-50',
    warning: 'bg-yellow-50',
    info: 'bg-blue-50'
  }[type];

  const buttonColor = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    info: 'bg-blue-600 hover:bg-blue-700'
  }[type];

  return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
        <div
            ref={bgRef}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
        />

        <div
            ref={dialogRef}
            className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 relative z-[101] overflow-hidden"
        >
          <div className={`p-5 ${bgColor} flex items-start space-x-4`}>
            <div className={`${iconColor} flex-shrink-0`}>
              {type === 'danger' && <XIcon className="w-6 h-6" />}
              {type === 'warning' && <AlertTriangleIcon className="w-6 h-6" />}
              {type === 'info' && <CoinsIcon className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              <p className="mt-1 text-sm text-gray-600">{message}</p>
            </div>
          </div>

          {onInputConfirm && (
              <div className="p-5 pt-0">
                <div className="mt-4">
                  {inputLabel && (
                      <label className="block text-sm font-medium text-gray-700 mb-1">{inputLabel}</label>
                  )}
                  <input
                      type={inputType}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={inputPlaceholder}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      autoFocus
                  />
                </div>
              </div>
          )}

          <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
            <button
                type="button"
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
                onClick={handleClose}
            >
              {cancelLabel}
            </button>
            <button
                type="button"
                className={`px-4 py-2 rounded-md text-sm font-medium text-white ${buttonColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
                onClick={handleConfirm}
                disabled={onInputConfirm && !inputValue}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
  );
};

const UserProfileDialog: React.FC<UserProfileDialogProps> = (props) => {
  const {
    isOpen,
    onClose,
    user,
    loading,
    onAddCoins,
    onRemoveCoins,
    onToggleActive,
    onDelete,
    onUpdateProfile,
    cities
  } = props;

  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'info' | 'photos' | 'activity'>('info');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    gender: 'FEMALE' as 'MALE' | 'FEMALE' | 'OTHER',
    birthDate: '',
    bio: '',
    cityId: '',
    relationshipType: 'DATING' as 'DATING' | 'FRIENDSHIP' | 'BOTH',
    isActive: true,
    coins: 0
  });
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);

  // Konfirmasyon diyalogları için state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
    inputLabel?: string;
    inputPlaceholder?: string;
    onInputConfirm?: (value: string) => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Form verilerini kullanıcı bilgileriyle doldur
      if (user) {
        setEditForm({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          gender: user.gender || 'FEMALE',
          birthDate: user.birthDate || '',
          bio: user.bio || '',
          cityId: user.city?.id || '',
          relationshipType: user.relationshipType || 'DATING',
          isActive: user.isActive ?? true,
          coins: user.coins || 0
        });
      }
      // Animasyon: Modal açılışı
      gsap.fromTo(
          backgroundRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.3 }
      );

      gsap.fromTo(
          modalRef.current,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
      );
    } else {
      document.body.style.overflow = '';
      setIsEditing(false);
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, user]);

  const handleClose = () => {
    // Animasyon: Modal kapanışı
    gsap.to(backgroundRef.current, { opacity: 0, duration: 0.2 });
    gsap.to(modalRef.current, {
      y: 50,
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: onClose
    });
  };

  const nextPhoto = () => {
    if (user?.photos && currentPhotoIndex < user.photos.length - 1) {
      setCurrentPhotoIndex(prev => prev + 1);
    }
  };

  const prevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(prev => prev - 1);
    }
  };

  const getAge = (birthDateStr?: string) => {
    if (!birthDateStr) return null;
    const birthDate = new Date(birthDateStr);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  const formatLastActive = (lastActiveAt?: string) => {
    if (!lastActiveAt) return 'Hiç aktif olmamış';

    const date = new Date(lastActiveAt);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Az önce';
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} gün önce`;

    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRelationshipLabel = (type?: string) => {
    const typeMap: Record<string, string> = {
      DATING: "Flört",
      FRIENDSHIP: "Arkadaşlık",
      BOTH: "Her İkisi"
    };

    return type && typeMap[type] ? typeMap[type] : 'Belirtilmemiş';
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
          type === 'number' ? Number(value) : value
    }));
  };

  const handleSaveProfile = () => {
    if (onUpdateProfile && user) {
      const updateData = {
        ...editForm,
        birthDate: editForm.birthDate ? new Date(editForm.birthDate) : undefined
      };
      onUpdateProfile(user.id, updateData);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Form verilerini sıfırla
    if (user) {
      setEditForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        gender: user.gender || 'FEMALE',
        birthDate: user.birthDate || '',
        bio: user.bio || '',
        cityId: user.city?.id || '',
        relationshipType: user.relationshipType || 'DATING',
        isActive: user.isActive ?? true,
        coins: user.coins || 0
      });
    }
  };

  if (!isOpen) return null;

  return (
      <>
        {/* Konfirmasyon Diyaloğu */}
        <ConfirmationDialog
            isOpen={confirmDialog.isOpen}
            title={confirmDialog.title}
            message={confirmDialog.message}
            onConfirm={() => {
              confirmDialog.onConfirm();
              setConfirmDialog({ ...confirmDialog, isOpen: false });
            }}
            onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
            type={confirmDialog.type}
            inputLabel={confirmDialog.inputLabel}
            inputPlaceholder={confirmDialog.inputPlaceholder}
            onInputConfirm={confirmDialog.onInputConfirm ? (value) => {
              confirmDialog.onInputConfirm!(value);
              setConfirmDialog({ ...confirmDialog, isOpen: false });
            } : undefined}
        />

        <div
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm overflow-hidden"
            ref={backgroundRef}
        >
          <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
              onClick={handleClose}
          />

          <div
              ref={modalRef}
              className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden relative z-10 mx-4 max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-secondary to-primary text-white p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center space-x-2">
                <UserIcon className="w-5 h-5" />
                <span>Kullanıcı Profili</span>
                {isEditing && <span className="text-sm font-normal">(Düzenleme Modu)</span>}
              </h2>
              <div className="flex items-center space-x-2">
                {onUpdateProfile && !isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                        title="Profili Düzenle"
                    >
                      <EditIcon className="w-5 h-5" />
                    </button>
                )}
                {isEditing && (
                    <>
                      <button
                          onClick={handleSaveProfile}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded-md text-sm transition-colors"
                      >
                        Kaydet
                      </button>
                      <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md text-sm transition-colors"
                      >
                        İptal
                      </button>
                    </>
                )}
                <button
                    onClick={handleClose}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center p-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-secondary border-t-transparent"></div>
                </div>
            ) : !user ? (
                <div className="flex-1 flex items-center justify-center p-10 text-gray-500">
                  Kullanıcı bilgileri bulunamadı
                </div>
            ) : (
                <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                  {/* Sol Panel - Fotoğraf ve Temel Bilgiler */}
                  <div className="w-full md:w-1/3 bg-gray-50 p-6 flex flex-col border-r border-gray-100">
                    <div className="relative">
                      <div className="aspect-square w-full rounded-2xl overflow-hidden bg-gray-200 mb-4 relative group">
                        {user.photos && user.photos.length > 0 ? (
                            <>
                              <img
                                  src={user.photos[currentPhotoIndex].filePath}
                                  alt={`${user.firstName} ${user.lastName}`}
                                  className="w-full h-full object-cover"
                              />

                              {user.photos.length > 1 && (
                                  <>
                                    <button
                                        onClick={prevPhoto}
                                        disabled={currentPhotoIndex === 0}
                                        className={`absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 p-2 rounded-full text-white ${currentPhotoIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'opacity-70 hover:opacity-100'} transition-opacity`}
                                    >
                                      <ChevronLeftIcon className="w-5 h-5" />
                                    </button>

                                    <button
                                        onClick={nextPhoto}
                                        disabled={currentPhotoIndex === user.photos.length - 1}
                                        className={`absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 p-2 rounded-full text-white ${currentPhotoIndex === user.photos.length - 1 ? 'opacity-30 cursor-not-allowed' : 'opacity-70 hover:opacity-100'} transition-opacity`}
                                    >
                                      <ChevronRightIcon className="w-5 h-5" />
                                    </button>

                                    <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1">
                                      {user.photos.map((_, index) => (
                                          <button
                                              key={index}
                                              onClick={() => setCurrentPhotoIndex(index)}
                                              className={`w-2 h-2 rounded-full ${index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'}`}
                                          />
                                      ))}
                                    </div>
                                  </>
                              )}
                            </>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                              <UserIcon className="w-16 h-16 text-gray-400" />
                            </div>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h3 className="text-2xl font-bold text-gray-900">
                        {user.firstName} {user.lastName}
                      </h3>
                      <div className="text-sm text-gray-500 flex items-center mt-1 space-x-1">
                        <MailIcon className="w-4 h-4" />
                        <span className="truncate max-w-[200px]">{user.email || 'Email belirtilmemiş'}</span>
                        {user.emailVerifiedAt && (
                            <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" title="Doğrulanmış E-posta"></span>
                        )}
                      </div>
                      {user.phone && (
                          <div className="text-sm text-gray-500 flex items-center mt-1 space-x-1">
                            <PhoneIcon className="w-4 h-4" />
                            <span>{user.phone}</span>
                            {user.phoneVerifiedAt && (
                                <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" title="Doğrulanmış Telefon"></span>
                            )}
                          </div>
                      )}
                      {user.uuid && (
                          <div className="text-xs text-gray-400 mt-1 truncate max-w-[200px]">
                            UUID: {user.uuid}
                          </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? 'Aktif' : 'Pasif'}
                  </span>

                      {user.isPremium && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Premium
                    </span>
                      )}

                      {user.isAdmin && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      Admin
                    </span>
                      )}

                      {user.isFake && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      Sahte Hesap
                    </span>
                      )}

                      {user.isBanned && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Engellenmiş
                    </span>
                      )}

                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {user.gender === 'MALE' ? 'Erkek' : user.gender === 'FEMALE' ? 'Kadın' : 'Diğer'}
                  </span>

                      {user.birthDate && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {getAge(user.birthDate)} yaşında
                    </span>
                      )}
                    </div>

                    <div className="mt-auto pt-4 space-y-3">
                      <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex items-center space-x-2">
                          <div className="bg-yellow-100 p-2 rounded-lg">
                            <CoinsIcon className="w-5 h-5 text-yellow-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">Coin Bakiyesi</div>
                            <div className="text-lg font-bold text-yellow-600">{user.coins || 0}</div>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          {onAddCoins && (
                              <button
                                  onClick={() => {
                                    setConfirmDialog({
                                      isOpen: true,
                                      title: 'Coin Ekle',
                                      message: `${user.firstName} ${user.lastName} kullanıcısına eklenecek coin miktarını girin`,
                                      type: 'info',
                                      inputLabel: 'Coin Miktarı',
                                      inputPlaceholder: 'Örn: 100',
                                      onInputConfirm: (value) => {
                                        const amount = parseInt(value, 10);
                                        if (!isNaN(amount) && amount > 0) {
                                          onAddCoins(user.id);
                                        }
                                      },
                                      onConfirm: () => {}
                                    });
                                  }}
                                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                  title="Coin Ekle"
                              >
                                <PlusIcon className="w-4 h-4 text-green-600" />
                              </button>
                          )}
                          {onRemoveCoins && (
                              <button
                                  onClick={() => {
                                    setConfirmDialog({
                                      isOpen: true,
                                      title: 'Coin Çıkar',
                                      message: `${user.firstName} ${user.lastName} kullanıcısından çıkarılacak coin miktarını girin`,
                                      type: 'warning',
                                      inputLabel: 'Coin Miktarı',
                                      inputPlaceholder: 'Örn: 50',
                                      onInputConfirm: (value) => {
                                        const amount = parseInt(value, 10);
                                        if (!isNaN(amount) && amount > 0) {
                                          onRemoveCoins(user.id);
                                        }
                                      },
                                      onConfirm: () => {}
                                    });
                                  }}
                                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                  title="Coin Çıkar"
                              >
                                <MinusIcon className="w-4 h-4 text-orange-600" />
                              </button>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex items-center space-x-2">
                          <div className="bg-green-100 p-2 rounded-lg">
                            <ClockIcon className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">Son Aktivite</div>
                            <div className="text-sm text-gray-600">{formatLastActive(user.lastActiveAt)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sağ Panel - Detaylar */}
                  <div className="w-full md:w-2/3 flex flex-col overflow-hidden">
                    {/* Sekmeler */}
                    <div className="border-b border-gray-200">
                      <div className="flex">
                        <button
                            className={`px-5 py-3 font-medium text-sm border-b-2 ${activeTab === 'info' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('info')}
                        >
                          Profil Bilgileri
                        </button>
                        <button
                            className={`px-5 py-3 font-medium text-sm border-b-2 ${activeTab === 'photos' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('photos')}
                        >
                          Fotoğraflar {user.photos?.length ? `(${user.photos.length})` : ''}
                        </button>
                        <button
                            className={`px-5 py-3 font-medium text-sm border-b-2 ${activeTab === 'activity' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('activity')}
                        >
                          Aktivite
                        </button>
                      </div>
                    </div>

                    {/* Sekme İçeriği */}
                    <div className="p-6 overflow-y-auto flex-1" ref={contentRef}>
                      {activeTab === 'info' && (
                          <div className="space-y-6">
                            {isEditing ? (
                                <div className="space-y-6">
                                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                                    <h4 className="font-semibold text-blue-700 mb-4 flex items-center space-x-2">
                                      <EditIcon className="w-4 h-4" />
                                      <span>Profil Düzenleme</span>
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Ad</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={editForm.firstName}
                                            onChange={handleEditFormChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Soyad</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={editForm.lastName}
                                            onChange={handleEditFormChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={editForm.email}
                                            onChange={handleEditFormChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Cinsiyet</label>
                                        <select
                                            name="gender"
                                            value={editForm.gender}
                                            onChange={handleEditFormChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                            value={editForm.birthDate}
                                            onChange={handleEditFormChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">İlişki Türü</label>
                                        <select
                                            name="relationshipType"
                                            value={editForm.relationshipType}
                                            onChange={handleEditFormChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                          <option value="DATING">Flört</option>
                                          <option value="FRIENDSHIP">Arkadaşlık</option>
                                          <option value="BOTH">Her İkisi</option>
                                        </select>
                                      </div>
                                      {cities && cities.length > 0 && (
                                          <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Şehir</label>
                                            <select
                                                name="cityId"
                                                value={editForm.cityId}
                                                onChange={handleEditFormChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                              <option value="">Şehir Seçin</option>
                                              {cities.map((city) => (
                                                  <option key={city.id} value={city.id}>
                                                    {city.name}
                                                  </option>
                                              ))}
                                            </select>
                                          </div>
                                      )}
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Coin Bakiyesi</label>
                                        <input
                                            type="number"
                                            name="coins"
                                            value={editForm.coins}
                                            onChange={handleEditFormChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                      </div>
                                    </div>
                                    <div className="mt-4">
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Hakkında</label>
                                      <textarea
                                          name="bio"
                                          value={editForm.bio}
                                          onChange={handleEditFormChange}
                                          rows={3}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          placeholder="Kendiniz hakkında bir şeyler yazın..."
                                      />
                                    </div>
                                  </div>
                                </div>
                            ) : (
                                <>
                                  <div className="bg-gray-50 p-4 rounded-xl">
                                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                                      <HeartIcon className="w-4 h-4 text-pink-500" />
                                      <span>İlişki Bilgileri</span>
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium text-gray-500">İlişki Türü:</span>
                                        <span className="text-sm font-semibold">{getRelationshipLabel(user.relationshipType)}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="bg-gray-50 p-4 rounded-xl">
                                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                                      <UserIcon className="w-4 h-4 text-blue-500" />
                                      <span>Kişisel Bilgiler</span>
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium text-gray-500">ID:</span>
                                        <span className="text-sm font-semibold truncate max-w-[200px]">{user.id}</span>
                                      </div>

                                      {user.uuid && (
                                          <div className="flex items-center space-x-2">
                                            <span className="text-sm font-medium text-gray-500">UUID:</span>
                                            <span className="text-sm font-semibold truncate max-w-[200px]">{user.uuid}</span>
                                          </div>
                                      )}

                                      <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium text-gray-500">Cinsiyet:</span>
                                        <span className="text-sm font-semibold">
                                  {user.gender === 'MALE' ? 'Erkek' : user.gender === 'FEMALE' ? 'Kadın' : 'Diğer'}
                                </span>
                                      </div>

                                      {user.birthDate && (
                                          <div className="flex items-center space-x-2">
                                            <span className="text-sm font-medium text-gray-500">Yaş:</span>
                                            <span className="text-sm font-semibold">{getAge(user.birthDate)}</span>
                                          </div>
                                      )}

                                      {user.city && (
                                          <div className="flex items-center space-x-2">
                                            <span className="text-sm font-medium text-gray-500">Konum:</span>
                                            <span className="text-sm font-semibold">{user.city.name}</span>
                                          </div>
                                      )}

                                      {user.createdAt && (
                                          <div className="flex items-center space-x-2">
                                            <span className="text-sm font-medium text-gray-500">Kayıt Tarihi:</span>
                                            <span className="text-sm font-semibold">{new Date(user.createdAt).toLocaleDateString('tr-TR')}</span>
                                          </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="bg-gray-50 p-4 rounded-xl">
                                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                                      <ShieldIcon className="w-4 h-4 text-blue-500" />
                                      <span>Hesap Durumu</span>
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium text-gray-500">Aktif:</span>
                                        <span className={`text-sm font-semibold ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                                  {user.isActive ? 'Evet' : 'Hayır'}
                                </span>
                                      </div>

                                      <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium text-gray-500">Premium:</span>
                                        <span className={`text-sm font-semibold ${user.isPremium ? 'text-purple-600' : 'text-gray-600'}`}>
                                  {user.isPremium ? 'Evet' : 'Hayır'}
                                </span>
                                      </div>

                                      <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium text-gray-500">Sahte Hesap:</span>
                                        <span className={`text-sm font-semibold ${user.isFake ? 'text-amber-600' : 'text-gray-600'}`}>
                                  {user.isFake ? 'Evet' : 'Hayır'}
                                </span>
                                      </div>

                                      <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium text-gray-500">Admin:</span>
                                        <span className={`text-sm font-semibold ${user.isAdmin ? 'text-indigo-600' : 'text-gray-600'}`}>
                                  {user.isAdmin ? 'Evet' : 'Hayır'}
                                </span>
                                      </div>

                                      <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium text-gray-500">Engellenmiş:</span>
                                        <span className={`text-sm font-semibold ${user.isBanned ? 'text-red-600' : 'text-gray-600'}`}>
                                  {user.isBanned ? 'Evet' : 'Hayır'}
                                </span>
                                      </div>

                                      {user.isBanned && user.banReason && (
                                          <div className="flex items-center space-x-2">
                                            <span className="text-sm font-medium text-gray-500">Engelleme Nedeni:</span>
                                            <span className="text-sm font-semibold text-red-600">{user.banReason}</span>
                                          </div>
                                      )}

                                      {user.isBanned && user.banExpiresAt && (
                                          <div className="flex items-center space-x-2">
                                            <span className="text-sm font-medium text-gray-500">Engel Bitiş:</span>
                                            <span className="text-sm font-semibold text-red-600">
                                    {new Date(user.banExpiresAt).toLocaleDateString('tr-TR')}
                                  </span>
                                          </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="bg-gray-50 p-4 rounded-xl">
                                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                                      <ClockIcon className="w-4 h-4 text-green-500" />
                                      <span>Doğrulama Bilgileri</span>
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium text-gray-500">E-posta Doğrulaması:</span>
                                        <span className={`text-sm font-semibold ${user.emailVerifiedAt ? 'text-green-600' : 'text-red-600'}`}>
                                  {user.emailVerifiedAt ? new Date(user.emailVerifiedAt).toLocaleDateString('tr-TR') : 'Doğrulanmamış'}
                                </span>
                                      </div>

                                      <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium text-gray-500">Telefon Doğrulaması:</span>
                                        <span className={`text-sm font-semibold ${user.phoneVerifiedAt ? 'text-green-600' : 'text-red-600'}`}>
                                  {user.phoneVerifiedAt ? new Date(user.phoneVerifiedAt).toLocaleDateString('tr-TR') : 'Doğrulanmamış'}
                                </span>
                                      </div>
                                    </div>
                                  </div>

                                  {user.bio && (
                                      <div className="bg-gray-50 p-4 rounded-xl">
                                        <h4 className="font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                                          <MessageCircleIcon className="w-4 h-4 text-purple-500" />
                                          <span>Hakkında</span>
                                        </h4>
                                        <p className="text-sm text-gray-700 leading-relaxed">{user.bio}</p>
                                      </div>
                                  )}
                                </>
                            )}
                          </div>
                      )}

                      {activeTab === 'photos' && (
                          <div className="space-y-4">
                            {user.photos && user.photos.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                  {user.photos.map((photo, index) => (
                                      <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
                                        <img
                                            src={photo.filePath}
                                            alt={`Fotoğraf ${index + 1}`}
                                            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                                            onClick={() => setCurrentPhotoIndex(index)}
                                        />
                                        {photo.isPrimary && (
                                            <div className="absolute top-2 left-2">
                                              <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">Ana</span>
                                            </div>
                                        )}
                                        {photo.isVerified && (
                                            <div className="absolute top-2 right-2">
                                              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">✓</span>
                                            </div>
                                        )}
                                      </div>
                                  ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                  <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                  <p>Henüz fotoğraf eklenmemiş</p>
                                </div>
                            )}
                          </div>
                      )}

                      {activeTab === 'activity' && (
                          <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-xl">
                              <h4 className="font-semibold text-gray-700 mb-3">Hesap Aktivitesi</h4>
                              <div className="space-y-3">
                                {user.createdAt && (
                                    <div className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                                      <span className="text-sm text-gray-600">Hesap Oluşturuldu</span>
                                      <span className="text-sm font-medium">{new Date(user.createdAt).toLocaleDateString('tr-TR')}</span>
                                    </div>
                                )}
                                {user.lastActiveAt && (
                                    <div className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                                      <span className="text-sm text-gray-600">Son Görülme</span>
                                      <span className="text-sm font-medium">{formatLastActive(user.lastActiveAt)}</span>
                                    </div>
                                )}
                                {user.emailVerifiedAt && (
                                    <div className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                                      <span className="text-sm text-gray-600">E-posta Doğrulandı</span>
                                      <span className="text-sm font-medium">{new Date(user.emailVerifiedAt).toLocaleDateString('tr-TR')}</span>
                                    </div>
                                )}
                                {user.phoneVerifiedAt && (
                                    <div className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                                      <span className="text-sm text-gray-600">Telefon Doğrulandı</span>
                                      <span className="text-sm font-medium">{new Date(user.phoneVerifiedAt).toLocaleDateString('tr-TR')}</span>
                                    </div>
                                )}
                              </div>
                            </div>
                          </div>
                      )}
                    </div>
                  </div>
                </div>
            )}
          </div>
        </div>
      </>
  );
};

export default UserProfileDialog;