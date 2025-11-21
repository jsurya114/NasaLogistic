import React from "react";
import { NavLink } from "react-router-dom";

function Nav() {
  const links = [
    { to: "/admin/dashboard", icon: "📊", label: "Dashboard" },
    { to: "/admin/create-users", icon: "👥", label: "Users" },
    { to: "/admin/routes", icon: "🧭", label: "Routes" },
    { to: "/admin/jobs", icon: "📦", label: "Cities" },
    { to: "/admin/double-stop", icon: "🔁", label: "Double Stop" },
    { to: "/admin/manage-access-codes", icon: "🔑", label: "Access Codes" },

  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#462976] border-t border-white/10">
      <div className="flex justify-between sm:justify-center gap-1 xs:gap-2 sm:gap-3 md:gap-4 p-1 xs:p-2 sm:p-3 max-w-full sm:max-w-5xl mx-auto px-2 sm:px-4">
        {links.map((item, i) => (
          <NavLink
            key={i}
            to={item.to}
            className={({ isActive }) =>
              `bg-white text-gray-800 rounded-lg sm:rounded-xl shadow-md px-1 xs:px-2 sm:px-3 md:px-4 py-1 xs:py-2 flex flex-col items-center gap-0.5 xs:gap-1 hover:scale-105 transition flex-1 sm:flex-initial max-w-none sm:max-w-none ${
                isActive ? "ring-1 sm:ring-2 ring-blue-500" : ""
              }`
            }
          >
            <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gray-100 grid place-items-center rounded sm:rounded-md text-sm xs:text-base sm:text-xl md:text-2xl">
              {item.icon}
            </div>
            <small className="font-semibold text-xs xs:text-xs sm:text-sm leading-tight text-center">{item.label}</small>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default Nav;