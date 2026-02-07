import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CartDrawer = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-[400px] bg-[#F3F3F3] z-[101] shadow-2xl p-8 flex flex-col"
          >
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-[12px] tracking-[0.2em] uppercase font-medium">Your Bag (0)</h2>
              <button onClick={onClose} className="hover:rotate-90 transition-transform duration-300">
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <p className="text-[11px] tracking-wider text-[#777] uppercase mb-8">Your bag is currently empty.</p>
              <button onClick={onClose} className="bg-black text-white w-full py-4 text-[10px] tracking-[0.2em] uppercase font-medium">
                Continue Shopping
              </button>
            </div>

            <div className="pt-8 border-t border-[#D1D1D1]">
              <div className="flex justify-between mb-4">
                <span className="text-[11px] tracking-widest uppercase font-medium">Subtotal</span>
                <span className="text-[11px] tracking-widest uppercase font-medium">$0.00</span>
              </div>
              <p className="text-[9px] text-[#999] tracking-wider uppercase mb-6 text-center">Shipping & taxes calculated at checkout</p>
              <button disabled className="bg-black/10 text-black/40 w-full py-4 text-[10px] tracking-[0.2em] uppercase font-medium cursor-not-allowed">
                Checkout
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
