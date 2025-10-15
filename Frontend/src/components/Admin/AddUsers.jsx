import React,{useState,useEffect} from 'react';
import Header from '../../reuse/Header';
import Nav from '../../reuse/Nav';
import AddAdminForm from '../../reuse/AddAdminForm';
import AddDriverForm from '../../reuse/AddDriverForm';
import AdminsList from '../../reuse/AdminsList';
import DriversList from '../../reuse/DriversList';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from "react-toastify";
import { addDriver,addAdmin } from '../../redux/slice/admin/userLoadSlice';
import { clearMessages,getCities } from '../../redux/slice/admin/userLoadSlice';
import { accessAdminUser } from '../../redux/slice/admin/adminSlice';


const AddUsers = () => {
    const dispatch= useDispatch();
    const {error,success}= useSelector((state)=>state.users);
    const {isSuperAdmin}= useSelector((state)=>state.admin);
    const [activeTab, setActiveTab] = useState("drivers");
    
    useEffect(()=>{
      dispatch(getCities())
    },[dispatch]);
    
    useEffect(()=>{      

     if (error) {
      toast.error(error);
      dispatch(clearMessages()); // reset state after showing toast
    }
    if (success) {
      toast.success(success);
      dispatch(clearMessages());
    }
    },[error,success,dispatch]);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-poppins">
        <Header/>     
        
        {/* Toggle Switch - Show both options but conditionally enable */}
        <div className="flex items-center justify-center pt-6 pb-4">
          <div className="relative bg-white rounded-full p-1 shadow-md border border-gray-200">
            {/* Background slider */}
            <div 
              className={`absolute top-1 bottom-1 bg-purple-600 rounded-full transition-all duration-300 ease-in-out ${
                activeTab === "drivers" 
                  ? "left-1 right-1/2" 
                  : "left-1/2 right-1"
              }`}
            />
            
            {/* Drivers Tab */}
            <button
              onClick={() => setActiveTab("drivers")}
              className={`relative z-10 px-6 py-2 rounded-full font-medium transition-colors duration-300 ${
                activeTab === "drivers"
                  ? "text-white"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Drivers
            </button>
            
            {/* Admins Tab - Always visible but conditionally functional */}
            <button
              onClick={() => {
                // if (isSuperAdmin) {
                  setActiveTab("admins");
              // }
              }}
              className={`relative z-10 px-6 py-2 rounded-full font-medium transition-colors duration-300 ${
                activeTab === "admins"
                  ? "text-white"
                  : isSuperAdmin 
                    ? "text-gray-600 hover:text-gray-800"
                    : "text-gray-400 cursor-not-allowed"
              }`}
            >
              Admins
            </button>
          </div>
        </div>

        {/* Error/Success Messages */}
        {/* <div className="text-center mt-4">
          {error && (
            <p className="bg-red-100 text-red-700 px-4 py-2 rounded-md inline-block shadow">
              {error}
            </p>
          )}
          {success && (
            <p className="bg-green-100 text-green-700 px-4 py-2 rounded-md inline-block shadow">
              {success}
            </p>
          )}
        </div> */}
      
        {/* Content Area */}
        <div className="flex-1 p-6 pb-24">       
          {activeTab === "drivers" ? (
            <div className="space-y-6">
              {/* Add Driver Section */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Add New Driver
                </h2>
                <AddDriverForm onSubmit={(form) => dispatch(addDriver(form))} />
              </div>

              {/* Drivers List Section */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    All Drivers
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <DriversList/>
                </div>
              </div>
            </div>
          ) : (
            // ORIGINAL CONDITION: Only show admin content if isSuperAdmin
            <>
              {isSuperAdmin ? (
                <div className="space-y-6">
                  {/* Add Admin Section */}
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                      <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Add New Admin
                    </h2>
                    <AddAdminForm onSubmit={(form) => dispatch(addAdmin(form))} />
                  </div>

                  {/* Admins List Section */}
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        All Administrators
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <AdminsList />
                    </div>
                  </div>
                </div>
              ) : (
                // ORIGINAL FUNCTIONALITY: Show restriction message for non-superAdmin
                <div className="text-center py-12">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
                    <div className="text-yellow-600 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-yellow-800 mb-3">Access Restricted</h3>
                    <p className="text-yellow-700 leading-relaxed">
                      You don't have permission to manage administrators. Only super administrators can access this section.
                    </p>
                    <div className="mt-4 text-sm text-yellow-600">
                      Contact your system administrator for elevated access.
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        <Nav />
    </div>    
  );
}

export default AddUsers;