import React,{useState} from 'react';
import Header from '../reuse/Header';
import Nav from '../reuse/Nav';
import AddAdminForm from '../reuse/AddAdminForm';
import AddDriverForm from '../reuse/AddDriverForm';
import AdminsList from '../reuse/AdminsList';
import DriversList from '../reuse/DriversList';
import { useDispatch, useSelector } from 'react-redux';
import { addDriver,addAdmin } from '../redux/slice/userLoadSlice';

const AddUsers = () => {
    const dispatch= useDispatch();
    const {error,success}= useSelector((state)=>state.users);
    
    const [activeTab, setActiveTab] = useState("drivers");
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
        <button
          onClick={() => setActiveTab("admins")}
          className={`px-6 py-2 font-medium ${
            activeTab === "admins"
              ? "border-b-2 border-purple-600 text-purple-600"
              : "text-gray-600"
          }`}
        >
          Admins
        </button>
      </div>

       {error && <p className="text-red-600 mt-2">{error}</p>}   
        {success && <p className="text-green-600 mt-2">{success}</p>}
      

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
