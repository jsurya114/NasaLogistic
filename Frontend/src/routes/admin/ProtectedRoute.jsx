import { Navigate, Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useSelector,useDispatch } from "react-redux";
import { accessAdminUser } from "../../redux/slice/admin/adminSlice";
const ProtectedRoutes=()=>{
    const dispatch=useDispatch();
    const {isAuthenticated,loading}=useSelector((state)=>state.admin);

    useEffect(()=>{
        dispatch(accessAdminUser());
    },[]);    

    if(loading || isAuthenticated===null){
        return null;
    }
    return isAuthenticated ? <Outlet/> : <Navigate to="/admin/login" />
}

export default ProtectedRoutes;