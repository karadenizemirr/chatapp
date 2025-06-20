export interface UploadedFile {
  publicId: string;
  url: string;
  format?: string;
  width?: number;
  height?: number;
  originalName: string;
  size: number;
  previewUrl?: string; // Önizleme için yerel URL
}

export interface FileUploadProps {
  /** Çoklu dosya yüklemeye izin verilip verilmeyeceği */
  multiple?: boolean;

  /** Yüklenen dosyaların saklanacağı Cloudinary klasörü */
  folder?: string;

  /** Kabul edilen dosya türleri (örn: 'image/*', '.pdf,.docx', vb.) */
  accept?: string;

  /** Yüklenen dosyaların maksimum boyutu (byte cinsinden) */
  maxSize?: number;

  /** Bir seferde yüklenebilecek maksimum dosya sayısı */
  maxFiles?: number;

  /** Yükleme başarılı olduğunda çağrılacak callback */
  onSuccess?: (files: UploadedFile[]) => void;

  /** Hata oluştuğunda çağrılacak callback */
  onError?: (error: string) => void;
import { ReactNode } from 'react';

export interface UploadedFile {
  publicId: string;
  url: string;
  originalName: string;
  size: number;
  format?: string;
  width?: number;
  height?: number;
  resourceType?: string;
  previewUrl?: string;
}

export interface FileUploadProps {
  multiple?: boolean;
  folder?: string;
  accept?: string;
  maxSize?: number; // bytes
  maxFiles?: number;
  onSuccess?: (files: UploadedFile[]) => void;
  onError?: (error: string) => void;
  onStatusChange?: (isUploading: boolean) => void;
  initialFiles?: UploadedFile[];
  disabled?: boolean;
  className?: string;
  dropzoneText?: string;
  placeholder?: string;
  buttonText?: string;
  showPreview?: boolean;
}
  /** Yükleme durumu değiştiğinde çağrılacak callback */
  onStatusChange?: (isUploading: boolean) => void;

  /** Bileşen başlangıçta seçili dosyalara sahip olacaksa */
  initialFiles?: UploadedFile[];

  /** Bileşen etkin olup olmadığı */
  disabled?: boolean;

  /** Bileşen için özel CSS sınıfı */
  className?: string;

  /** Sürükle bırak bölgesi için metin */
  dropzoneText?: string;

  /** Yükleme yapılan alan için placeholder */
  placeholder?: string;

  /** Yükleme butonunun metni */
  buttonText?: string;

  /** Arayüzde önizleme gösterilip gösterilmeyeceği */
  showPreview?: boolean;
}
