import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = (process.env.ICARE_API_BASE_URL ?? 'https://backend.igroup.website').replace(/\/$/, '');

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const url = new URL(path.join('/'), BACKEND_API_URL);
  
  // Forward query parameters
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  try {
    const response = await fetch(url.toString(), {
      headers: {
        ...(request.headers.get('authorization') && { Authorization: request.headers.get('authorization')! }),
        ...(request.headers.get('content-type') && { 'Content-Type': request.headers.get('content-type')! }),
      },
    });

    const data = await response.text();
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('[Legacy API proxy] GET failed', error);
    return NextResponse.json(
      { error: 'Failed to fetch from backend' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const url = new URL(path.join('/'), BACKEND_API_URL);
  
  const body = await request.text();

  try {
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        ...(request.headers.get('authorization') && { Authorization: request.headers.get('authorization')! }),
        ...(request.headers.get('content-type') && { 'Content-Type': request.headers.get('content-type')! }),
      },
      body,
    });

    const data = await response.text();
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('[Legacy API proxy] POST failed', error);
    return NextResponse.json(
      { error: 'Failed to fetch from backend' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
