import React from "react";
import { getWebsiteMediaImage } from "../data/websiteMedia.js";

const fallbackImages = {
  hero: "/homepage-categories/bathroom.jpg",
  why: "/homepage-categories/home-care.jpg",
  bcorp: "/homepage-categories/bathroom.jpg",
  safe: "/homepage-categories/home-care.jpg",
  performance: "/products/limescale-remover-main.jpg",
  impact: "/homepage-categories/car-care.jpg",
  stat1: "/products/limescale-remover-hover.jpg",
  stat2: "/images/products/fabric-cleaner.svg",
  stat3: "/images/products/grease-oil-remover.svg",
  accordion: "/products/limescale-remover-main.jpg",
  cta: "/homepage-categories/laundry.jpg",
  product: "/homepage-categories/bathroom.jpg",
};

const copy = {
  en: {
    heroTitle: "Smarter cleaning starts here",
    heroSubtitle: "Practical products designed for cleaner homes, cars, and everyday routines.",
    review: "Over 500+ orders from happy customers",
    intro:
      "At EB Chemical, sustainability starts with practical choices. We focus on reliable cleaning and care products that help customers use the right solution, reduce unnecessary waste, and keep everyday spaces fresh with less effort.",
    whyLabel: "Why Choose EB Chemical?",
    refillableTitle: "Refillable design to last a lifetime",
    refillableText:
      "Our refillable system is built to reduce waste while keeping performance reliable. Each bottle is designed for repeated use, making it easy to maintain a cleaner routine at home and in the car.",
    bCorpTitle: "Committed to quality and care",
    bCorpText:
      "We take responsibility seriously. Every product is formulated with care, using ingredients that are effective yet mindful of the spaces you live and work in.",
    safeTitle: "Safe for you, your body, and the planet",
    safeText:
      "Our formulations are designed with safety in mind for your home, your family, and the environment. Non-toxic, biodegradable, and practical for everyday use.",
    performanceTitle: "Performance you can trust",
    performanceText:
      "Every EB Chemical product is carefully formulated to deliver effective cleaning results without compromise. Our concentrates are designed to work hard while using less material, so you get the best clean with minimal impact.",
    impactTitle: "The Impact",
    impactText: "We could tell you all about it with words, but these numbers speak for themselves.",
    stat1Value: "243k",
    stat1Label: "plastic bottles saved",
    stat2Value: "123kg",
    stat2Label: "plastic bags saved",
    stat3Value: "123kg",
    stat3Label: "CO2 saved",
    accordionTitle: "Our products",
    accordionText:
      "Designed for practical daily use, our products focus on performance, simplicity, and care for everyday spaces.",
    accordion1Title: "Formulated with purpose",
    accordion1Text:
      "Our formulas are made to deliver reliable cleaning results for homes, cars, and daily routines. Biodegradable and effective.",
    accordion2Title: "Refillable by design",
    accordion2Text:
      "Our product system supports practical use and helps reduce unnecessary packaging where possible. Refill, reuse, repeat.",
    accordion3Title: "Built to last a lifetime",
    accordion3Text:
      "Each product is designed to be easy to use, easy to store, and suitable for everyday cleaning needs. Durable bottles built for repeated use.",
    ctaTitle: "Ready to make the switch?",
    ctaText: "Discover products designed for practical, sustainable living.",
    ctaButton: "Discover products",
    goodbyeTitle: "Goodbye, waste. Hello, refills.",
    goodbyeText: "Discover products with purpose.",
  },
  ar: {
    heroTitle: "تنظيف أذكى يبدأ من هنا",
    heroSubtitle: "منتجات عملية مصممة لمنزل وسيارة وروتين يومي أنظف.",
    review: "أكثر من 500 طلب من عملاء سعداء",
    intro:
      "في EB Chemical، تبدأ الاستدامة من اختيارات عملية. نركز على منتجات تنظيف وعناية موثوقة تساعد العملاء على استخدام الحل المناسب، وتقليل الهدر غير الضروري، والحفاظ على المساحات اليومية نظيفة ومنعشة بجهد أقل.",
    whyLabel: "لماذا تختار EB Chemical؟",
    refillableTitle: "تصميم قابل لإعادة الاستخدام ليدوم مدى الحياة",
    refillableText:
      "نظام إعادة التعبئة لدينا مصمم لتقليل الهدر مع الحفاظ على أداء موثوق. كل عبوة مصممة للاستخدام المتكرر، مما يسهل الحفاظ على روتين نظيف في المنزل والسيارة.",
    bCorpTitle: "ملتزمون بالجودة والرعاية",
    bCorpText:
      "نحن نأخذ المسؤولية على محمل الجد. كل منتج يتم تركيبه بعناية، باستخدام مكونات فعالة ومراعية للمساحات التي تعيش وتعمل فيها.",
    safeTitle: "آمن لك ولجسمك وللكوكب",
    safeText:
      "تم تصميم تركيباتنا مع مراعاة السلامة لمنزلك وعائلتك والبيئة. غير سامة، قابلة للتحلل، وعملية للاستخدام اليومي.",
    performanceTitle: "أداء يمكنك الوثوق به",
    performanceText:
      "كل منتج EB Chemical يتم تركيبه بعناية لتقديم نتائج تنظيف فعالة دون مساومة. تركيباتنا المركزة مصممة لتعمل بكفاءة مع استخدام مواد أقل.",
    impactTitle: "الأثر",
    impactText: "يمكننا شرح الكثير بالكلمات، لكن هذه الأرقام تتحدث بنفسها.",
    stat1Value: "243 ألف",
    stat1Label: "زجاجة بلاستيكية تم توفيرها",
    stat2Value: "123 كجم",
    stat2Label: "أكياس بلاستيكية تم توفيرها",
    stat3Value: "123 كجم",
    stat3Label: "ثاني أكسيد الكربون تم توفيره",
    accordionTitle: "منتجاتنا",
    accordionText:
      "مصممة للاستخدام اليومي العملي، تركز منتجاتنا على الأداء والبساطة والعناية بالمساحات اليومية.",
    accordion1Title: "تركيبات بهدف واضح",
    accordion1Text:
      "تركيباتنا مصممة لتقديم نتائج تنظيف موثوقة للمنزل والسيارة والروتين اليومي. قابلة للتحلل وفعالة.",
    accordion2Title: "قابلة لإعادة التعبئة بالتصميم",
    accordion2Text:
      "نظام منتجاتنا يدعم الاستخدام العملي ويساعد على تقليل التغليف غير الضروري. أعد التعبئة، أعد الاستخدام، كرر.",
    accordion3Title: "مصممة لتدوم مدى الحياة",
    accordion3Text:
      "كل منتج مصمم ليكون سهل الاستخدام والتخزين ومناسبًا لاحتياجات التنظيف اليومية. زجاجات متينة للاستخدام المتكرر.",
    ctaTitle: "مستعد للتبديل؟",
    ctaText: "اكتشف منتجات مصممة لحياة عملية ومستدامة.",
    ctaButton: "اكتشف المنتجات",
    goodbyeTitle: "وداعًا للهدر. مرحبًا بإعادة التعبئة.",
    goodbyeText: "اكتشف منتجات ذات هدف.",
  },
};

