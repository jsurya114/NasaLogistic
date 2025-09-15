import React from "react";

function Nav(){

    return(
        <>
         <nav className="fixed bottom-0 left-0 right-0 bg-[#153a6a] border-t border-white/10">
        <div className="flex justify-center gap-4 p-3 max-w-5xl mx-auto">
          {[
            { href: "index.html", icon: "📊", label: "Dashboard" },
            { href: "users.html", icon: "👥", label: "Users" },
            { href: "routes.html", icon: "🧭", label: "Routes" },
            { href: "index.html", icon: "📦", label: "Jobs" },
            { href: "double-stop.html", icon: "🔁", label: "Double Stop" },
          ].map((item, i) => (
            <a
              key={i}
              href={item.href}
              className="bg-white text-gray-800 rounded-xl shadow-md px-4 py-2 flex flex-col items-center gap-1 hover:scale-105 transition"
            >
              <div className="w-10 h-10 bg-gray-100 grid place-items-center rounded-md text-2xl">
                {item.icon}
              </div>
              <small className="font-semibold">{item.label}</small>
            </a>
          ))}
        </div>
      </nav>
        </>
    )
}

export default Nav