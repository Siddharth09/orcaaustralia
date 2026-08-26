import { formatCents } from "@/lib/money";

export interface OrderEmailItem {
  productName: string;
  size: string;
  quantity: number;
  unitPriceCents: number;
}

export function renderOrderConfirmationEmail(order: {
  id: string;
  customerName?: string | null;
  totalCents: number;
  items: OrderEmailItem[];
}) {
  const rows = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;color:#10203a;">${item.productName} (${item.size}) &times; ${item.quantity}</td>
          <td style="padding:8px 0;text-align:right;color:#10203a;">${formatCents(
            item.unitPriceCents * item.quantity
          )}</td>
        </tr>`
    )
    .join("");

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:24px;">
    <h1 style="color:#0f2438;font-size:20px;">Thanks${order.customerName ? `, ${order.customerName}` : ""}!</h1>
    <p style="color:#10203a;">Your Orca Australia order <strong>#${order.id.slice(-8).toUpperCase()}</strong> is confirmed.</p>
    <table style="width:100%;border-collapse:collapse;margin-top:16px;border-top:1px solid #e5e2da;">
      ${rows}
    </table>
    <table style="width:100%;margin-top:8px;border-top:1px solid #e5e2da;">
      <tr>
        <td style="padding:8px 0;font-weight:bold;color:#0f2438;">Total</td>
        <td style="padding:8px 0;text-align:right;font-weight:bold;color:#0f2438;">${formatCents(
          order.totalCents
        )}</td>
      </tr>
    </table>
    <p style="color:#10203a;margin-top:24px;">We'll email you again once your order ships. Thanks for shopping with us.</p>
    <p style="color:#10203a;">— Orca Australia</p>
  </div>`;
}

export function renderShippingNotificationEmail(order: {
  id: string;
  customerName?: string | null;
}) {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:24px;">
    <h1 style="color:#0f2438;font-size:20px;">Your order is on its way${order.customerName ? `, ${order.customerName}` : ""}!</h1>
    <p style="color:#10203a;">Good news — your Orca Australia order <strong>#${order.id.slice(-8).toUpperCase()}</strong> has shipped.</p>
    <p style="color:#10203a;margin-top:16px;">Questions about your delivery? Just reply to this email or reach us at
      <a href="mailto:support@astryks.com" style="color:#0f2438;">support@astryks.com</a>.
    </p>
    <p style="color:#10203a;margin-top:24px;">Thanks for shopping with us.</p>
    <p style="color:#10203a;">— Orca Australia</p>
  </div>`;
}
