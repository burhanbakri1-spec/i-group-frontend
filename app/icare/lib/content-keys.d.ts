// Auto-generated registry of ContentProvider keys consumed by the iCare FE.
// Mirrors the keys registered by NestJS modules via ContentRegistryService.register()
// in e-commerce-backend/src (HeroService, PagesService, etc.).
//
// Adding a key here without a matching BE registration will surface a 404 warning
// in dev mode but won't break the build. Adding a key on the BE without adding it
// here will compile but lose type-safety on `useContent('new.key', ...)`.
export interface ContentKeys {
  // Homepage hero
  'home.hero.headline': { type: 'text'; locales: ['en', 'ar'] };
  'home.hero.image': { type: 'image' };
  'home.commitment.image': { type: 'image' };

  // Homepage — social grid
  'home.social.heading': { type: 'text'; locales: ['en', 'ar'] };
  'home.social.cta': { type: 'text'; locales: ['en', 'ar'] };
  'home.social.image1': { type: 'image' };
  'home.social.image2': { type: 'image' };
  'home.social.image3': { type: 'image' };
  'home.social.image4': { type: 'image' };

  // Homepage — promo
  'home.promo.badge': { type: 'text'; locales: ['en', 'ar'] };
  'home.promo.headline': { type: 'text'; locales: ['en', 'ar'] };
  'home.promo.description': { type: 'text'; locales: ['en', 'ar'] };
  'home.promo.cta': { type: 'text'; locales: ['en', 'ar'] };
  'home.promo.image': { type: 'image' };

  // Homepage — philosophy
  'home.philosophy.headline': { type: 'text'; locales: ['en', 'ar'] };
  'home.philosophy.text': { type: 'text'; locales: ['en', 'ar'] };
  'home.philosophy.cta': { type: 'text'; locales: ['en', 'ar'] };
  'home.philosophy.image': { type: 'image' };

  // Homepage — trending + marquee
  'home.trending.title': { type: 'text'; locales: ['en', 'ar'] };
  'home.marquee.text': { type: 'text'; locales: ['en', 'ar'] };

  // Homepage — product showcase states
  'home.showcase.loading': { type: 'text'; locales: ['en', 'ar'] };
  'home.showcase.empty': { type: 'text'; locales: ['en', 'ar'] };

  // Homepage — commitment items (mission / philanthropy / sustainability)
  'home.commitment.mission.title': { type: 'text'; locales: ['en', 'ar'] };
  'home.commitment.mission.detail': { type: 'text'; locales: ['en', 'ar'] };
  'home.commitment.mission.cta': { type: 'text'; locales: ['en', 'ar'] };
  'home.commitment.philanthropy.title': { type: 'text'; locales: ['en', 'ar'] };
  'home.commitment.philanthropy.detail': { type: 'text'; locales: ['en', 'ar'] };
  'home.commitment.philanthropy.cta': { type: 'text'; locales: ['en', 'ar'] };
  'home.commitment.sustainability.title': { type: 'text'; locales: ['en', 'ar'] };
  'home.commitment.sustainability.detail': { type: 'text'; locales: ['en', 'ar'] };
  'home.commitment.sustainability.cta': { type: 'text'; locales: ['en', 'ar'] };

  // About page
  'about.hero.headline': { type: 'text'; locales: ['en', 'ar'] };
  'about.hero.cta': { type: 'text'; locales: ['en', 'ar'] };
  'about.hero.image': { type: 'image' };
  'about.intentional.image': { type: 'image' };
  'about.foundation.image': { type: 'image' };
  'about.values.image': { type: 'image' };
  'about.team.member1.name': { type: 'text'; locales: ['en', 'ar'] };
  'about.team.member1.title': { type: 'text'; locales: ['en', 'ar'] };
  'about.team.member1.image': { type: 'image' };
  'about.team.member2.name': { type: 'text'; locales: ['en', 'ar'] };
  'about.team.member2.title': { type: 'text'; locales: ['en', 'ar'] };
  'about.team.member2.image': { type: 'image' };
  'about.team.member3.name': { type: 'text'; locales: ['en', 'ar'] };
  'about.team.member3.title': { type: 'text'; locales: ['en', 'ar'] };
  'about.team.member3.image': { type: 'image' };
  'about.founder.signature.image': { type: 'image' };

