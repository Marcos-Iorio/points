"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

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
    <header className="flex gap-2 justify-between mx-auto p-4 px-10  bg-surface backdrop-blur-2xl w-[90%] rounded-lg border border-soft">
      <img src={null} alt="points logo" />
      <nav className="flex gap-2 justify-end space-x-2">
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
      {user && club && <p>{club.name}</p>}
    </header>
  );
};

export default Navbar;
