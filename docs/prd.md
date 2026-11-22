# phoneX — Product Requirements Document

**Version:** 1.0  
**Date:** November 2026  
**Stack:** Next.js 16 · Tailwind v4 · Zustand · Razorpay · Cloudinary · Render (backend)  
**Base URL:** `https://phonex-be.onrender.com/api/v1`  
**Frontend:** `http://localhost:3000`

---

## 1. Product Overview

phoneX is a D2C e-commerce platform selling precision-cut vinyl skins for phones, tablets and laptops. Customers browse a catalogue of designs, select their exact device model, and check out. They can also upload custom artwork to generate a bespoke skin. An admin panel manages orders, inventory, products, devices, categories and coupons.

---

## 2. User Roles

| Role | Description |
|---|---|
| **Guest** | Browses catalogue, adds to cart (local), checks out as guest |
| **Customer** | Registered user — saves designs, tracks orders, manages addresses |
| **Admin** | Full admin panel access (products, orders, devices, coupons, reviews, users) |
| **Super Admin** | Admin + can change user roles |

---

## 3. Core Modules

### 3.1 Authentication

| ID | Feature | Acceptance Criteria |
|---|---|---|
| AUTH-01 | Sign up | Email + password + name. Minimum password 6 chars. Duplicate email returns 400. |
| AUTH-02 | Sign in | Valid credentials → JWT stored in localStorage. Invalid → error toast. |
| AUTH-03 | Sign out | Clears token, cart synced to server, redirect to home. |
| AUTH-04 | Forgot password | Email submitted → success message shown regardless of whether email exists. |
| AUTH-05 | Token refresh | Expired access token automatically refreshed using refresh token. |
| AUTH-06 | Admin login | `/admin/login` — only ADMIN or SUPER_ADMIN roles granted access. Customer credentials rejected with toast. |
| AUTH-07 | Admin guard | Visiting any `/admin/*` route without valid admin session redirects to `/admin/login`. |

---

### 3.2 Navigation & Layout

| ID | Feature | Acceptance Criteria |
|---|---|---|
| NAV-01 | Navbar | Sticky. Contains logo, Shop, Phones, Tablets, Laptops, Designs, Customize, New, Offers. |
| NAV-02 | Sign in button | Shown when logged out. Direct link to `/login`. Hidden when logged in; user icon shown instead. |
| NAV-03 | Wishlist icon | Shows count badge. Navigates to `/wishlist`. |
| NAV-04 | Cart icon | Shows item count badge. Navigates to `/cart`. |
| NAV-05 | Coupon marquee | Announcement bar scrolls live coupons from `GET /coupons`. Falls back to static text if API unavailable. |
| NAV-06 | Search | Opens search dialog. Results include devices, brands, categories and skins. |

---

### 3.3 Homepage

| ID | Feature | Acceptance Criteria |
|---|---|---|
| HOME-01 | Hero | Dark section with orbital phone animation. CTA "Find My Device" scrolls to device finder. |
| HOME-02 | Device finder | Search bar + brand/model dropdowns. Selecting a model shows skin count and "Browse Skins" button. |
| HOME-03 | Category strip | Loads from `GET /categories`. Shows image (imageUrl field) or generated artwork fallback. |
| HOME-04 | Featured products | 8 featured skins displayed. |
| HOME-05 | Custom banner | "Can't find it? Design it." — links to `/customize`. |
| HOME-06 | Popular devices | 3 device cards (iPhone 17 Pro, Samsung S26 Ultra, MacBook Air M4). |
| HOME-07 | New arrivals | 4 newest skins. |
| HOME-08 | Coupons sidebar | Live coupons from `GET /coupons`. Copy-to-clipboard button on each. |

---

### 3.4 Device Catalogue

| ID | Feature | Acceptance Criteria |
|---|---|---|
| DEV-01 | `/devices` | Lists all brands (pills), then Phone / Tablet / Laptop sections with device cards. |
| DEV-02 | `/devices/phones` | Filtered list of phone models. |
| DEV-03 | `/devices/tablets` | Filtered list of tablet models. Returns correct page (not 404). |
| DEV-04 | `/devices/laptops` | Filtered list of laptop models. |
| DEV-05 | `/devices/[brand]` | All models for a brand, grouped by type. |
| DEV-06 | `/devices/[brand]/[model]` | Product page for specific model — shows compatible skins, buy panel, gallery. |
| DEV-07 | Glassmorphic dropdown | Custom brand + model dropdowns with inline search, no native `<select>`. |