function SustainabilityAccordion({ items }) {
  const [active, setActive] = React.useState(0);

  return (
    <div className="sustainability-accordion">
      {items.map(([title, text], index) => (
        <article key={title} className={active === index ? "is-open" : ""}>
          <button type="button" onClick={() => setActive(active === index ? -1 : index)}>
            <span>{title}</span>
            <span>{active === index ? "−" : "+"}</span>
          </button>
          <div className="sustainability-accordion-content" style={{ maxHeight: active === index ? "200px" : "0", overflow: "hidden", transition: "max-height 0.3s ease" }}>
            <p>{text}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

function SustainabilityPage({ language = "en", onNavigate, websiteMedia = [] }) {
  const isArabic = language === "ar";
  const t = copy[isArabic ? "ar" : "en"];

  const image = React.useCallback(
    (key) => getWebsiteMediaImage(websiteMedia, `sustainability_${key}`, fallbackImages[key]) || fallbackImages[key],
    [websiteMedia]
  );

  const accordionItems = [
    [t.accordion1Title, t.accordion1Text],
    [t.accordion2Title, t.accordion2Text],
    [t.accordion3Title, t.accordion3Text],
  ];

  const impactStats = [
    { value: t.stat1Value, label: t.stat1Label, img: image("stat1") },
    { value: t.stat2Value, label: t.stat2Label, img: image("stat2") },
    { value: t.stat3Value, label: t.stat3Label, img: image("stat3") },
  ];

  return (
    <main className="sustainability-page" dir={isArabic ? "rtl" : "ltr"}>
      <section className="sustainability-hero">
        <picture>
          <img className="sustainability-media" src={image("hero")} alt="" aria-hidden="true" />
        </picture>
        <div className="sustainability-hero-overlay" />
        <div className="sustainability-hero-copy">
          <h1>{t.heroTitle}</h1>
          <p>{t.heroSubtitle}</p>
          <div className="sustainability-review">
            <span>{t.review}</span>
            <strong>4.85 ★</strong>
          </div>
        </div>
      </section>

      <section className="sustainability-section sustainability-intro">
        <p>{t.intro}</p>
      </section>

      <section className="sustainability-section sustainability-why">
        <div className="sustainability-why-bg">
          <img className="sustainability-media" src={image("why")} alt="" aria-hidden="true" />
          <div className="sustainability-why-overlay" />
        </div>
        <div className="sustainability-why-copy">
          <h2>{t.whyLabel}</h2>
        </div>
      </section>

      <section className="sustainability-section sustainability-text-block">
        <h2>{t.refillableTitle}</h2>
        <p>{t.refillableText}</p>
      </section>

      <section className="sustainability-section sustainability-bcorp">
        <img className="sustainability-media" src={image("bcorp")} alt="" aria-hidden="true" />
        <div className="sustainability-bcorp-overlay" />
        <div className="sustainability-bcorp-copy">
          <h2>{t.bCorpTitle}</h2>
          <p>{t.bCorpText}</p>
        </div>
      </section>

      <section className="sustainability-section sustainability-safe">
        <img className="sustainability-media" src={image("safe")} alt="" aria-hidden="true" />
        <div className="sustainability-safe-overlay" />
        <div className="sustainability-safe-copy">
          <h2>{t.safeTitle}</h2>
          <p>{t.safeText}</p>
        </div>
      </section>

      <section className="sustainability-section sustainability-performance">
        <div className="sustainability-performance-media">
          <img src={image("performance")} alt="" aria-hidden="true" />
        </div>
        <div className="sustainability-performance-copy">
          <h2>{t.performanceTitle}</h2>
          <p>{t.performanceText}</p>
        </div>
      </section>

      <section className="sustainability-section sustainability-impact">
        <img className="sustainability-impact-bg" src={image("impact")} alt="" aria-hidden="true" />
        <div className="sustainability-impact-heading">
          <h2>{t.impactTitle}</h2>
          <p>{t.impactText}</p>
        </div>
        <div className="sustainability-impact-stats">
          {impactStats.map((stat) => (
            <article key={stat.label} className="sustainability-stat-pill">
              <img src={stat.img} alt="" aria-hidden="true" />
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="sustainability-section sustainability-products-split">
        <div className="sustainability-products-copy">
          <h2>{t.accordionTitle}</h2>
          <p>{t.accordionText}</p>
          <SustainabilityAccordion items={accordionItems} />
        </div>
        <div className="sustainability-products-media">
          <img src={image("accordion")} alt="" aria-hidden="true" />
        </div>
      </section>

      <section className="sustainability-section sustainability-cta-banner">
        <div className="sustainability-cta-bg">
          <img className="sustainability-media" src={image("cta")} alt="" aria-hidden="true" />
          <div className="sustainability-cta-overlay" />
        </div>
        <div className="sustainability-cta-copy">
          <h2>{t.ctaTitle}</h2>
          <p>{t.ctaText}</p>
          <button type="button" onClick={() => onNavigate?.("products")}>{t.ctaButton}</button>
        </div>
      </section>

      <section className="sustainability-section sustainability-two-col">
        <div className="sustainability-two-col-media">
          <img src={image("product")} alt="" aria-hidden="true" />
        </div>
        <div className="sustainability-two-col-copy">
          <h2>{t.goodbyeTitle}</h2>
          <p>{t.goodbyeText}</p>
        </div>
      </section>
    </main>
  );
}

export default SustainabilityPage;
