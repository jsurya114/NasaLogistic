import React, { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
import { accessDriver, driverLogout } from "../../redux/slice/driver/driverSlice.js";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { driver } = useSelector((state) => state.driver);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    dispatch(accessDriver());
    // console.log("Available user ", driver);
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(driverLogout());
    navigate("/driver/login");
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between h-16 bg-[#462976] text-white px-4 border-b border-white/10">
      {/* Left Side (Hide on mobile) */}
      <div className="hidden md:block font-semibold text-sm md:text-lg">
        Dashboard Driver
      </div>

      {/* Center (Logo always centered) */}
      <div className="absolute left-1/2 transform -translate-x-1/2 md:static md:translate-x-0 md:left-auto">
        <img
          src={logo}
          alt="Logo"
          className="w-28 sm:w-40 md:w-56 object-contain"
        />
      </div>

      {/* Right Side - Desktop (≥768px) */}
      <div className="hidden md:flex items-center gap-3 text-sm md:text-base">
        <div className="flex flex-col items-center">
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-yellow-400 text-black font-bold grid place-items-center">
            👤
          </div>
          <div className="font-semibold truncate max-w-[120px] md:max-w-[150px]">
            {driver?.name}
          </div>
        </div>

        <button
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md font-semibold"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      {/* Hamburger Menu - Mobile (<768px) */}
      <div className="md:hidden relative ml-auto">
        <button onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Small dropdown */}
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-36 bg-white text-black rounded-md shadow-lg z-50">
            <ul className="py-2 text-sm">
              <li className="px-4 py-2 border-b border-gray-200 font-medium text-[#462976]">
                Dashboard Driver
              </li>
              <li className="px-4 py-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-yellow-400 text-black text-xs grid place-items-center">
                  👤
                </span>
                <span className="truncate">{driver?.name}</span>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
