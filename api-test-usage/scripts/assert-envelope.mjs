import { makeResult } from './api-client.mjs';

export const isEnvelope = (payload) => {
  return payload && typeof payload === 'object' && 'success' in payload && 'data' in payload;
};

export const passIfOkEnvelope = (name, response, { allowEmptyData = true } = {}) => {
  if (!response.ok) {
    return makeResult(name, 'FAIL', { route: response.route, message: `HTTP ${response.status}`, response: response.payload });
  }
  if (!isEnvelope(response.payload)) {
    return makeResult(name, 'FAIL', { route: response.route, message: 'Response is not the documented envelope', response: response.payload });
  }
  if (response.payload.success !== true) {
    return makeResult(name, 'FAIL', { route: response.route, message: `Envelope success was ${response.payload.success}`, response: response.payload });
  }
  if (!allowEmptyData && (response.payload.data === null || response.payload.data === undefined)) {
    return makeResult(name, 'FAIL', { route: response.route, message: 'Envelope data was empty', response: response.payload });
  }
  return makeResult(name, 'PASS', { route: response.route, statusCode: response.status });
};

export const skipUnsupported = (name, response) => {
  if ([404, 405, 501].includes(response.status)) {
    return makeResult(name, 'SKIP', { route: response.route, message: `Endpoint unsupported or unavailable (HTTP ${response.status})` });
  }
  return null;
};

export const expectedFailure = (name, response, expectedStatuses) => {
  if (expectedStatuses.includes(response.status)) {
    return makeResult(name, 'EXPECTED_FAILURE', { route: response.route, message: `Expected safe failure HTTP ${response.status}` });
  }
  return makeResult(name, 'FAIL', { route: response.route, message: `Expected HTTP ${expectedStatuses.join('/')} but got ${response.status}`, response: response.payload });
};
