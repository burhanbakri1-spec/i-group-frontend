import {
  AllSettingsResponse,
  AppSettings,
  ShippingPageContent,
  ShippingPageContentByLanguage,
  ShippingPageFaqContent,
} from '../types';

const isRecord = (value: unknown): value is Record<string, unknown> => (
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)
);

const normalizeStringSettings = (value: unknown): Record<string, string> | null => {
  if (!isRecord(value)) return null;

  return Object.entries(value).reduce<Record<string, string>>((settings, [key, settingValue]) => {
    if (typeof settingValue === 'string') {
      settings[key] = settingValue;
      return settings;
    }

    if (typeof settingValue === 'number' || typeof settingValue === 'boolean') {
      settings[key] = String(settingValue);
    }

    return settings;
  }, {});
};

const normalizeSettingsRecord = (value: unknown): AppSettings | null => {
  if (!isRecord(value)) return null;

  const settings = Object.entries(value).reduce<AppSettings>((settingsByGroup, [group, groupSettings]) => {
    const normalizedGroup = normalizeStringSettings(groupSettings);
    if (normalizedGroup) {
      settingsByGroup[group] = normalizedGroup;
    }
    return settingsByGroup;
  }, {});

  return Object.keys(settings).length > 0 ? settings : null;
};

const normalizeSettingsGroupsArray = (groups: unknown[]): AppSettings | null => {
  const settings = groups.reduce<AppSettings>((settingsByGroup, groupItem) => {
    if (!isRecord(groupItem)) return settingsByGroup;

    const group = typeof groupItem.group === 'string' ? groupItem.group : '';
    const normalizedGroup = normalizeStringSettings(groupItem.settings);
    if (group && normalizedGroup) {
      settingsByGroup[group] = normalizedGroup;
    }

    return settingsByGroup;
  }, {});

  return Object.keys(settings).length > 0 ? settings : null;
};

const isShippingFaq = (value: unknown): value is ShippingPageFaqContent => (
  isRecord(value)
  && typeof value.question === 'string'
  && typeof value.answer === 'string'
);

const normalizeShippingPageLocale = (value: unknown): Partial<ShippingPageContent> | null => {
  if (!isRecord(value)) return null;

  const content: Partial<ShippingPageContent> = {};
  const stringFields: Array<keyof ShippingPageContent> = [
    'title',
    'subtitle',
    'shippingHeading',
    'freeShippingTitle',
    'freeShippingDescription',
    'expressTitle',
    'expressDescription',
    'internationalTitle',
    'internationalDescription',
    'processingTitle',
    'processingDescription',
    'returnsTitle',
    'returnPolicyTitle',
    'returnPolicyDescription',
    'howToReturnTitle',
    'conditionsTitle',
    'trackingTitle',
    'trackingDescription',
    'faqsTitle',
    'ctaTitle',
    'ctaDescription',
    'ctaButton',
  ];

  stringFields.forEach((field) => {
    const settingValue = value[field];
    if (typeof settingValue === 'string') {
      (content as Record<string, string>)[field as string] = settingValue;
    }
  });

  const legacyAliases: Array<[keyof ShippingPageContent, string]> = [
    ['title', 'hero_title'],
    ['subtitle', 'hero_text'],
    ['ctaDescription', 'support_text'],
  ];

  legacyAliases.forEach(([targetKey, legacyKey]) => {
    if (!content[targetKey] && typeof value[legacyKey] === 'string') {
      (content as Record<string, string>)[targetKey] = value[legacyKey] as string;
    }
  });

  if (Array.isArray(value.returnSteps) && value.returnSteps.every((item) => typeof item === 'string')) {
    content.returnSteps = value.returnSteps as ShippingPageContent['returnSteps'];
  }

  if (Array.isArray(value.conditions) && value.conditions.every((item) => typeof item === 'string')) {
    content.conditions = value.conditions as ShippingPageContent['conditions'];
  }

  if (Array.isArray(value.faqs) && value.faqs.every((item) => isShippingFaq(item))) {
    content.faqs = value.faqs as ShippingPageContent['faqs'];
  }

  return Object.keys(content).length > 0 ? content : null;
};

export const parseShippingPageContent = (value: unknown): ShippingPageContentByLanguage | null => {
  const parsedValue = typeof value === 'string'
    ? (() => {
        if (!value.trim()) return null;
        try {
          return JSON.parse(value) as unknown;
        } catch {
          return null;
        }
      })()
    : value;

  if (!isRecord(parsedValue)) return null;

  const hasLocaleBuckets = 'en' in parsedValue || 'ar' in parsedValue;
  if (hasLocaleBuckets) {
    const shippingPageContent: ShippingPageContentByLanguage = {};
    const en = normalizeShippingPageLocale(parsedValue.en);
    const ar = normalizeShippingPageLocale(parsedValue.ar);

    if (en) shippingPageContent.en = en;
    if (ar) shippingPageContent.ar = ar;

    return Object.keys(shippingPageContent).length > 0 ? shippingPageContent : null;
  }

  const localeContent = normalizeShippingPageLocale(parsedValue);
  return localeContent ? { en: localeContent } : null;
};

export const normalizeSettingsGroups = (data: AllSettingsResponse | null | undefined): AppSettings | null => {
  if (!data) return null;

  const settings = normalizeSettingsRecord(data.settings);
  if (settings) return settings;

  if (Array.isArray(data.groups)) {
    return normalizeSettingsGroupsArray(data.groups);
  }

  return normalizeSettingsRecord(data.groups);
};
