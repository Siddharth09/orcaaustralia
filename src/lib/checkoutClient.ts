export async function startCheckout(
  items: { variantId: string; quantity: number }[]
) {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });

  let data: { url?: string; error?: string } = {};
  try {
    data = await res.json();
  } catch {
    // response had no JSON body (e.g. an unhandled server error page)
  }

  if (!res.ok || !data.url) {
    throw new Error(data.error ?? "Checkout failed. Please try again.");
  }

  window.location.href = data.url;
}