---

### 3.5 Shop & Product Pages

| ID | Feature | Acceptance Criteria |
|---|---|---|
| SHOP-01 | `/shop` | Paginated skin catalogue. Filterable by category, material, finish, price, rating, in-stock. Sortable. |
| SHOP-02 | Product card | Shows image/artwork, name, price, rating, sale badge, wishlist heart. |
| SHOP-03 | `/products/[slug]` | Full product detail — gallery, finish selector, add to cart. |
| SHOP-04 | Sale badge | Shows `−X%` if discountPct > 0. |
| SHOP-05 | Price display | Tabular numerals. Shows original price struck through when discounted. |

---

### 3.6 Custom Skin Studio

| ID | Feature | Acceptance Criteria |
|---|---|---|
| CUST-01 | `/customize` | Landing page — product list (mobile skin, laptop skin, photo case, metal case), how-it-works, tips. |
| CUST-02 | `/customize/phone-skin` | Loads full studio. Device picker → artwork upload → finish selector → preview. |
| CUST-03 | `/customize/laptop-skin` | Same studio, pre-scoped to laptops. |
| CUST-04 | Mockup preview | Uploaded artwork composited onto `customize.png` phone case mockup in real time. |
| CUST-05 | Save design | Saves to Zustand + localStorage. Accessible under Account → Saved designs. |
| CUST-06 | Add custom to cart | Custom skin added as a cart item with artwork data URL. |

---

### 3.7 Cart & Checkout

| ID | Feature | Acceptance Criteria |
|---|---|---|
| CART-01 | Add to cart | POST `/cart/items`. Optimistic update. Quantity badge updates immediately. |
| CART-02 | Update quantity | PATCH `/cart/items/:id`. Min 1. |
| CART-03 | Remove item | DELETE `/cart/items/:id`. |
| CART-04 | Coupon apply | Validates against `POST /coupons/validate`. Shows discount and free shipping if applicable. |
| CART-05 | Free shipping bar | Progress bar showing spend toward ₹999 free shipping threshold. |
| CART-06 | Checkout | Requires login. Saves/selects address, creates order, opens Razorpay. |
| CART-07 | Razorpay payment | On success, verifies signature. Order confirmed and cart cleared. |
| CART-08 | Address creation | New address saved to backend via `POST /addresses`. Requires `name` and `fullName` fields. |

---

### 3.8 Account

| ID | Feature | Acceptance Criteria |
|---|---|---|
| ACC-01 | Profile | View/edit name, email, phone. |
| ACC-02 | Addresses | Add, view, delete addresses. First address auto-set as default. |
| ACC-03 | Orders | List of past orders. |
| ACC-04 | Order detail | Status timeline, items, shipping address, payment status. |
| ACC-05 | Saved designs | Custom studio designs saved locally. Can re-open in studio or add to cart. |
| ACC-06 | Wishlist | `/wishlist` page shows all hearted skins. |

---

### 3.9 Admin Panel

All admin routes require ADMIN or SUPER_ADMIN role. Unauthenticated access redirects to `/admin/login`.

| ID | Page | Key Features |
|---|---|---|
| ADM-01 | Dashboard | KPI cards (revenue, orders, customers, products), sales bar chart, order status donut, recent orders, top products. |
| ADM-02 | Orders | Paginated order list, status filter chips, inline status update modal. |
| ADM-03 | Products | List from `GET /products`. Create/edit (name, description, category, images via Cloudinary upload). Expandable variants sub-table per product. Add variant (device model picker, SKU, price, stock). |
| ADM-04 | Inventory | All variants with inline stock edit. Low-stock rows highlighted amber/red. |
| ADM-05 | Devices | Brands paginated 8/page. Type filter (All/Phone/Tablet/Laptop). Expandable model tables. Full CRUD for brands and models. |
| ADM-06 | Categories | List from `GET /categories`. Create/edit/delete via `/admin/categories`. imageUrl field. Live image preview in form. |
| ADM-07 | Coupons | List from `GET /admin/coupons`. Create with correct fields: `discountType`, `discountValue`, `validFrom`, `validUntil`. |
| ADM-08 | Reviews | Pending reviews from `GET /admin/reviews/pending`. Approve (`PATCH /admin/reviews/:id/approve`) or reject. |
| ADM-09 | Users | Paginated list. Activate/deactivate. Pagination reads from `{ data: [], pagination: {} }` response shape. |
| ADM-10 | Analytics | Sales bar chart (14 days), customer signup chart, top products table. |
| ADM-11 | Design system | `/admin/design` — live color tokens, typography scale, spacing, components. |

