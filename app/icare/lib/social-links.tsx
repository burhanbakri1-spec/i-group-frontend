import React from 'react';
import { ExternalLink, Facebook, Ghost, Instagram, Linkedin, Music2, Twitter, Youtube } from 'lucide-react';

type SocialIconProps = { size: number; strokeWidth: number };

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

export const getSocialPlatformLabel = (platform: string) => (
  SOCIAL_PLATFORM_LABELS[normalizeSocialPlatform(platform)] || platform.charAt(0).toUpperCase() + platform.slice(1)
);

export const getSocialPlatformIcon = (platform: string) => (
  SOCIAL_ICON_MAP[normalizeSocialPlatform(platform)] || ExternalLink
);
