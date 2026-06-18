const APPROVED_DEV_FALLBACK_URL = '/api/icare';

function isProductionBuild(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function getIcareApiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_ICARE_API_URL;
  if (url && url.length > 0) {
    return url;
  }
  if (isProductionBuild()) {
    throw new Error(
      'NEXT_PUBLIC_ICARE_API_URL is required in production builds (see i-group/app/icare/lib/env.ts).',
    );
  }
  return APPROVED_DEV_FALLBACK_URL;
}
