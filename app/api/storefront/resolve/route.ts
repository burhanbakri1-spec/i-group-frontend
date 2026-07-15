import { NextRequest, NextResponse } from 'next/server';

const PLATFORM_API_BASE_URL = (
  process.env.PLATFORM_API_BASE_URL
  ?? process.env.ICARE_API_BASE_URL
  ?? process.env.NEXT_PUBLIC_ICARE_API_URL
  ?? 'https://backend.igroup.website'
).replace(/\/$/, '');

export async function GET(request: NextRequest) {
  const host = request.nextUrl.searchParams.get('host') || '';
  const path = request.nextUrl.searchParams.get('path') || '/';
  const target = new URL('/api/company/resolve-storefront', PLATFORM_API_BASE_URL);
  target.searchParams.set('host', host);
  target.searchParams.set('path', path);

  try {
    const response = await fetch(target, { cache: 'no-store' });
    const body = await response.text();
    return new NextResponse(body, {
      status: response.status,
      headers: { 'Content-Type': response.headers.get('content-type') || 'application/json' },
    });
  } catch {
    return NextResponse.json({ message: 'Storefront resolution is unavailable.' }, { status: 502 });
  }
}
