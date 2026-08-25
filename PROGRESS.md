# Orca Australia — Setup Progress

_Last updated: 2026-08-25. I'll keep this file up to date as we go — check here any time for where things stand._

## ✅ Done

- **App built**: storefront (browse, sizes/SKUs, cart, Stripe Checkout), admin dashboard (orders, product/variant CRUD, photo upload), Stripe webhook + Resend confirmation email. Fully tested locally.
- **GitHub repo**: pushed to https://github.com/Siddharth09/orcaaustralia (branch `master`).
- **Database (Neon)**: project `orca-australia` in Sydney (`ap-southeast-2`), tables migrated, seeded with 2 starter products (Classic Swim Shorts, Tencel Modal Boxer Brief).
- **Vercel account**: connected via CLI (signed in as `mehtasiddharth09-9311`).
- **Vercel project**: created (`astryks/orca-australia`).
- **Vercel Blob storage**: created (`orca-australia-photos`, public access) and linked to the project — product photo uploads work.
- **Vercel environment variables set**: `DATABASE_URL`, `ADMIN_PASSWORD` (Waffle.09), `ADMIN_SESSION_SECRET`, `BLOB_READ_WRITE_TOKEN`.
- **Fixed two Vercel-specific build bugs**: added a `postinstall` script so Prisma regenerates on Vercel's cached installs, and made the Stripe/Resend clients initialize lazily so a not-yet-set API key doesn't crash the whole build. Also added `.vercelignore` so local `.env` files never get uploaded as deployment source.
- **🚀 Site is LIVE**: https://orca-australia.vercel.app — verified working: homepage/products load from the real database, admin login works, admin dashboard loads.

## ⏳ Pending — next steps in order

1. **Stripe test keys** — from dashboard.stripe.com/apikeys (Test mode), send me the Secret key (`sk_test_...`) and Publishable key (`pk_test_...`) and I'll add them to Vercel and redeploy.

2. **Resend API key** — from resend.com/api-keys, send me the key (`re_...`). Also verify `orcaaustralia.com` as a sending domain in Resend (Domains → Add Domain) if not done yet — needed so order confirmation emails can send from `orders@orcaaustralia.com`.

3. **Connect GitHub to Vercel for auto-deploy** (optional convenience) — currently deploys are manual (`vercel --prod`) because your Vercel account doesn't have GitHub connected as a login method yet. To fix: in the Vercel dashboard → Account Settings → Login Connections, connect GitHub. Then I can link the repo so every `git push` auto-deploys. Not required to keep working — just a convenience.

4. **Connect the domain** — add `orcaaustralia.com` to the Vercel project and update DNS at wherever the domain is registered (I'll give exact records once we're at this step).

5. **Stripe webhook** — add a production webhook endpoint in Stripe pointing at the live domain (`/api/webhooks/stripe`), then add its signing secret as `STRIPE_WEBHOOK_SECRET` and redeploy.

6. **Full smoke test** — place a real test-mode order on the live site, confirm it shows up in `/admin/orders` and the confirmation email arrives.

7. **Replace placeholder photos** — upload real product photos via `/admin/products` once you have them.

8. **Go live for real** — when ready to accept real payments, switch Stripe to Live mode (new live keys + live webhook), and set `NEXT_PUBLIC_SITE_URL` to the final domain.
