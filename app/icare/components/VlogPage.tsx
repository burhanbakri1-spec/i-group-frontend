import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Language } from '../translations';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Play } from 'lucide-react';
import { fetchProductMediaVlogs } from '../lib/catalog-client';
import { VlogContentItem } from '../types';
import { useSiteContent } from '../hooks/useSiteContent';

interface VlogPageProps {
  lang: Language;
}

const VLOG_EMPTY_HEADING = 'Vlog content unavailable';
const VLOG_EMPTY_DESCRIPTION = 'Product media will appear here when the backend provides it.';
const VLOG_HERO_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1590439471364-192aa70c47b53?q=80&w=2000';
const IMAGE_BASE_URL = (process.env.NEXT_PUBLIC_IMAGE_BASE_URL || '').replace(/\/$/, '');
const IMAGE_PROXY_BASE_URL = '/api/icare';

const normalizeVlogHeroImageUrl = (image?: string | null) => {
  const trimmedImage = image?.trim();
  if (!trimmedImage) return VLOG_HERO_FALLBACK_IMAGE;
  if (trimmedImage.startsWith('http://') || trimmedImage.startsWith('https://')) return trimmedImage;
  if (trimmedImage.startsWith('/api/icare/')) return trimmedImage;
  if (trimmedImage.startsWith('/public/uploads/') || trimmedImage.startsWith('/uploads/')) {
    return `${IMAGE_BASE_URL || IMAGE_PROXY_BASE_URL}${trimmedImage}`;
  }
  return trimmedImage;
};

const VlogItemBase = ({ image, subtitle, thumbnailType, title, videoPreviewUrl, videoUrl }: VlogContentItem) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    onClick={() => videoUrl && window.open(videoUrl, '_blank', 'noopener,noreferrer')}
    className={`group ${videoUrl ? 'cursor-pointer' : ''}`}
  >
    <div className="relative aspect-video rounded-2xl overflow-hidden bg-[#F2F1ED] mb-6">
      <VlogThumbnailMedia image={image} thumbnailType={thumbnailType} title={title} videoPreviewUrl={videoPreviewUrl} />
      {videoUrl && (
        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
            <Play size={20} className="ml-1 fill-black" />
          </div>
        </div>
      )}
    </div>
    <div className="space-y-1 px-1">
      <h3 className="text-[14px] md:text-[16px] font-black uppercase tracking-tight">{title}</h3>
      <p className="text-[12px] md:text-[14px] text-black/50 leading-tight">{subtitle}</p>
    </div>
  </motion.div>
);

const VlogItem = React.memo(VlogItemBase);

const VlogThumbnailMedia = ({ image, thumbnailType, title, videoPreviewUrl }: Pick<VlogContentItem, 'image' | 'thumbnailType' | 'title' | 'videoPreviewUrl'>) => {
  const [videoFailed, setVideoFailed] = useState(false);

  if (thumbnailType === 'video' && videoPreviewUrl && !videoFailed) {
    return (
      <video
        src={videoPreviewUrl}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        muted
        playsInline
        preload="metadata"
        onError={() => setVideoFailed(true)}
      />
    );
  }

  if (image) {
    return (
      <ImageWithFallback
        src={image}
        alt={title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
    );
  }

  return <VlogThumbnailFallback title={title} />;
};

const VlogThumbnailFallback = ({ title }: { title: string }) => (
  <div className="flex h-full w-full items-center justify-center bg-[#F2F1ED] text-black/35" role="img" aria-label={`${title} preview unavailable`}>
    <VideoFallbackIcon />
  </div>
);

const VideoFallbackIcon = () => (
  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-black/10 bg-white/70">
    <Play size={20} className="ml-1 fill-black/40 text-black/40" />
  </div>
);

export const VlogPage: React.FC<VlogPageProps> = ({ lang }) => {
  const { vlogHeroTitle, vlogHeroImage } = useSiteContent();
  const [remoteVlogs, setRemoteVlogs] = useState<VlogContentItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVlogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await fetchProductMediaVlogs(12);
      setRemoteVlogs(items ?? []);
    } catch (err) {
      console.error('Failed to load vlogs', err);
      setError(err instanceof Error ? err.message : 'Failed to load vlogs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVlogs();
  }, []);

  const vlogs = remoteVlogs ?? [];
  const isLoading = loading || remoteVlogs === null;
  const heroTitle = vlogHeroTitle?.trim() || 'PRODUCT STORIES';
  const heroImage = normalizeVlogHeroImageUrl(vlogHeroImage);

  return (
    <div className="min-h-screen bg-[#FFFFFF] pb-32">
      {/* 1. Hero Section */}
      <section className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden">
        <ImageWithFallback 
          src={heroImage} 
          alt="Hero Vlog" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/10 flex flex-col items-center justify-center text-white p-4">
          <div className="space-y-4 md:space-y-6 text-center">
            <h1 className="text-[24px] md:text-[48px] font-black uppercase tracking-tighter drop-shadow-sm">
              {heroTitle}
            </h1>
          </div>
        </div>
      </section>

      {/* 2. Vlog Grid */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-6 pt-8 md:pt-12">
        {isLoading ? (
          <div className="py-20 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="py-20 text-center space-y-4">
            <p className="text-[13px] text-red-600 font-medium">{error}</p>
            <button
              onClick={loadVlogs}
              className="px-6 py-2 bg-black text-white rounded-full text-[11px] font-black uppercase tracking-[0.2em] hover:bg-black/90 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : vlogs.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 md:gap-x-8 gap-y-8 md:gap-y-16">
            {vlogs.map((vlog) => (
              <VlogItem key={vlog.id} {...vlog} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center space-y-3">
            <h2 className="text-[18px] font-black uppercase tracking-tight text-black/60">
              {VLOG_EMPTY_HEADING}
            </h2>
            <p className="text-[13px] text-black/40 font-medium">
              {VLOG_EMPTY_DESCRIPTION}
            </p>
          </div>
        )}
      </section>
    </div>
  );
};
