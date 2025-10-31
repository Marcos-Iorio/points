import { requireClub } from "@/lib/auth";
import Link from "next/link";
import React from "react";

const Navbar = async () => {
  const { user, club } = await requireClub();

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

  return (
    <header className="flex gap-2 justify-between mx-auto my-5 p-4 px-10  bg-surface backdrop-blur-2xl w-3/4 rounded-lg border border-soft">
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
      {user && <p>{club.name}</p>}
    </header>
  );
};

export default Navbar;
