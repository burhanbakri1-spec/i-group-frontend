import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Language, translations } from '../translations';
import { useShop } from '../context/ShopContext';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onNavigate: (page: string) => void;
}

export const Cart: React.FC<CartProps> = ({ isOpen, onClose, lang, onNavigate }) => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, cartCount } = useShop();
  const t = translations[lang];

  const handleCheckout = () => {
    onClose();
    onNavigate('checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[250]"
          />
          
          {/* Drawer */}
          <motion.div 
            initial={{ x: lang === 'ar' ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: lang === 'ar' ? '-100%' : '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.8 }}
            className={`fixed top-0 ${lang === 'ar' ? 'left-0' : 'right-0'} h-full w-full max-w-[500px] bg-[#F3F2EE] z-[300] shadow-2xl flex flex-col font-sans`}
          >
            {/* Header */}
            <div className="relative p-6 flex items-center justify-center border-b border-black/5">
              <span className="text-[15px] font-medium text-[#706E6A] tracking-tight">
                {cartCount} {lang === 'en' ? 'items' : 'منتجات'}
              </span>
              <button 
                onClick={onClose} 
                className={`absolute ${lang === 'ar' ? 'left-6' : 'right-6'} p-1 text-[#706E6A] hover:text-black transition-colors`}
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
                  <h3 className="text-lg font-medium text-[#706E6A] mb-2">{t.emptyCart}</h3>
                  <p className="text-sm text-[#706E6A] mb-6">
                    {lang === 'en' ? 'Start adding products you love' : 'ابدأ بإضافة المنتجات المفضلة'}
                  </p>
                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-black text-white text-sm uppercase tracking-wider rounded-full hover:bg-[#333] transition-colors"
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
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
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
                          <img 
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
                              <p className="text-[13px] text-[#706E6A] font-medium">
                                {item.name}
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
                                className="w-8 h-8 flex items-center justify-center border border-[#D9D7D2] rounded-full hover:border-black transition-colors"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="text-[14px] font-medium w-8 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center border border-[#D9D7D2] rounded-full hover:border-black transition-colors"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-[#706E6A] hover:text-red-500 transition-colors"
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
                  <span className="font-medium text-[#706E6A]">
                    {lang === 'en' ? 'Subtotal' : 'المجموع الفرعي'}
                  </span>
                  <span className="font-[900] text-[#333]">
                    ${cartTotal.toFixed(2)}
                  </span>
                </div>
                
                <button 
                  onClick={handleCheckout}
                  className="w-full py-4 bg-black text-white text-[14px] font-[900] tracking-wider uppercase rounded-full hover:bg-[#333] transition-all transform hover:scale-[1.02]"
                >
                  {t.checkout}
                </button>
                
                <p className="text-xs text-[#706E6A] text-center">
                  {lang === 'en' ? 'Shipping & taxes calculated at checkout' : 'يتم حساب الشحن والضرائب عند الدفع'}
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
