/**
 * Cloudinary URL'sinden dosya uzantısını çıkarır
 */
export function getFormatFromCloudinaryUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('.');
    return pathSegments.length > 1 ? pathSegments.pop()?.toLowerCase() || null : null;
  } catch (error) {
    console.error('URL ayrıştırma hatası:', error);
    return null;
  }
}

/**
 * Cloudinary URL'sine dönüşüm parametreleri ekler
 */
export function transformCloudinaryUrl(url: string, options: {
  width?: number;
  height?: number;
  quality?: number;
  crop?: string;
  gravity?: string;
}): string {
  try {
    // URL'yi ayrıştır
    const urlObj = new URL(url);
    const uploadIndex = urlObj.pathname.indexOf('/upload/');

    if (uploadIndex === -1) return url;

    // Parametreleri oluştur
    const transformations = [];
    if (options.width) transformations.push(`w_${options.width}`);
    if (options.height) transformations.push(`h_${options.height}`);
    if (options.quality) transformations.push(`q_${options.quality}`);
    if (options.crop) transformations.push(`c_${options.crop}`);
    if (options.gravity) transformations.push(`g_${options.gravity}`);

    if (transformations.length === 0) return url;

    // Dönüşüm parametrelerini ekle
    const transformString = transformations.join(',');
    const newPath = urlObj.pathname.replace('/upload/', `/upload/${transformString}/`);

    return url.replace(urlObj.pathname, newPath);
  } catch (error) {
    console.error('URL dönüştürme hatası:', error);
    return url;
  }
}

/**
 * Dosya boyutunu formatlar
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * Dosya tipinin resim olup olmadığını kontrol eder
 */
export function isImageFile(mimeType: string | undefined): boolean {
  if (!mimeType) return false;
  return mimeType.startsWith('image/');
}

/**
 * Dosya uzantısından MIME tipini tahmin eder
 */
export function getMimeTypeFromExtension(extension: string): string {
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    txt: 'text/plain',
    mp3: 'audio/mpeg',
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
  };

  const ext = extension.toLowerCase().replace('.', '');
  return mimeTypes[ext] || 'application/octet-stream';
}
