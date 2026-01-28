import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@14.10.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, stripe-signature",
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
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeKey || !webhookSecret || !supabaseUrl || !supabaseServiceKey) {
      console.error("Missing environment variables");
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

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      console.error("Missing stripe signature");
      return new Response(
        JSON.stringify({ error: "Missing signature" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response(
        JSON.stringify({ error: "Webhook signature verification failed" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("=== STRIPE WEBHOOK EVENT ===");
    console.log("Event Type:", event.type);
    console.log("Event ID:", event.id);
    console.log("===========================");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle checkout.session.completed
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const coins = parseInt(session.metadata?.coins || "0");
      const clientId = session.client_reference_id;
      const sessionId = session.id;
      const packageId = session.metadata?.packageId || "unknown";
      const amount = session.amount_total || 0;

      console.log("Processing checkout.session.completed");
      console.log("Session ID:", sessionId);
      console.log("Client ID:", clientId);
      console.log("Coins to add:", coins);
      console.log("Payment Status:", session.payment_status);
      console.log("Package ID:", packageId);
      console.log("Amount:", amount);

      if (!clientId) {
        console.error("❌ No client ID in session");
        return new Response(
          JSON.stringify({ error: "No client ID" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Check if transaction already exists
      const { data: existingTransaction } = await supabase
        .from("transactions")
        .select("id, status")
        .eq("session_id", sessionId)
        .maybeSingle();

      if (existingTransaction && existingTransaction.status === "completed") {
        console.log("⚠️ Transaction already processed:", sessionId);
        return new Response(
          JSON.stringify({ received: true, status: "already_processed" }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Verify payment was successful
      if (session.payment_status !== "paid") {
        console.warn("⚠️ Payment not completed yet:", session.payment_status);

        // Record pending transaction
        await supabase.from("transactions").upsert({
          session_id: sessionId,
          client_id: clientId,
          package_id: packageId,
          coins,
          amount,
          status: "pending",
          stripe_payment_status: session.payment_status,
          created_at: new Date().toISOString(),
        });

        return new Response(
          JSON.stringify({ received: true, status: "payment_pending" }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (coins > 0) {
        // Get current coins
        const { data: profile, error: fetchError } = await supabase
          .from("profiles")
          .select("coins")
          .eq("client_id", clientId)
          .maybeSingle();

        if (fetchError) {
          console.error("❌ Error fetching profile:", fetchError);

          // Record failed transaction
          await supabase.from("transactions").upsert({
            session_id: sessionId,
            client_id: clientId,
            package_id: packageId,
            coins,
            amount,
            status: "failed",
            stripe_payment_status: session.payment_status,
            created_at: new Date().toISOString(),
          });

          return new Response(
            JSON.stringify({ error: "Database error" }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const currentCoins = profile?.coins || 0;
        const newCoins = currentCoins + coins;

        console.log(`Current coins: ${currentCoins} → Adding: ${coins} → New total: ${newCoins}`);

        // Update coins
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ coins: newCoins })
          .eq("client_id", clientId);

        if (updateError) {
          console.error("❌ Error updating coins:", updateError);

          // Record failed transaction
          await supabase.from("transactions").upsert({
            session_id: sessionId,
            client_id: clientId,
            package_id: packageId,
            coins,
            amount,
            status: "failed",
            stripe_payment_status: session.payment_status,
            created_at: new Date().toISOString(),
          });

          return new Response(
            JSON.stringify({ error: "Failed to update coins" }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // Record successful transaction
        await supabase.from("transactions").upsert({
          session_id: sessionId,
          client_id: clientId,
          package_id: packageId,
          coins,
          amount,
          status: "completed",
          stripe_payment_status: session.payment_status,
          created_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        });

        console.log(`✅ Successfully added ${coins} coins to client ${clientId}. New total: ${newCoins}`);
      } else {
        console.warn("⚠️ No coins in metadata or coins = 0");
      }
    }

    // Handle checkout.session.expired
    else if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("⏰ Checkout session expired:", session.id);
      console.log("Client ID:", session.client_reference_id);
    }

    // Handle payment_intent.payment_failed
    else if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log("❌ Payment failed:", paymentIntent.id);
      console.log("Failure reason:", paymentIntent.last_payment_error?.message);
    }

    // Handle charge.refunded
    else if (event.type === "charge.refunded") {
      const charge = event.data.object as Stripe.Charge;
      console.log("💰 Charge refunded:", charge.id);
      console.log("Refund amount:", charge.amount_refunded);
      // TODO: Implement coin removal logic if needed
    }

    // Log unhandled events
    else {
      console.log("ℹ️ Unhandled event type:", event.type);
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Webhook error:", error);
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