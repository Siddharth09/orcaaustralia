# Orca Australia — Setup Progress

_Last updated: 2026-08-26. I'll keep this file up to date as we go — check here any time for where things stand._

## ✅ Done

- **App built**: storefront (browse, sizes/SKUs, cart, Stripe Checkout), admin dashboard (orders, product/variant CRUD, photo upload), Stripe webhook + Resend confirmation email.
- **Real product catalog live**: 6 products from your real photos — Black/Blue/Green Swim Shorts, High Seas Print Swim Shorts, Polar Bear Print Swim Shorts, and Black Boxer Briefs — each with front/back/detail/model photos, S–XXL sizes, real prices ($69–$74 for shorts, $39 for briefs).
- **Real branding**: your logo mark is now in the header, footer, and site favicon. Homepage hero uses your cover photo. Category tiles use real model photos.
- **Footer updated**: support email (support@astryks.com) and "Orca Australia, part of the Astryks Group | astryks.com" added.
- **GitHub repo**: https://github.com/Siddharth09/orcaaustralia (branch `master`), fully up to date.
- **Database (Neon)**: project `orca-australia` in Sydney (`ap-southeast-2`).
- **Vercel project**: `astryks/orca-australia`, with `DATABASE_URL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `BLOB_READ_WRITE_TOKEN`, `NEXT_PUBLIC_SITE_URL` all set.
- **Vercel Blob storage**: holds all product photos.
- **🚀 Site is LIVE**: https://orca-australia.vercel.app
- **Domain added to Vercel project**: `orcaaustralia.com` and `www.orcaaustralia.com` — **DNS not pointed yet, see below.**

## ⏳ Pending — next steps in order

1. **Point your domain's DNS at Vercel** — your domain's nameservers currently look like GoDaddy's. At your DNS provider, add these two records:
   | Type | Host | Value |
   | --- | --- | --- |
   | A | `@` (or blank/root) | `76.76.21.21` |
   | A | `www` | `76.76.21.21` |

   Once added, DNS usually propagates within minutes to a few hours. I'll verify and redeploy once it's live — just let me know when you've added them (or if you'd like exact click-by-click steps for your specific registrar).

2. **Stripe test keys** — from dashboard.stripe.com/apikeys (Test mode): Secret key (`sk_test_...`) and Publishable key (`pk_test_...`).

3. **Resend API key** — from resend.com/api-keys (`re_...`), plus confirm `orcaaustralia.com` is verified as a sending domain there.

4. **Stripe webhook** — once the domain is live, add a webhook endpoint in Stripe pointing at `https://orcaaustralia.com/api/webhooks/stripe`, then add its signing secret as `STRIPE_WEBHOOK_SECRET`.

5. **Full smoke test** — place a real test-mode order on the live site, confirm it shows up in `/admin/orders` and the confirmation email arrives.

6. **Connect GitHub to Vercel for auto-deploy** (optional convenience) — currently deploys are manual (`vercel --prod`). To enable auto-deploy on push: Vercel dashboard → Account Settings → Login Connections → connect GitHub, then I can link the repo.

7. **Go live for real** — when ready to accept real payments, switch Stripe to Live mode (new live keys + live webhook).
