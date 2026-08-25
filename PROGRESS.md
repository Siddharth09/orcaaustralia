# Orca Australia — Setup Progress

_Last updated: 2026-08-25. I'll keep this file up to date as we go — check here any time for where things stand._

## ✅ Done

- **App built**: storefront (browse, sizes/SKUs, cart, Stripe Checkout), admin dashboard (orders, product/variant CRUD, photo upload), Stripe webhook + Resend confirmation email. Fully tested locally.
- **GitHub repo**: created at https://github.com/Siddharth09/orcaaustralia, code committed locally and remote added.
- **Database (Neon)**: project `orca-australia` created in Sydney (`ap-southeast-2`), tables migrated, seeded with 2 starter products (Classic Swim Shorts, Tencel Modal Boxer Brief). Connection string saved in `.env` as `DATABASE_URL`.
- **Vercel account**: connected via CLI (signed in as `mehtasiddharth09-9311`).
- **Vercel project**: created (`astryks/orca-australia`).
- **Vercel Blob storage**: created (`orca-australia-photos`, public access) and linked to the project — product photo uploads will work once deployed.
- **Vercel environment variables set**: `DATABASE_URL`, `ADMIN_PASSWORD` (Waffle.09), `ADMIN_SESSION_SECRET`, `BLOB_READ_WRITE_TOKEN`.

## ⏳ Pending — next steps in order

1. **Push to GitHub** — I couldn't complete this from my sandboxed terminal (GitHub's sign-in popup can't open there). Run this yourself in a normal terminal:
   ```bash
   cd "C:\Users\SidMehta\Desktop\Orca australia"
   git push -u origin master
   ```
   A browser window should pop up for GitHub sign-in — complete it and the push will finish.

2. **Stripe test keys** — from dashboard.stripe.com/apikeys (Test mode), send me the Secret key (`sk_test_...`) and Publishable key (`pk_test_...`) and I'll wire them in.

3. **Resend API key** — from resend.com/api-keys, send me the key (`re_...`). Also verify `orcaaustralia.com` as a sending domain in Resend (Domains → Add Domain) if not done yet — needed so order confirmation emails can send from `orders@orcaaustralia.com`.

4. **First deploy** — once the above are in, I'll run `vercel --prod` to get the site live on a `*.vercel.app` URL.

5. **Connect the domain** — add `orcaaustralia.com` to the Vercel project and update DNS at wherever the domain is registered (I'll give exact records once we're at this step).

6. **Stripe webhook** — add a production webhook endpoint in Stripe pointing at the live domain (`/api/webhooks/stripe`), then add its signing secret as `STRIPE_WEBHOOK_SECRET`.

7. **Redeploy** with the final env vars, then do a full smoke test: place a real test-mode order, confirm it shows up in `/admin/orders` and the confirmation email arrives.

8. **Replace placeholder photos** — upload real product photos via `/admin/products` once you have them.

9. **Go live for real** — when ready to accept real payments, switch Stripe to Live mode (new live keys + live webhook), and set `NEXT_PUBLIC_SITE_URL` to the final domain.
