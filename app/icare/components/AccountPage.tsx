import React from 'react';
import { motion } from 'framer-motion';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Language } from '../translations';

interface AccountPageProps {
  onNavigate: (page: string) => void;
  lang: Language;
}

export const AccountPage: React.FC<AccountPageProps> = ({ onNavigate, lang }) => {
  const loginImage = "https://images.unsplash.com/photo-1729952620303-4dc47fb5d93a?q=80&w=1200&auto=format&fit=crop";

  return (
    <div className="min-h-screen md:h-screen bg-white p-4 md:p-6 lg:p-12 mb-12 md:mb-0 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 lg:gap-8 overflow-y-auto md:overflow-hidden">
      {/* Left Section: Image and Message */}
      <div className="md:w-1/2 relative h-[45vh] md:h-[80vh] w-full overflow-hidden rounded-[32px]">
        <ImageWithFallback 
          src={loginImage} 
          alt="Skin Investment" 
          className="w-full h-full object-cover"
        />
        {/* Overlay Text - Matching the image exactly */}
        <div className="absolute inset-0 flex items-center justify-center p-8 md:p-12 bg-black/10">
          <h2 className="text-white text-[28px] md:text-[36px] lg:text-[42px] font-medium leading-tight text-center md:text-left md:max-w-xl tracking-tight drop-shadow-lg">
            It's time to invest in your SKIN.
          </h2>
        </div>
      </div>

      {/* Right Section: Login Form */}
      <div className="md:w-1/2 bg-[#F2F1ED] flex items-center justify-center p-8 md:p-12 rounded-[32px] w-full h-auto md:h-[80vh]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-[400px] flex flex-col items-center"
        >
          <h1 className="text-[36px] md:text-[48px] font-bold text-[#5C5A56] mb-12 lowercase">
            Login
          </h1>

          <form className="w-full space-y-4 flex flex-col items-center" onSubmit={(e) => e.preventDefault()}>
            <div className="w-full">
              <input 
                type="email" 
                placeholder="Email"
                className="w-full bg-white border-none rounded-[12px] px-6 py-4 text-[14px] text-[#5C5A56] placeholder:text-[#9A9A9A] focus:ring-1 focus:ring-black/10 transition-shadow outline-none"
              />
            </div>
            
            <div className="w-full">
              <input 
                type="password" 
                placeholder="Password"
                className="w-full bg-white border-none rounded-[12px] px-6 py-4 text-[14px] text-[#5C5A56] placeholder:text-[#9A9A9A] focus:ring-1 focus:ring-black/10 transition-shadow outline-none"
              />
            </div>

            <button className="mt-8 border border-[#5C5A56] text-[#5C5A56] px-14 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all duration-300 active:scale-95">
              SIGN IN
            </button>
          </form>

          <div className="mt-8 flex flex-col items-center gap-3">
            <button className="text-[12px] text-[#706E6A] underline underline-offset-4 hover:text-black transition-colors font-medium">
              Forgot your password?
            </button>
            <div className="text-[12px] text-[#706E6A] font-medium">
              Don't have an account? <button className="underline underline-offset-4 hover:text-black transition-colors">Sign up!</button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
