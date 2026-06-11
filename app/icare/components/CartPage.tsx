import React from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Trash2, Minus, Plus, ArrowLeft } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useIcareShell } from './IcareShell';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { translations } from '../translations';

const CartPage: React.FC = () => {
  const { cartItems, cartTotal, cartCount, removeFromCart, updateQuantity, isAuthenticated } = useShop();
  const { lang, navigateToPage } = useIcareShell();
  const t = translations[lang];

  const handleCheckout = () => {
    navigateToPage(isAuthenticated ? 'checkout' : 'account');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6 max-w-md">
          <div className="w-24 h-24 mx-auto rounded-full bg-[#F1F0ED] flex items-center justify-center">
            <ShoppingBag size={40} className="text-[#D9D7D2]" />
          </div>
          <h1 className="text-[28px] md:text-[36px] font-black lowercase tracking-tight text-[#67645E]">{t.cartDrawer.empty}</h1>
          <p className="text-[14px] text-[#84827E]">{t.cartDrawer.emptyDesc}</p>
          <button onClick={() => navigateToPage('shop')} className="px-10 py-4 bg-[#67645E] text-white rounded-full text-[12px] font-black uppercase tracking-[0.2em] hover:bg-[#5A5853] transition-colors">
            {t.cartDrawer.shopNow}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-[#F1F0ED] pb-24">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 pt-8">
          <button onClick={() => navigateToPage('shop')} className="inline-flex items-center gap-2 text-[13px] text-[#84827E] hover:text-[#67645E] mb-8 transition-colors">
          <ArrowLeft size={16} /> {t.cartDrawer.continue}
        </button>

        <h1 className="text-[32px] md:text-[42px] font-black lowercase tracking-tight text-[#67645E] mb-10">{t.cartDrawer.title} ({cartCount} {t.cartDrawer.items})</h1>

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <motion.div key={item.id} layout className="flex gap-4 md:gap-6 p-4 rounded-[12px] border border-[#DDDDDD] hover:border-[#67645E] transition-colors bg-white">
                <div className="w-24 h-24 md:w-28 md:h-28 bg-[#F1F0ED] rounded-[12px] flex items-center justify-center p-3 flex-shrink-0">
                  <ImageWithFallback src={item.primaryImage} alt={item.name} className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#84827E]">{item.title}</p>
                    <h3 className="text-[14px] md:text-[16px] font-bold text-[#67645E] mt-1">{item.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      {item.originalPrice && (
                        <span className="text-[12px] font-bold text-[#67645E]/50 line-through">{item.originalPrice}</span>
                      )}
                      <p className="text-[14px] font-bold text-[#67645E]">{item.price}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-2 bg-[#F1F0ED] rounded-full">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-[#84827E] hover:text-[#67645E] transition-colors"><Minus size={14} /></button>
                      <span className="text-[12px] font-bold min-w-[20px] text-center text-[#67645E]">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-[#84827E] hover:text-[#67645E] transition-colors"><Plus size={14} /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-[12px] text-[#999] hover:text-red-500 transition-colors flex items-center gap-1"><Trash2 size={14} />{t.cartDrawer.remove}</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-6 md:p-8 rounded-[12px] sticky top-28 border border-[#DDDDDD]">
              <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#67645E] mb-6">{t.cartDrawer.orderSummary}</h3>
              <div className="flex justify-between text-[14px] text-[#67645E] mb-2"><span>{t.cartDrawer.subtotal}</span><span className="font-bold">${cartTotal.toFixed(2)}</span></div>
              <p className="text-[11px] text-[#84827E] mb-6">{t.cartDrawer.shippingCalculated}</p>
              <button onClick={handleCheckout} className="w-full py-4 bg-[#67645E] text-white rounded-full text-[12px] font-black uppercase tracking-[0.2em] hover:bg-[#5A5853] transition-colors">{isAuthenticated ? t.cartDrawer.checkout : t.cartDrawer.signInToCheckout}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
