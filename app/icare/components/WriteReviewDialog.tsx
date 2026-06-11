'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Star, X, Send, Loader2 } from 'lucide-react';
import { useSiteContent } from '../hooks/useSiteContent';
import { CreateReviewInput } from '../types';
import { translations, Language } from '../translations';

/* ──────────────────────────────────────────────────────────────────────────── */
/*  Props                                                                       */
/* ──────────────────────────────────────────────────────────────────────────── */

interface WriteReviewDialogProps {
  open: boolean;
  onClose: () => void;
  productSlug: string;
  productName: string;
  onSubmit: (review: CreateReviewInput) => Promise<void>;
  isAuthenticated: boolean;
  onLoginRequest: () => void;
  lang: Language;
}

/* ──────────────────────────────────────────────────────────────────────────── */
/*  Constants                                                                   */
/* ──────────────────────────────────────────────────────────────────────────── */

const CONTROL_FOCUS_CLASS =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-white';

const AGE_RANGES = ['18-24', '25-34', '35-44', '45-54', '55+'] as const;

const SKIN_TYPES = ['Oily', 'Dry', 'Combination', 'Normal', 'Sensitive'] as const;

const SKIN_CONCERNS = [
  'Acne',
  'Aging',
  'Dark spots',
  'Dryness',
  'Dullness',
  'Fine lines',
  'Redness',
  'Sensitivity',
] as const;

const FAVORITE_FEATURES = [
  'Texture',
  'Scent',
  'Absorption',
  'Packaging',
  'Results',
  'Value',
  'Hydration',
  'Glow',
] as const;

const MAX_TITLE_LENGTH = 200;
const MAX_COMMENT_LENGTH = 2000;
const DEFAULT_HYDRATION = 75;

/* ──────────────────────────────────────────────────────────────────────────── */
/*  Component                                                                   */
/* ──────────────────────────────────────────────────────────────────────────── */

