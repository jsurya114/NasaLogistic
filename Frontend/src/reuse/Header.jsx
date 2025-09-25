import React,{useEffect} from "react";
import logo from "../assets/logo.png"; 
import { accessAdminUser, adminLogout} from "../redux/slice/admin/adminSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
function Header(){
    const dispatch = useDispatch();   
    const navigate= useNavigate();  
    const {admin}= useSelector((state)=>state.admin);

    useEffect(()=>{
      dispatch(accessAdminUser());
      console.log("Avaibale user ", admin);
    },[]);

    

    const handleLogout=()=>{
      dispatch(adminLogout());
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
        {/* Stack icon and name vertically */}
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-yellow-400 text-black font-bold grid place-items-center">
            👤
          </div>
          <div className="font-semibold">{admin?.name}</div>
        </div>

        {/* Logout button stays next to the stack */}
        <button
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md font-semibold"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
      </header>
        </>
    )
}

export default Header