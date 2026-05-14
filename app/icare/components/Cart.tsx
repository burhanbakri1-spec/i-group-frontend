import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Language, translations } from '../translations';
import { useShop } from '../context/ShopContext';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onNavigate: (page: string) => void;
}

const DRAWER_BACKDROP_Z_CLASS = 'z-[70]';
const DRAWER_PANEL_Z_CLASS = 'z-[75]';
const CONTROL_FOCUS_CLASS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D48]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F3F2EE]';
const DARK_CONTROL_FOCUS_CLASS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D48]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white';
const DRAWER_TRANSITION = { duration: 0.18, ease: 'easeOut' as const };

export const Cart: React.FC<CartProps> = ({ isOpen, onClose, lang, onNavigate }) => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, cartCount, isAuthenticated } = useShop();
  const t = translations[lang];
  const shouldReduceMotion = useReducedMotion();

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
            className={`fixed inset-0 bg-black/35 backdrop-blur-[2px] ${DRAWER_BACKDROP_Z_CLASS}`}
          />
          
          {/* Drawer */}
          <motion.div 
            key="cart-drawer-panel"
            initial={shouldReduceMotion ? { opacity: 0 } : { x: lang === 'ar' ? '-100%' : '100%' }}
            animate={shouldReduceMotion ? { opacity: 1 } : { x: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { x: lang === 'ar' ? '-100%' : '100%' }}
            transition={DRAWER_TRANSITION}
            className={`fixed top-0 ${lang === 'ar' ? 'left-0' : 'right-0'} h-full w-full max-w-[500px] bg-[#F3F2EE] ${DRAWER_PANEL_Z_CLASS} shadow-2xl flex flex-col font-sans`}
          >
            {/* Header */}
            <div className="relative p-6 flex items-center justify-center border-b border-black/5">
              <span className="text-[15px] font-medium text-[#706E6A] tracking-tight">
                {cartCount} {lang === 'en' ? 'items' : 'منتجات'}
              </span>
              <button 
                onClick={onClose} 
                className={`absolute ${lang === 'ar' ? 'left-6' : 'right-6'} p-1 text-[#5F5D59] hover:text-black transition-colors ${CONTROL_FOCUS_CLASS}`}
                aria-label={lang === 'en' ? 'Close cart' : 'إغلاق السلة'}
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
                  <h3 className="text-lg font-medium text-[#5F5D59] mb-2">{t.emptyCart}</h3>
                  <p className="text-sm text-[#5F5D59] mb-6">
                    {lang === 'en' ? 'Start adding products you love' : 'ابدأ بإضافة المنتجات المفضلة'}
                  </p>
                  <button
                    onClick={onClose}
                    className={`px-6 py-3 bg-black text-white text-sm uppercase tracking-wider rounded-full hover:bg-[#333] transition-colors ${CONTROL_FOCUS_CLASS}`}
                  >
                    {t.shopNow}
                  </button>
                </div>
              ) : (
                <>
                  {/* Shipping Progress */}
                  {cartTotal >= 45 && (
                    <div className="mb-10 text-center space-y-3">
                      <div className="w-full h-[6px] bg-[#D9D7D2] rounded-full overflow-hidden">
                        <motion.div 
                          initial={shouldReduceMotion ? false : { width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                          className="h-full bg-[#706E6A]"
                        />
                      </div>
                      <p className="text-[13px] text-[#706E6A] font-medium tracking-tight">
                        {lang === 'en' ? 'Free standard shipping unlocked ✓' : 'تم تفعيل الشحن المجاني ✓'}
                      </p>
                    </div>
                  )}

                  {/* Cart Items */}
                  <div className="space-y-8">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-6 relative group pb-4 border-b border-black/5">
                        <div className="w-20 h-24 bg-white/40 rounded-[8px] overflow-hidden flex-shrink-0">
                          <ImageWithFallback 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="flex-1 flex flex-col">
                          <div className="flex justify-between items-start mb-3">
                            <div className="space-y-0.5">
                              <h3 className="text-[14px] font-[900] text-[#333] tracking-wider uppercase">
                                {item.title}
                              </h3>
                              <p className="text-[13px] text-[#5F5D59] font-medium">
                                {item.category}
                              </p>
                            </div>
                            <span className="text-[14px] font-[900] text-[#333]">
                              {item.price}
                            </span>
                          </div>

                          {/* Quantity Selector */}
                          <div className="flex items-center justify-between mt-auto">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className={`w-8 h-8 flex items-center justify-center border border-[#C9C6BF] rounded-full hover:border-black transition-colors ${CONTROL_FOCUS_CLASS}`}
                                aria-label={lang === 'en' ? `Decrease quantity of ${item.title}` : `تقليل كمية ${item.title}`}
                              >
                                <Minus size={14} />
                              </button>
                              <span className="text-[14px] font-medium w-8 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className={`w-8 h-8 flex items-center justify-center border border-[#C9C6BF] rounded-full hover:border-black transition-colors ${CONTROL_FOCUS_CLASS}`}
                                aria-label={lang === 'en' ? `Increase quantity of ${item.title}` : `زيادة كمية ${item.title}`}
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className={`text-[#5F5D59] hover:text-red-600 transition-colors ${CONTROL_FOCUS_CLASS}`}
                              aria-label={lang === 'en' ? `Remove ${item.title} from cart` : `حذف ${item.title} من السلة`}
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
              <div className="border-t border-black/10 p-8 space-y-4 bg-white/50">
                <div className="flex justify-between items-center text-[15px]">
                  <span className="font-medium text-[#5F5D59]">
                    {lang === 'en' ? 'Subtotal' : 'المجموع الفرعي'}
                  </span>
                  <span className="font-[900] text-[#333]">
                    EGP {cartTotal.toFixed(2)}
                  </span>
                </div>
                
                <button 
                  onClick={handleCheckout}
                  className={`w-full py-4 bg-black text-white text-[14px] font-[900] tracking-wider uppercase rounded-full hover:bg-[#333] transition-colors duration-200 motion-reduce:transition-none ${DARK_CONTROL_FOCUS_CLASS}`}
                >
                  {isAuthenticated ? t.checkout : lang === 'en' ? 'SIGN IN TO CHECKOUT' : 'سجّل الدخول لإتمام الطلب'}
                </button>
                
                <p className="text-xs text-[#5F5D59] text-center">
                  {lang === 'en' ? 'Shipping & taxes calculated at checkout' : 'يتم حساب الشحن والضرائب عند الدفع'}
                </p>
              </div>
            )}
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
};
