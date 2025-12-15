"use server";

import { createClient } from "@/lib/supabase/server";

const MERCADOPAGO_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN!;
const MERCADOPAGO_API_BASE = "https://api.mercadopago.com";

export async function suscribe({
  planId,
  userId,
  email,
  returnUrl,
}: {
  planId: string;
  userId: string;
  email: string;
  returnUrl: string;
}) {
  try {
    const supabase = await createClient();

    // Obtener el plan de la base de datos
    const { data: plan, error: planError } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (planError || !plan) {
      return { error: "Plan no encontrado" };
    }

    // Crear la suscripción en Mercado Pago
    const subscriptionData = {
      reason: `Suscripción ${plan.name} - Menucito`,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: plan.price,
        currency_id: "ARS",
      },
      payer_email: email,
      back_url: returnUrl,
      status: "pending",
    };

    const response = await fetch(`${MERCADOPAGO_API_BASE}/preapproval`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(subscriptionData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error de Mercado Pago:", errorData);
      return { error: "Error al crear la suscripción en Mercado Pago" };
    }

    const subscription = await response.json();

    // Guardar información de la suscripción en la base de datos
    const { error: dbError } = await supabase
      .from("user_subscriptions")
      .upsert({
        user_id: userId,
        plan_id: planId,
        mp_subscription_id: subscription.id,
        status: "pending",
        email: email,
        created_at: new Date().toISOString(),
      });

    if (dbError) {
      console.error("Error al guardar en BD:", dbError);
      // No retornamos error aquí porque la suscripción ya se creó en MP
    }

    return { url: subscription.init_point };
  } catch (error) {
    console.error("Error en suscribe:", error);
    return { error: "Error interno del servidor" };
  }
}

export async function createMercadoPagoSubscriptionPlan(plan: any) {
  try {
    // Crear el plan de suscripción en Mercado Pago
    const planData = {
      reason: `Plan ${plan.name} - menucito`,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: plan.price,
        currency_id: "ARS",
      },
      back_url: `${process.env.APP_URL}/dashboard/subscription/callback`,
    };

    const response = await fetch(`${MERCADOPAGO_API_BASE}/preapproval_plan`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(planData),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error al crear plan en Mercado Pago: ${error}`);
    }

    const result = await response.json();

    // Guardar el ID del plan de Mercado Pago en nuestra base de datos
    const supabase = await createClient();
    await supabase
      .from("subscription_plans")
      .update({
        features: {
          ...plan.features,
          mercadopago_plan_id: result.id,
        },
      })
      .eq("id", plan.id);

    return { success: true, planId: result.id };
  } catch (error: any) {
    console.error("Error al crear plan de suscripción:", error);
    return { error: error.message };
  }
}

export async function deleteMercadoPagoSubscriptionPlan(planId: string) {
  try {
    const supabase = await createClient();

    // Obtener el plan para conseguir el ID de Mercado Pago
    const { data: plan } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (!plan?.features?.mercadopago_plan_id) {
      throw new Error("Plan no encontrado en Mercado Pago");
    }

    // Eliminar el plan de Mercado Pago
    const response = await fetch(
      `${MERCADOPAGO_API_BASE}/preapproval_plan/${plan.features.mercadopago_plan_id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "cancelled",
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error al eliminar plan en Mercado Pago: ${error}`);
    }

    // Remover el ID del plan de Mercado Pago de nuestra base de datos
    const updatedFeatures = { ...plan.features };
    delete updatedFeatures.mercadopago_plan_id;

    await supabase
      .from("subscription_plans")
      .update({
        features: updatedFeatures,
      })
      .eq("id", planId);

    return { success: true };
  } catch (error: any) {
    console.error("Error al eliminar plan de suscripción:", error);
    return { error: error.message };
  }
}

export async function createSubscription({
  planId,
  userId,
  returnUrl,
}: {
  planId: string;
  userId: string;
  returnUrl: string;
}) {
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

    if (!plan.features?.mercadopago_plan_id) {
      throw new Error("Plan no configurado en Mercado Pago");
    }

    // Crear la suscripción en Mercado Pago
    const subscriptionData = {
      preapproval_plan_id: plan.features.mercadopago_plan_id,
      reason: `Suscripción ${plan.name} - menucito`,
      external_reference: JSON.stringify({
        userId,
        planId,
        type: "subscription",
      }),
      payer_email: user.email,
      back_url: returnUrl,
      status: "pending",
    };

    const response = await fetch(`${MERCADOPAGO_API_BASE}/preapproval`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subscriptionData),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error al crear suscripción: ${error}`);
    }

    const result = await response.json();

    // Guardar información de la suscripción
    await supabase.from("user_subscriptions").upsert({
      user_id: userId,
      mp_subscription_id: result.id,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return { url: result.init_point, subscriptionId: result.id };
  } catch (error: any) {
    console.error("Error al crear suscripción:", error);
    return { error: error.message };
  }
}

export async function handleSubscriptionWebhook(data: any) {
  try {
    const supabase = await createClient();

    if (data.type === "subscription_preapproval") {
      const subscriptionId = data.data.id;

      // Obtener información de la suscripción desde Mercado Pago
      const response = await fetch(
        `${MERCADOPAGO_API_BASE}/preapproval/${subscriptionId}`,
        {
          headers: {
            Authorization: `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al obtener información de la suscripción");
      }

      const subscription = await response.json();

      // Extraer información del external_reference
      let externalReference;
      try {
        externalReference = JSON.parse(subscription.external_reference);
      } catch (e) {
        console.error("Error al parsear external_reference:", e);
        return { error: "Invalid external_reference" };
      }

      const { userId, planId } = externalReference;

      if (subscription.status === "authorized") {
        // Activar la suscripción del usuario
        await supabase
          .from("profiles")
          .update({
            subscription_tier: planId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        // Actualizar la suscripción
        await supabase.from("user_subscriptions").upsert({
          user_id: userId,
          mp_subscription_id: subscriptionId,
          status: "active",
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(), // 30 días
          updated_at: new Date().toISOString(),
        });
      } else if (
        subscription.status === "cancelled" ||
        subscription.status === "paused"
      ) {
        // Desactivar la suscripción del usuario
        await supabase
          .from("profiles")
          .update({
            subscription_tier: "free",
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        // Actualizar el estado de la suscripción
        await supabase
          .from("user_subscriptions")
          .update({
            status: subscription.status,
            updated_at: new Date().toISOString(),
          })
          .eq("mp_subscription_id", subscriptionId);
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error al procesar webhook de suscripción:", error);
    return { error: error.message };
  }
}
