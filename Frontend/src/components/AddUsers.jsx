import React,{useState,useEffect} from 'react';
import Header from '../reuse/Header';
import Nav from '../reuse/Nav';
import AddAdminForm from '../reuse/AddAdminForm';
import AddDriverForm from '../reuse/AddDriverForm';
import AdminsList from '../reuse/AdminsList';
import DriversList from '../reuse/DriversList';
import { useDispatch, useSelector } from 'react-redux';
import { addDriver,addAdmin } from '../redux/slice/userLoadSlice';
import { clearMessages } from '../redux/slice/userLoadSlice';
const AddUsers = () => {
    const dispatch= useDispatch();
    const {error,success,isSuperAdmin}= useSelector((state)=>state.users);

    const [activeTab, setActiveTab] = useState("drivers");

    useEffect(()=>{
        if (error || success) {
      const timer = setTimeout(() => {
        dispatch(clearMessages());
      }, 5000);
      return () => clearTimeout(timer);
    }
    },[error,success]);
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-poppins">
        <Header/>     
            <div className="flex border-b border-gray-300">
            <button
            onClick={() => setActiveTab("drivers")}
            className={`px-6 py-2 font-medium ${
                activeTab === "drivers"
                ? "border-b-2 border-purple-600 text-purple-600"
                : "text-gray-600"
            }`}
            >
            Drivers
            </button>
           {isSuperAdmin && (   // ✅ Only show Admins tab for superAdmin
            <button
      onClick={() => setActiveTab("admins")}
      className={`px-6 py-2 font-medium ${
        activeTab === "admins"
          ? "border-b-2 border-purple-600 text-purple-600"
          : "text-gray-600"
            }`}>
            Admins
            </button>
        )} 
        </div>

       <div className="text-center mt-4">
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
    </div>
      

      <div className="flex-1 p-6 pb-24">       
        {activeTab === "drivers" ? (
    <>
      <h2 className="text-lg font-bold">Add Drivers</h2>
      <AddDriverForm onSubmit={(form) => dispatch(addDriver(form))} />
         <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto">
         <DriversList/>
         </section>
      
    </>
  ) : (
    <>
      <h2 className="text-lg font-bold">Add Admins</h2>
      <AddAdminForm onSubmit={(form) => dispatch(addAdmin(form))} />        
         <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto">
           
      <AdminsList />
      </section>
     
    </>
  )}
      </div>
      <Nav />
    </div>    
  );
}

export default AddUsers;
