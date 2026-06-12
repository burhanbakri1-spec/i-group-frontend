import React, { useState, useEffect } from "react";
import { placeholderImage } from "../data/products.js";
import { getWebsiteMediaImage } from "../data/websiteMedia.js";

const fallbackImages = {
  hero: "/products/limescale-remover-hover.jpg",
  concentrate: "/products/limescale-remover-main.jpg",
  refill: "/images/products/fabric-cleaner.svg",
  cta: "/homepage-categories/car-care.jpg",
  essentials: "/homepage-categories/home-care.jpg",
};

function localize(value, language) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[language] || value.en || value.ar || "";
}

const copy = {
  en: {
    label: "How it works",
    heroTitle: "How it works",
    heroSubtitle: "Choose the product once, clean with confidence every day.",
    badge: "Over 500+ orders from happy customers",
    rating: "4.85",
    intro: "Simple cleaning, made for everyday routines.",
    concentrateTitle: "Concentrate",
    refillTitle: "Refill & Use",
    ctaTitle: "Goodbye, waste. Hello, refills. Discover plastic-free living.",
    ctaText: "Explore EB Chemical products designed for home and car routines.",
    ctaButton: "Shop now",
    productsTitle: "Popular Products",
    previous: "Previous",
    next: "Next",
    currency: "ILS",
    steps: [
      ["Fill", "Fill the bottle with water to the marked line."],
      ["Drop", "Drop the concentrate tablet into the water."],
      ["Start", "Start cleaning and enjoy the fresh results."],
    ],
    refillSteps: [
      ["Fill", "Pour the refill pouch content into your bottle."],
      ["Start", "Start cleaning right away with a full bottle."],
    ],
    tabs: [
      {
        title: "Pick Your Essentials",
        text: "Choose the products you need, add them to your cart, and complete your order easily.",
      },
      {
        title: "Set Your Schedule",
        text: "Set up automatic deliveries so you never run out of your favorite products.",
      },
      {
        title: "Enjoy a Cleaner Life",
        text: "Sit back and enjoy a consistently clean home with less effort and less waste.",
      },
    ],
    subscribeButton: "Subscribe now",
    badges: ["Subscribe & Save 50%", "Seasonal Scent", "Bestseller", "Offer"],
  },
  ar: {
    label: "كيف يعمل",
    heroTitle: "كيف يعمل",
    heroSubtitle: "اختر المنتج المناسب، ونظّف بثقة كل يوم.",
    badge: "أكثر من 500 طلب من عملاء سعداء",
    rating: "٤٫٨٥",
    intro: "تنظيف بسيط يناسب روتينك اليومي.",
    concentrateTitle: "التركيز والاستخدام",
    refillTitle: "عبّئ واستخدم",
    ctaTitle: "وداعًا للنفايات، مرحبًا بإعادة التعبئة. اكتشف حياة خالية من البلاستيك.",
    ctaText: "اكتشف منتجات EB Chemical المصممة لروتين المنزل والسيارة.",
    ctaButton: "تسوق الآن",
    productsTitle: "المنتجات الشائعة",
    previous: "السابق",
    next: "التالي",
    currency: "شيكل",
    steps: [
      ["املأ", "املأ الزجاجة بالماء حتى الخط المحدد."],
      ["أسقط", "أسقط قرص المركز في الماء."],
      ["ابدأ", "ابدأ التنظيف واستمتع بالنتائج المنعشة."],
    ],
    refillSteps: [
      ["عبّئ", "اسكب محتوى كيس إعادة التعبئة في الزجاجة."],
      ["ابدأ", "ابدأ التنظيف فورًا بزجاجة ممتلئة."],
    ],
    tabs: [
      {
        title: "اختر أساسياتك",
        text: "اختر المنتجات التي تحتاجها، أضفها إلى السلة، وأكمل طلبك بسهولة.",
      },
      {
        title: "حدد جدولك",
        text: "اضبط التوصيل التلقائي لضمان عدم نفاد منتجاتك المفضلة.",
      },
      {
        title: "استمتع بحياة أنظف",
        text: "استرخِ واستمتع بمنزل نظيف باستمرار بجهد أقل ونفايات أقل.",
      },
    ],
    subscribeButton: "اشترك الآن",
    badges: ["عرض خاص", "الأكثر مبيعًا", "رائحة موسمية", "وفّر أكثر"],
  },
};

