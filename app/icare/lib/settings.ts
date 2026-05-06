import { AllSettingsResponse, AppSettings } from '../types';

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

export const normalizeSettingsGroups = (data: AllSettingsResponse | null | undefined): AppSettings | null => {
  if (!data) return null;

  const settings = normalizeSettingsRecord(data.settings);
  if (settings) return settings;

  if (Array.isArray(data.groups)) {
    return normalizeSettingsGroupsArray(data.groups);
  }

  return normalizeSettingsRecord(data.groups);
};
