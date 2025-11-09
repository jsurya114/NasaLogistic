import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { accessAdminUser } from "../../redux/slice/admin/adminSlice";

function AdminPublicOnlyRoute() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(accessAdminUser());
  }, []);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      // Cancel this navigation by going back if possible; otherwise, go to dashboard
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate("/admin/dashboard", { replace: true });
      }
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading || isAuthenticated) return null;

  return <Outlet />;
}

export default AdminPublicOnlyRoute;
