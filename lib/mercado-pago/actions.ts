"use server";

import { createClient } from "@/lib/supabase/server";
import { mercadopago } from "@/lib/mercado-pago/client";

interface CheckoutParams {
  planId: string;
  userId: string;
  returnUrl: string;
}

export async function createCheckoutSession({
  planId,
  userId,
  returnUrl,
}: CheckoutParams) {
  try {
    const supabase = await createClient();

    // Obtener información del usuario
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError) throw new Error("Usuario no encontrado");

    // Obtener información del plan
    const { data: plan, error: planError } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (planError) throw new Error("Plan no encontrado");

    // Crear la preferencia de pago en Mercado Pago
    const preference = {
      items: [
        {
          id: planId,
          title: `Plan ${plan.name} - menucito`,
          description:
            plan.description || `Suscripción al plan ${plan.name} de menucito`,
          quantity: 1,
          currency_id: "ARS", // Moneda argentina
          unit_price: plan.price,
        },
      ],
      payer: {
        email: user.email,
        name: user.full_name?.split(" ")[0] || "",
        surname: user.full_name?.split(" ").slice(1).join(" ") || "",
      },
      back_urls: {
        success: `${returnUrl}?success=true&plan_id=${planId}`,
        failure: `${returnUrl}?failure=true`,
        pending: `${returnUrl}?pending=true`,
      },
      auto_return: "approved",
      external_reference: JSON.stringify({
        userId,
        planId,
        type: "subscription",
      }),
      metadata: {
        userId,
        planId,
      },
    };

    const response = await mercadopago.preferences.create(preference);

    // Guardar información de la transacción
    await supabase.from("payment_transactions").insert({
      user_id: userId,
      plan_id: planId,
      payment_provider: "mercadopago",
      payment_id: response.body.id,
      status: "pending",
      amount: plan.price,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return { url: response.body.init_point };
  } catch (error: any) {
    console.error("Error al crear sesión de checkout:", error);
    return { error: error.message };
  }
}

export async function handleSuccessfulPayment(
  userId: string,
  planId: string,
  paymentId: string
) {
  try {
    const supabase = await createClient();

    // Verificar el estado del pago en Mercado Pago
    const paymentInfo = await mercadopago.payment.get(paymentId);

    if (paymentInfo.body.status !== "approved") {
      throw new Error("El pago no ha sido aprobado");
    }

    // Actualizar el plan del usuario
    await supabase
      .from("profiles")
      .update({
        subscription_tier: planId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    // Calcular la fecha de fin del período
    const currentDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // Suscripción mensual

    // Actualizar o crear la suscripción del usuario
    await supabase.from("user_subscriptions").upsert({
      user_id: userId,
      mp_customer_id: paymentInfo.body.payer.id,
      status: "active",
      current_period_start: currentDate.toISOString(),
      current_period_end: endDate.toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Actualizar la transacción
    await supabase
      .from("payment_transactions")
      .update({
        status: "completed",
        payment_details: paymentInfo.body,
        updated_at: new Date().toISOString(),
      })
      .eq("payment_id", paymentInfo.body.id);

    return { success: true };
  } catch (error: any) {
    console.error("Error al procesar pago exitoso:", error);
    return { error: error.message };
  }
}

export async function handleWebhook(data: any) {
  try {
    const supabase = await createClient();

    // Verificar el tipo de notificación
    if (data.type === "payment") {
      const paymentId = data.data.id;

      // Obtener información del pago
      const paymentInfo = await mercadopago.payment.get(paymentId);
      const payment = paymentInfo.body;

      // Extraer información del external_reference
      let externalReference;
      try {
        externalReference = JSON.parse(payment.external_reference);
      } catch (e) {
        console.error("Error al parsear external_reference:", e);
        return { error: "Invalid external_reference" };
      }

      const { userId, planId } = externalReference;

      if (payment.status === "approved") {
        // Actualizar el plan del usuario
        await supabase
          .from("profiles")
          .update({
            subscription_tier: planId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        // Calcular la fecha de fin del período
        const currentDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1); // Suscripción mensual

        // Actualizar o crear la suscripción del usuario
        await supabase.from("user_subscriptions").upsert({
          user_id: userId,
          mp_customer_id: payment.payer.id,
          status: "active",
          current_period_start: currentDate.toISOString(),
          current_period_end: endDate.toISOString(),
          updated_at: new Date().toISOString(),
        });

        // Actualizar la transacción
        await supabase
          .from("payment_transactions")
          .update({
            status: "completed",
            payment_details: payment,
            updated_at: new Date().toISOString(),
          })
          .eq("payment_id", payment.id);
      } else if (
        payment.status === "rejected" ||
        payment.status === "cancelled"
      ) {
        // Actualizar la transacción como fallida
        await supabase
          .from("payment_transactions")
          .update({
            status: "failed",
            payment_details: payment,
            updated_at: new Date().toISOString(),
          })
          .eq("payment_id", payment.id);
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error al procesar webhook de Mercado Pago:", error);
    return { error: error.message };
  }
}
