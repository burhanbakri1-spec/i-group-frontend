import { NextRequest } from 'next/server';
import { handlePlatformRequest } from './platform-adapter';

type RouteContext = { params: Promise<{ path: string[] }> };

const handle = async (request: NextRequest, context: RouteContext) =>
  handlePlatformRequest(request, (await context.params).path);

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
