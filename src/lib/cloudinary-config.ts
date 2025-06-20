/**
 * Cloudinary istemci tarafı yapılandırması
 */
export const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
  apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '',
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '',
};

/**
 * Cloudinary URL oluşturma yardımcı fonksiyonu
 */
export function getCloudinaryUrl(publicId: string, options: {
  width?: number;
  height?: number;
  crop?: string;
  quality?: number;
} = {}) {
  const { width, height, crop = 'fill', quality = 90 } = options;

  let transformations = '';

  if (width || height) {
    transformations += `c_${crop},q_${quality}`;

    if (width) transformations += `,w_${width}`;
    if (height) transformations += `,h_${height}`;
  }

  const transformationPath = transformations ? `${transformations}/` : '';

  return `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload/${transformationPath}${publicId}`;
}
