import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireProductManager } from '@/lib/auth/guards';

// Manejador para ELIMINAR etiquetas
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireProductManager();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const tagId = params.id;

    // Buscamos si el ID es un número secuencial falso del frontend y resolvemos por nombre
    // O si coincide con el ID String real de la BD.
    if (!isNaN(Number(tagId))) {
      // Si el frontend mandó el índice numérico falso (ej: 1, 11), buscamos los tags ordenados para hallar el real
      const allTags = await prisma.tag.findMany({ orderBy: { name: 'asc' } });
      const targetIndex = Number(tagId) - 1;
      const realTag = allTags[targetIndex];

      if (realTag) {
        await prisma.tag.delete({ where: { id: realTag.id } });
        return NextResponse.json({ success: true, message: 'Etiqueta eliminada con éxito' });
      }
    } else {
      // Si mandó el CUID real string
      await prisma.tag.delete({ where: { id: tagId } });
      return NextResponse.json({ success: true, message: 'Etiqueta eliminada con éxito' });
    }

    return NextResponse.json({ error: 'Etiqueta no encontrada' }, { status: 404 });
  } catch (error: any) {
    console.error("ERROR AL ELIMINAR TAG:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Manejador para ACTUALIZAR etiquetas (Nombre e Imagen)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireProductManager();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { name, imageUrl } = await request.json();
    const tagId = params.id;

    let targetId = tagId;

    if (!isNaN(Number(tagId))) {
      const allTags = await prisma.tag.findMany({ orderBy: { name: 'asc' } });
      const targetIndex = Number(tagId) - 1;
      const realTag = allTags[targetIndex];
      if (!realTag) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      targetId = realTag.id;
    }

    const updatedTag = await prisma.tag.update({
      where: { id: targetId },
      data: {
        name,
        imageUrl // ⚡ Aquí guardamos la URL de la imagen que configures
      }
    });

    return NextResponse.json({ success: true, data: updatedTag });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}