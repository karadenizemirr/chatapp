"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileUploadProps, UploadedFile } from './types';
import { cn } from '@/lib/utils';
import { X, Upload, Image, File, CheckCircle, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';

export const FileUpload: React.FC<FileUploadProps> = ({
  multiple = false,
  folder = 'uploads',
  accept,
  maxSize = 10 * 1024 * 1024, // Varsayılan 10MB
  maxFiles = 5,
  onSuccess,
  onError,
  onStatusChange,
  initialFiles = [],
  disabled = false,
  className = '',
  dropzoneText = 'Dosyaları buraya sürükleyin veya seçmek için tıklayın',
  placeholder = 'Dosya seçilmedi',
  buttonText = 'Dosya Seç',
  showPreview = true,
}) => {
  const {
    isUploading,
    uploadedFiles,
    error,
    handleFileUpload,
    clearFiles,
    removeFile,
  } = useFileUpload({
    folder,
    onSuccess,
    onError,
    onStatusChange,
    maxSize,
  });

  // Seçilen dosyaları izleme
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // Başlangıç dosyalarını ayarlama
  useEffect(() => {
    if (initialFiles?.length) {
      const initialFileUrls = initialFiles.map(file => file.url);
      setPreviews(initialFileUrls);
    }
  }, [initialFiles]);

  // Dosya seçildiğinde veya bırakıldığında
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (disabled || isUploading) return;

      // Maksimum dosya sayısını kontrol et
      const totalFiles = multiple 
        ? Math.min(acceptedFiles.length, maxFiles) 
        : 1;

      const filesToUpload = acceptedFiles.slice(0, totalFiles);

      // Dosya önizlemelerini oluştur
      if (showPreview) {
        const newPreviews = filesToUpload.map((file) => URL.createObjectURL(file));
        setPreviews(multiple ? [...previews, ...newPreviews] : newPreviews);
      }

      setSelectedFiles(multiple ? [...selectedFiles, ...filesToUpload] : filesToUpload);
      await handleFileUpload(filesToUpload);
    },
    [disabled, isUploading, multiple, maxFiles, previews, selectedFiles, handleFileUpload, showPreview]
  );

  // React-dropzone konfigürasyonu
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: accept ? { [accept]: [] } : undefined,
    maxSize,
    disabled: disabled || isUploading,
    multiple,
    noClick: true, // Manuel tıklama yönetimi için
  });

  // Önizleme URL'lerini temizle
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  // Tüm dosyaları temizle
  const handleClearAll = useCallback(() => {
    setPreviews([]);
    setSelectedFiles([]);
    clearFiles();
  }, [clearFiles]);

  // Tek bir dosyayı kaldır
  const handleRemoveFile = useCallback(
    (index: number, publicId?: string) => {
      // Önizleme URL'sini kaldır
      setPreviews((prev) => prev.filter((_, i) => i !== index));

      // Seçili dosyaları güncelle
      setSelectedFiles((prev) => prev.filter((_, i) => i !== index));

      // Yüklenmiş dosyayı publicId ile kaldır (varsa)
      if (publicId) {
        removeFile(publicId);
      }
    },
    [removeFile]
  );

  // Dosya boyutu biçimlendirme
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-4 transition-colors duration-200 cursor-pointer flex flex-col items-center justify-center gap-2 min-h-[150px]',
          isDragActive ? 'border-blue-500 bg-blue-50/10' : 'border-gray-300 hover:border-blue-400',
          disabled && 'opacity-60 cursor-not-allowed hover:border-gray-300',
          isUploading && 'opacity-80',
          error && 'border-red-400'
        )}
      >
        <input {...getInputProps()} />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2 text-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-sm text-gray-500">Dosyalar yükleniyor...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="p-3 bg-blue-100/50 rounded-full">
              <Upload className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{dropzoneText}</p>
              <p className="text-xs text-gray-500 mt-1">
                {multiple ? `En fazla ${maxFiles} dosya, her biri ` : 'Maksimum '}
                {(maxSize / (1024 * 1024)).toFixed(0)}MB
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                open();
              }}
              disabled={disabled || isUploading}
              className={cn(
                'px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm',
                (disabled || isUploading) && 'opacity-70 cursor-not-allowed hover:bg-blue-500'
              )}
            >
              {buttonText}
            </button>
          </div>
        )}
      </div>

      {/* Hata mesajı */}
      {error && (
        <div className="mt-2 flex items-center gap-1.5 text-red-500">
          <AlertCircle className="w-4 h-4" />
          <p className="text-xs">{error}</p>
        </div>
      )}

      {/* Yüklenen dosya listesi */}
      {(uploadedFiles.length > 0 || previews.length > 0) && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">
              {multiple ? 'Yüklenen Dosyalar' : 'Yüklenen Dosya'}
            </h4>
            {multiple && uploadedFiles.length > 1 && (
              <button
                type="button"
                onClick={handleClearAll}
                disabled={isUploading}
                className="text-xs text-red-500 hover:text-red-700 transition-colors"
              >
                Tümünü Temizle
              </button>
            )}
          </div>

          <div className={multiple ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3' : ''}>
            {uploadedFiles.map((file, index) => (
              <div
                key={file.publicId}
                className="flex items-center justify-between border rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="flex-shrink-0">
                    {file.format && /^(jpg|jpeg|png|gif|webp|svg)$/i.test(file.format) ? (
                      <div className="w-12 h-12 rounded bg-gray-200 overflow-hidden relative">
                        {showPreview && (
                          <img
                            src={file.url}
                            alt={file.originalName}
                            className="w-full h-full object-cover"
                            onLoad={() => URL.revokeObjectURL(file.previewUrl || '')}
                          />
                        )}
                        {!showPreview && <Image className="w-full h-full p-2 text-gray-500" />}
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded bg-blue-100 flex items-center justify-center">
                        <File className="w-6 h-6 text-blue-500" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {file.originalName}
                    </p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <div className="flex items-center ml-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index, file.publicId)}
                    disabled={isUploading}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Henüz yüklenmemiş dosyaların önizlemeleri (seçilmiş ama henüz yüklenmemiş) */}
            {selectedFiles.map((file, index) => {
              // Yüklenen dosyalar arasında zaten varsa gösterme
              const isAlreadyUploaded = uploadedFiles.some(
                (uploaded) => uploaded.originalName === file.name && uploaded.size === file.size
              );

              if (isAlreadyUploaded) return null;

              return (
                <div
                  key={`preview-${index}`}
                  className="flex items-center justify-between border rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="flex-shrink-0">
                      {file.type.startsWith('image/') ? (
                        <div className="w-12 h-12 rounded bg-gray-200 overflow-hidden relative">
                          {showPreview && previews[index] && (
                            <img
                              src={previews[index]}
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                          {(!showPreview || !previews[index]) && (
                            <Image className="w-full h-full p-2 text-gray-500" />
                          )}
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded bg-blue-100 flex items-center justify-center">
                          <File className="w-6 h-6 text-blue-500" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <div className="flex items-center ml-2">
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
