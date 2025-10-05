import React from "react";
import { useDispatch,useSelector } from "react-redux";
import { fetchDriverPayment } from "../../redux/slice/admin/dashboardUpdateSlice";
import { ToastContainer } from "react-toastify";
import "react-toastify/ReactToastify.css"

export default function DriverPaymentSection({loadData}) {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.dashboard);

  // const handleClick = () => {
    
  // };

  return (
    <>
      {/* Toasts */}
      <ToastContainer position="top-right" autoClose={3000} />

      {/* driver payment calculate button section */}
      <section className="bg-white border mb-4 p-6 border-gray-200 rounded-xl shadow-sm overflow-x-auto flex justify-center">
        <button
          onClick={loadData}
          className="px-3 py-1 bg-blue-800 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Calculating..." : "Calculate Driver Payment"}
        </button>
      </section>
    </>
  );
}
