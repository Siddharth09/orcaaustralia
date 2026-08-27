import { formatCents } from "@/lib/money";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://orcaaustralia.com";
const LOGO_URL = `${SITE_URL}/orca-icon.png`;

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export interface OrderEmailItem {
  productName: string;
  size: string;
  quantity: number;
  unitPriceCents: number;
  imageUrl?: string | null;
}

function emailShell(bodyHtml: string) {
  return `
  <div style="background:#f5f2ea;padding:32px 16px;font-family:Helvetica,Arial,sans-serif;">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e2da;">
      <div style="background:#0f2438;padding:28px 32px;text-align:center;">
        <img src="${LOGO_URL}" width="36" height="36" alt="Orca Australia" style="display:inline-block;vertical-align:middle;" />
        <span style="display:inline-block;vertical-align:middle;margin-left:10px;font-size:18px;letter-spacing:2px;color:#ffffff;font-weight:600;">
          ORCA <span style="font-weight:300;">AUSTRALIA</span>
        </span>
      </div>
      <div style="padding:32px;">
        ${bodyHtml}
      </div>
      <div style="background:#f5f2ea;padding:20px 32px;text-align:center;">
        <p style="margin:0;font-size:12px;color:#10203a99;">
          Need help? Email <a href="mailto:support@astryks.com" style="color:#0f2438;">support@astryks.com</a>
        </p>
        <p style="margin:8px 0 0;font-size:11px;color:#10203a66;">
          Orca Australia, part of the Astryks Group &middot;
          <a href="${SITE_URL}" style="color:#10203a66;">orcaaustralia.com</a>
        </p>
      </div>
    </div>
  </div>`;
}

function ctaButton(href: string, label: string) {
  return `
    <div style="margin-top:24px;text-align:center;">
      <a href="${href}" style="display:inline-block;background:#0f2438;color:#ffffff;text-decoration:none;font-size:13px;font-weight:600;padding:12px 28px;border-radius:999px;">
        ${label}
      </a>
    </div>`;
}

function secondaryButton(href: string, label: string) {
  return `
    <div style="margin-top:12px;text-align:center;">
      <a href="${href}" style="display:inline-block;background:#ffffff;color:#0f2438;text-decoration:none;font-size:13px;font-weight:600;padding:11px 28px;border-radius:999px;border:1px solid #0f2438;">
        ${label}
      </a>
    </div>`;
}

