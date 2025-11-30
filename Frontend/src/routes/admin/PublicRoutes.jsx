import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector,useDispatch } from "react-redux";
import { accessAdminUser } from "../../redux/slice/admin/adminSlice";
const PublicRoutes=()=>{
    const dispatch=useDispatch();
    const {isAuthenticated}=useSelector((state)=>state.admin);

    // useEffect(()=>{
    //     dispatch(accessAdminUser());
    // },[]);

    return isAuthenticated ? <Navigate to="/admin/dashboard" /> : <Outlet/> ; 
}

export default PublicRoutes;    