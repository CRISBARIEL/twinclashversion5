import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@14.10.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  accountId: string;
  adminSecret: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const adminSecret = Deno.env.get("ADMIN_SECRET") || "twinclash-admin-2024";

    if (!stripeKey) {
      return new Response(
        JSON.stringify({
          error: "Stripe no está configurado"
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

    const { accountId, adminSecret: providedSecret }: RequestBody = await req.json();

    if (providedSecret !== adminSecret) {
      return new Response(
        JSON.stringify({ error: "No autorizado" }),
        {
          status: 401,
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

    await stripe.accounts.del(accountId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Cuenta ${accountId} desvinculada exitosamente` 
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
    console.error("Error disconnecting Stripe account:", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Error desconocido al desvincular cuenta"
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