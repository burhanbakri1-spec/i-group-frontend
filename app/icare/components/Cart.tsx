import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Language, translations } from '../translations';
import { useShop } from '../context/ShopContext';
import { useSiteContent } from '../hooks/useSiteContent';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onNavigate: (page: string) => void;
}

const DRAWER_BACKDROP_Z_CLASS = 'z-[70]';
const DRAWER_PANEL_Z_CLASS = 'z-[75]';
const CONTROL_FOCUS_CLASS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B7872]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F1F0ED]';
const DARK_CONTROL_FOCUS_CLASS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B7872]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white';
const DRAWER_TRANSITION = { duration: 0.18, ease: 'easeOut' as const };

export const Cart: React.FC<CartProps> = ({ isOpen, onClose, lang, onNavigate }) => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, cartCount, isAuthenticated } = useShop();
  const { freeShippingThreshold, cartShippingUnlockedText, cartShippingDisclaimer } = useSiteContent(lang);
  const t = translations[lang];
  const shouldReduceMotion = useReducedMotion();
  const hasUnlockedShipping = Number.isFinite(freeShippingThreshold) && cartTotal >= freeShippingThreshold;

  const handleCheckout = () => {
    onClose();
    onNavigate(isAuthenticated ? 'checkout' : 'account');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment key="cart-drawer">
          {/* Overlay */}
          <motion.div 
            key="cart-drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            transition={DRAWER_TRANSITION}
            className={`fixed inset-0 bg-black/35 ${DRAWER_BACKDROP_Z_CLASS}`}
          />
          
          {/* Drawer */}
          <motion.div 
            key="cart-drawer-panel"
            initial={shouldReduceMotion ? { opacity: 0 } : { x: lang === 'ar' ? '-100%' : '100%' }}
            animate={shouldReduceMotion ? { opacity: 1 } : { x: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { x: lang === 'ar' ? '-100%' : '100%' }}
            transition={DRAWER_TRANSITION}
            className={`fixed top-0 ${lang === 'ar' ? 'left-0' : 'right-0'} h-full w-full max-w-[500px] bg-[#F1F0ED] ${DRAWER_PANEL_Z_CLASS} flex flex-col font-sans`}
          >
            {/* Header */}
            <div className="relative p-6 flex items-center justify-center border-b border-black/5">
              <span className="text-[15px] font-medium text-[#67645E] tracking-tight">
                {cartCount} {t.cartDrawer.items}
              </span>
              <button 
                onClick={onClose} 
                className={`absolute ${lang === 'ar' ? 'left-6' : 'right-6'} p-1 text-[#67645E] hover:text-black transition-colors ${CONTROL_FOCUS_CLASS}`}
                aria-label={t.cartDrawer.closeCart}
              >
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-8 pt-4 pb-8 no-scrollbar">
              {cartItems.length === 0 ? (
                /* Empty Cart */
                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                  <ShoppingBag size={64} className="text-[#D9D7D2] mb-4" />
                  <h3 className="text-lg font-medium text-[#67645E] mb-2">{t.emptyCart}</h3>
                  <p className="text-sm text-[#67645E] mb-6">
                    {t.cartDrawer.emptyMessage}
                  </p>
                  <button
                    onClick={() => { onClose(); onNavigate('shop'); }}
                    className={`px-6 py-3 bg-[#67645E] text-white text-sm uppercase tracking-wider rounded-full hover:bg-[#5A5853] transition-colors ${CONTROL_FOCUS_CLASS}`}
                  >
                    {t.shopNow}
                  </button>
                </div>
              ) : (
                <>
                  {/* Shipping Progress */}
                  {hasUnlockedShipping && (
                    <div className="mb-10 text-center space-y-3">
                      <div className="w-full h-[6px] bg-[#D9D7D2] rounded-full overflow-hidden">
                        <motion.div 
                          initial={shouldReduceMotion ? false : { width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                          className="h-full bg-[#67645E]"
                        />
                      </div>
                      <p className="text-[13px] text-[#67645E] font-medium tracking-tight">
                        {cartShippingUnlockedText}
                      </p>
                    </div>
                  )}

                  {/* Cart Items */}
                  <div className="space-y-8">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-6 relative group pb-4 border-b border-black/5">
                        <div className="w-20 h-24 bg-white/40 rounded-[8px] overflow-hidden flex-shrink-0">
                          <ImageWithFallback 
                            src={item.primaryImage} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="flex-1 flex flex-col">
                          <div className="flex justify-between items-start mb-3">
                            <div className="space-y-0.5">
                              <h3 className="text-[14px] font-[900] text-[#67645E] tracking-wider uppercase">
                                {item.title}
                              </h3>
                              <p className="text-[13px] text-[#67645E] font-medium">
                                {item.category}
                              </p>
                            </div>
                            <div className="text-right">
                              {item.originalPrice && (
                                <span className="text-[12px] font-[700] text-[#67645E]/50 line-through block">{item.originalPrice}</span>
                              )}
                              <span className="text-[14px] font-[900] text-[#67645E]">
                                {item.price}
                              </span>
                            </div>
                          </div>

                          {/* Quantity Selector */}
                          <div className="flex items-center justify-between mt-auto">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className={`w-8 h-8 flex items-center justify-center border border-[#DDDDDD] rounded-full hover:border-[#67645E] transition-colors ${CONTROL_FOCUS_CLASS}`}
                                aria-label={t.cartDrawer!.decreaseQuantity!.replace('{item}', item.title!)}
                              >
                                <Minus size={14} />
                              </button>
                              <span className="text-[14px] font-medium w-8 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className={`w-8 h-8 flex items-center justify-center border border-[#DDDDDD] rounded-full hover:border-[#67645E] transition-colors ${CONTROL_FOCUS_CLASS}`}
                                aria-label={t.cartDrawer!.increaseQuantity!.replace('{item}', item.title!)}
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className={`text-[#67645E] hover:text-red-600 transition-colors ${CONTROL_FOCUS_CLASS}`}
                              aria-label={t.cartDrawer!.removeFromCart!.replace('{item}', item.title!)}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Footer - Checkout Button */}
            {cartItems.length > 0 && (
              <div className="border-t border-[#DDDDDD] p-8 space-y-4 bg-white">
                <div className="flex justify-between items-center text-[15px]">
                  <span className="font-medium text-[#67645E]">
                    {t.cartDrawer.subtotal}
                  </span>
                  <span className="font-[900] text-[#67645E]">
                    USD {cartTotal.toFixed(2)}
                  </span>
                </div>
                
                <button 
                  onClick={handleCheckout}
                  className={`w-full py-4 bg-[#67645E] text-white text-[14px] font-[900] tracking-wider uppercase rounded-full hover:bg-[#5A5853] transition-colors duration-200 motion-reduce:transition-none ${DARK_CONTROL_FOCUS_CLASS}`}
                >
                  {isAuthenticated ? t.checkout : t.cartDrawer.signInToCheckout}
                </button>
                
                <p className="text-xs text-[#84827E] text-center">
                  {cartShippingDisclaimer}
                </p>
              </div>
            )}
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
};
