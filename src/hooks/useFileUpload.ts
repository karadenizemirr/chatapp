import { useState, useCallback } from 'react';
import { UploadedFile } from '@/components/ui/FileUpload/types';

interface UseFileUploadProps {
  folder?: string;
  onSuccess?: (files: UploadedFile[]) => void;
  onError?: (error: string) => void;
  onStatusChange?: (isUploading: boolean) => void;
  maxSize?: number;
}

export function useFileUpload({
  folder = 'uploads',
  onSuccess,
  onError,
  onStatusChange,
  maxSize = 10 * 1024 * 1024, // Varsayılan 10MB
}: UseFileUploadProps = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback(
    (file: File): boolean => {
      // Dosya boyutunu kontrol et
      if (maxSize && file.size > maxSize) {
        const errorMsg = `Dosya boyutu çok büyük. Maksimum ${(maxSize / (1024 * 1024)).toFixed(2)}MB izin veriliyor.`;
        setError(errorMsg);
        onError?.(errorMsg);
        return false;
      }
      return true;
    },
    [maxSize, onError]
  );

  const handleFileUpload = useCallback(
    async (files: File[]): Promise<void> => {
      if (files.length === 0) return;

      // Dosya boyutu kontrolü
      const validFiles = files.filter(validateFile);
      if (validFiles.length === 0) return;

      setError(null);
      setIsUploading(true);
      onStatusChange?.(true);

      try {
        const formData = new FormData();
        formData.append('folder', folder);

        // Tüm dosyaları FormData'ya ekle
        validFiles.forEach((file) => {
          formData.append('file', file);
        });

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Dosya yükleme başarısız oldu');
        }

        // Başarı ile yüklenen dosyaları state'e ve callback'e gönder
        const uploadedResult = result.files || [];
        setUploadedFiles((prev) => [...prev, ...uploadedResult]);
        onSuccess?.(uploadedResult);

        console.log('Dosyalar başarıyla yüklendi:', uploadedResult);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu';
        setError(errorMsg);
        onError?.(errorMsg);
      } finally {
        setIsUploading(false);
        onStatusChange?.(false);
      }
    },
    [folder, validateFile, onSuccess, onError, onStatusChange]
  );

  const clearFiles = useCallback(() => {
    setUploadedFiles([]);
    setError(null);
  }, []);

  const removeFile = useCallback((publicId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.publicId !== publicId));
  }, []);

  return {
    isUploading,
    uploadedFiles,
    error,
    handleFileUpload,
    clearFiles,
    removeFile,
  };
}
