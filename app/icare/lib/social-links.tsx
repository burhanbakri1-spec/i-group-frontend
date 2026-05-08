import React from 'react';
import { ExternalLink, Facebook, Ghost, Instagram, Linkedin, Music2, Twitter, Youtube } from 'lucide-react';

type SocialIconProps = { size: number; strokeWidth: number };
export type SocialLinkItem = { platform: string; url: string };

type SocialLinkRecord = Record<string, unknown>;

const SOCIAL_PLATFORM_ALIASES: Record<string, string> = {
  x: 'twitter',
  twitter: 'twitter',
  instagram: 'instagram',
  tiktok: 'tiktok',
  facebook: 'facebook',
  youtube: 'youtube',
  linkedin: 'linkedin',
  snapchat: 'snapchat',
  pinterest: 'pinterest',
};

const SOCIAL_PLATFORM_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  facebook: 'Facebook',
  youtube: 'YouTube',
  twitter: 'X / Twitter',
  linkedin: 'LinkedIn',
  snapchat: 'Snapchat',
  pinterest: 'Pinterest',
};

const TextSocialIcon = ({ label, size }: { label: string; size: number }) => (
  <span
    aria-hidden="true"
    className="inline-flex items-center justify-center font-black leading-none"
    style={{ width: size, height: size, fontSize: Math.max(9, Math.floor(size * 0.58)) }}
  >
    {label}
  </span>
);

const PinterestIcon = ({ size }: SocialIconProps) => <TextSocialIcon label="P" size={size} />;

const SOCIAL_ICON_MAP: Record<string, React.ComponentType<SocialIconProps>> = {
  instagram: Instagram,
  tiktok: Music2,
  facebook: Facebook,
  youtube: Youtube,
  twitter: Twitter,
  linkedin: Linkedin,
  snapchat: Ghost,
  pinterest: PinterestIcon,
};

export const normalizeSocialPlatform = (platform: string) => {
  const normalizedPlatform = platform.trim().toLowerCase().replace(/_url$/, '').replace(/[-\s]+/g, '_');
  return SOCIAL_PLATFORM_ALIASES[normalizedPlatform] || normalizedPlatform;
};

const isSocialLinkRecord = (value: unknown): value is SocialLinkRecord => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
);

const getStringField = (record: SocialLinkRecord, keys: string[]) => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
};

const isRenderableSocialUrl = (url: string) => url !== '' && url !== '#';

export const normalizeSocialLinksResponse = (payload: unknown): SocialLinkItem[] => {
  if (Array.isArray(payload)) {
    return payload
      .map((item) => {
        if (!isSocialLinkRecord(item)) return null;
        const platform = getStringField(item, ['platform', 'key', 'name', 'type']);
        const url = getStringField(item, ['url', 'link', 'href', 'value']);
        if (!platform || !isRenderableSocialUrl(url)) return null;
        return { platform: normalizeSocialPlatform(platform), url };
      })
      .filter((item): item is SocialLinkItem => item !== null);
  }

  if (!isSocialLinkRecord(payload)) return [];

  for (const envelopeKey of ['data', 'links', 'socialLinks', 'settings']) {
    if (payload[envelopeKey] !== undefined) {
      const normalizedLinks = normalizeSocialLinksResponse(payload[envelopeKey]);
      if (normalizedLinks.length > 0) return normalizedLinks;
    }
  }

  return Object.entries(payload)
    .map(([platform, value]) => {
      const url = typeof value === 'string'
        ? value.trim()
        : isSocialLinkRecord(value)
          ? getStringField(value, ['url', 'link', 'href', 'value'])
          : '';
      const resolvedPlatform = isSocialLinkRecord(value)
        ? getStringField(value, ['platform', 'key', 'name', 'type']) || platform
        : platform;

      if (!isRenderableSocialUrl(url)) return null;
      return { platform: normalizeSocialPlatform(resolvedPlatform), url };
    })
    .filter((item): item is SocialLinkItem => item !== null);
};

export const getSocialPlatformLabel = (platform: string) => (
  SOCIAL_PLATFORM_LABELS[normalizeSocialPlatform(platform)] || platform.charAt(0).toUpperCase() + platform.slice(1)
);

export const getSocialPlatformIcon = (platform: string) => (
  SOCIAL_ICON_MAP[normalizeSocialPlatform(platform)] || ExternalLink
);
