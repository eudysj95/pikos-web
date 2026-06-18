import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { prisma } = await import("@/lib/prisma");
    const result = await prisma.$queryRaw`SELECT 1 as ok`;
    return NextResponse.json({
      status: "ok",
      db: "connected",
      result,
      env: {
        hasDbUrl: !!process.env.DATABASE_URL,
        hasDirectUrl: !!process.env.DIRECT_URL,
        hasAuthSecret: !!process.env.AUTH_SECRET,
        node: process.version,
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        status: "error",
        name: e.constructor?.name,
        message: e.message?.substring(0, 500),
        stack: e.stack?.substring(0, 500),
      },
      { status: 500 }
    );
  }
}
