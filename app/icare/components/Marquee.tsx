import React from 'react';
import { motion } from 'motion/react';

const Marquee = ({ text }: { text: string }) => {
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
            {text}
          </span>
        ))}
      </motion.div>
    </div>
  );
};

export default Marquee;
