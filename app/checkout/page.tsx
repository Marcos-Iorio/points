"use client";

import useCart from "@/hooks/useCart";
import { formatPrice } from "@/utils/format-price";
import Link from "next/link";
import SelectPlan from "@/components/shop/product/select-plan";
import { useState, useEffect } from "react";
import { Plan } from "@/types/subscription";
import { createClient } from "@/lib/supabase/client";

export default function CheckoutPage() {
  const { cartItems } = useCart();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [hasActivePlan, setHasActivePlan] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const supabase = createClient();

  useEffect(() => {
    const checkActivePlan = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: clubData } = await supabase
          .from("clubs")
          .select(
            `
            id,
            club_subscriptions (
              status
            )
          `
          )
          .eq("auth_user_id", user.id)
          .single();

        if (clubData?.club_subscriptions) {
          const subscription = clubData.club_subscriptions as unknown as {
            status: string;
          };

          setHasActivePlan(subscription.status === "active");
        }
      }

      setLoading(false);
    };

    checkActivePlan();
  }, []);

  const calculateTotal = () => {
    const productsTotal = cartItems.reduce((total, item) => {
      const price = item.promotion_price || item.price;
      return total + price * item.quantity;
    }, 0);

    // Solo sumar el plan si el usuario NO tiene plan activo y seleccionó uno
    const planPrice = !hasActivePlan && selectedPlan ? selectedPlan.price : 0;
    return productsTotal + planPrice;
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-3xl font-bold">Tu carrito está vacío</h1>
        <Link
          href="/shop"
          className="bg-accent-primary text-white px-6 py-3 rounded-lg hover:bg-accent-primary/80"
        >
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Checkout</h1>

        <div className="bg-surface border border-soft rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-6">Resumen de compra</h2>

          <div className="space-y-6">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 pb-6 border-b border-soft last:border-0"
              >
                {item.images && item.images.length > 0 && (
                  <div className="w-24 h-24 bg-hover-light rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.images[0].image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                  <p className="text-text-secondary mb-2">
                    Cantidad: {item.quantity}
                  </p>

                  <div className="space-y-1">
                    <p className="text-lg font-semibold">
                      Precio unitario:{" "}
                      {formatPrice(item.promotion_price || item.price)}{" "}
                      {item.promotion_price && (
                        <span className="text-sm text-text-secondary line-through ml-2">
                          {formatPrice(item.price)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold">
                    {formatPrice(
                      (item.promotion_price || item.price) * item.quantity
                    )}
                  </p>
                  <p className="text-sm text-text-secondary">Subtotal</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface border border-soft rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Plan de soporte</h2>
          <SelectPlan
            setSelectedPlan={setSelectedPlan}
            selectedPlan={selectedPlan}
          />
        </div>

        <div className="bg-surface border border-soft rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Resumen de pago</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-lg">
              <span>Productos</span>
              <span>
                {formatPrice(
                  cartItems.reduce(
                    (total, item) =>
                      total +
                      (item.promotion_price || item.price) * item.quantity,
                    0
                  )
                )}
              </span>
            </div>
            {!hasActivePlan && selectedPlan && (
              <div className="flex justify-between text-lg">
                <span>Plan {selectedPlan.name}</span>
                <span>{formatPrice(selectedPlan.price)}/mes</span>
              </div>
            )}
            {hasActivePlan && (
              <div className="flex justify-between text-lg text-green-600">
                <span>Plan de soporte</span>
                <span>Tiene un plan asociado</span>
              </div>
            )}
            <div className="pt-3 border-t border-soft flex justify-between items-center text-2xl font-bold">
              <span>Total</span>
              <span>{formatPrice(calculateTotal())}</span>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-soft rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Método de pago</h2>
          <p className="text-text-secondary">
            La integración de pagos se implementará próximamente.
          </p>
        </div>

        <div className="flex gap-4">
          <Link
            href="/shop"
            className="flex-1 bg-hover-light text-text-primary px-6 py-3 rounded-lg text-center hover:bg-border font-semibold"
          >
            Seguir comprando
          </Link>
          <button
            disabled
            className="flex-1 bg-accent-primary/50 text-white px-6 py-3 rounded-lg font-semibold cursor-not-allowed"
          >
            Finalizar compra (Próximamente)
          </button>
        </div>
      </div>
    </div>
  );
}
