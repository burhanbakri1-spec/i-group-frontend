import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSiteContent } from '../hooks/useSiteContent';

export const CartDrawer = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { cartBagLabel, cartEmptyDrawer, cartContinueShopping, cartShippingDisclaimer, cartCheckoutLabel } = useSiteContent();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 z-[100]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-[400px] bg-[#F1F0ED] z-[101] p-8 flex flex-col"
          >
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-[12px] tracking-[0.2em] uppercase font-medium">{cartBagLabel} (0)</h2>
              <button onClick={onClose} className="hover:rotate-90 transition-transform duration-300">
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <p className="text-[11px] tracking-wider text-[#84827E] uppercase mb-8">{cartEmptyDrawer}</p>
              <button onClick={onClose} className="bg-[#67645E] text-white w-full py-4 rounded-full text-[10px] tracking-[0.2em] uppercase font-medium hover:bg-[#5A5853] transition-colors">
                {cartContinueShopping}
              </button>
            </div>

            <div className="pt-8 border-t border-[#DDDDDD]">
              <div className="flex justify-between mb-4">
                <span className="text-[11px] tracking-widest uppercase font-medium text-[#67645E]">Subtotal</span>
                <span className="text-[11px] tracking-widest uppercase font-medium text-[#67645E]">$0.00</span>
              </div>
              <p className="text-[9px] text-[#84827E] tracking-wider uppercase mb-6 text-center">{cartShippingDisclaimer}</p>
              <button disabled className="bg-[#67645E]/10 text-[#67645E]/40 w-full py-4 rounded-full text-[10px] tracking-[0.2em] uppercase font-medium cursor-not-allowed">
                {cartCheckoutLabel}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
