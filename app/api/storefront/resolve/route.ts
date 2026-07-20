import { NextRequest, NextResponse } from 'next/server';
import { platformApiOrigin } from '../../../icare/lib/platform-origin';

const PLATFORM_API_BASE_URL = platformApiOrigin();

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
