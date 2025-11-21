//  import React  from "react";
//  import { NavLink } from "react-router-dom";

//  function Nav(){
//     return(
//         <>
//           {/* Dock */}
//       <nav className="fixed left-0 right-0 bottom-0 bg-[#153a6a] border-t border-white/10">
//         <div className="grid grid-flow-col gap-4 justify-center px-4 py-3 max-w-[1200px] mx-auto">
//           <a
//             href="/driver/dashboard"
//             className="bg-white text-[#1f2633] rounded-xl px-4 py-2 min-w-[105px] flex flex-col items-center gap-2 shadow-md"
//           >
//             <div className="w-10 h-10 rounded-lg bg-[#eef2f7] flex items-center justify-center text-2xl">
//               📊
//             </div>
//             <small className="text-[13px] font-semibold">Dashboard</small>
//           </a>
//           <a
           
//             className="bg-white text-[#1f2633] rounded-xl px-4 py-2 min-w-[105px] flex flex-col items-center gap-2 shadow-md"
//           >
//             <div className="w-10 h-10 rounded-lg bg-[#eef2f7] flex items-center justify-center text-2xl">
//               🧭
//             </div>
//             <small className="text-[13px] font-semibold">Routes</small>
//           </a>
//         </div>
//       </nav>
//         </>
//     )
//  }
//  export default Nav


import React from "react";
import { NavLink } from "react-router-dom";

function Nav() {
  return (
    <>
      {/* Dock */}
      <nav className="fixed left-0 right-0 bottom-0 bg-[#462976] border-t border-white/10">
        <div className="grid grid-flow-col gap-4 justify-center px-4 py-3 max-w-[1200px] mx-auto">
          <NavLink
            to="/driver/dashboard"
            className={({ isActive }) =>
              `bg-white text-[#1f2633] rounded-xl px-4 py-2 min-w-[105px] flex flex-col items-center gap-2 shadow-md ${
                isActive ? "bg-opacity-90" : ""
              }`
            }
          >
            <div className="w-10 h-10 rounded-lg bg-[#eef2f7] flex items-center justify-center text-2xl">
              📊
            </div>
            <small className="text-[13px] font-semibold">Dashboard</small>
          </NavLink>
          <NavLink
            to="/driver/access-codes"
            className={({ isActive }) =>
              `bg-white text-[#1f2633] rounded-xl px-4 py-2 min-w-[105px] flex flex-col items-center gap-2 shadow-md ${
                isActive ? "bg-opacity-90" : ""
              }`
            }
          >
            <div className="w-10 h-10 rounded-lg bg-[#eef2f7] flex items-center justify-center text-2xl">
              🔑
            </div>
            <small className="text-[13px] font-semibold">Access Codes</small>
          </NavLink>
          <NavLink
            to="/driver/delivery"
            className={({ isActive }) =>
              `bg-white text-[#1f2633] rounded-xl px-4 py-2 min-w-[105px] flex flex-col items-center gap-2 shadow-md ${
                isActive ? "bg-opacity-90" : ""
              }`
            }
          >
            <div className="w-10 h-10 rounded-lg bg-[#eef2f7] flex items-center justify-center text-2xl">
             🚛
            </div>
            <small className="text-[13px] font-semibold">Deliveries</small>
          </NavLink>
        </div>
      </nav>
    </>
  );
}

export default Nav;