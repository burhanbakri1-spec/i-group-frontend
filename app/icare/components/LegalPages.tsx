import React from 'react';
import { motion } from 'motion/react';
import { Language } from '../translations';

interface PolicyPageProps {
  lang: Language;
}

export const PrivacyPolicy: React.FC<PolicyPageProps> = ({ lang }) => {
  const isEn = lang === 'en';
  
  return (
    <div className="min-h-screen bg-[#F1F0ED] pt-32 pb-24 px-6 md:px-12 max-w-[800px] mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <h1 className="text-[24px] md:text-[32px] font-black uppercase tracking-tight">
          {isEn ? 'Privacy Policy' : 'سياسة الخصوصية'}
        </h1>
        
        <div className="prose prose-sm max-w-none text-[#5C5B57] space-y-6 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-[14px] font-bold text-black uppercase tracking-wider">
              {isEn ? '1. Information Collection' : '1. جمع المعلومات'}
            </h2>
            <p className="text-[14px]">
              {isEn 
                ? "We collect information you provide directly to us when you create an account, make a purchase, or communicate with us. This may include your name, email address, and shipping information."
                : "نقوم بجمع المعلومات التي تقدمها لنا مباشرة عند إنشاء حساب، أو إجراء عملية شراء، أو التواصل معنا. قد يشمل ذلك اسمك، وبريدك الإلكتروني، ومعلومات الشحن."}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[14px] font-bold text-black uppercase tracking-wider">
              {isEn ? '2. Use of Information' : '2. استخدام المعلومات'}
            </h2>
            <p className="text-[14px]">
              {isEn 
                ? "We use the information we collect to process your orders, provide customer support, and send you updates about our products and services (with your consent)."
                : "نستخدم المعلومات التي نجمعها لمعالجة طلباتك، وتقديم دعم العملاء، وإرسال تحديثات حول منتجاتنا وخدماتنا (بموافقتك)."}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[14px] font-bold text-black uppercase tracking-wider">
              {isEn ? '3. Data Security' : '3. أمن البيانات'}
            </h2>
            <p className="text-[14px]">
              {isEn 
                ? "We implement reasonable security measures to protect your personal information from unauthorized access or disclosure."
                : "نحن نطبق تدابير أمنية معقولة لحماية معلوماتك الشخصية من الوصول غير المصرح به أو الكشف عنها."}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[14px] font-bold text-black uppercase tracking-wider">
              {isEn ? '4. Third-Party Services' : '4. خدمات الطرف الثالث'}
            </h2>
            <p className="text-[14px]">
              {isEn 
                ? "We may share your information with trusted third-party service providers who assist us in operating our website and processing payments."
                : "قد نشارك معلوماتك مع مزودي خدمة خارجيين موثوقين يساعدوننا في تشغيل موقعنا ومعالجة المدفوعات."}
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
};

export const TermsOfService: React.FC<PolicyPageProps> = ({ lang }) => {
  const isEn = lang === 'en';
  
  return (
    <div className="min-h-screen bg-[#F1F0ED] pt-32 pb-24 px-6 md:px-12 max-w-[800px] mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <h1 className="text-[24px] md:text-[32px] font-black uppercase tracking-tight">
          {isEn ? 'Terms of Service' : 'شروط الخدمة'}
        </h1>
        
        <div className="prose prose-sm max-w-none text-[#5C5B57] space-y-6 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-[14px] font-bold text-black uppercase tracking-wider">
              {isEn ? '1. Agreement to Terms' : '1. الموافقة على الشروط'}
            </h2>
            <p className="text-[14px]">
              {isEn 
                ? "By accessing or using icare, you agree to be bound by these Terms of Service and all applicable laws and regulations."
                : "من خلال الوصول إلى icare أو استخدامه، فإنك توافق على الالتزام بشروط الخدمة هذه وجميع القوانين واللوائح المعمول بها."}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[14px] font-bold text-black uppercase tracking-wider">
              {isEn ? '2. Use License' : '2. رخصة الاستخدام'}
            </h2>
            <p className="text-[14px]">
              {isEn 
                ? "Permission is granted to temporarily download one copy of the materials on icare's website for personal, non-commercial transitory viewing only."
                : "تمنح الإذن لتنزيل نسخة واحدة مؤقتة من المواد الموجودة على موقع icare للمشاهدة الشخصية وغير التجارية فقط."}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[14px] font-bold text-black uppercase tracking-wider">
              {isEn ? '3. Product Availability' : '3. توفر المنتجات'}
            </h2>
            <p className="text-[14px]">
              {isEn 
                ? "All products are subject to availability, and we reserve the right to limit quantities or discontinue products at any time."
                : "تخضع جميع المنتجات للتوافر، ونحن نحتفظ بالحق في تحديد الكميات أو إيقاف المنتجات في أي وقت."}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[14px] font-bold text-black uppercase tracking-wider">
              {isEn ? '4. Governing Law' : '4. القانون الحاكم'}
            </h2>
            <p className="text-[14px]">
              {isEn 
                ? "These terms are governed by and construed in accordance with the laws of the jurisdiction in which icare operates."
                : "تخضع هذه الشروط وتفسر وفقاً لقوانين الاختصاص القضائي الذي تعمل فيه icare."}
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
};

export const AccessibilityStatement: React.FC<PolicyPageProps> = ({ lang }) => {
  const isEn = lang === 'en';
  
  return (
    <div className="min-h-screen bg-[#F1F0ED] pt-32 pb-24 px-6 md:px-12 max-w-[800px] mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <h1 className="text-[24px] md:text-[32px] font-black uppercase tracking-tight">
          {isEn ? 'Accessibility' : 'إمكانية الوصول'}
        </h1>
        
        <div className="prose prose-sm max-w-none text-[#5C5B57] space-y-6 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-[14px] font-bold text-black uppercase tracking-wider">
              {isEn ? 'Our Commitment' : 'التزامنا'}
            </h2>
            <p className="text-[14px]">
              {isEn 
                ? "icare is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards."
                : "تلتزم icare بضمان إمكانية الوصول الرقمي للأشخاص ذوي الإعاقة. نحن نعمل باستمرار على تحسين تجربة المستخدم للجميع وتطبيق معايير الوصول ذات الصلة."}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[14px] font-bold text-black uppercase tracking-wider">
              {isEn ? 'Conformance Status' : 'حالة الامتثال'}
            </h2>
            <p className="text-[14px]">
              {isEn 
                ? "The Web Content Accessibility Guidelines (WCAG) defines requirements for designers and developers to improve accessibility for people with disabilities."
                : "تحدد إرشادات إمكانية الوصول إلى محتوى الويب (WCAG) متطلبات المصممين والمطورين لتحسين إمكانية الوصول للأشخاص ذوي الإعاقة."}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[14px] font-bold text-black uppercase tracking-wider">
              {isEn ? 'Feedback' : 'التعليقات'}
            </h2>
            <p className="text-[14px]">
              {isEn 
                ? "We welcome your feedback on the accessibility of icare. Please let us know if you encounter accessibility barriers on our website."
                : "نرحب بتعليقاتكم حول إمكانية الوصول في icare. يرجى إعلامنا إذا واجهت أي عوائق تتعلق بإمكانية الوصول على موقعنا."}
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
};
