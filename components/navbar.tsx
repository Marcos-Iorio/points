"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { ShoppingCart } from "lucide-react";
import useCart from "@/hooks/useCart";

type Club = {
  id: string;
  name: string;
  auth_user_id: string;
};

const Navbar = () => {
  const pathName = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [club, setClub] = useState<Club | null>(null);
  const supabase = createClient();

  const { cartItems } = useCart();

  const navItems = [
    { item: "Comprá", link: "/shop" },
    {
      item: "Acerca de",
      link: "",
      subItems: [
        { item: "Nosotros", link: "/about-us" },
        { item: "Kits", link: "/about-us/kits" },
      ],
    },
    {
      item: "Planes",
      link: "/plans",
    },
  ];

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: clubData } = await supabase
          .from("clubs")
          .select("*")
          .eq("auth_user_id", user.id)
          .single();

        setClub(clubData);
      }
    };

    getUser();
  }, []);

  if (pathName.includes("/club")) {
    return null;
  }

  return (
    <header className=" mx-auto w-[90%] rounded-lg flex justify-between gap-2">
      <Link
        href="/"
        className="border border-soft rounded-lg bg-surface flex justify-center items-center px-4 py-2"
      >
        <img src={null} alt="points logo" />
      </Link>
      <div className="bg-surface backdrop-blur-2xl border border-soft flex gap-2 justify-between w-full rounded-lg px-4 py-2">
        <div></div>
        <nav className="flex gap-2 justify-center items-center space-x-2">
          {navItems.reverse().map((item, i) => (
            <Link
              key={i}
              href={item.link}
              className="text-primary lowercase text-lg"
            >
              {item.item}
            </Link>
          ))}
        </nav>
        {user && club && (
          <p className="flex justi-center items-center">{club.name}</p>
        )}
      </div>

      <Link
        href="/cart"
        className="border border-soft rounded-lg bg-surface hover:bg-hover-light flex justify-center items-center px-4 py-2 relative"
      >
        <ShoppingCart className="w-5" />
        <div className="absolute top-[-10px] right-[-10px] rounded-full bg-accent-secondary w-1 h-1 flex justify-center items-center text-sm font-normal p-3 border-2 border-white text-blue-800">
          <p>{cartItems.length}</p>
        </div>
      </Link>
    </header>
  );
};

export default Navbar;
