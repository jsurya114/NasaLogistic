import React from "react";
import logo from "../assets/logo.png"; 
import { logout } from "../redux/slice/adminSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
function Header(){
    const dispatch = useDispatch();
    const navigate = useNavigate();
    // const {token, error}= useSelector((state)=>state.admin);
    const handleLogout=()=>{
      dispatch(logout());
      navigate('/admin/login');
    }


    return(
        <>
          <header className="sticky top-0 z-50 grid grid-cols-[1fr_auto_1fr] items-center h-16 bg-[#462976] text-white px-4 border-b border-white/10">
        <div className="font-semibold">Dashboard Admin</div>
        <div className="justify-self-center mt-1">
          <img src={logo} alt="Logo" className="w-56" />
        </div>
        <div className="justify-self-end flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-yellow-400 text-black font-bold grid place-items-center">
            👤
          </div>
          <div className="font-semibold">Nasa Logistic Carriers LLC ▾</div>
          <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md font-semibold" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>
        </>
    )
}

export default Header