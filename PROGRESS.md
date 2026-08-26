# Orca Australia — Setup Progress

_Last updated: 2026-08-26. I'll keep this file up to date as we go — check here any time for where things stand._

## ✅ Done

- **App built**: storefront (browse, sizes/SKUs, cart, Stripe Checkout), admin dashboard (orders, product/variant CRUD, photo upload), Stripe webhook + Resend confirmation/shipping emails, guest order tracking, contact/support form.
- **Real product catalog live — 7 products across 3 categories**: **Swim Shorts** (High Seas Print, Polar Bear Print — both "New"), **Gym Shorts** (Black/Blue/Green), and **Tencel Modal Boxer Briefs** (Lock-In Pouch, Classic Lining). All with real front/back/detail/model photos, S–XXL sizes.
- **"What's Tencel Modal?" section**: a fun, friendly explainer under the Boxer Briefs category page comparing Tencel Modal (made by Lenzing) to cotton, bamboo viscose, and nylon.
- **Real branding**: logo mark in header/footer/favicon, homepage hero uses your cover photo, category tiles use real model photos, homepage trust strip (quick-dry, Tencel modal, Aussie-made, secure Stripe checkout).
- **Guest order tracking** (`/track-order`): customers enter email + order number to see live/past order status and history — no account needed.
- **Contact/support page** (`/contact`): on-site form emails support@astryks.com with reply-to set to the customer; linked from order tracking and the footer.
- **Shipping-notification email**: sent automatically when an admin marks an order "Fulfilled".
- **Footer**: support email + "Orca Australia, part of the Astryks Group | astryks.com".
- **Bug found & fixed during audit**: Resend's SDK returns `{ data, error }` instead of throwing on failures — all three email send points (order confirmation, shipping notice, contact form) were silently "succeeding" even when nothing sent. Now properly checked. Also fixed: duplicated page titles, several form labels missing proper accessibility associations.
- **Small conversion/legitimacy wins**: Stripe promo codes enabled at checkout, Open Graph + per-product SEO metadata, product badges.
- **GitHub repo**: https://github.com/Siddharth09/orcaaustralia (branch `master`), fully up to date.
- **Database (Neon)**: project `orca-australia` in Sydney (`ap-southeast-2`).
- **Vercel project**: `astryks/orca-australia`, with `DATABASE_URL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `BLOB_READ_WRITE_TOKEN`, `NEXT_PUBLIC_SITE_URL` all set.
- **Vercel Blob storage**: holds all product photos.
- **🚀 Site is LIVE at your real domain**: https://orcaaustralia.com (and https://orca-australia.vercel.app) — DNS pointed at Vercel, SSL certificate provisioned, verified serving correctly.

## ⏳ Pending — next steps in order

1. **Stripe test keys** — from dashboard.stripe.com/apikeys (Test mode): Secret key (`sk_test_...`) and Publishable key (`pk_test_...`).

2. **Resend API key** — from resend.com/api-keys (`re_...`), plus confirm `orcaaustralia.com` is verified as a sending domain there. (Now that email failures are actually surfaced, we'll know immediately once this is wired up correctly.)

3. **Stripe webhook** — add a webhook endpoint in Stripe pointing at `https://orcaaustralia.com/api/webhooks/stripe`, then add its signing secret as `STRIPE_WEBHOOK_SECRET`.

4. **Enable Stripe's built-in abandoned-cart recovery emails** — Stripe Dashboard → Settings → Checkout and Payment Links → Customer emails. This is a one-click toggle once the Stripe account above is set up; no custom code needed since our cart is client-side only until checkout starts.

5. **Full smoke test** — place a real test-mode order on the live site, confirm it shows up in `/admin/orders`, the confirmation email arrives, and marking it "Fulfilled" sends the shipping email.

6. **Connect GitHub to Vercel for auto-deploy** (optional convenience) — currently deploys are manual (`vercel --prod`). To enable: Vercel dashboard → Account Settings → Login Connections → connect GitHub, then I can link the repo.

7. **Go live for real** — when ready to accept real payments, switch Stripe to Live mode (new live keys + live webhook).

## Ideas for later (not built — advisory)

Things larger e-commerce sites have that could be worth adding next: legal pages (Shipping & Returns, Privacy Policy, Terms of Service — Stripe often wants these visible too), a size guide, product reviews, a newsletter signup / first-order discount, analytics (Vercel Analytics or GA), and structured data for richer Google search results. Apple Pay/Google Pay already work automatically on Stripe's hosted checkout page — no extra work needed there.
