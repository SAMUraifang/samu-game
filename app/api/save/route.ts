import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { userId, samu } = await request.json();
  if (!userId || samu === undefined) {
    return NextResponse.json({ error: 'User ID and samu are required' }, { status: 400 });
  }
  try {
    const user = await prisma.user.update({
      where: { userId },
      data: { samu },
    });
    return NextResponse.json({ success: true, user });
  } catch {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}