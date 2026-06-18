import React from 'react';
import { motion } from 'motion/react';
import { useContent } from '../hooks/useContent';
import { Language } from '../translations';

// Wired in i-group/app/icare by Home.tsx — fetches `home.marquee.text`
// from the BE content registry (registered in
// e-commerce-backend/src/content/content-defaults.service.ts) and
// renders a horizontally-scrolling marquee strip. If the BE serves an
// empty string we render nothing — keeps the layout clean instead of
// showing a marquee of empty space.
const Marquee: React.FC<{ lang: Language }> = ({ lang }) => {
  const { val: marqueeText } = useContent('home.marquee.text', { lang, fallback: '' });
  if (!marqueeText.trim()) return null;
  return (
    <div className="bg-[#F1F0ED] py-2 overflow-hidden border-y border-[#DDDDDD]">
      <motion.div
        animate={{ x: [0, -1000] }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="whitespace-nowrap flex"
      >
        {[...Array(10)].map((_, i) => (
          <span key={i} className="text-[10px] tracking-[0.2em] font-medium uppercase px-8 text-[#67645E]">
            {marqueeText}
          </span>
        ))}
      </motion.div>
    </div>
  );
};

export default Marquee;