function itemRows(items: OrderEmailItem[]) {
  return items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #eeece4;" width="56">
          ${
            item.imageUrl
              ? `<img src="${item.imageUrl}" width="48" height="48" alt="" style="border-radius:6px;object-fit:cover;display:block;" />`
              : `<div style="width:48px;height:48px;border-radius:6px;background:#f5f2ea;"></div>`
          }
        </td>
        <td style="padding:12px 0 12px 12px;border-bottom:1px solid #eeece4;color:#10203a;font-size:14px;">
          ${escapeHtml(item.productName)}<br/>
          <span style="color:#10203a99;font-size:12px;">Size ${escapeHtml(item.size)} &times; ${item.quantity}</span>
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #eeece4;color:#10203a;font-size:14px;text-align:right;white-space:nowrap;">
          ${formatCents(item.unitPriceCents * item.quantity)}
        </td>
      </tr>`
    )
    .join("");
}

export function renderOrderConfirmationEmail(order: {
  id: string;
  customerName?: string | null;
  totalCents: number;
  items: OrderEmailItem[];
}) {
  const body = `
    <h1 style="margin:0 0 4px;color:#0f2438;font-size:22px;">
      Thanks${order.customerName ? `, ${escapeHtml(order.customerName.split(" ")[0])}` : ""}!
    </h1>
    <p style="margin:0 0 24px;color:#10203a;font-size:14px;">
      Your order <strong>#${order.id.slice(-8).toUpperCase()}</strong> is confirmed and being prepared.
    </p>
    <table style="width:100%;border-collapse:collapse;">
      ${itemRows(order.items)}
    </table>
    <table style="width:100%;margin-top:12px;">
      <tr>
        <td style="padding:8px 0;font-weight:700;color:#0f2438;font-size:15px;">Total</td>
        <td style="padding:8px 0;text-align:right;font-weight:700;color:#0f2438;font-size:15px;">
          ${formatCents(order.totalCents)}
        </td>
      </tr>
    </table>
    <p style="margin:28px 0 0;color:#10203a;font-size:14px;">
      We'll send another email as soon as your order ships.
    </p>
    ${ctaButton(`${SITE_URL}/account`, "View Order")}
  `;
  return emailShell(body);
}

export function renderShippingNotificationEmail(order: {
  id: string;
  customerName?: string | null;
  items?: OrderEmailItem[];
  trackingUrl?: string | null;
}) {
  const body = `
    <h1 style="margin:0 0 4px;color:#0f2438;font-size:22px;">
      On its way${order.customerName ? `, ${escapeHtml(order.customerName.split(" ")[0])}` : ""}!
    </h1>
    <p style="margin:0 0 24px;color:#10203a;font-size:14px;">
      Good news — your order <strong>#${order.id.slice(-8).toUpperCase()}</strong> has shipped.
    </p>
    ${order.items && order.items.length > 0 ? `<table style="width:100%;border-collapse:collapse;">${itemRows(order.items)}</table>` : ""}
    <p style="margin:28px 0 0;color:#10203a;font-size:14px;">
      Questions about your delivery? Just reply to this email or reach us at
      <a href="mailto:support@astryks.com" style="color:#0f2438;">support@astryks.com</a>.
    </p>
    ${order.trackingUrl ? ctaButton(order.trackingUrl, "Track Package") : ""}
    ${secondaryButton(`${SITE_URL}/account`, "View Order")}
  `;
  return emailShell(body);
}

export function renderMagicLinkEmail(link: string) {
  const body = `
    <h1 style="margin:0 0 4px;color:#0f2438;font-size:22px;">Sign in to your account</h1>
    <p style="margin:0 0 24px;color:#10203a;font-size:14px;">
      Click the button below to sign in and see your order history. This link expires in 30 minutes and can only be used once requested by you.
    </p>
    ${ctaButton(link, "Sign In")}
    <p style="margin:24px 0 0;color:#10203a99;font-size:12px;">
      Didn't request this? You can safely ignore this email.
    </p>
  `;
  return emailShell(body);
}

export function renderRefundRequestedAdminEmail(details: {
  orderId: string;
  productName: string;
  size: string;
  amountCents: number;
  reason: string;
  customerEmail: string;
}) {
  const body = `
    <h1 style="margin:0 0 4px;color:#0f2438;font-size:22px;">New refund request</h1>
    <p style="margin:0 0 20px;color:#10203a;font-size:14px;">
      A customer has requested a refund on order <strong>#${details.orderId.slice(-8).toUpperCase()}</strong>.
    </p>
    <table style="width:100%;font-size:14px;color:#10203a;">
      <tr><td style="padding:4px 0;color:#10203a99;">Item</td><td style="padding:4px 0;text-align:right;">${escapeHtml(details.productName)} (${escapeHtml(details.size)})</td></tr>
      <tr><td style="padding:4px 0;color:#10203a99;">Amount</td><td style="padding:4px 0;text-align:right;">${formatCents(details.amountCents)}</td></tr>
      <tr><td style="padding:4px 0;color:#10203a99;">Customer</td><td style="padding:4px 0;text-align:right;">${escapeHtml(details.customerEmail)}</td></tr>
      <tr><td style="padding:4px 0;color:#10203a99;">Reason</td><td style="padding:4px 0;text-align:right;">${escapeHtml(details.reason)}</td></tr>
    </table>
    ${ctaButton(`${SITE_URL}/admin/refunds`, "Review Request")}
  `;
  return emailShell(body);
}

export function renderRefundApprovedEmail(details: {
  orderId: string;
  productName: string;
  amountCents: number;
}) {
  const body = `
    <h1 style="margin:0 0 4px;color:#0f2438;font-size:22px;">Your refund is on its way</h1>
    <p style="margin:0 0 20px;color:#10203a;font-size:14px;">
      We've processed a refund of <strong>${formatCents(details.amountCents)}</strong> for
      <strong>${escapeHtml(details.productName)}</strong> from order <strong>#${details.orderId.slice(-8).toUpperCase()}</strong>.
      It should appear back in your account within 5–10 business days, depending on your bank.
    </p>
    ${ctaButton(`${SITE_URL}/account`, "View Order")}
  `;
  return emailShell(body);
}

export function renderRefundDeniedEmail(details: {
  orderId: string;
  productName: string;
  adminNote?: string | null;
}) {
  const body = `
    <h1 style="margin:0 0 4px;color:#0f2438;font-size:22px;">About your refund request</h1>
    <p style="margin:0 0 20px;color:#10203a;font-size:14px;">
      We've taken a look at your refund request for <strong>${escapeHtml(details.productName)}</strong>
      from order <strong>#${details.orderId.slice(-8).toUpperCase()}</strong>, and unfortunately
      we're not able to process it.
    </p>
    ${details.adminNote ? `<p style="margin:0 0 20px;color:#10203a;font-size:14px;background:#f5f2ea;padding:12px 16px;border-radius:8px;">${escapeHtml(details.adminNote)}</p>` : ""}
    <p style="margin:0;color:#10203a;font-size:14px;">
      Questions? Just reply to this email or reach us at
      <a href="mailto:support@astryks.com" style="color:#0f2438;">support@astryks.com</a>.
    </p>
  `;
  return emailShell(body);
}
