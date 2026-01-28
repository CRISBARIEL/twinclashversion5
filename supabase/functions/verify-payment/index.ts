import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@14.10.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeKey || !supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    const { sessionId, clientId } = await req.json();

    console.log("=== VERIFY PAYMENT ===");
    console.log("Session ID:", sessionId);
    console.log("Client ID:", clientId?.substring(0, 8) + "...");

    if (!sessionId || !clientId) {
      return new Response(
        JSON.stringify({ error: "Missing sessionId or clientId" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    console.log("Payment Status:", session.payment_status);
    console.log("Session Status:", session.status);

    // Check if payment was successful
    if (session.payment_status !== "paid") {
      return new Response(
        JSON.stringify({
          success: false,
          status: session.payment_status,
          message: "Payment not completed yet"
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get current coins from database to verify webhook processed
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: profile } = await supabase
      .from("profiles")
      .select("coins")
      .eq("client_id", clientId)
      .maybeSingle();

    console.log("Current coins in DB:", profile?.coins);

    return new Response(
      JSON.stringify({
        success: true,
        status: session.payment_status,
        coins: profile?.coins || 0,
        message: "Payment successful"
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error verifying payment:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
