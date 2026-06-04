import React, { useRef } from "react";
import { placeholderImage } from "../data/products.js";
import { getWebsiteMediaImage } from "../data/websiteMedia.js";

function getLocalized(value, language) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[language] || value.en || value.ar || "";
}

const howImages = {
  hero: "/images/products/multi-surface-cleaner.svg",
  steps: "/images/products/grease-oil-remover.svg",
  refill: "/images/products/fabric-cleaner.svg",
  cta: "/images/products/car-shampoo-gloss.svg",
  essentials: "/images/products/car-interior-cleaner.svg",
};

function StepList({ isArabic, label, title, steps }) {
  return (
    <div className="how-steps-copy">
      <p className="eyebrow">{label}</p>
      <h2>{title}</h2>
      <div className="how-step-list">
        {steps.map((step, index) => (
          <article key={step.title}>
            <span>{index + 1}</span>
            <div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function HowProductCarousel({ language, onViewProduct, products }) {
  const isArabic = language === "ar";
  const trackRef = useRef(null);
  const [progress, setProgress] = React.useState(0);
  const badges = isArabic
    ? ["عرض خاص", "الأكثر مبيعًا", "رائحة موسمية", "وفر أكثر"]
    : ["Subscribe & Save 50%", "Seasonal Scent", "Bestseller", "Offer"];
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
    const distance = card ? card.getBoundingClientRect().width + 18 : track.clientWidth * 0.8;
    track.scrollBy({ left: (isArabic ? -direction : direction) * distance, behavior: "smooth" });
  }

  if (!visibleProducts.length) return null;

  return (
    <section className="how-products-section">
      <div className="how-products-head">
        <h2>{isArabic ? "المنتجات الشائعة" : "Popular Products"}</h2>
        <div className="how-products-controls">
          <button aria-label={isArabic ? "السابق" : "Previous"} onClick={() => scrollProducts(-1)} type="button">‹</button>
          <button aria-label={isArabic ? "التالي" : "Next"} onClick={() => scrollProducts(1)} type="button">›</button>
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
          const firstSize = product.sizes?.[0] || { size: "", price: 0 };
          const badge = getLocalized(product.badge, language) || badges[index % badges.length];

          return (
            <article className="how-product-card" key={product.id}>
              <button className="how-product-image" onClick={() => onViewProduct(product.slug)} type="button">
                <span>{badge}</span>
                <img
                  alt={getLocalized(product.name, language)}
                  className="how-product-main"
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.src = product.fallbackImage || placeholderImage;
                  }}
                  src={mainImage}
                />
                <img
                  aria-hidden="true"
                  alt=""
                  className="how-product-hover"
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                  src={hoverImage}
                />
              </button>
              <button className="how-product-copy" onClick={() => onViewProduct(product.slug)} type="button">
                <strong>{getLocalized(product.name, language)}</strong>
                <small>{getLocalized(product.shortDescription, language)}</small>
                <b>{firstSize.price} {isArabic ? "شيكل" : "ILS"}</b>
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

function HowItWorksPage({
  language = "en",
  onNavigate,
  onViewProduct,
  products = [],
  websiteMedia = [],
}) {
  const isArabic = language === "ar";
  const images = {
    hero: getWebsiteMediaImage(websiteMedia, "how_it_works_hero", howImages.hero),
    steps: getWebsiteMediaImage(websiteMedia, "how_it_works_steps", howImages.steps),
    refill: getWebsiteMediaImage(websiteMedia, "how_it_works_refill", howImages.refill),
    cta: getWebsiteMediaImage(websiteMedia, "how_it_works_cta", howImages.cta),
    essentials: getWebsiteMediaImage(websiteMedia, "how_it_works_essentials", howImages.essentials),
  };
  const label = isArabic ? "كيف يعمل" : "How it works";
  const firstSteps = isArabic
    ? [
        { title: "اختر", text: "اختر المنتج المناسب للمنزل أو السيارة." },
        { title: "استخدم", text: "استخدمه مباشرة أو خففه حسب الإرشادات." },
        { title: "نظّف", text: "احصل على نتيجة نظيفة ومنعشة بجهد أقل." },
      ]
    : [
        { title: "Choose", text: "Pick the right product for your home or car." },
        { title: "Apply", text: "Use it directly or dilute it as recommended." },
        { title: "Clean", text: "Enjoy a fresh, clean result with less effort." },
      ];
  const refillSteps = isArabic
    ? [
        { title: "عبّئ", text: "اسكب المنتج داخل العبوة." },
        { title: "ابدأ", text: "استخدمه مباشرة واجعل روتينك أبسط." },
      ]
    : [
        { title: "Refill", text: "Pour the product into the bottle." },
        { title: "Start", text: "Use it directly and keep your routine simple." },
      ];
  const accordionItems = isArabic
    ? ["اختر منتجاتك", "أكمل طلبك", "استمتع بروتين أنظف"]
    : ["Pick your products", "Complete your order", "Enjoy a cleaner routine"];

  return (
    <main className="how-page">
      <section className="how-hero">
        <img alt="" aria-hidden="true" src={images.hero} />
        <div className="how-hero-copy">
          <span className="how-rating-badge">
            {isArabic ? "أكثر من 500 طلب من عملاء سعداء" : "Over 500+ orders from happy customers"}
            <b>4.85 ★</b>
          </span>
          <h1>{isArabic ? "كيف يعمل" : "How it works"}</h1>
          <p>{isArabic ? "اختر المنتج المناسب، ونظّف بثقة كل يوم." : "Choose the product once, clean with confidence every day."}</p>
        </div>
      </section>

      <section className="how-large-title">
        <h2>{isArabic ? "تنظيف بسيط يناسب روتينك اليومي." : "Simple cleaning, made for everyday routines."}</h2>
      </section>

      <section className="how-split-section">
        <StepList
          isArabic={isArabic}
          label={label}
          title={isArabic ? "التركيز والاستخدام" : "Concentrate"}
          steps={firstSteps}
        />
        <div className="how-image-panel">
          <img alt="" aria-hidden="true" src={images.steps} />
        </div>
      </section>

      <section className="how-split-section reverse">
        <div className="how-image-panel">
          <img alt="" aria-hidden="true" src={images.refill} />
        </div>
        <StepList
          isArabic={isArabic}
          label={label}
          title={isArabic ? "عبّئ واستخدم" : "Refill & Use"}
          steps={refillSteps}
        />
      </section>

      <section className="how-cta-split">
        <div className="how-dark-panel">
          <h2>{isArabic ? "جاهز لعناية يومية أنظف؟" : "Ready for cleaner everyday care?"}</h2>
          <p>{isArabic ? "اكتشف منتجات EB Chemical المصممة لروتين المنزل والسيارة." : "Explore EB Chemical products designed for home and car routines."}</p>
          <button className="primary-action large" onClick={() => onNavigate("products")} type="button">
            {isArabic ? "تسوق الآن" : "Shop now"}
          </button>
        </div>
        <div className="how-cta-image">
          <img alt="" aria-hidden="true" src={images.cta} />
        </div>
      </section>

      <section className="how-essentials-section">
        <div className="how-cta-image">
          <img alt="" aria-hidden="true" src={images.essentials} />
        </div>
        <div className="how-essentials-copy">
          <h2>{isArabic ? "اختر أساسياتك" : "Pick your essentials"}</h2>
          <p>{isArabic ? "اختر المنتجات التي تحتاجها، أضفها إلى السلة، وأكمل طلبك بسهولة." : "Choose the products you need, add them to your cart, and complete your order easily."}</p>
          <div className="how-accordion-list">
            {accordionItems.map((item, index) => (
              <button key={item} type="button">
                <span>{index + 1}</span>
                {item}
              </button>
            ))}
          </div>
          <button className="primary-action large" onClick={() => onNavigate("products")} type="button">
            {isArabic ? "ابدأ التسوق" : "Start shopping"}
          </button>
        </div>
      </section>

      <HowProductCarousel language={language} onViewProduct={onViewProduct} products={products} />
    </main>
  );
}

export default HowItWorksPage;
