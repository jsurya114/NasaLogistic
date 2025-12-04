import { Navigate, Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { accessAdminUser } from "../../redux/slice/admin/adminSlice";

const ProtectedRoutes = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.admin);

  useEffect(() => {
    // Only hit /admin/access-admin when we don't yet know auth state.
    // This avoids an immediate redirect loop on iOS where cookies from
    // the Render backend may be blocked when called as a "third‑party"
    // request from the Vercel frontend.
    if (isAuthenticated === null) {
      dispatch(accessAdminUser());
    }
  }, [dispatch, isAuthenticated]);

  if (loading || isAuthenticated === null) {
    return null;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/admin/login" />;
};

export default ProtectedRoutes;