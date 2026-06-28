export const DEFAULT_COMPANY_ID = "eb-chemical";
export const DEFAULT_COMPANY_DOMAIN = "eb-chemical-full.vercel.app";

const publicSettingKeys = new Set([
  "currency",
  "direction",
  "faviconUrl",
  "language",
  "locale",
  "logoUrl",
  "socialLinks",
  "supportEmail",
  "supportPhone",
]);

const privateContextKeys = new Set([
  "company_id",
  "companyId",
  "memberships",
  "password",
  "permissions",
  "privateKey",
  "secret",
  "serviceKey",
  "service_role_key",
  "serviceRoleKey",
  "tenant_id",
  "tenantId",
  "users",
]);

export const defaultCompany = Object.freeze({
  id: DEFAULT_COMPANY_ID,
  slug: DEFAULT_COMPANY_ID,
  name: "EB Chemical",
  status: "active",
  isDefault: true,
  domain: DEFAULT_COMPANY_DOMAIN,
  publicSettings: Object.freeze({}),
});

export function normalizeCompanyId(companyId) {
  return typeof companyId === "string" && companyId.trim()
    ? companyId.trim()
    : DEFAULT_COMPANY_ID;
}

export function normalizeCompanyHost(value) {
  const firstValue = Array.isArray(value) ? value[0] : String(value || "").split(",")[0];
  const input = String(firstValue || "").trim().slice(0, 2048);
  if (!input) return "";

  let hostname = "";
  try {
    const url = new URL(input.includes("://") ? input : `http://${input}`);
    hostname = url.hostname;
  } catch {
    hostname = input
      .replace(/^[a-z][a-z0-9+.-]*:\/\//i, "")
      .split(/[/?#]/, 1)[0]
      .replace(/^\[|\]$/g, "")
      .replace(/:\d+$/, "");
  }

  return hostname
    .trim()
    .toLowerCase()
    .replace(/^\[|\]$/g, "")
    .replace(/\.$/, "")
    .replace(/^www\./, "");
}

function clonePublicValue(value) {
  if (Array.isArray(value)) return value.map(clonePublicValue);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !privateContextKeys.has(key))
      .map(([key, entry]) => [key, clonePublicValue(entry)]),
  );
}

function publicSettingsFor(company) {
  const source = company?.publicSettings;
  if (!source || typeof source !== "object" || Array.isArray(source)) return {};
  return Object.fromEntries(
    Object.entries(source)
      .filter(([key]) => publicSettingKeys.has(key))
      .map(([key, value]) => [key, clonePublicValue(value)]),
  );
}

export function createPublicCompanyContext(company = defaultCompany, options = {}) {
  const source = company && typeof company === "object" ? company : defaultCompany;
  const requestHost = normalizeCompanyHost(options.host);
  return {
    id: String(source.id || DEFAULT_COMPANY_ID),
    slug: String(source.slug || DEFAULT_COMPANY_ID),
    name: String(source.name || defaultCompany.name),
    status: String(source.status || defaultCompany.status),
    isDefault: source.isDefault !== false,
    domain: requestHost || normalizeCompanyHost(source.domain) || DEFAULT_COMPANY_DOMAIN,
    settings: publicSettingsFor(source),
  };
}

export function companyStorageSegment(companyId) {
  const normalized = normalizeCompanyId(companyId).toLowerCase();
  const segment = normalized
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
  return segment || DEFAULT_COMPANY_ID;
}

export function companyStoragePath(companyId, ...parts) {
  return [companyStorageSegment(companyId), ...parts.filter(Boolean)].join("/");
}