export const WriteReviewDialog: React.FC<WriteReviewDialogProps> = ({
  open,
  onClose,
  productSlug,
  productName,
  onSubmit,
  isAuthenticated,
  onLoginRequest,
  lang,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const { reviewHydrationLow, reviewHydrationHigh } = useSiteContent();
  const t = translations[lang];

  /* ── Form state ────────────────────────────────────────────────────────── */

  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [skinType, setSkinType] = useState('');
  const [skinConcerns, setSkinConcerns] = useState<string[]>([]);
  const [favoriteFeatures, setFavoriteFeatures] = useState<string[]>([]);
  const [hydrationRating, setHydrationRating] = useState(DEFAULT_HYDRATION);

  /* ── Submission state ──────────────────────────────────────────────────── */

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [showThankYou, setShowThankYou] = useState(false);

  /* ── Lock body scroll when open ───────────────────────────────────────── */

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  /* ── Reset form when dialog closes ────────────────────────────────────── */

  useEffect(() => {
    if (!open) {
      const resetTimer = window.setTimeout(() => {
        setRating(0);
        setHoveredStar(0);
        setTitle('');
        setComment('');
        setAgeRange('');
        setSkinType('');
        setSkinConcerns([]);
        setFavoriteFeatures([]);
        setHydrationRating(DEFAULT_HYDRATION);
        setIsSubmitting(false);
        setValidationError('');
        setSubmitError('');
        setShowThankYou(false);
      }, 300); // wait for exit animation
      return () => window.clearTimeout(resetTimer);
    }
  }, [open]);

  /* ── Helpers ──────────────────────────────────────────────────────────── */

  const hydrationLow = reviewHydrationLow || t.reviewDialog.notVeryHydrated;
  const hydrationHigh = reviewHydrationHigh || t.reviewDialog.superHydrated;

  const toggleItem = useCallback(
    (field: 'skinConcerns' | 'favoriteFeatures', item: string) => {
      const setter = field === 'skinConcerns' ? setSkinConcerns : setFavoriteFeatures;
      const current = field === 'skinConcerns' ? skinConcerns : favoriteFeatures;
      const next = current.includes(item)
        ? current.filter((v) => v !== item)
        : [...current, item];
      setter(next);
    },
    [skinConcerns, favoriteFeatures],
  );

  const validate = (): string | null => {
    if (rating < 1) return t.reviewDialog.selectRating;
    if (title.length > MAX_TITLE_LENGTH) return t.reviewDialog.titleMaxLength.replace('{max}', String(MAX_TITLE_LENGTH));
    if (comment.length > MAX_COMMENT_LENGTH) return t.reviewDialog.reviewMaxLength.replace('{max}', String(MAX_COMMENT_LENGTH));
    return null;
  };

  const handleSubmit = async () => {
    setValidationError('');
    setSubmitError('');

    const error = validate();
    if (error) {
      setValidationError(error);
      return;
    }

    setIsSubmitting(true);

    const review: CreateReviewInput = {
      rating,
      ...(title.trim() ? { title: title.trim() } : {}),
      ...(comment.trim() ? { comment: comment.trim() } : {}),
      ...(ageRange ? { ageRange } : {}),
      ...(skinType ? { skinType } : {}),
      ...(skinConcerns.length > 0 ? { skinConcerns } : {}),
      ...(favoriteFeatures.length > 0 ? { favoriteFeatures } : {}),
      hydrationRating,
    };

    try {
      await onSubmit(review);
      setShowThankYou(true);
      window.setTimeout(() => {
        onClose();
      }, 1500);
    } catch {
      setSubmitError(t.reviewDialog.somethingWentWrong);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Animation variants ──────────────────────────────────────────────── */

  const overlayVariants = shouldReduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };

  const panelVariants = shouldReduceMotion
    ? { initial: { opacity: 0, scale: 1 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 1 } }
    : {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
      };

  const panelTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.2, ease: [0.32, 0.72, 0, 1] as const };

  /* ── Render ──────────────────────────────────────────────────────────── */

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="write-review-backdrop"
            {...overlayVariants}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-[100]"
          />

          {/* Panel */}
          <motion.div
            key="write-review-panel"
            {...panelVariants}
            transition={panelTransition}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="bg-white rounded-[12px] w-full max-w-[560px] max-h-[90vh] overflow-y-auto pointer-events-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className={`absolute top-5 right-5 p-1 rounded-md hover:rotate-90 transition-transform duration-300 ${CONTROL_FOCUS_CLASS}`}
                aria-label={t.reviewDialog.close}
              >
                <X size={18} strokeWidth={1.5} />
              </button>

              <div className="p-8 md:p-10">
                {/* Header */}
                <div className="pr-8 mb-8">
                  <h2 className="text-[12px] font-black uppercase tracking-widest text-[#67645E]">
                    {t.reviewDialog.writeReview}
                  </h2>
                  <p className="text-[13px] text-black/50 mt-1.5">{productName}</p>
                </div>

                {/* Auth gate */}
                {!isAuthenticated ? (
                  <div className="py-16 flex flex-col items-center justify-center text-center gap-6">
                    <p className="text-[12px] font-bold uppercase tracking-widest text-[#67645E]/60">
                      {t.reviewDialog.loginToReview}
                    </p>
                    <button
                      onClick={onLoginRequest}
                      className={`bg-[#67645E] text-white px-8 py-3.5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#7B7872] transition-colors ${CONTROL_FOCUS_CLASS}`}
                    >
                      {t.reviewDialog.login}
                    </button>
                  </div>
                ) : showThankYou ? (
                  /* Thank-you state */
                  <div className="py-16 flex flex-col items-center justify-center text-center">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
                    >
                      <p className="text-[14px] font-bold uppercase tracking-widest text-[#67645E]">
                        {t.reviewDialog.thankYouReview}
                      </p>
                    </motion.div>
                  </div>
                ) : (
                  /* ── Form ──────────────────────────────────────────────── */
                  <div className="space-y-8">
                    {/* Validation error */}
                    {validationError && (
                      <div className="bg-red-50 text-red-700 text-[12px] font-bold px-4 py-3 rounded-lg">
                        {validationError}
                      </div>
                    )}

                    {/* Submit error */}
                    {submitError && (
                      <div className="bg-red-50 text-red-700 text-[12px] font-bold px-4 py-3 rounded-lg">
                        {submitError}
                      </div>
                    )}

                    {/* Star rating */}
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-[#67645E]">
                        {t.reviewDialog.yourRating}
                      </label>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const isActive = star <= (hoveredStar || rating);
                          return (
                            <button
                              key={star}
                              onClick={() => setRating(star)}
                              onMouseEnter={() => setHoveredStar(star)}
                              onMouseLeave={() => setHoveredStar(0)}
                              className={`p-0.5 rounded-sm transition-colors ${CONTROL_FOCUS_CLASS}`}
                              aria-label={`${star} star${star > 1 ? 's' : ''}`}
                            >
                              <Star
                                size={24}
                                fill={isActive ? 'black' : 'none'}
                                className={isActive ? 'text-black' : 'text-black/15'}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-[#67645E]">
                        {t.reviewDialog.reviewTitle}
                        <span className="text-black/30 normal-case tracking-normal font-normal ml-1.5">
                          {t.reviewDialog.optional}
                        </span>
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={t.reviewDialog.summarizeExperience}
                        maxLength={MAX_TITLE_LENGTH}
                        className={`w-full px-4 py-3 rounded-[12px] border border-[#DDDDDD] bg-[#F9F8F6] text-[14px] text-[#67645E] placeholder:text-[#84827E] placeholder:text-[12px] transition-colors hover:border-[#7B7872] ${CONTROL_FOCUS_CLASS}`}
                      />
                      {title.length > 0 && (
                        <p className="text-[10px] text-[#84827E] text-right">
                          {title.length}/{MAX_TITLE_LENGTH}
                        </p>
                      )}
                    </div>

                    {/* Comment */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-[#67645E]">
                        {t.reviewDialog.yourReview}
                        <span className="text-black/30 normal-case tracking-normal font-normal ml-1.5">
                          {t.reviewDialog.optional}
                        </span>
                      </label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder={t.reviewDialog.tellUsMore}
                        maxLength={MAX_COMMENT_LENGTH}
                        rows={4}
                        className={`w-full px-4 py-3 rounded-[12px] border border-[#DDDDDD] bg-[#F9F8F6] text-[14px] text-[#67645E] placeholder:text-[#84827E] placeholder:text-[12px] resize-none transition-colors hover:border-[#7B7872] ${CONTROL_FOCUS_CLASS}`}
                      />
                      {comment.length > 0 && (
                        <p className="text-[10px] text-black/35 text-right">
                          {comment.length}/{MAX_COMMENT_LENGTH}
                        </p>
                      )}
                    </div>

                    {/* Age range & skin type — side by side */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Age range */}
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-[#67645E]">
                          {t.reviewDialog.ageRange}
                          <span className="text-black/30 normal-case tracking-normal font-normal ml-1.5">
                            {t.reviewDialog.optional}
                          </span>
                        </label>
                        <select
                          value={ageRange}
                          onChange={(e) => setAgeRange(e.target.value)}
                          className={`w-full px-4 py-3 rounded-[12px] border border-[#DDDDDD] bg-[#F9F8F6] text-[14px] text-[#67645E] appearance-none transition-colors hover:border-[#7B7872] ${CONTROL_FOCUS_CLASS}`}
                        >
                          <option value="" disabled>
                            {t.reviewDialog.selectAgeRange}
                          </option>
                          {AGE_RANGES.map((range) => (
                            <option key={range} value={range}>
                              {range}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Skin type */}
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-[#67645E]">
                          {t.reviewDialog.skinType}
                          <span className="text-black/30 normal-case tracking-normal font-normal ml-1.5">
                            {t.reviewDialog.optional}
                          </span>
                        </label>
                        <select
                          value={skinType}
                          onChange={(e) => setSkinType(e.target.value)}
                          className={`w-full px-4 py-3 rounded-[12px] border border-[#DDDDDD] bg-[#F9F8F6] text-[14px] text-[#67645E] appearance-none transition-colors hover:border-[#7B7872] ${CONTROL_FOCUS_CLASS}`}
                        >
                          <option value="" disabled>
                            {t.reviewDialog.selectSkinType}
                          </option>
                          {SKIN_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Skin concerns chips */}
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-[#67645E]">
                        {t.reviewDialog.skinConcerns}
                        <span className="text-black/30 normal-case tracking-normal font-normal ml-1.5">
                          {t.reviewDialog.optional}
                        </span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {SKIN_CONCERNS.map((concern) => {
                          const selected = skinConcerns.includes(concern);
                          return (
                            <button
                              key={concern}
                              onClick={() => toggleItem('skinConcerns', concern)}
                              className={`px-3 py-1.5 rounded-full border text-[11px] font-bold uppercase tracking-wider transition-colors ${CONTROL_FOCUS_CLASS} ${
                                selected
                                  ? 'bg-black text-white border-black'
                                  : 'border-black/15 text-black/60 hover:border-black'
                              }`}
                            >
                              {concern}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Favorite features chips */}
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-[#67645E]">
                        {t.reviewDialog.favoriteFeatures}
                        <span className="text-black/30 normal-case tracking-normal font-normal ml-1.5">
                          {t.reviewDialog.optional}
                        </span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {FAVORITE_FEATURES.map((feature) => {
                          const selected = favoriteFeatures.includes(feature);
                          return (
                            <button
                              key={feature}
                              onClick={() => toggleItem('favoriteFeatures', feature)}
                              className={`px-3 py-1.5 rounded-full border text-[11px] font-bold uppercase tracking-wider transition-colors ${CONTROL_FOCUS_CLASS} ${
                                selected
                                  ? 'bg-black text-white border-black'
                                  : 'border-black/15 text-black/60 hover:border-black'
                              }`}
                            >
                              {feature}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Hydration slider */}
                    <div className="space-y-4">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-[#67645E]">
                        {t.reviewDialog.hydrationRating}
                        <span className="text-black/30 normal-case tracking-normal font-normal ml-1.5">
                          {t.reviewDialog.optional}
                        </span>
                      </label>

                      {/* Custom slider matching the hydration display in ReviewItem */}
                      <div className="relative pt-2">
                        {/* Track */}
                        <div className="h-0.5 w-full bg-black/10 rounded-full relative">
                          {/* Filled portion */}
                          <div
                            className="absolute top-0 left-0 h-full bg-black/30 rounded-full"
                            style={{ width: `${hydrationRating}%` }}
                          />
                          {/* Thumb indicator */}
                          <div
                            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[#66635F] rounded-full shadow-sm border-2 border-white pointer-events-none"
                            style={{ left: `calc(${hydrationRating}% - 6px)` }}
                          />
                        </div>

                        {/* Native range input overlaid for interaction */}
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={hydrationRating}
                          onChange={(e) => setHydrationRating(Number(e.target.value))}
                          className={`absolute inset-0 w-full h-6 opacity-0 cursor-pointer ${CONTROL_FOCUS_CLASS}`}
                          aria-label={t.reviewDialog.hydrationRatingLabel}
                        />

                        {/* Labels */}
                        <div className="flex justify-between pt-3 text-[10px] font-bold text-black/55 uppercase tracking-widest">
                          <span>{hydrationLow}</span>
                          <span>{hydrationHigh}</span>
                        </div>
                      </div>
                    </div>

                    {/* Submit */}
                    <div className="pt-2">
                      <motion.button
                        whileHover={shouldReduceMotion ? undefined : { scale: 1.005 }}
                        whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className={`w-full bg-[#67645E] text-white py-4 rounded-full text-[12px] font-black uppercase tracking-[0.2em] hover:bg-[#7B7872] transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${CONTROL_FOCUS_CLASS}`}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            {t.reviewDialog.submitting}
                          </>
                        ) : (
                          <>
                            <Send size={14} />
                            {t.reviewDialog.submitReview}
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
