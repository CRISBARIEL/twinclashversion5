import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@14.10.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  packageId: string;
  coins: number;
  price: number;
  clientId: string;
}

const PACKAGES: Record<string, { coins: number; price: number; name: string }> = {
  small: { coins: 1000, price: 99, name: "1000 Monedas" },
  medium: { coins: 1550, price: 399, name: "1550 Monedas (+50 Bonus)" },
  large: { coins: 2400, price: 799, name: "2400 Monedas (+200 Bonus)" },
  xlarge: { coins: 4000, price: 1499, name: "4000 Monedas (+700 Bonus)" },
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");

    console.log("=== CREATE CHECKOUT SESSION ===");
    console.log("Stripe Key Present:", !!stripeKey);
    console.log("Stripe Key Type:", stripeKey?.substring(0, 7));

    if (!stripeKey) {
      console.error("❌ STRIPE_SECRET_KEY not configured in Supabase Secrets");
      return new Response(
        JSON.stringify({
          error: "Stripe no está configurado. Por favor, contacta al administrador."
        }),
        {
          status: 503,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Validate it's a LIVE key
    if (!stripeKey.startsWith("sk_live_") && !stripeKey.startsWith("sk_test_")) {
      console.error("❌ Invalid Stripe key format");
      return new Response(
        JSON.stringify({
          error: "Configuración de Stripe inválida"
        }),
        {
          status: 503,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log("✅ Stripe configured with", stripeKey.startsWith("sk_live_") ? "LIVE" : "TEST", "key");

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    const { packageId, coins, price, clientId }: RequestBody = await req.json();

    console.log("Request data:", { packageId, coins, price, clientId: clientId?.substring(0, 8) + "..." });

    if (!clientId) {
      return new Response(
        JSON.stringify({ error: "Client ID es requerido" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const packageInfo = PACKAGES[packageId];
    if (!packageInfo) {
      return new Response(
        JSON.stringify({ error: "Paquete no válido" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const origin = req.headers.get("origin") || "http://localhost:5173";
    const referer = req.headers.get("referer");

    let baseUrl = origin;
    if (referer) {
      try {
        const refererUrl = new URL(referer);
        baseUrl = `${refererUrl.protocol}//${refererUrl.host}`;
      } catch (e) {
        console.log("Could not parse referer, using origin");
      }
    }

    console.log("Creating checkout session...");
    console.log("Origin:", origin);
    console.log("Referer:", referer);
    console.log("Base URL used:", baseUrl);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: packageInfo.name,
              description: `${coins} monedas para usar en el juego`,
            },
            unit_amount: packageInfo.price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}?payment=cancelled`,
      client_reference_id: clientId,
      metadata: {
        coins: coins.toString(),
        packageId: packageId,
        clientId: clientId,
      },
    });

    console.log("✅ Checkout session created successfully");
    console.log("Session ID:", session.id);
    console.log("Session URL:", session.url ? "Generated" : "Missing");

    return new Response(
      JSON.stringify({
        url: session.url,
        sessionId: session.id
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error creating checkout session:", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Error desconocido al procesar el pago"
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});