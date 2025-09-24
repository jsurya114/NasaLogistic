import React from "react";
import logo from "../../assets/logo.png"
import Header from "../../reuse/driver/Header";
import Nav from "../../reuse/driver/Nav";
import { useSelector } from "react-redux";

const DriverDashboard = () => {
   const {driver}= useSelector((state)=>state.driver);
  return (
    <div className="min-h-screen bg-[#f4f6f8] text-[#1f2633] font-poppins">
      {/* Topbar */}
      <Header/>
      
      {/* Main content */}
      <main className="max-w-[1450px] mx-auto mt-4 mb-24 px-4 pb-36">
        {/* Welcome Card */}
        <div className="bg-white border border-[#e4e7eb] rounded-xl shadow-sm overflow-hidden mb-4">
          <div className="px-6 py-8 text-center">
            <h1 className="text-2xl font-semibold text-[#1f2633] mb-2">
              Welcome back, {driver?.name}!
            </h1>
            <p className="text-gray-600 text-base">
              Ready to start your delivery route for today?
            </p>
          </div>
        </div>
      </main>
      
      <Nav/>
    </div>
  );
};

export default DriverDashboard;
