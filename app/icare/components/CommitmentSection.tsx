import React from 'react';
import { motion } from 'framer-motion';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Language } from '../translations';

interface CommitmentSectionProps {
  lang: Language;
}

export const CommitmentSection: React.FC<CommitmentSectionProps> = ({ lang }) => {
  const listItems = lang === 'en' 
    ? ['mission', 'philanthropy', 'sustainability']
    : ['المهمة', 'العمل الخيري', 'الاستدامة'];

  return (
    <section className="px-4 md:px-8 py-4 md:py-8 bg-white">
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        
        {/* Left Side: Info Box */}
        <div className="bg-[#F2F2F0] rounded-[16px] p-8 md:p-16 flex flex-col justify-between min-h-[500px] md:min-h-[700px]">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <h2 className="text-[22px] md:text-[36px] font-[500] leading-[1.25] text-[#5C5A56] mb-10 max-w-lg">
                {lang === 'en' 
                  ? <>From consciously-sourced ingredients to packaging made with post-consumer recycled materials, we're committed to <span className="text-black font-[900]">MINDFUL SKINCARE.</span></>
                  : <>من المكونات المختارة بوعي إلى التغليف المصنوع من مواد معاد تدويرها، نحن ملتزمون بـ<span className="text-black font-[900]">العناية الواعية بالبشرة.</span></>
                }
              </h2>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                className="border border-black/10 bg-white/50 backdrop-blur-sm rounded-full px-8 py-3 text-[10px] font-black tracking-[0.2em] uppercase text-black hover:bg-black hover:text-white transition-all duration-500 shadow-sm"
              >
                {lang === 'en' ? 'OUR FOOTPRINT' : 'بصمتنا'}
              </motion.button>
            </motion.div>
          </div>

          {/* Bottom List / Accordion Style */}
          <div className="mt-16">
            {listItems.map((item, index) => (
              <motion.div 
                key={item}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`py-6 border-t border-black/10 flex justify-between items-center group cursor-pointer ${index === listItems.length - 1 ? 'border-b' : ''}`}
              >
                <span className="text-[20px] md:text-[28px] font-[900] text-black/30 group-hover:text-black transition-all duration-500 lowercase">
                  {item}
                </span>
                <div className="w-8 h-8 rounded-full border border-black/5 flex items-center justify-center bg-white group-hover:bg-black group-hover:text-white transition-all duration-500">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Side: Visual Box */}
        <div className="relative aspect-square md:aspect-auto h-[400px] md:h-full overflow-hidden rounded-[16px]">
          <motion.div
            initial={{ scale: 1.2, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full"
          >
            <ImageWithFallback 
              src="https://images.unsplash.com/photo-1603189777895-1dcbe39ec57e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200" 
              alt="icare texture" 
              className="w-full h-full object-cover"
            />
          </motion.div>
          <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-700" />
        </div>
      </div>
    </section>
  );
};
