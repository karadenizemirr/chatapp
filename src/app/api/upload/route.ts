
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import cloudinary from '@/lib/cloudinary';
import { UploadApiResponse } from 'cloudinary';
import { getServerSession } from 'next-auth';

export async function POST(req: NextRequest) {
  try {
    // Oturum kontrolü
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
          { success: false, message: 'Yetkilendirme hatası' },
          { status: 401 }
      );
    }

    // FormData'dan dosyaları alma
    const formData = await req.formData();
    const files = formData.getAll('file') as File[];
    const folder = formData.get('folder') as string || 'uploads';

    if (!files || files.length === 0) {
      return NextResponse.json(
          { success: false, message: 'Dosya bulunamadı' },
          { status: 400 }
      );
    }

    // Tüm dosyaları Cloudinary'ye yükleme
    const uploadPromises = files.map(async (file) => {
      if (!(file instanceof File)) {
        throw new Error('Geçersiz dosya formatı');
      }

      // Dosyayı buffer'a çevirme
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileExtension = file.name.split('.').pop() || '';
      const uniqueFileName = `${uuidv4()}.${fileExtension}`;

      // Base64 formatına dönüştürme
      const base64Data = `data:${file.type};base64,${buffer.toString('base64')}`;

      // Cloudinary'ye yükleme
      const result: UploadApiResponse = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
            base64Data,
            {
              folder: folder,
              public_id: `${Date.now()}-${file.name.split('.')[0]}`,
              resource_type: 'auto',
              filename_override: file.name,
            },
            (error, result) => {
              if (error || !result) {
                return reject(error || new Error('Cloudinary yükleme hatası'));
              }
              resolve(result);
            }
        );
      });

      return {
        publicId: result.public_id,
        url: result.secure_url,
        originalName: file.name,
        size: file.size,
        format: result.format,
        width: result.width,
        height: result.height,
        resourceType: result.resource_type,
      };
    });

    // Tüm yüklemeleri bekle
    const uploadedFiles = await Promise.all(uploadPromises);

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
      count: uploadedFiles.length,
    });

  } catch (error) {
    console.error('Dosya yükleme hatası:', error);
    return NextResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : 'Dosya yüklenirken bir hata oluştu'
        },
        { status: 500 }
    );
  }
}