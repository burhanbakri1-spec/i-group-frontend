import React from "react";
import { brand } from "../data/brand.js";

const instagramUrl = "https://www.instagram.com/eb_chemical";
const facebookUrl = "https://www.facebook.com/profile.php?id=61586630773060";

function Footer({ onNavigate, t }) {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-col footer-col-newsletter">
          <div className="footer-newsletter-card">
            <h3>{t("footer.newsletterTitle")}</h3>
            <p>Follow updates, product care tips, and upcoming offers from EB Chemical.</p>
            <div className="footer-newsletter-form">
              <input aria-label="Email" placeholder={t("footer.emailPlaceholder")} />
              <button type="button">{t("footer.subscribe")}</button>
            </div>
          </div>
        </div>

        <div className="footer-col footer-col-shop">
          <h4>{t("footer.shop")}</h4>
          <p className="footer-brand-text">{t("footer.description")}</p>
          <nav>
            <button onClick={() => onNavigate("products")} type="button">{t("footer.products")}</button>
            <button type="button">Cleaning Products</button>
            <button type="button">Car Care</button>
            <button type="button">Bundles & Sets</button>
            <button type="button">Refills</button>
            <button type="button">Accessories</button>
          </nav>
        </div>

        <div className="footer-col footer-col-about">
          <h4>About</h4>
          <nav>
            <button onClick={() => onNavigate("about")} type="button">About us</button>
            <button type="button">How it Works</button>
            <button type="button">Sustainability</button>
            <button type="button">Stories</button>
            <button type="button">Careers</button>
            <button type="button">Wholesale</button>
          </nav>
        </div>

        <div className="footer-col footer-col-help">
          <h4>Help & support</h4>
          <nav>
            <button type="button">Frequently asked questions</button>
            <button type="button">Shipping Information</button>
            <button type="button">{t("footer.contact")}</button>
            <a href={`https://wa.me/${brand.whatsappLinkNumber}`}>WhatsApp</a>
            <a href={instagramUrl} rel="noopener noreferrer" target="_blank">Instagram</a>
            <a href={facebookUrl} rel="noopener noreferrer" target="_blank">Facebook</a>
            <button type="button">Terms & Conditions</button>
          </nav>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
