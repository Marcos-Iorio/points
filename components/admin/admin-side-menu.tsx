"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Settings, User, MapPin, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";

interface AdminSideMenuProps {
  clubData: {
    name: string;
    id: string;
  };
  userEmail?: string;
  userName?: string;
}

export function AdminSideMenu({
  clubData,
  userEmail,
  userName,
}: AdminSideMenuProps) {
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  };

  const menuItems = [
    {
      href: `/club/${clubData.name}/${clubData.id}/admin`,
      label: "Dashboard",
      icon: Home,
    },
    {
      href: `/club/${clubData.id}/admin/canchas`,
      label: "Canchas",
      icon: MapPin,
    },
    {
      href: `/club/${clubData.id}/admin/configuracion`,
      label: "Configuración",
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 h-screen bg-background  flex flex-col gap-3 py-3 pl-3">
      <div className="flex items-center gap-3 bg-surface border border-border rounded-lg p-2">
        <div className="w-10 h-10 rounded-full bg-accent-primary flex items-center justify-center">
          <User className="w-5 h-5 text-gray-600 " />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {userName || "Usuario"}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {userEmail || "email@example.com"}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 bg-surface border border-border p-2 rounded-lg">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${
                  isActive
                    ? "bg-accent-primary text-gray-900"
                    : "text-primary hover:bg-hover-light hover:text-gray-900"
                }
              `}
            >
              {Icon && <Icon className="w-5 h-5" />}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div>
        <Button
          onClick={handleSignOut}
          disabled={isLoggingOut}
          variant="outline"
          className="w-full bg-surface border border-border justify-start gap-3 hover:bg-hover-light cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          {isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
        </Button>
      </div>
    </aside>
  );
}
