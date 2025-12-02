"use client";

import useCart from "@/hooks/useCart";
import { formatPrice } from "@/utils/format-price";
import Link from "next/link";
import Image from "next/image";

export default function CheckoutPage() {
  const { cartItems } = useCart();

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.promotion_price || item.price;
      const planPrice = item.selectedPlan?.price || 0;
      return total + (price + planPrice) * item.quantity;
    }, 0);
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
                      Producto: {formatPrice(item.promotion_price || item.price)}{" "}
                      {item.promotion_price && (
                        <span className="text-sm text-text-secondary line-through ml-2">
                          {formatPrice(item.price)}
                        </span>
                      )}
                    </p>

                    {item.selectedPlan && (
                      <div className="bg-accent-secondary/20 rounded-lg p-3 mt-2">
                        <p className="font-semibold">
                          Plan de soporte: {item.selectedPlan.name}
                        </p>
                        <p className="text-sm text-text-secondary">
                          {formatPrice(item.selectedPlan.price)} mensuales
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold">
                    {formatPrice(
                      ((item.promotion_price || item.price) +
                        (item.selectedPlan?.price || 0)) *
                        item.quantity
                    )}
                  </p>
                  <p className="text-sm text-text-secondary">Total</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-soft">
            <div className="flex justify-between items-center text-2xl font-bold">
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
