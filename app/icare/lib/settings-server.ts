import { AllSettingsResponse, ApiEnvelope, AppSettings } from '../types';
import { normalizeSettingsGroups } from './settings';

const APPROVED_BACKEND_FALLBACK_URL = 'https://backend.igroup.website';
const SETTINGS_PATH = '/api/v1/settings';

const getServerApiBaseUrl = () => (
  process.env.ICARE_API_BASE_URL || APPROVED_BACKEND_FALLBACK_URL
).replace(/\/$/, '');

const parseSettingsEnvelope = async (response: Response): Promise<AllSettingsResponse | null> => {
  if (!response.ok) return null;

  const body = await response.text();
  if (!body) return null;

  const parsed = JSON.parse(body) as ApiEnvelope<AllSettingsResponse> | AllSettingsResponse;
  if ('data' in parsed && parsed.data) return parsed.data;
  return parsed as AllSettingsResponse;
};

export const fetchServerSettings = async (): Promise<AppSettings | null> => {
  try {
    const response = await fetch(`${getServerApiBaseUrl()}${SETTINGS_PATH}`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 300 },
    });
    return normalizeSettingsGroups(await parseSettingsEnvelope(response));
  } catch {
    return null;
  }
};
