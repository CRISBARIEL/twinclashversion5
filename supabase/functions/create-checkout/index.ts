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
}

const PACKAGES: Record<string, { coins: number; price: number; name: string }> = {
  small: { coins: 500, price: 100, name: "Paquete Pequeño - 500 Monedas" },
  medium: { coins: 2500, price: 250, name: "Paquete Mediano - 2000 + 500 Bonus" },
  large: { coins: 12000, price: 600, name: "Paquete Grande - 10000 + 2000 Bonus" },
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const stripeKey = Deno.env.get("STRIPESECRETKEY");

    if (!stripeKey) {
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

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    const { packageId, coins, price }: RequestBody = await req.json();

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
      success_url: `${req.headers.get("origin") || "http://localhost:5173"}?payment=success&coins=${coins}`,
      cancel_url: `${req.headers.get("origin") || "http://localhost:5173"}?payment=cancelled`,
      metadata: {
        coins: coins.toString(),
        packageId: packageId,
      },
    });

    return new Response(
      JSON.stringify({ url: session.url }),
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