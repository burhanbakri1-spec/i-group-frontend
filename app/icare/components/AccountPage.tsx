import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Language } from '../translations';
import { useShop } from '../context/ShopContext';

interface AccountPageProps {
  onNavigate?: (page: string) => void;
  lang?: Language;
}

export const AccountPage: React.FC<AccountPageProps> = ({ onNavigate }) => {
  const loginImage = "https://images.unsplash.com/photo-1729952620303-4dc47fb5d93a?q=80&w=1200&auto=format&fit=crop";
  const { user, isAuthenticated, login, register, logout, authError } = useShop();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      if (mode === 'register') {
        await register(name, email, password, phone);
      } else {
        await login(email, password);
      }
      onNavigate?.('shop');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            It&apos;s time to invest in your SKIN.
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
            {isAuthenticated ? 'Account' : mode === 'login' ? 'Login' : 'Sign up'}
          </h1>

          {isAuthenticated ? (
            <div className="w-full space-y-5 text-center">
              <div className="bg-white rounded-[16px] p-6 text-[#5C5A56]">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-50 mb-2">signed in as</p>
                <p className="text-[20px] font-bold">{user?.name}</p>
                <p className="text-[13px] opacity-70">{user?.email}</p>
              </div>
              {authError && <p className="text-sm text-red-600">{authError}</p>}
              <button
                onClick={() => logout()}
                className="border border-[#5C5A56] text-[#5C5A56] px-14 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all duration-300 active:scale-95"
              >
                SIGN OUT
              </button>
            </div>
          ) : (
            <form className="w-full space-y-4 flex flex-col items-center" onSubmit={handleSubmit}>
              {mode === 'register' && (
                <div className="w-full">
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Name"
                    className="w-full bg-white border-none rounded-[12px] px-6 py-4 text-[14px] text-[#5C5A56] placeholder:text-[#9A9A9A] focus:ring-1 focus:ring-black/10 transition-shadow outline-none"
                  />
                </div>
              )}
              <div className="w-full">
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Email"
                  className="w-full bg-white border-none rounded-[12px] px-6 py-4 text-[14px] text-[#5C5A56] placeholder:text-[#9A9A9A] focus:ring-1 focus:ring-black/10 transition-shadow outline-none"
                />
              </div>
              
              <div className="w-full">
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Password"
                  className="w-full bg-white border-none rounded-[12px] px-6 py-4 text-[14px] text-[#5C5A56] placeholder:text-[#9A9A9A] focus:ring-1 focus:ring-black/10 transition-shadow outline-none"
                />
              </div>

              {mode === 'register' && (
                <div className="w-full">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="Phone (optional)"
                    className="w-full bg-white border-none rounded-[12px] px-6 py-4 text-[14px] text-[#5C5A56] placeholder:text-[#9A9A9A] focus:ring-1 focus:ring-black/10 transition-shadow outline-none"
                  />
                </div>
              )}

              {(formError || authError) && <p className="text-sm text-red-600">{formError ?? authError}</p>}

              <button disabled={isSubmitting} className="mt-8 border border-[#5C5A56] text-[#5C5A56] px-14 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all duration-300 active:scale-95 disabled:opacity-50">
                {isSubmitting ? 'PLEASE WAIT' : mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
              </button>
            </form>
          )}

          {!isAuthenticated && <div className="mt-8 flex flex-col items-center gap-3">
            <button className="text-[12px] text-[#706E6A] underline underline-offset-4 hover:text-black transition-colors font-medium">
              Forgot your password?
            </button>
            <div className="text-[12px] text-[#706E6A] font-medium">
              {mode === 'login' ? 'Don\'t have an account?' : 'Already have an account?'}{' '}
              <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="underline underline-offset-4 hover:text-black transition-colors">
                {mode === 'login' ? 'Sign up!' : 'Sign in!'}
              </button>
            </div>
          </div>}
        </motion.div>
      </div>
    </div>
  );
};