---

## 4. API Endpoints Reference

### Public
```
GET  /categories                      List active categories
GET  /categories/:slug                Category by slug
GET  /coupons                         Active coupons (public)
GET  /products                        Paginated product list
GET  /products/:slug                  Product detail
GET  /devices/brands                  All brands
GET  /devices/brands/:slug/models     Models for a brand
GET  /variants/skins/:brand/:model    Skins for a device model
```

### Auth (no token)
```
POST /auth/register
POST /auth/login
POST /auth/refresh-token
POST /auth/forgot-password
POST /auth/reset-password
```

### Customer (Bearer token)
```
GET/POST     /cart/items
PATCH/DELETE /cart/items/:id
GET/POST     /addresses
PUT/DELETE   /addresses/:id
PATCH        /addresses/:id/default
POST         /orders/checkout
GET          /orders
GET          /orders/:id
POST         /payments/create
POST         /payments/verify
GET/POST     /wishlist
DELETE       /wishlist/:id
```

### Admin (Bearer token, ADMIN role)
```
GET    /admin/dashboard
GET    /admin/orders
PATCH  /admin/orders/:id/status
POST   /admin/products
PUT    /admin/products/:id
POST   /admin/products/:id/images
POST   /admin/variants
PUT    /admin/variants/:id
GET    /admin/inventory
PATCH  /admin/inventory/:variantId
POST   /admin/devices/brands
PUT    /admin/devices/brands/:id
DELETE /admin/devices/brands/:id
POST   /admin/devices/models
PUT    /admin/devices/models/:id
DELETE /admin/devices/models/:id
POST   /admin/categories
PUT    /admin/categories/:id
DELETE /admin/categories/:id
GET    /admin/coupons
POST   /admin/coupons
GET    /admin/reviews/pending
PATCH  /admin/reviews/:id/approve
PATCH  /admin/reviews/:id/reject
GET    /admin/users
PATCH  /admin/users/:id/status
PATCH  /admin/users/:id/role
GET    /admin/analytics/orders
GET    /admin/analytics/sales
GET    /admin/analytics/products
GET    /admin/analytics/customers
```

### Upload (Bearer token, ADMIN role)
```
POST /upload/single?folder=products      field: image
POST /upload/multiple?folder=products    field: images (up to 10)
```

---

## 5. Non-Functional Requirements

| Area | Requirement |
|---|---|
| Performance | LCP < 2.5s. Static pages pre-rendered. API calls use `next: { revalidate: 300 }` where applicable. |
| Accessibility | Keyboard navigable. Focus ring on all interactive elements (2px, 2px offset). Min tap target 44px. ARIA labels on icon-only buttons. |
| Reduced motion | All animations disabled under `prefers-reduced-motion: reduce`. |
| Responsive | Mobile-first. Works at 375px, 768px, 1280px. |
| Auth security | JWT in localStorage + cookie mirror for middleware. Refresh token rotation. Admin role checked server-side. |
| Images | All external images allowed via `next.config.ts` `hostname: "**"`. |
| Error handling | API errors show toast. Forms show inline field errors. Network failures show retry state. |

---

## 6. Known Constraints

- `/customize/[type]` sub-routes load the full studio — product types (photo case, metal case) are not yet differentiated in the UI
- Static local skins catalog (`src/lib/data/skins.ts`) is not yet replaced by live API products
- `customize.png` mockup has a white background; a transparent version would improve the studio preview quality
- The `request-model` route linked from the customize page does not yet exist
