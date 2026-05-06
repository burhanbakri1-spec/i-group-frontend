# i-group — iCare E-Commerce Storefront

A modern, animated e-commerce storefront for the iCare brand, built with Next.js and consuming the iCare backend API. The app features a full shopping experience — product browsing, cart management, wishlist, authenticated and guest checkout, order tracking, and content discovery (vlog, FAQ, store locator).

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| UI Library | [React 19](https://react.dev/) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |
| Components | [Radix UI](https://www.radix-ui.com/) primitives |
| Animations | [Framer Motion](https://www.framer.com/motion/) |
| Charts | [Recharts](https://recharts.org/) |
| Forms | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| Icons | [Lucide React](https://lucide.dev/) |
| Language | TypeScript |

## Architecture

- **Next.js App Router** with client-side state-driven navigation — routes are not URL-based; `currentPage` state switches between views.
- **API Proxy Pattern**: All backend requests flow through `app/api/icare/[...path]/route.ts`, a server-side proxy that avoids CORS issues. The client API module (`app/icare/lib/api-client.ts`) targets `/api/icare` by default.
- **ShopContext** manages global commerce state: cart, wishlist, auth session, and catalog data.
- **Graceful degradation**: When the backend is unreachable, the app falls back to static/mock product data so the storefront remains browsable.

## Route Structure

All storefront pages live under `/icare/*`:

| Route | Description |
|---|---|
| `/icare` | Homepage — hero, featured products, new arrivals, bestsellers |
| `/icare` (shop view) | Product catalog with filters, sort, and grid controls |
| `/icare` (product view) | Product detail with variants, reviews, related products |
| `/icare` (cart drawer) | Slide-over cart with quantity stepper and checkout CTA |
| `/icare` (checkout) | Three-step flow: shipping → payment → review |
| `/icare` (account) | User profile, order history, order detail |
| `/icare` (wishlist) | Saved products |
| `/icare` (search) | Full-text search across products, categories, and brands |
| `/icare` (story) | Brand story / about page |
| `/icare` (vlog) | Video content browser |
| `/icare` (faq) | Frequently asked questions |
| `/icare` (stores) | Store locator |
| `/icare` (contact) | Contact page |

## Key Features

- **Shop**: Browse products by category and brand, with sort and filter controls
- **Cart**: Server-side cart for authenticated users; localStorage fallback for guests
- **Checkout**: Authenticated and guest checkout flows with multiple payment gateways
- **Wishlist**: Local wishlist with add/remove toggling
- **Account**: Login, register, profile view, order history, order tracking
- **Vlog**: Video content discovery with categories
- **FAQ**: Categorized question-and-answer browsing
- **Store Locator**: Physical store listings
- **Announcements**: Active promotional banners
- **Content Pages**: Dynamic content pages served from the backend

## Getting Started

### Prerequisites

- Node.js 18+
- An iCare backend instance (see [Backend Dependency](#backend-dependency))

### Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local — set NEXT_PUBLIC_ICARE_API_URL to your backend URL

# Start development server
npm run dev
```

Open [http://localhost:3000/icare](http://localhost:3000/icare) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Backend Dependency

This frontend requires the iCare backend API. Configure the backend URL via the `NEXT_PUBLIC_ICARE_API_URL` environment variable. Default fallback: `https://backend.igroup.website`.

See [`api-references.md`](./api-references.md) for the full public API reference and integration guide.

## Documentation

| File | Content |
|---|---|
| [`api-references.md`](./api-references.md) | Complete public API reference with request/response shapes and integration workflows |
| [`api-references-map.md`](./api-references-map.md) | Quick-reference navigation map for `api-references.md` |
| [`api-endpoints.md`](./api-endpoints.md) | Admin OpenAPI endpoint catalog |
| [`app/icare/CURRENT_UX.md`](./app/icare/CURRENT_UX.md) | Current UX behaviour and data-source strategy |
| [`.env.example`](./.env.example) | Environment variable template |
