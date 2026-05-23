import React from "react";

const aboutImages = {
  hero: "/images/products/multi-surface-cleaner.svg",
  banner: "/images/products/car-interior-cleaner.svg",
  bottle: "/images/products/fabric-cleaner.svg",
  concentrate: "/images/products/grease-oil-remover.svg",
  material: "/images/products/car-shampoo-gloss.svg",
  cta: "/images/products/limescale-remover.svg",
  impact: "/images/products/radiator-water-green.svg",
};

function AboutPage({ language = "en", onNavigate }) {
  const isArabic = language === "ar";
  const [activeCard, setActiveCard] = React.useState(null);
  const cards = isArabic
    ? [
        {
          title: "كل عبوة",
          description:
            "صُممت عبواتنا للاستخدام اليومي المتكرر، للمساعدة في تقليل الهدر ودعم روتين تنظيف يدوم أكثر.",
          image: aboutImages.bottle,
        },
        {
          title: "التركيبات المركزة",
          description:
            "تساعد التركيبات المركزة على تقليل التغليف غير الضروري وجعل التنظيف أكثر كفاءة دون التأثير على الأداء.",
          image: aboutImages.concentrate,
        },
        {
          title: "المواد",
          description:
            "نختار المواد بعناية لدعم المتانة والعملية ونظام منتجات أكثر مسؤولية.",
          image: aboutImages.material,
        },
      ]
    : [
        {
          title: "Every Bottle",
          description:
            "Designed for repeated daily use, our bottles help reduce waste and support a longer-lasting cleaning routine.",
          image: aboutImages.bottle,
        },
        {
          title: "Concentrates",
          description:
            "Our concentrates reduce unnecessary packaging and make cleaning more efficient without compromising performance.",
          image: aboutImages.concentrate,
        },
        {
          title: "Materials",
          description:
            "We choose materials thoughtfully to support durability, practicality, and a more responsible product system.",
          image: aboutImages.material,
        },
      ];
  const stats = isArabic
    ? [
        { number: "+20", label: "منتج", description: "حلول تنظيف وعناية موثوقة" },
        { number: "+500", label: "طلب", description: "تمت إدارتها عبر نظامنا المتطور" },
        { number: "4", label: "أقسام", description: "العناية بالمنزل والسيارة والعطور والإكسسوارات" },
      ]
    : [
        { number: "20+", label: "Products", description: "Reliable cleaning and care solutions" },
        { number: "500+", label: "Orders", description: "Handled through our growing system" },
        { number: "4", label: "Categories", description: "Home care, car care, fragrance, and accessories" },
      ];

  function toggleCard(index) {
    setActiveCard((current) => (current === index ? null : index));
  }

  return (
    <main className="about-editorial-page">
      <section className="about-hero-section">
        <img alt="" aria-hidden="true" src={aboutImages.hero} />
        <div className="about-hero-copy">
          <span className="about-review-badge">{isArabic ? "EB Chemical" : "EB Chemical"}</span>
          <h1>{isArabic ? "نحن هنا لجعل التنظيف أسهل" : "We’re here to make cleaning simpler"}</h1>
          <p>
            {isArabic
              ? "منتجات تنظيف وعناية عملية للمنزل والسيارة والمساحات اليومية."
              : "Practical cleaning and care products for homes, cars, and everyday spaces."}
          </p>
        </div>
      </section>

      <section className="about-intro-section">
        <p>
          {isArabic
            ? "في EB Chemical، نطوّر منتجات تنظيف وعناية عملية للاستخدام اليومي، لتصبح العناية بالمنزل والسيارة أسهل وأنظف وأكثر فعالية."
            : "At EB Chemical, we create practical cleaning and care products for daily use, making home and car care easier, cleaner, and more effective."}
        </p>
      </section>

      <section className="about-image-banner">
        <img alt="" aria-hidden="true" src={aboutImages.banner} />
        <div>
          <h2>{isArabic ? "إعادة التفكير في التنظيف اليومي" : "Rethinking everyday cleaning"}</h2>
          <p>
            {isArabic
              ? "نطوّر منتجات للعناية بالمنزل والسيارة تناسب الروتين اليومي وتساعد العملاء في الحفاظ على مساحات نظيفة ومنعشة بجهد أقل."
              : "We design home and car care products that fit daily routines and help customers keep their spaces fresh with less effort."}
          </p>
        </div>
      </section>

      <section className="about-dark-cards-section">
        <div className="about-dark-heading">
          <h2>{isArabic ? "طريق أنظف للأمام" : "A cleaner way forward"}</h2>
          <p>
            {isArabic
              ? "ماذا لو كان التنظيف اليومي أسهل وأذكى وأكثر مسؤولية؟"
              : "What if everyday cleaning could be simpler, smarter, and more responsible?"}
          </p>
        </div>
        <div className="about-interactive-grid">
          {cards.map((card, index) => (
            <button
              className={activeCard === index ? "about-interactive-card active" : "about-interactive-card"}
              key={card.title}
              onClick={() => toggleCard(index)}
              type="button"
            >
              <img alt="" aria-hidden="true" src={card.image} />
              <span className="about-card-scrim" />
              <span className="about-card-plus" aria-hidden="true">+</span>
              <span className="about-card-title">{card.title}</span>
              <span className="about-card-details">
                <strong>{card.title}</strong>
                <em>{card.description}</em>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="about-cta-section">
        <div className="about-cta-image">
          <img alt="" aria-hidden="true" src={aboutImages.cta} />
        </div>
        <div className="about-cta-copy">
          <h2>{isArabic ? "انضم إلينا لجعل التنظيف أسهل" : "Join us in making cleaning simpler"}</h2>
          <p>
            {isArabic
              ? "منتجات عملية للعناية بالمنزل والسيارة، مصممة لتنظيف يومي أسهل وأكثر موثوقية."
              : "Practical home and car care products for easier, more reliable daily cleaning."}
          </p>
          <button className="primary-action large" onClick={() => onNavigate?.("products")} type="button">
            {isArabic ? "اكتشف المزيد" : "Discover more"}
          </button>
        </div>
      </section>

      <section className="about-impact-section">
        <div className="about-impact-head">
          <h2>{isArabic ? "الأثر" : "Impact"}</h2>
          <p>
            {isArabic
              ? "اختيارات يومية بسيطة تجعل التنظيف أسهل وأذكى وأكثر مسؤولية."
              : "Small daily choices can make cleaning simpler, smarter, and more responsible."}
          </p>
        </div>
        <div className="about-impact-media">
          <img alt="" aria-hidden="true" src={aboutImages.impact} />
          <div className="about-impact-stats">
            {stats.map((stat) => (
              <article key={stat.label}>
                <span>{stat.number}</span>
                <strong>{stat.label}</strong>
                <p>{stat.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default AboutPage;
