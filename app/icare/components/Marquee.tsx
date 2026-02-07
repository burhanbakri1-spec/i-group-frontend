import React from 'react';
import { motion } from 'framer-motion';

const Marquee = ({ text }: { text: string }) => {
  return (
    <div className="bg-[#EBEBEB] py-2 overflow-hidden border-y border-[#D1D1D1]">
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
          <span key={i} className="text-[10px] tracking-[0.2em] font-medium uppercase px-8 text-[#555]">
            {text}
          </span>
        ))}
      </motion.div>
    </div>
  );
};

export default Marquee;