  // About — values accordion (3 items)
  // No dedicated ContentProvider keys — components fall back to translations.ts.

  // Contact page
  'contact.email': { type: 'text'; locales: ['en', 'ar'] };
  'contact.hero.heading': { type: 'text'; locales: ['en', 'ar'] };
  'contact.hero.image': { type: 'image' };
  'contact.info.title': { type: 'text'; locales: ['en', 'ar'] };
  'contact.support.info': { type: 'text'; locales: ['en', 'ar'] };
  'contact.email.label': { type: 'text'; locales: ['en', 'ar'] };
  'contact.wholesale.email': { type: 'text'; locales: ['en', 'ar'] };
  'contact.wholesale.label': { type: 'text'; locales: ['en', 'ar'] };
  'contact.faq.title': { type: 'text'; locales: ['en', 'ar'] };
  'contact.faq.text': { type: 'text'; locales: ['en', 'ar'] };
  'contact.faq.cta': { type: 'text'; locales: ['en', 'ar'] };
  'contact.support.hours': { type: 'text'; locales: ['en', 'ar'] };

  // Shipping
  'shipping.rates': { type: 'text'; locales: ['en', 'ar'] };
  'shipping.free.threshold': { type: 'text'; locales: ['en', 'ar'] };

  // Auth (account page)
  'auth.heading.login': { type: 'text'; locales: ['en', 'ar'] };
  'auth.heading.signup': { type: 'text'; locales: ['en', 'ar'] };
  'auth.heading.account': { type: 'text'; locales: ['en', 'ar'] };
  'auth.signed.in.as': { type: 'text'; locales: ['en', 'ar'] };
  'auth.sign.out': { type: 'text'; locales: ['en', 'ar'] };
  'auth.placeholder.name': { type: 'text'; locales: ['en', 'ar'] };
  'auth.placeholder.email': { type: 'text'; locales: ['en', 'ar'] };
  'auth.placeholder.password': { type: 'text'; locales: ['en', 'ar'] };
  'auth.placeholder.phone': { type: 'text'; locales: ['en', 'ar'] };
  'auth.submit.login': { type: 'text'; locales: ['en', 'ar'] };
  'auth.submit.signup': { type: 'text'; locales: ['en', 'ar'] };
  'auth.toggle.to.register': { type: 'text'; locales: ['en', 'ar'] };
  'auth.toggle.to.login': { type: 'text'; locales: ['en', 'ar'] };
  'auth.login.tagline': { type: 'text'; locales: ['en', 'ar'] };
  'account.login.image': { type: 'image' };

  // Search
  'search.placeholder': { type: 'text'; locales: ['en', 'ar'] };
  'search.drawer.title': { type: 'text'; locales: ['en', 'ar'] };
  'search.no.results': { type: 'text'; locales: ['en', 'ar'] };
  'search.collections.heading': { type: 'text'; locales: ['en', 'ar'] };
  'search.products.heading': { type: 'text'; locales: ['en', 'ar'] };
  'search.brands.heading': { type: 'text'; locales: ['en', 'ar'] };
  'search.collections.unavailable': { type: 'text'; locales: ['en', 'ar'] };

  // Cart
  'cart.empty.drawer': { type: 'text'; locales: ['en', 'ar'] };
  'cart.continue.shopping': { type: 'text'; locales: ['en', 'ar'] };
  'cart.shipping.disclaimer': { type: 'text'; locales: ['en', 'ar'] };
  'cart.shipping.unlocked.text': { type: 'text'; locales: ['en', 'ar'] };
  'cart.checkout.label': { type: 'text'; locales: ['en', 'ar'] };
  'cart.bag.label': { type: 'text'; locales: ['en', 'ar'] };

