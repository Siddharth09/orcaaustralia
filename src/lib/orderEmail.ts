import { formatCents } from "@/lib/money";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://orcaaustralia.com";
const LOGO_URL = `${SITE_URL}/orca-icon.png`;

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
          ${item.productName}<br/>
          <span style="color:#10203a99;font-size:12px;">Size ${item.size} &times; ${item.quantity}</span>
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
      Thanks${order.customerName ? `, ${order.customerName.split(" ")[0]}` : ""}!
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
    <div style="margin-top:24px;text-align:center;">
      <a href="${SITE_URL}/track-order" style="display:inline-block;background:#0f2438;color:#ffffff;text-decoration:none;font-size:13px;font-weight:600;padding:12px 28px;border-radius:999px;">
        Track Your Order
      </a>
    </div>
  `;
  return emailShell(body);
}

export function renderShippingNotificationEmail(order: {
  id: string;
  customerName?: string | null;
  items?: OrderEmailItem[];
}) {
  const body = `
    <h1 style="margin:0 0 4px;color:#0f2438;font-size:22px;">
      On its way${order.customerName ? `, ${order.customerName.split(" ")[0]}` : ""}!
    </h1>
    <p style="margin:0 0 24px;color:#10203a;font-size:14px;">
      Good news — your order <strong>#${order.id.slice(-8).toUpperCase()}</strong> has shipped.
    </p>
    ${order.items && order.items.length > 0 ? `<table style="width:100%;border-collapse:collapse;">${itemRows(order.items)}</table>` : ""}
    <p style="margin:28px 0 0;color:#10203a;font-size:14px;">
      Questions about your delivery? Just reply to this email or reach us at
      <a href="mailto:support@astryks.com" style="color:#0f2438;">support@astryks.com</a>.
    </p>
    <div style="margin-top:24px;text-align:center;">
      <a href="${SITE_URL}/track-order" style="display:inline-block;background:#0f2438;color:#ffffff;text-decoration:none;font-size:13px;font-weight:600;padding:12px 28px;border-radius:999px;">
        Track Your Order
      </a>
    </div>
  `;
  return emailShell(body);
}
