import { NextResponse } from 'next/server';
import { getBoldPseBanks } from '@/lib/payments/bold';

export async function GET() {
  try {
    const banks = await getBoldPseBanks();
    return NextResponse.json({ banks });
  } catch (error) {
    console.error('Bold PSE banks error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'No fue posible consultar bancos PSE.' },
      { status: 500 }
    );
  }
}