function StepSection({ image, reverse = false, steps, title, label }) {
  return (
    <section className={`how-section how-step-section${reverse ? " reverse" : ""}`}>
      <div className="how-step-copy">
        <p className="how-kicker">{label}</p>
        <h2>{title}</h2>
        <div className="how-step-list">
          {steps.map(([stepTitle, stepText], index) => (
            <article className="how-step" key={stepTitle}>
              <span className="how-step-number">{index + 1}</span>
              <div>
                <h3>{stepTitle}</h3>
                <p>{stepText}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="how-media how-step-media">
        <img
          className="how-step-img"
          src={image}
          alt=""
          aria-hidden="true"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src = placeholderImage;
          }}
        />
      </div>
    </section>
  );
}

function TabsSection({ tabs, image, subscribeButton, onNavigate }) {
  const [activeTab, setActiveTab] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (isHovering) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 100 / 80;
        if (next >= 100) {
          setActiveTab((prevTab) => (prevTab + 1) % tabs.length);
          return 0;
        }
        return next;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isHovering, tabs.length]);

  function handleTabClick(index) {
    setActiveTab(index);
    setProgress(0);
  }

  return (
    <section
      className="how-section how-tabs-section"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="how-media">
        <img className="how-tabs-img" src={image} alt="" aria-hidden="true" loading="lazy" />
      </div>
      <div className="how-tabs-copy">
        <div className="how-tabs-content">
          <h3>{tabs[activeTab].title}</h3>
          <p>{tabs[activeTab].text}</p>
        </div>
        <div className="how-tabs-list">
          {tabs.map((tab, index) => (
            <div
              key={index}
              className="how-tab-title"
              onClick={() => handleTabClick(index)}
            >
              <span className={index === activeTab ? "active" : ""}>{tab.title}</span>
              <div className="how-tab-progress">
                <div
                  className="how-tab-progress-bar"
                  style={{ width: `${index === activeTab ? progress : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <button className="how-primary-action" type="button" onClick={() => onNavigate?.("products")}>
          {subscribeButton}
        </button>
      </div>
    </section>
  );
}

function HowProductCarousel({ language, onViewProduct, products, t }) {
  const isArabic = language === "ar";
  const trackRef = React.useRef(null);
  const [progress, setProgress] = React.useState(0);
  const visibleProducts = products.slice(0, 10);

  function updateProgress() {
    const track = trackRef.current;
    if (!track) return;
    const maxScroll = track.scrollWidth - track.clientWidth;
    setProgress(maxScroll > 0 ? Math.min(1, Math.abs(track.scrollLeft) / maxScroll) : 1);
  }

  function scrollProducts(direction) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector(".how-product-card");
    const distance = card ? card.getBoundingClientRect().width + 20 : track.clientWidth * 0.8;
    track.scrollBy({ left: (isArabic ? -direction : direction) * distance, behavior: "smooth" });
  }

  if (!visibleProducts.length) return null;

  return (
    <section className="how-section how-products-section">
      <div className="how-products-head">
        <h2>{t.productsTitle}</h2>
        <div className="how-products-controls">
          <button aria-label={t.previous} onClick={() => scrollProducts(-1)} type="button">‹</button>
          <button aria-label={t.next} onClick={() => scrollProducts(1)} type="button">›</button>
        </div>
      </div>
      <div className="how-products-track" onScroll={updateProgress} ref={trackRef}>
        {visibleProducts.map((product, index) => {
          const mainImage = product.image || product.fallbackImage || placeholderImage;
          const hoverImage =
            product.hoverImage ||
            product.secondaryImage ||
            product.gallery?.[1] ||
            product.images?.[1] ||
            mainImage;
          const firstSize = product.sizes?.[0] || { price: 0 };
          const productName = localize(product.name, language);
          const badge = localize(product.badge, language) || t.badges[index % t.badges.length];

          return (
            <article className="how-product-card" key={product.id || product.slug || productName}>
              <button className="how-product-image" onClick={() => onViewProduct?.(product.slug)} type="button">
                <span>{badge}</span>
                <img className="how-product-main" src={mainImage} alt={productName} loading="lazy" />
                <img className="how-product-hover" src={hoverImage} alt="" aria-hidden="true" loading="lazy" />
              </button>
              <button className="how-product-copy" onClick={() => onViewProduct?.(product.slug)} type="button">
                <strong>{productName}</strong>
                <small>{localize(product.shortDescription, language)}</small>
                <b>
                  {firstSize.price} {t.currency}
                </b>
              </button>
            </article>
          );
        })}
      </div>
      <div className="how-products-progress" aria-hidden="true">
        <span style={{ transform: `scaleX(${Math.max(progress, 0.18)})` }} />
      </div>
    </section>
  );
}

function HowItWorksPage({ language = "en", onNavigate, onViewProduct, products = [], websiteMedia = [] }) {
  const isArabic = language === "ar";
  const t = copy[isArabic ? "ar" : "en"];
  const image = React.useCallback(
    (key) => getWebsiteMediaImage(websiteMedia, `how_it_works_${key}`, fallbackImages[key]) || fallbackImages[key],
    [websiteMedia]
  );

  return (
    <main className="how-page" dir={isArabic ? "rtl" : "ltr"}>
      <section className="how-section how-hero">
        <picture>
          <source srcSet={image("hero")} media="(min-width: 768px)" />
          <img className="how-hero-img" src={image("hero")} alt="" aria-hidden="true" />
        </picture>
        <div className="how-hero-overlay" />
        <div className="how-hero-copy">
          <span className="how-rating-badge">
            {t.badge}
            <b>{t.rating} ★</b>
          </span>
          <h1>{t.heroTitle}</h1>
          <p>{t.heroSubtitle}</p>
        </div>
      </section>

      <section className="how-section how-intro">
        <p>{t.intro}</p>
      </section>

      <StepSection image={image("concentrate")} label={t.label} steps={t.steps} title={t.concentrateTitle} />
      <StepSection image={image("refill")} label={t.label} reverse steps={t.refillSteps} title={t.refillTitle} />

      <section className="how-section how-shop-cta how-card">
        <div className="how-media">
          <img className="how-cta-img" src={image("cta")} alt="" aria-hidden="true" loading="lazy" />
        </div>
        <div className="how-dark-panel">
          <h2>{t.ctaTitle}</h2>
          <p>{t.ctaText}</p>
          <button className="how-primary-action" type="button" onClick={() => onNavigate?.("products")}>
            {t.ctaButton}
          </button>
        </div>
      </section>

      <TabsSection
        tabs={t.tabs}
        image={image("essentials")}
        subscribeButton={t.subscribeButton}
        onNavigate={onNavigate}
      />

      <HowProductCarousel language={language} onViewProduct={onViewProduct} products={products} t={t} />
    </main>
  );
}

export default HowItWorksPage;
