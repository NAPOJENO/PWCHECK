import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Vercel Serverless Function pro vytvoření Stripe Checkout Session.
 * Vyžaduje: STRIPE_SECRET_KEY, STRIPE_PRICE_ID, STRIPE_SUCCESS_URL, STRIPE_CANCEL_URL
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRICE_ID;
  const successUrl = process.env.STRIPE_SUCCESS_URL || `${req.headers.origin}/?success=true`;
  const cancelUrl = process.env.STRIPE_CANCEL_URL || `${req.headers.origin}/?canceled=true`;

  if (!secretKey || !priceId) {
    return res.status(500).json({
      error: "Stripe není nakonfigurován. Nastavte STRIPE_SECRET_KEY a STRIPE_PRICE_ID.",
    });
  }

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(secretKey);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        product: "pvcheck-export-access",
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    return res.status(500).json({
      error: err instanceof Error ? err.message : "Chyba při vytváření platby",
    });
  }
}
