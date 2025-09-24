import React,{useState} from "react";
import logo from "../../assets/logo.png"

import {useDispatch, useSelector} from 'react-redux'
import { driverLogin, clearError } from "../../redux/slice/driver/driverSlice.js";
import { useNavigate } from "react-router-dom";

const DriverLogin = () => {

const [email,setEmail]=useState("");
const [password,setPassword]=useState("")

const dispatch  = useDispatch();
const navigate = useNavigate();

const {loading,error,isAuthenticated}=useSelector((state)=>state.driver);

const handleSubmit= async(e)=>{
    e.preventDefault();   
      dispatch(clearError());
    try{
      const result = await dispatch(driverLogin({email,password})).unwrap();
      if(result.driver){
        navigate("/driver/driver-dashboard");
      }
    }catch(err){
      console.log("Error from server ",err)
    }  
    dispatch(clearError());  
}    
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-poppins">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md">
        <div className="bg-[oklch(0.36_0.13_296.97)] rounded-t-2xl py-6 flex justify-center">
          <img src={logo} alt="Nasa Logistic Carriers Logo" className="w-44" />
        </div>

        <div className="px-10 py-6 text-center">
          <h2 className="text-2xl font-semibold text-blue-900 mb-2">Driver Login</h2>
          {/* <p className="text-gray-600 text-sm mb-6">Welcome back! Please sign in to your driver account</p> */}
          
         <form onSubmit={handleSubmit}>
  <div className="text-left mb-4">
    <label htmlFor="email" className="block text-gray-700 mb-1 font-medium">
      Email Address
    </label>
    <input
      type="email"
      id="email"
      name="email"
      placeholder="Enter your driver email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
      required
    />
  </div>

  <div className="text-left mb-4">
    <label htmlFor="password" className="block text-gray-700 mb-1 font-medium">
      Password
    </label>
    <input
      type="password"
      id="password"
      name="password"
      placeholder="Enter your password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
      required
    />
  </div>

  <button
    type="submit"
    disabled={loading}
    className="w-full bg-[oklch(0.36_0.13_296.97)] hover:bg-purple-900 text-white font-semibold py-3 rounded-lg shadow-md mt-4 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
  >
    {loading ? (
      <>
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Signing in...
      </>
    ) : (
      "Sign In to Driver Portal"
    )}
  </button>

  {error && (
    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
      <p className="text-red-600 text-sm flex items-center">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {error}
      </p>
    </div>
  )}
  
  {isAuthenticated && (
    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
      <p className="text-green-600 text-sm flex items-center">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
        Login successful! Redirecting to dashboard...
      </p>
    </div>
  )}
</form>

          {/* <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Need help with your account?{" "}
              <a href="#" className="text-purple-700 hover:underline font-medium">
                Contact Support
              </a>
            </p>
          </div> */}

          {/* <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              For administrative access,{" "}
              <a href="/admin/login" className="text-purple-700 hover:underline">
                click here
              </a>
            </p>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default DriverLogin;