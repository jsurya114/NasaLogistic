import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector,useDispatch } from "react-redux";
import { accessAdminUser } from "../redux/slice/adminSlice";
const ProtectedRoutes=()=>{
    const dispatch=useDispatch();
    const {isAuthenticated}=useSelector((state)=>state.admin);

    useEffect(()=>{
        dispatch(accessAdminUser());
    },[dispatch]);    

    return isAuthenticated ? <Outlet/> : <Navigate to="/admin/login" />
}

export default ProtectedRoutes;