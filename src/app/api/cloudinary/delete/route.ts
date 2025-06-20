import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { getServerSession } from 'next-auth';

export async function DELETE(req: NextRequest) {
  try {
    // Oturum kontrolü
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Yetkilendirme hatası' },
        { status: 401 }
      );
    }

    // İstek gövdesinden publicId alınması
    const { publicId } = await req.json();

    if (!publicId) {
      return NextResponse.json(
        { success: false, message: 'Dosya tanımlayıcısı gereklidir' },
        { status: 400 }
      );
    }

    // Cloudinary'den dosyayı silme
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result !== 'ok') {
      return NextResponse.json(
        { success: false, message: 'Dosya silinirken bir hata oluştu' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Dosya başarıyla silindi',
    });

  } catch (error) {
    console.error('Dosya silme hatası:', error);
    return NextResponse.json(
      { success: false, message: 'Dosya silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
