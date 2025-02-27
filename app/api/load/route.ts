import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || '6829222253';
  try {
    const user = await prisma.user.upsert({
      where: { userId },
      update: {},
      create: { userId, samu: 0 },
    });
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}