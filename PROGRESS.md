# Orca Australia — Setup Progress

_Last updated: 2026-08-31. I'll keep this file up to date as we go — check here any time for where things stand._

## 🔧 Sign-in bug fixed, hero photo fixed — 2026-08-31

**Sign-in was genuinely broken, and I found the real cause.** Email security scanners (Gmail/Outlook's "Safe Links"-style protection) automatically open links inside incoming emails to check them for phishing before a person ever clicks — and because sign-in links were single-use, that automatic scan was silently using up the link before you got to click it. So you'd click "sign in," get emailed a link, click it, and it would say "invalid or expired" even though you'd never actually used it. This is a known, common failure mode for single-use email links, and it's on me — I introduced single-use links in the last security audit without accounting for it.

**Fixed**: clicking a sign-in link now opens a page that asks you to confirm ("Sign in as you@email.com?") before actually signing you in. Automated scanners open the page but don't click buttons, so they can no longer burn the link — only a real click does. I tested this by simulating a scanner (fetching the link several times with no browser) and then completing a real sign-in afterward — works correctly. I also confirmed a link genuinely can't be reused a second time after a real sign-in, so the original security fix is intact.

To be clear on the account question: there's no separate "create an account" step to fix — entering your email and getting a sign-in link *is* how an account works here (no password to set up). That's now reliable.

**On `orders@orcaaustralia.com`**: it is a real, correctly configured sending address — your domain is properly verified (SPF/DKIM both pass) and I confirmed emails are actually being delivered to real inboxes, not bouncing. The legitimate concern was different: if a customer ever hit "reply" on one of these emails, it had nowhere real to go. Fixed by adding a reply-to of `support@astryks.com` (your real, monitored inbox) to every customer-facing email — order confirmation, shipping notice, sign-in link, and refund emails. No need to change the sending address itself; "orders@" is standard practice for this kind of email.

**Homepage cover photo**: fixed — it was center-cropping and cutting off both models' faces/hair on wider screens. Re-anchored the crop to the top of the photo instead, verified on both desktop and mobile that both faces are now fully visible.

**General health check**: re-verified admin login gating, the products/product-detail/cart/track-order/contact pages, and confirmed no regressions from these changes (`tsc`, `eslint`, and a production build all clean).

## 🟢 Stripe switched to LIVE mode — 2026-08-30

Swapped the test keys for your real `sk_live_...` and `whsec_...` on Vercel and redeployed. Real money now moves through checkout. Verified the live secret key actually works by creating a real Checkout Session via the API (confirmed the session ID came back as `cs_live_...`, not `cs_test_...`) — I stopped short of completing a real purchase myself, since that needs a real card and I don't handle payment details directly.

**Recommended next step**: make one small real purchase yourself (something you'd actually want, or a cheap test item) to confirm the live path works end-to-end exactly like the test-mode run below, then approve a refund for it from `/admin/refunds` to see the real refund flow work too.

Your Stripe account needs to be "activated" (business details, bank account for payouts, tax/ABN info) before live charges will actually succeed — if a real checkout fails, that's the first thing to check in the Stripe dashboard.

## 💳 Stripe test-mode purchase verified end-to-end — 2026-08-30

Before switching to live keys, ran a full real test-mode purchase end-to-end to confirm everything actually works, not just that it deploys:
- Added an item to cart on the live site, checked out through Stripe's real hosted Checkout page (test mode), paid with Stripe's test card.
- Redirected back to the "Thank you!" page correctly.
- Confirmed in the database: the order landed with status `PAID`, correct total (item + shipping), correct shipping address, and the Stripe payment ID captured (needed for refunds).
- Confirmed stock decremented correctly for the purchased size.
- Confirmed the webhook processed with no errors, meaning the confirmation email sent cleanly.

Checkout, order creation, stock updates, and confirmation emails are now fully verified working. Still in **test mode** — no real money moves yet. See "Pending" below for what's left before going live for real.

## 🔒 Full code audit (2026-08-27)

Ran a thorough security/correctness audit across payments, auth, email, admin, and storefront code. Real bugs found and fixed:

- **Admin actions now check the session directly, not just the page wrapper** — defense-in-depth per Next.js's own security guidance, so a mutation can never run without a valid admin login even if the page-level gate were ever bypassed.
- **Refund approval could double-refund** if clicked twice quickly (or from two admin tabs) — now claims the request atomically before calling Stripe, so only one refund is ever issued.
- **Magic-link sign-in emails were reusable** — anyone who got hold of a link (forwarded email, shared inbox) could sign in with it repeatedly for 30 minutes. Links are now single-use; a second use is rejected. Also added a per-email cooldown so the sign-in endpoint can't be used to spam someone's inbox.
- **Refund emails to customers could silently fail to send** with no record anywhere (same class of bug as the earlier Resend fix, missed on the two newest email types) — now checked and logged like every other email in the app.
- **Customer name / refund reason / admin notes could break email formatting** if they contained `<` or `>` characters — all user-supplied text in emails is now safely escaped.
- **A product with all sizes marked inactive showed "$∞"** on the homepage/listing instead of being hidden.
- **Cart quantity box would delete the item** if you cleared it to type a new number, and had no ceiling tied to actual stock — fixed on the product page and in the cart/drawer.
- **Re-adding an item already in your cart could show stale info** (old name/price) if the product had been edited/renamed since — now always refreshes to current data.
- **Stock could go negative** under concurrent checkouts, and a Stripe webhook retry could silently skip a stock update forever if one item failed — both hardened.
- Smaller fixes: admin can no longer save a negative price/stock or an invalid category, duplicate SKUs get a friendly error instead of a crash, editing a product's variants/photos now correctly refreshes the live storefront (was only refreshing the admin page), deleted product photos are now actually removed from storage instead of leaking, and the orders list is capped so it can't grow unbounded.
- Full `tsc`/`eslint`/production build all clean; storefront fixes spot-checked live in browser (price display, quantity clamping, cart refresh).

## ✅ Done

- **App built**: storefront (browse, sizes/SKUs, cart, Stripe Checkout), admin dashboard (orders, product/variant CRUD, photo upload), Stripe webhook + Resend confirmation/shipping emails, guest order tracking, contact/support form.
- **Real product catalog live — 7 products across 3 categories**: **Swim Shorts** (High Seas Print, Polar Bear Print — both "New"), **Gym Shorts** (Black/Blue/Green), and **Tencel Modal Boxer Briefs** (Lock-In Pouch, Classic Lining). All with real front/back/detail/model photos, S–XXL sizes.
- **"What's Tencel Modal?" section**: a fun, friendly explainer under the Boxer Briefs category page comparing Tencel Modal (made by Lenzing) to cotton, bamboo viscose, and nylon.
- **Real branding**: logo mark in header/footer/favicon (fixed a subtle stretch distortion — icons are now proper 588×588 squares), homepage hero uses your cover photo, category tiles use real model photos, homepage trust strip (quick-dry, Tencel modal, Aussie-made, secure Stripe checkout).
- **Customer accounts** (`/account`): passwordless magic-link sign-in (email a one-time link, no password to manage) shows every past order tied to that email in one place.
- **Refund requests**: customers can request a refund on a specific item from their order history with a reason; you get an email notification immediately, review it at `/admin/refunds`, and "Approve & Refund" triggers a real Stripe refund automatically (or "Deny" with an optional note) — the customer gets an email either way. You stay in control of the actual money movement.
- **Parcel tracking**: paste any carrier's tracking link into an order in `/admin/orders/[id]` — it shows on the customer's `/account` page and as a "Track Package" button in the shipping-notification email.
- **Guest order tracking** (`/track-order`) still works too: customers who don't want to log in can enter email + order number to see order status — no account needed.
- **Contact/support page** (`/contact`): on-site form emails support@astryks.com with reply-to set to the customer; linked from order tracking and the footer.
- **Shipping-notification email**: sent automatically when an admin marks an order "Fulfilled", now with a tracking button when a tracking URL is set.
- **Footer**: support email, "My Account" link, and "Orca Australia, part of the Astryks Group | astryks.com".
- **Resend email is fully wired up**: domain verified, API key set, all transactional emails (order confirmation, shipping notice, magic-link sign-in, refund requested/approved/denied, contact form) sending for real.
- **GitHub → Vercel auto-deploy connected**: pushing to `master` deploys automatically — no more manual `vercel --prod`.
- **Bugs found & fixed during audits**: Resend's SDK returns `{ data, error }` instead of throwing on failures — all email send points were silently "succeeding" even when nothing sent; now properly checked everywhere. A refund-approval failure (e.g. bad Stripe key) used to crash the whole admin page — now shows a friendly inline error instead. Also fixed: duplicated page titles, several form labels missing proper accessibility associations, non-square logo icons.
- **Small conversion/legitimacy wins**: Stripe promo codes enabled at checkout, Open Graph + per-product SEO metadata, product badges.
- **GitHub repo**: https://github.com/Siddharth09/orcaaustralia (branch `master`), fully up to date.
- **Database (Neon)**: project `orca-australia` in Sydney (`ap-southeast-2`).
- **Vercel project**: `astryks/orca-australia`, with `DATABASE_URL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `BLOB_READ_WRITE_TOKEN`, `NEXT_PUBLIC_SITE_URL`, `RESEND_API_KEY`, `STRIPE_SECRET_KEY` (live), `STRIPE_WEBHOOK_SECRET` (live) all set.
- **Vercel Blob storage**: holds all product photos.
- **🚀 Site is LIVE at your real domain**: https://orcaaustralia.com (and https://orca-australia.vercel.app) — DNS pointed at Vercel, SSL certificate provisioned, verified serving correctly.

## ⏳ Pending — next steps in order

1. **Make one real purchase yourself** to confirm live mode actually charges and completes correctly end-to-end (I can't do this step — it needs a real card). Then approve its refund from `/admin/refunds` to confirm real refunds work too.

2. **Confirm your Stripe account is "activated"** — check the Stripe dashboard for any outstanding business/bank/tax verification steps. Live charges won't succeed until that's complete, if it isn't already.

3. **Enable Stripe's built-in abandoned-cart recovery emails** (optional) — Stripe Dashboard → Settings → Checkout and Payment Links → Customer emails. One-click toggle; no custom code needed since our cart is client-side only until checkout starts.

## Still on the wishlist

- **Animated hero graphic** — a GIF or short moving image combining your product designs and logo for extra polish on the homepage. Not started yet.

## Known low-risk items (reviewed, not changed)

- No brute-force lockout on the admin login page or the customer sign-in-link endpoint. Low real-world risk for a single-admin store on a strong password, but worth Vercel/Cloudflare-level bot protection if it ever becomes a target.
- A sign-in link is tied to whoever clicks it, not to the device that requested it (standard for email magic links) — someone could theoretically bait you into clicking a link tied to their own account. Impact is limited to seeing their own order data, not yours.
- Two customers buying the very last unit of a size at the exact same moment could both complete payment (oversell by one unit) — stock can no longer go negative, but a rare double-sale would need a manual "sorry, restocking" email rather than being prevented outright. Fixing this fully would mean holding stock during checkout, which is a bigger feature than this store's current scale needs.

## Ideas for later (not built — advisory)

Things larger e-commerce sites have that could be worth adding next: legal pages (Shipping & Returns, Privacy Policy, Terms of Service — Stripe often wants these visible too), a size guide, product reviews, a newsletter signup / first-order discount, analytics (Vercel Analytics or GA), and structured data for richer Google search results. Apple Pay/Google Pay already work automatically on Stripe's hosted checkout page — no extra work needed there.
