import React from "react";
import { NavLink } from "react-router-dom";

function Nav() {
  const links = [
    { to: "/admin/dashboard", icon: "📊", label: "Dashboard" },
    { to: "/admin/create-users", icon: "👥", label: "Users" },
    { to: "/admin/routes", icon: "🧭", label: "Routes" },
    { to: "/admin/jobs", icon: "📦", label: "Jobs" },
    { to: "/admin/double-stop", icon: "🔁", label: "Double Stop" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#153a6a] border-t border-white/10">
      <div className="flex justify-center gap-4 p-3 max-w-5xl mx-auto">
        {links.map((item, i) => (
          <NavLink
            key={i}
            to={item.to}
            className={({ isActive }) =>
              `bg-white text-gray-800 rounded-xl shadow-md px-4 py-2 flex flex-col items-center gap-1 hover:scale-105 transition ${
                isActive ? "ring-2 ring-blue-500" : ""
              }`
            }
          >
            <div className="w-10 h-10 bg-gray-100 grid place-items-center rounded-md text-2xl">
              {item.icon}
            </div>
            <small className="font-semibold">{item.label}</small>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default Nav;