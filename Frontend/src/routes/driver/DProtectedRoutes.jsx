import { Navigate,Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useSelector,useDispatch } from "react-redux";
import { accessDriver } from "../../redux/slice/driver/driverSlice.js";

function DProtectRoutes(){
    const dispatch = useDispatch()
    const {isAuthenticated}=useSelector((state)=>state.driver)
    useEffect(()=>{
        dispatch(accessDriver())
    },[])
    return isAuthenticated ? <Outlet/>:<Navigate to ="/driver/login"/>

}

export default DProtectRoutes