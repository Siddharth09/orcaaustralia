# Orca Australia

E-commerce store for Orca Australia — men's swim shorts and Tencel modal boxer briefs. Built with Next.js, Prisma/Postgres, Stripe Checkout, Resend, and Vercel Blob.

## What's included

- **Storefront** (`/`, `/products`, `/products/[slug]`, `/cart`) — browse products, pick a size/SKU, add to cart, checkout with Stripe.
- **Admin dashboard** (`/admin`) — password-protected. View orders, update order status, manage products/variants, upload product photos.
- **Stripe Checkout** — hosted payment page, AUD, Australia-only shipping, flat rate with free shipping over a threshold.
- **Automated emails** — order confirmation email sent via Resend when a Stripe payment completes.

## One-time setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Postgres database

Sign up at [neon.tech](https://neon.tech) (free tier), create a project, and copy the connection string.

> **Just want to try it locally first, without signing up for anything?** Run `npx prisma dev` in a separate terminal — it starts a free local Postgres server and prints a `DATABASE_URL` you can paste into `.env`. Good for kicking the tires; switch to Neon (or any Postgres host) before deploying, since this local database doesn't persist to the cloud.

### 3. Set environment variables

Copy `.env.example` to `.env` and fill in every value:

```bash
cp .env.example .env
```

| Variable | Where to get it |
| --- | --- |
| `DATABASE_URL` | Neon dashboard → connection string |
| `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | [Stripe Dashboard → API keys](https://dashboard.stripe.com/apikeys) |
| `STRIPE_WEBHOOK_SECRET` | [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks) — see step 5 |
| `RESEND_API_KEY` | [Resend → API Keys](https://resend.com/api-keys) |
| `ORDER_EMAIL_FROM` | A verified sender on your Resend domain, e.g. `Orca Australia <orders@orcaaustralia.com>` |
| `BLOB_READ_WRITE_TOKEN` | Created automatically when you add Vercel Blob storage to your Vercel project (see step 6) |
| `ADMIN_PASSWORD` | Any password you choose for `/admin` |
| `ADMIN_SESSION_SECRET` | A random string 32+ characters long (e.g. `openssl rand -base64 32`) |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` locally, your real domain in production |

### 4. Run database migrations and seed sample products

```bash
npm run db:migrate
npm run db:seed
```

This creates two starter products (Classic Swim Shorts, Tencel Modal Boxer Brief) with sizes S–XXL and placeholder images, so the store isn't empty on first run. Replace the placeholder photos any time from `/admin/products`.

### 5. Set up the Stripe webhook

Stripe needs to notify the app when a payment completes, so orders get created and confirmation emails get sent.

- **Local development**: install the [Stripe CLI](https://docs.stripe.com/stripe-cli) and run:
  ```bash
  stripe listen --forward-to localhost:3000/api/webhooks/stripe
  ```
  Copy the `whsec_...` value it prints into `STRIPE_WEBHOOK_SECRET`.
- **Production**: in the Stripe Dashboard, add an endpoint pointing to `https://yourdomain.com/api/webhooks/stripe`, listening for the `checkout.session.completed` event, and copy its signing secret into `STRIPE_WEBHOOK_SECRET` on your hosting provider.

### 6. Run it

```bash
npm run dev
```

Visit `http://localhost:3000` for the store and `http://localhost:3000/admin` for the dashboard (sign in with `ADMIN_PASSWORD`).

## Deploying to Vercel

1. Push this project to a GitHub repository and import it into [Vercel](https://vercel.com/new).
2. Add all the environment variables from `.env` in the Vercel project settings.
3. In the Vercel project, go to **Storage → Create Database → Blob** to provision Vercel Blob; it will add `BLOB_READ_WRITE_TOKEN` automatically.
4. Point `orcaaustralia.com` at the Vercel project (**Settings → Domains**).
5. After the first deploy, run `npm run db:deploy` against the production `DATABASE_URL` (applies existing migrations without prompting — run it locally with the production URL set, or as a one-off command from your host) and add the Stripe production webhook endpoint from step 5 above.

## Everyday use

- **Add a product**: `/admin/products/new`, then add sizes/prices and upload photos on the product's edit page.
- **View and fulfill orders**: `/admin/orders`.
- **Change prices/stock**: `/admin/products/[product]` — edit the size row and click Save.
