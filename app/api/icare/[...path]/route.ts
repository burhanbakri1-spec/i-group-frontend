import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE_URL = (process.env.ICARE_API_BASE_URL ?? 'https://backend.igroup.website').replace(/\/$/, '');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, (await params).path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, (await params).path);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, (await params).path);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, (await params).path);
}

async function proxyRequest(
  request: NextRequest,
  pathSegments: string[],
): Promise<NextResponse> {
  const backendPath = '/' + pathSegments.join('/');
  const targetUrl = `${BACKEND_BASE_URL}${backendPath}`;

  // Forward query parameters
  const url = new URL(request.url);
  const backendUrl = new URL(targetUrl);
  url.searchParams.forEach((value, key) => {
    backendUrl.searchParams.set(key, value);
  });

  // Forward relevant headers
  const headers: Record<string, string> = {};
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }
  const contentType = request.headers.get('content-type');
  if (contentType) {
    headers['Content-Type'] = contentType;
  }

  // Forward request body for mutating methods
  let body: string | undefined;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    body = await request.text();
  }

  try {
    const backendResponse = await fetch(backendUrl.toString(), {
      method: request.method,
      headers,
      body,
    });

    const responseBody = await backendResponse.text();

    // Build response headers — forward only safe headers
    const responseHeaders: Record<string, string> = {
      'Content-Type': backendResponse.headers.get('content-type') ?? 'application/json',
    };

    return new NextResponse(responseBody, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Proxy request failed.';
    console.error(`[iCare API Proxy] ${request.method} ${backendUrl.toString()} →`, message);
    return NextResponse.json(
      { success: false, message, data: null, timestamp: new Date().toISOString() },
      { status: 502 },
    );
  }
}