  // Checkout
  'checkout.heading': { type: 'text'; locales: ['en', 'ar'] };
  'checkout.shipping.heading': { type: 'text'; locales: ['en', 'ar'] };
  'checkout.payment.heading': { type: 'text'; locales: ['en', 'ar'] };
  'checkout.card.label': { type: 'text'; locales: ['en', 'ar'] };
  'checkout.paypal.label': { type: 'text'; locales: ['en', 'ar'] };
  'checkout.cod.label': { type: 'text'; locales: ['en', 'ar'] };
  'checkout.review.heading': { type: 'text'; locales: ['en', 'ar'] };
  'checkout.terms.text': { type: 'text'; locales: ['en', 'ar'] };
  'checkout.confirmed.heading': { type: 'text'; locales: ['en', 'ar'] };
  'checkout.confirmed.message': { type: 'text'; locales: ['en', 'ar'] };
  'checkout.place.order': { type: 'text'; locales: ['en', 'ar'] };
  'checkout.submitting.text': { type: 'text'; locales: ['en', 'ar'] };
  'checkout.back.to.shop': { type: 'text'; locales: ['en', 'ar'] };
  'checkout.nav.back': { type: 'text'; locales: ['en', 'ar'] };
  'checkout.nav.continue': { type: 'text'; locales: ['en', 'ar'] };
  'checkout.tax.rate': { type: 'text'; locales: ['en', 'ar'] };
  'checkout.shipping.rates': { type: 'text'; locales: ['en', 'ar'] };

  // Wishlist
  'wishlist.empty': { type: 'text'; locales: ['en', 'ar'] };
  'wishlist.empty.subtext': { type: 'text'; locales: ['en', 'ar'] };
  'wishlist.recommendations.title': { type: 'text'; locales: ['en', 'ar'] };

  // Footer (22 keys — newsletter, copyright, columns, links)
  'footer.newsletter.text': { type: 'text'; locales: ['en', 'ar'] };
  'footer.newsletter.subtitle': { type: 'text'; locales: ['en', 'ar'] };
  'footer.email.placeholder': { type: 'text'; locales: ['en', 'ar'] };
  'footer.subscribe.btn': { type: 'text'; locales: ['en', 'ar'] };
  'footer.privacy.notice': { type: 'text'; locales: ['en', 'ar'] };
  'footer.copyright': { type: 'text'; locales: ['en', 'ar'] };
  'footer.country.region': { type: 'text'; locales: ['en', 'ar'] };
  'footer.columns.title.navigate': { type: 'text'; locales: ['en', 'ar'] };
  'footer.columns.title.social': { type: 'text'; locales: ['en', 'ar'] };
  'footer.columns.title.official': { type: 'text'; locales: ['en', 'ar'] };
  'footer.columns.title.support': { type: 'text'; locales: ['en', 'ar'] };
  'footer.support.subtext': { type: 'text'; locales: ['en', 'ar'] };
  'footer.cookie.link': { type: 'text'; locales: ['en', 'ar'] };
  'footer.link.shop': { type: 'text'; locales: ['en', 'ar'] };
  'footer.link.story': { type: 'text'; locales: ['en', 'ar'] };
  'footer.link.vlog': { type: 'text'; locales: ['en', 'ar'] };
  'footer.link.find.us': { type: 'text'; locales: ['en', 'ar'] };
  'footer.link.privacy': { type: 'text'; locales: ['en', 'ar'] };
  'footer.link.terms': { type: 'text'; locales: ['en', 'ar'] };
  'footer.link.accessibility': { type: 'text'; locales: ['en', 'ar'] };
  'footer.link.faq': { type: 'text'; locales: ['en', 'ar'] };
  'footer.link.contact': { type: 'text'; locales: ['en', 'ar'] };

  // Marketing — announcement bar, store locator, site identity
  'marketing.announcement.text': { type: 'text'; locales: ['en', 'ar'] };
  'marketing.store.locator.tagline': { type: 'text'; locales: ['en', 'ar'] };
  'marketing.store.locator.no.results': { type: 'text'; locales: ['en', 'ar'] };
  'marketing.store.locator.map.image': { type: 'image' };
  'marketing.site.name': { type: 'text'; locales: ['en', 'ar'] };

  // Page hero images (added in spec 003 wiring)
  'home.faq.image': { type: 'image' };
  'home.shop.image': { type: 'image' };
  'vlog.hero.image': { type: 'image' };
  'home.our-story.image': { type: 'image' };
  'home.story.image': { type: 'image' };
}