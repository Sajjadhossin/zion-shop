# 🛍️ Zion Shop — Complete Project Plan

> **Modern White-Label Fashion E-commerce Platform for Bangladesh**
> Built with Next.js 15, designed to be sold to fashion retailers as a complete, ready-to-deploy solution.

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack (Final)](#2-tech-stack-final)
3. [Core Features (v1.0)](#3-core-features-v10)
4. [Database Schema Plan](#4-database-schema-plan)
5. [Phase-by-Phase Task Plan](#5-phase-by-phase-task-plan)
6. [Page-by-Page UI Plan](#6-page-by-page-ui-plan)
7. [Payment Integration Plan](#7-payment-integration-plan)
8. [Claude Prompts Cheat-Sheet](#8-claude-prompts-cheat-sheet)
9. [Testing Checklist](#9-testing-checklist)
10. [Deployment Guide](#10-deployment-guide)
11. [White-Label Sales Kit](#11-white-label-sales-kit)
12. [Risk & Mitigation](#12-risk--mitigation)

---

## 1. Project Overview

### Vision
Build a **modern, eye-catching, conversion-focused fashion e-commerce platform** that I can sell as a white-label product to fashion retailers in Bangladesh.

### Project Name
**Zion Shop** (demo store name; customers can rebrand)

### Target Market for the Product
Small-to-medium fashion retailers in Bangladesh who want:
- A professional online store
- Local payment methods (bKash, SSLCommerz, COD)
- No monthly Shopify fees
- Full ownership of their code

### Target Launch Date
**Before Eid 2026** — quality first, no rushed launch.

### Design Direction
- **Modern, minimalist, eye-catching**
- Inspired by: Aarong's elegance + Daraz's filtering + Amazon's product detail UX
- Mobile-first (70% of BD shoppers are on mobile)
- Fast-loading product images (critical for fashion conversion)
- Smooth animations (subtle, professional — not flashy)

### Working Setup
- **Developer:** Sajjad (solo)
- **AI Pair:** Claude
- **Hours/Week:** 5–10 hours (weekends only)
- **Total estimated dev time:** 16–20 weeks (4–5 months)

---

## 2. Tech Stack (Final)

| Layer | Choice | Why |
|-------|--------|-----|
| **Framework** | Next.js 15 (App Router) | SEO + React 19 + stable LTS |
| **Language** | TypeScript | Type safety = fewer bugs |
| **Styling** | Tailwind CSS v4 | Fast utility-first CSS |
| **Components** | shadcn/ui | Modern, customizable, copy-paste |
| **Database** | Supabase (PostgreSQL) | Built-in Auth + Storage + Free tier |
| **ORM** | Prisma | Type-safe queries, you already know it |
| **Auth** | Supabase Auth | Email/password + Google login |
| **File Storage** | Cloudinary | CDN + image optimization for product photos |
| **Forms** | React Hook Form + Zod | Validation + performance |
| **State (cart)** | Zustand | Lightweight, perfect for cart |
| **Animations** | Framer Motion | Smooth product transitions |
| **Payments** | bKash API + SSLCommerz | BD market coverage |
| **Email** | Resend | Order confirmations (free 3k/month) |
| **Hosting** | Vercel | Free tier, one-click deploy |
| **Version Control** | GitHub | Code backup + portfolio |

### Why NOT These (For Reference)
- ❌ MongoDB → relational data fits e-commerce better
- ❌ Redux → overkill for this size
- ❌ Bootstrap → Tailwind is more modern
- ❌ Stripe (only) → BD customers need bKash
- ❌ cPanel hosting → doesn't support Node.js

---

## 3. Core Features (v1.0)

### 🛒 Customer-Facing Features (MUST-HAVE)
- [x] Product catalog with filters (gender, category, size, color, price)
- [x] Product detail page (image gallery, variant selection, size guide)
- [x] Shopping cart (add/remove/update quantity)
- [x] Wishlist (save products for later)
- [x] User authentication (sign up, login, password reset)
- [x] Customer dashboard (orders, addresses, profile)
- [x] Checkout flow with address management
- [x] **Payment: bKash + SSLCommerz + Cash on Delivery**
- [x] Order confirmation page
- [x] Order tracking (status updates)
- [x] Product reviews & ratings
- [x] Search functionality
- [x] Mobile-responsive design

### 🔧 Admin Features (MUST-HAVE)
- [x] Admin login (separate from customer)
- [x] Product management (CRUD with images, variants)
- [x] Category management
- [x] Order management (view, update status, mark shipped)
- [x] Customer management
- [x] **Analytics dashboard** (revenue, orders, top products)
- [x] Inventory tracking
- [x] Coupon/discount management

### ⏳ v2.0 Features (LATER — Don't Build Now)
- Email notifications (Resend integration)
- Multi-language (Bengali/English toggle)
- Live chat support
- Advanced analytics (cohort analysis, etc.)
- Mobile app (React Native)
- Multi-vendor marketplace
- Loyalty program

---

## 4. Database Schema Plan

> Note: This is a conceptual plan. Actual `schema.prisma` will be written in Phase 2.

### Core Tables

```
👤 User
   - id, email, password (hashed), name, phone, role (CUSTOMER/ADMIN)
   - createdAt, updatedAt

📍 Address
   - id, userId, fullName, phone, addressLine, city, district, postalCode
   - isDefault (boolean)

📦 Product
   - id, name, slug, description, basePrice, gender (MEN/WOMEN/UNISEX)
   - categoryId, brand, isActive, isFeatured
   - createdAt, updatedAt

🎨 ProductVariant
   - id, productId, size (XS/S/M/L/XL/XXL), color, sku, stock, price
   - (Each shirt color+size = 1 variant)

🖼️ ProductImage
   - id, productId, url (Cloudinary), order, alt

📁 Category
   - id, name, slug, parentId (for sub-categories), gender
   - Examples: Men > Shirts, Women > Three-Piece, etc.

⭐ Review
   - id, productId, userId, rating (1-5), comment, createdAt

❤️ Wishlist
   - id, userId, productId, createdAt

🛒 Cart (or stored in session/localStorage)
   - userId, items (JSON or separate CartItem table)

🛒 CartItem
   - id, cartId, productVariantId, quantity

📦 Order
   - id, userId, orderNumber (e.g., ZION-001234)
   - subtotal, shippingFee, discount, total
   - paymentMethod (BKASH/SSLCOMMERZ/COD)
   - paymentStatus (PENDING/PAID/FAILED/REFUNDED)
   - orderStatus (PLACED/CONFIRMED/PACKED/SHIPPED/DELIVERED/CANCELLED)
   - shippingAddressId, createdAt

📦 OrderItem
   - id, orderId, productVariantId, quantity, priceAtPurchase

💳 Payment
   - id, orderId, method, transactionId, amount, status, gatewayResponse (JSON)

🎟️ Coupon
   - id, code, discountType (PERCENTAGE/FIXED), discountValue
   - minOrderAmount, maxDiscount, usageLimit, usedCount, expiresAt

📊 StoreSettings (for white-label customization)
   - id, storeName, logoUrl, primaryColor, secondaryColor
   - contactEmail, contactPhone, address
   - facebookUrl, instagramUrl, etc.
```

### Relationships
- `User` → `Address[]`, `Order[]`, `Review[]`, `Wishlist[]`
- `Product` → `ProductVariant[]`, `ProductImage[]`, `Review[]`
- `Order` → `OrderItem[]`, `Payment`, `Address`

---

## 5. Phase-by-Phase Task Plan

> **Total Duration:** 16-20 weeks (working 5-10 hrs/week on weekends)
> **Strategy:** Build incrementally. Each phase produces something working.

---

### 🏁 PHASE 0: Setup & Planning (Week 1) — ~8 hours

**Goal:** Get all tools ready and project initialized.

- [ ] Create GitHub repository: `zion-shop`
- [ ] Initialize Next.js 15 project with TypeScript
  ```bash
  npx create-next-app@latest zion-shop --typescript --tailwind --app
  ```
- [ ] Install core dependencies:
  - prisma, @prisma/client
  - @supabase/supabase-js
  - shadcn/ui (run init)
  - zustand, react-hook-form, zod
  - lucide-react, framer-motion
- [ ] Set up Supabase project (free tier)
- [ ] Set up Cloudinary account (free tier)
- [ ] Create `.env.example` and `.env.local`
- [ ] Set up Prisma + connect to Supabase
- [ ] Create basic folder structure:
  ```
  /app
    /(shop)        → public store pages
    /(auth)        → login/signup
    /(account)     → customer dashboard
    /admin         → admin panel
    /api           → API routes
  /components
    /ui            → shadcn components
    /shop          → store-specific components
    /admin         → admin components
  /lib
    /prisma.ts
    /supabase.ts
    /utils.ts
  /prisma
    /schema.prisma
  /types
  ```
- [ ] Push initial commit to GitHub
- [ ] Deploy "Hello World" to Vercel (test deployment pipeline)

**Deliverable:** Empty Next.js app deployed at `zion-shop.vercel.app`

---

### 🎨 PHASE 1: Database & Auth Foundation (Weeks 2-3) — ~16 hours

**Goal:** Database schema works, users can sign up and log in.

#### Week 2: Database
- [ ] Write complete `schema.prisma` with all tables
- [ ] Run `prisma migrate dev` — create all tables in Supabase
- [ ] Create seed script with sample data:
  - 5 categories (Men's Shirts, Women's Three-Piece, etc.)
  - 20 sample products with variants
  - 1 admin user
- [ ] Test database connection from Next.js

#### Week 3: Authentication
- [ ] Set up Supabase Auth (email/password)
- [ ] Build `/auth/signup` page (UI + logic)
- [ ] Build `/auth/login` page
- [ ] Build `/auth/forgot-password` flow
- [ ] Create middleware for protected routes
- [ ] Create `useAuth` hook
- [ ] Test login/logout flows

**Deliverable:** Users can sign up, log in, and see a protected page.

---

### 🛍️ PHASE 2: Public Store - Catalog (Weeks 4-5) — ~16 hours

**Goal:** Customers can browse products beautifully.

#### Week 4: Homepage & Product Listing
- [ ] Design **Homepage**:
  - Hero banner (carousel, eye-catching)
  - Featured categories (Men, Women, Kids)
  - Bestsellers section
  - New arrivals
  - Newsletter signup
- [ ] Design **Product Listing Page** (`/products` or `/category/[slug]`):
  - Filter sidebar (category, gender, size, color, price range)
  - Sort dropdown (newest, price low-high, popular)
  - Grid layout (4 columns desktop, 2 mobile)
  - Pagination or infinite scroll
- [ ] Create reusable `ProductCard` component
- [ ] Implement filter logic (server-side)

#### Week 5: Product Detail Page
- [ ] Design **Product Detail Page** (`/product/[slug]`):
  - Image gallery (zoom, multiple angles, thumbnails)
  - Product info (name, price, rating)
  - Variant selector (size buttons, color swatches)
  - Stock indicator
  - Quantity selector
  - "Add to Cart" + "Add to Wishlist" buttons
  - Size guide modal
  - Description tabs (Details, Reviews, Shipping Info)
  - Related products section
- [ ] Implement image zoom on hover
- [ ] Add reviews display

**Deliverable:** Beautiful, browseable product catalog with detail pages.

---

### 🛒 PHASE 3: Cart & Wishlist (Week 6) — ~8 hours

**Goal:** Customers can save items and manage their cart.

- [ ] Build cart logic with Zustand store
- [ ] Create **Cart Drawer** (slide-in from right):
  - Item list with images
  - Quantity adjusters
  - Remove button
  - Subtotal calculation
  - "Checkout" button
- [ ] Build **Cart Page** (`/cart`) — full-page version
- [ ] Build **Wishlist Page** (`/wishlist`)
- [ ] Sync cart to localStorage (persists across refresh)
- [ ] Sync wishlist to database (per user)
- [ ] Handle stock validation (can't add more than available)

**Deliverable:** Working cart + wishlist with smooth UX.

---

### 💳 PHASE 4: Checkout & Payments (Weeks 7-9) — ~24 hours

**Goal:** End-to-end purchase flow with bKash, SSLCommerz, COD.

#### Week 7: Checkout UI
- [ ] Build **Checkout Page** (`/checkout`):
  - Step 1: Shipping address (saved + new)
  - Step 2: Order review (items, shipping fee, total)
  - Step 3: Payment method selection
- [ ] Address management (add/edit/delete)
- [ ] Calculate shipping fee based on district
- [ ] Apply coupon codes
- [ ] Build order summary component

#### Week 8: bKash Integration
- [ ] Read bKash API documentation
- [ ] Get bKash sandbox credentials
- [ ] Create `/api/payments/bkash/create` endpoint
- [ ] Create `/api/payments/bkash/execute` endpoint
- [ ] Create `/api/payments/bkash/callback` endpoint (webhook)
- [ ] Implement bKash payment UI flow
- [ ] Test with sandbox

#### Week 9: SSLCommerz + COD
- [ ] Get SSLCommerz sandbox credentials
- [ ] Create `/api/payments/sslcommerz/create` endpoint
- [ ] Implement SSLCommerz redirect flow
- [ ] Create webhook handler for SSLCommerz
- [ ] Implement Cash on Delivery option (no gateway, just confirm)
- [ ] Build **Order Confirmation Page** (`/order/[id]/success`)
- [ ] Send confirmation email (basic, via Resend)

**Deliverable:** Customer can complete a purchase using any of 3 payment methods.

---

### 👤 PHASE 5: Customer Dashboard (Week 10) — ~8 hours

**Goal:** Customers can manage their account and orders.

- [ ] **Dashboard Home** (`/account`) — overview
- [ ] **My Orders** (`/account/orders`) — list with status
- [ ] **Order Detail** (`/account/orders/[id]`) — track status, see items
- [ ] **My Addresses** (`/account/addresses`) — CRUD
- [ ] **Profile Settings** (`/account/profile`) — update name, phone, password
- [ ] **My Reviews** (`/account/reviews`) — list of reviews written
- [ ] **My Wishlist** (`/account/wishlist`)

**Deliverable:** Full customer self-service dashboard.

---

### 🎛️ PHASE 6: Admin Panel — Core (Weeks 11-13) — ~24 hours

**Goal:** You can manage products and orders without touching the database.

#### Week 11: Admin Setup & Products
- [ ] Build admin layout (sidebar navigation, header)
- [ ] Protect `/admin` routes (only ADMIN role)
- [ ] **Admin Dashboard** (`/admin`) — placeholder, will fill later
- [ ] **Products List** (`/admin/products`) — searchable table
- [ ] **Add Product** (`/admin/products/new`):
  - Form with all fields
  - Image upload to Cloudinary
  - Variant manager (add multiple sizes/colors)
- [ ] **Edit Product** (`/admin/products/[id]/edit`)
- [ ] Bulk actions (delete, toggle active)

#### Week 12: Categories & Orders
- [ ] **Categories Management** (`/admin/categories`) — CRUD
- [ ] **Orders List** (`/admin/orders`):
  - Filter by status, date, payment method
  - Search by order number, customer name
- [ ] **Order Detail** (`/admin/orders/[id]`):
  - View all info
  - Update status (Confirmed → Packed → Shipped → Delivered)
  - Add tracking number
  - Trigger refund (manual)
- [ ] **Customers List** (`/admin/customers`) — view, search

#### Week 13: Analytics Dashboard
- [ ] **Analytics Dashboard** (`/admin`):
  - Today's revenue, orders, new customers
  - Revenue chart (last 30 days) — use Recharts
  - Top selling products
  - Recent orders table
  - Low-stock alerts
  - Order status distribution (pie chart)
- [ ] Coupon management page
- [ ] Store settings page (logo, name, colors)

**Deliverable:** Fully functional admin panel — you can run the store.

---

### ✨ PHASE 7: Polish & Launch Prep (Weeks 14-15) — ~16 hours

**Goal:** Make it production-ready and gorgeous.

#### Week 14: Polish
- [ ] Audit ALL pages for mobile responsiveness
- [ ] Add loading states everywhere (skeletons)
- [ ] Add empty states (empty cart, no orders, etc.)
- [ ] Add error boundaries and 404 page
- [ ] Implement search functionality (header search bar)
- [ ] Add breadcrumbs to all pages
- [ ] SEO basics: meta tags, Open Graph images, sitemap
- [ ] Generate `robots.txt`
- [ ] Test all forms with edge cases

#### Week 15: Performance & Testing
- [ ] Run Lighthouse audit (target 90+ scores)
- [ ] Optimize images (Next.js Image component everywhere)
- [ ] Lazy load components below fold
- [ ] Test on real devices (Android phone, iPhone)
- [ ] Test all payment flows in sandbox
- [ ] Fix bugs found during testing
- [ ] Add Google Analytics (basic)
- [ ] Set up error monitoring (Sentry free tier)

**Deliverable:** Production-quality store ready to launch.

---

### 🎁 PHASE 8: White-Label Prep (Week 16) — ~8 hours

**Goal:** Make it easy to sell to customers.

- [ ] Create **deployment guide** (`SETUP.md`):
  - How to clone the repo
  - How to set up Supabase
  - How to set up Cloudinary
  - How to get bKash & SSLCommerz credentials
  - How to deploy to Vercel
  - Step-by-step with screenshots
- [ ] Create **customization guide** (`CUSTOMIZATION.md`):
  - Where to change logo, colors, store name
  - How to add categories
  - How to add products
- [ ] Create **video walkthrough** (Loom or YouTube, 15-20 min)
- [ ] Create **license agreement** (terms of use)
- [ ] Create **sales page** (separate landing page promoting Zion Shop)
- [ ] Create demo store with realistic product data
- [ ] Take screenshots for marketing
- [ ] Set up support email

**Deliverable:** Ready to start selling licenses.

---

### 🚀 PHASE 9: Beta & Launch (Weeks 17-18) — ~16 hours

**Goal:** Get first paying customer.

- [ ] Reach out to 5-10 fashion entrepreneurs you know
- [ ] Offer **discounted pilot price**: ৳15,000 (vs ৳25,000 regular)
- [ ] Help first customer set up their store (you do it for them)
- [ ] Collect feedback, fix bugs
- [ ] Get testimonial from first customer
- [ ] Write case study (anonymous if needed)
- [ ] Officially "launch" v1.0 with full pricing
- [ ] Post on LinkedIn, Facebook groups, etc.

**Deliverable:** First paying customer + testimonial.

---

## 6. Page-by-Page UI Plan

### Public Store Pages

| Page | Route | Priority | Notes |
|------|-------|----------|-------|
| Homepage | `/` | P0 | Hero + categories + bestsellers |
| Product Listing | `/products` | P0 | Filters + grid |
| Category Page | `/category/[slug]` | P0 | Same as listing, filtered |
| Product Detail | `/product/[slug]` | P0 | Gallery + variants + reviews |
| Cart | `/cart` | P0 | Full-page cart |
| Checkout | `/checkout` | P0 | 3-step flow |
| Order Success | `/order/[id]/success` | P0 | Confirmation |
| Wishlist | `/wishlist` | P0 | Saved items |
| Search Results | `/search?q=...` | P0 | Search functionality |
| About Us | `/about` | P1 | Static page |
| Contact | `/contact` | P1 | Form + info |
| FAQ | `/faq` | P1 | Static FAQs |
| Terms & Privacy | `/terms`, `/privacy` | P1 | Legal pages |

### Customer Account Pages
| Page | Route | Priority |
|------|-------|----------|
| Dashboard | `/account` | P0 |
| Orders | `/account/orders` | P0 |
| Order Detail | `/account/orders/[id]` | P0 |
| Addresses | `/account/addresses` | P0 |
| Profile | `/account/profile` | P0 |
| Wishlist | `/account/wishlist` | P0 |
| Reviews | `/account/reviews` | P1 |

### Admin Pages
| Page | Route | Priority |
|------|-------|----------|
| Dashboard (Analytics) | `/admin` | P0 |
| Products | `/admin/products` | P0 |
| Add/Edit Product | `/admin/products/new`, `/admin/products/[id]/edit` | P0 |
| Categories | `/admin/categories` | P0 |
| Orders | `/admin/orders` | P0 |
| Order Detail | `/admin/orders/[id]` | P0 |
| Customers | `/admin/customers` | P0 |
| Coupons | `/admin/coupons` | P1 |
| Settings | `/admin/settings` | P0 |

---

## 7. Payment Integration Plan

### Cash on Delivery (Easiest — Build First)
**Flow:**
1. Customer selects COD at checkout
2. Order created with `paymentStatus = PENDING`, `paymentMethod = COD`
3. Order confirmation email sent
4. Admin manually marks `paymentStatus = PAID` after delivery

**Build Time:** 2 hours

---

### SSLCommerz (Easier than bKash)
**Flow:**
1. Customer selects SSLCommerz at checkout
2. Backend creates session via SSLCommerz API
3. Customer redirected to SSLCommerz hosted page
4. Customer pays (Card, Nagad, Rocket, bank)
5. SSLCommerz redirects back with result
6. Webhook confirms payment → update order

**API Documentation:** https://developer.sslcommerz.com

**Required:**
- Sandbox credentials (free, instant)
- Live credentials (requires merchant account, ৳15k setup)

**Build Time:** 6-8 hours

---

### bKash (Most Complex)
**Flow:**
1. Customer selects bKash
2. Frontend calls `/api/bkash/create` → gets paymentID
3. Customer enters bKash mobile number
4. Customer receives OTP, enters PIN on bKash dialog
5. Backend calls `/api/bkash/execute` to confirm
6. Payment success → update order

**API Documentation:** https://developer.bka.sh

**Required:**
- bKash merchant account (apply at bkash.com/business)
- Sandbox credentials (free for testing)

**Build Time:** 8-12 hours (more complex flow)

---

### Recommended Build Order
1. **COD first** (week 7) — get end-to-end flow working
2. **SSLCommerz** (week 8) — easier API, broader coverage
3. **bKash** (week 9) — most popular but most complex

---

## 8. Claude Prompts Cheat-Sheet

> Copy-paste these prompts into Claude when starting each phase. They're optimized for getting the best results.

### 🏁 Phase 0 Prompts

**Initial Setup:**
> "I'm starting a Next.js 15 e-commerce project called Zion Shop. Help me set up the folder structure with App Router, TypeScript, Tailwind CSS v4, and shadcn/ui. I need clean separation between (shop), (auth), (account), and admin routes."

**Prisma + Supabase:**
> "Help me connect Prisma to my Supabase PostgreSQL database. I need the prisma client setup, .env configuration, and a sample query to verify the connection works."

---

### 🎨 Phase 1 Prompts

**Database Schema:**
> "I need a complete Prisma schema for a fashion e-commerce store. Tables needed: User (with role), Address, Product, ProductVariant (size+color), ProductImage, Category (with subcategories), Order, OrderItem, Payment, Review, Wishlist, Coupon, StoreSettings. Make it production-ready with proper relations and indexes."

**Authentication:**
> "Help me set up Supabase Auth in my Next.js 15 app. I need: signup page with email/password, login page, forgot password flow, useAuth hook, and middleware to protect routes. Use shadcn/ui components and React Hook Form with Zod validation."

---

### 🛍️ Phase 2 Prompts

**Homepage:**
> "Design a modern, eye-catching homepage for Zion Shop fashion store. Sections needed: hero carousel (3-4 banners), featured categories grid (Men/Women/Kids with images), bestsellers section (4 products), new arrivals (4 products), promotional banner, newsletter signup. Style: minimalist, premium feel like Aarong but modern. Use Tailwind v4 + shadcn/ui + Framer Motion for subtle animations."

**Product Listing:**
> "Build a product listing page for fashion e-commerce. Need: filter sidebar (category checkboxes, size buttons, color swatches, price range slider, gender), sort dropdown, product grid (4 cols desktop / 2 mobile), pagination. Use Server Components for data fetching from Prisma. Include skeleton loading states."

**Product Detail:**
> "Create a product detail page with: image gallery (main image + thumbnails, zoom on hover), product info (name, price, rating stars), variant selector (size buttons + color swatches), quantity input, Add to Cart button, Add to Wishlist heart icon, size guide modal trigger, tabs section (Description/Reviews/Shipping), related products carousel. Mobile-responsive, modern, matches Zion Shop's style."

---

### 🛒 Phase 3 Prompts

**Cart with Zustand:**
> "Set up a Zustand store for shopping cart with: items array (productVariantId, quantity, price), addItem, removeItem, updateQuantity, clearCart actions. Persist to localStorage. Then build a slide-in cart drawer using shadcn/ui Sheet component, showing items with images, quantities, subtotal, and Checkout button."

---

### 💳 Phase 4 Prompts

**Checkout Flow:**
> "Build a 3-step checkout page: Step 1 (Shipping address - select saved or add new), Step 2 (Order review with items, shipping fee, coupon code, total), Step 3 (Payment method selection - bKash/SSLCommerz/COD). Use React Hook Form, Zod validation, Server Actions for data mutations. Make it mobile-friendly."

**bKash Integration:**
> "Help me integrate bKash payment in Next.js. I need: /api/payments/bkash/create endpoint (creates payment), /api/payments/bkash/execute endpoint (confirms payment), /api/payments/bkash/callback (webhook handler), and the frontend flow with bKash dialog. Use sandbox credentials. Show me the complete code with error handling."

**SSLCommerz Integration:**
> "Help me integrate SSLCommerz in Next.js 15. Build the create-session API, redirect flow, success/fail/cancel handlers, and IPN (webhook) verification. Show me how to update the order status after successful payment."

---

### 🎛️ Phase 6 Prompts

**Admin Layout:**
> "Build an admin panel layout for Zion Shop with: sidebar navigation (Dashboard, Products, Categories, Orders, Customers, Coupons, Settings), top header (search, notifications, user menu), main content area. Use shadcn/ui. Make it responsive."

**Product Management:**
> "Build the admin product CRUD pages. Products list with search/filter/pagination using a data table. Add Product form with: basic info (name, slug, description), pricing, category select, gender, image upload to Cloudinary (multiple), variant manager (add multiple size+color combos with stock and SKU). Use React Hook Form + Zod."

**Analytics Dashboard:**
> "Create an admin analytics dashboard with: KPI cards (today's revenue, orders, new customers, conversion rate), revenue line chart (last 30 days using Recharts), top 5 products bar chart, order status pie chart, recent orders table (last 10), low-stock alerts. Pull data from Prisma using server components."

---

### ✨ Phase 7 Prompts

**Polish:**
> "Audit my Next.js app for production readiness. Check for: missing loading states, error boundaries, 404 page, mobile responsiveness, accessibility (ARIA), SEO meta tags. Suggest improvements with code."

**Performance:**
> "Help me optimize my Next.js e-commerce app for performance. Goals: Lighthouse score 90+, fast image loading, minimal JS bundle, fast Time-to-Interactive. Audit my current setup and suggest improvements."

---

### 🎁 Phase 8 Prompts

**Setup Guide:**
> "Help me write a comprehensive SETUP.md for customers buying my Zion Shop white-label code. Include: prerequisites (Node.js, accounts needed), step-by-step setup (Supabase, Cloudinary, payment gateways), environment variables explanation, deployment to Vercel, troubleshooting common issues. Make it beginner-friendly."

---

## 9. Testing Checklist

### Functional Testing (per phase)

#### Auth
- [ ] Sign up with new email works
- [ ] Sign up with existing email shows error
- [ ] Login with correct credentials works
- [ ] Login with wrong password shows error
- [ ] Forgot password sends reset email
- [ ] Logout clears session

#### Product Browsing
- [ ] Homepage loads in <2s
- [ ] All product images load correctly
- [ ] Filters update product list correctly
- [ ] Sort options work
- [ ] Pagination works
- [ ] Product detail loads with all images
- [ ] Variant selection updates price/stock
- [ ] Out-of-stock variants are disabled

#### Cart & Wishlist
- [ ] Add to cart works
- [ ] Cart persists after refresh
- [ ] Quantity updates correctly
- [ ] Remove from cart works
- [ ] Add to wishlist works (logged in only)
- [ ] Wishlist syncs across devices

#### Checkout
- [ ] All form validations work
- [ ] Address selection works
- [ ] Coupon code application works
- [ ] Shipping fee calculates correctly
- [ ] Total is correct
- [ ] Payment method selection works

#### Payments
- [ ] COD order completes successfully
- [ ] SSLCommerz sandbox payment works
- [ ] bKash sandbox payment works
- [ ] Failed payments handled gracefully
- [ ] Order status updates after payment
- [ ] Order confirmation page shows correct info

#### Admin
- [ ] Admin login works (non-admin blocked)
- [ ] Add product with variants and images works
- [ ] Edit product works
- [ ] Delete product works
- [ ] Order status update works
- [ ] Analytics shows correct data

### Cross-Browser Testing
- [ ] Chrome (desktop + mobile)
- [ ] Safari (desktop + mobile)
- [ ] Firefox
- [ ] Edge

### Device Testing
- [ ] iPhone (Safari)
- [ ] Android phone (Chrome)
- [ ] Tablet (iPad)
- [ ] Desktop (1920x1080)
- [ ] Small laptop (1366x768)

---

## 10. Deployment Guide

### For You (Building the Demo)
1. Push code to GitHub
2. Connect Vercel to GitHub repo
3. Add environment variables in Vercel dashboard
4. Deploy
5. Custom domain: `zionshop.com` or use `zion-shop.vercel.app`

### For Customers (When Selling)
1. Customer creates accounts: GitHub, Vercel, Supabase, Cloudinary
2. Forks your repo (you give them access)
3. Sets up environment variables
4. Connects Vercel → deploys
5. Buys their domain → connects to Vercel
6. Done!

### Required Environment Variables
```env
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
BKASH_USERNAME=...
BKASH_PASSWORD=...
BKASH_APP_KEY=...
BKASH_APP_SECRET=...
BKASH_BASE_URL=...
SSLCOMMERZ_STORE_ID=...
SSLCOMMERZ_STORE_PASSWORD=...
SSLCOMMERZ_IS_LIVE=false
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://yourdomain.com
RESEND_API_KEY=...
```

---

## 11. White-Label Sales Kit

### Pricing
| Package | Price (BDT) | Includes |
|---------|------------|----------|
| **Starter** | ৳20,000 | Code + setup guide + 30 days email support |
| **Pro** | ৳40,000 | Code + setup guide + I deploy it for you + 60 days support |
| **Custom** | ৳75,000+ | Above + custom features + 6 months support |

### Sales Pitch (Use This)
> "Zion Shop is a complete, modern fashion e-commerce platform built with Next.js 15. Get your professional online store with bKash, SSLCommerz, and Cash on Delivery support — fully integrated. No monthly fees like Shopify, you own everything. Mobile-optimized, fast, and beautifully designed. Launch your fashion business in days, not months."

### Target Customers
1. Small fashion boutiques in Dhaka, Chittagong
2. Instagram sellers wanting to scale
3. Existing offline shops going online
4. Friends/network running fashion businesses

### Where to Find Customers
1. **Personal network** — start here, easiest sales
2. **Facebook groups:** "Bangladesh Online Business", "Fashion Entrepreneurs BD"
3. **LinkedIn** — post about the product
4. **Instagram** — DM small fashion accounts
5. **Fiverr/Upwork** — list as "Custom e-commerce development"

---

## 12. Risk & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Scope creep** | High | High | Stick to v1.0 features. Ignore "nice-to-have" requests. |
| **Payment integration delays** | Medium | High | Start with COD first to ensure end-to-end works. |
| **Burnout (5-10 hrs/week)** | Medium | High | Take breaks. Set realistic weekly goals. Celebrate small wins. |
| **No customers after launch** | Medium | High | Start outreach in Phase 8. Don't wait until Phase 9. |
| **bKash merchant account rejection** | Low | Medium | Apply early. Have SSLCommerz as backup. |
| **Bug-heavy launch** | Medium | Medium | Phase 7 testing is non-negotiable. Beta test with real users. |
| **Pricing too high/low** | Medium | Medium | Test with first 3 customers, adjust based on feedback. |

---

## 📌 Weekly Workflow (For Discipline)

### Every Saturday (3-5 hours)
1. Review last week's progress
2. Pick 2-3 tasks from current phase
3. Use Claude prompts cheat-sheet
4. Test what you built
5. Commit & push to GitHub

### Every Sunday (2-5 hours)
1. Continue Saturday's tasks
2. Test edge cases
3. Update task checklist
4. Note blockers for next week

### End of Each Phase
1. Demo what you built (record video)
2. Update this plan with learnings
3. Take a 1-week break (optional, prevents burnout)

---

## 🎯 Success Metrics

### Phase Milestones
- ✅ **Week 5:** Public store browseable
- ✅ **Week 9:** First test purchase completed
- ✅ **Week 13:** Admin panel functional
- ✅ **Week 16:** Production-ready
- ✅ **Week 18:** First paying customer

### Business Goals (6 months post-launch)
- 🎯 5 white-label customers (৳1,00,000+ revenue)
- 🎯 1 customer testimonial + case study
- 🎯 50+ inbound inquiries
- 🎯 Plan for v2.0 features based on feedback

---

## 📚 Reference Links

### Documentation
- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- Supabase: https://supabase.com/docs
- shadcn/ui: https://ui.shadcn.com
- Tailwind CSS: https://tailwindcss.com/docs
- bKash API: https://developer.bka.sh
- SSLCommerz: https://developer.sslcommerz.com

### Inspiration
- Aarong: https://www.aarong.com (premium feel)
- Daraz: https://daraz.com.bd (filtering UX)
- Yellow: https://www.yellow.com.bd (fashion focus)
- Le Reve: https://lerevecollection.com (modern design)

### Tools
- Figma (UI mockups, free): https://figma.com
- Excalidraw (flowcharts, free): https://excalidraw.com
- Loom (record demos, free): https://loom.com

---

## 📝 Notes Section

> Use this section to track learnings, blockers, and decisions as you build.

### Current Phase: _________
### Last Worked On: _________
### Next Task: _________
### Blockers: _________
### Wins This Week: _________

---

**🚀 Let's build Zion Shop. One weekend at a time.**

*Last updated: April 25, 2026*
