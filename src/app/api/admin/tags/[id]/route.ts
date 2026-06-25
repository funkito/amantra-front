import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireProductManager } from '@/lib/auth/guards';

// 🗑️ Manejador para ELIMINAR etiquetas (con params asíncronos para Next.js)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // 👈 Tipado como Promesa para Vercel
) {
  try {
    const session = await requireProductManager();
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    // Esperamos a que los parámetros se resuelvan
    const { id: tagId } = await params;

    if (!isNaN(Number(tagId))) {
      const allTags = await prisma.tag.findMany({ orderBy: { name: 'asc' } });
      const targetIndex = Number(tagId) - 1;
      const realTag = allTags[targetIndex];

      if (realTag) {
        await prisma.tag.delete({ where: { id: realTag.id } });
        return NextResponse.json({ success: true });
      }
    } else {
      await prisma.tag.delete({ where: { id: tagId } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 💾 Manejador para ACTUALIZAR etiquetas (con params asíncronos para Next.js)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // 👈 Tipado como Promesa para Vercel
) {
  try {
    const session = await requireProductManager();
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { name, imageUrl } = await request.json();
    
    // Esperamos a que los parámetros se resuelvan
    const { id: tagId } = await params;
    let targetId = tagId;

    if (!isNaN(Number(tagId))) {
      const allTags = await prisma.tag.findMany({ orderBy: { name: 'asc' } });
      const targetIndex = Number(tagId) - 1;
      const realTag = allTags[targetIndex];
      if (!realTag) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      targetId = realTag.id;
    }

    const updated = await prisma.tag.update({
      where: { id: targetId },
      data: { name, imageUrl }
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}