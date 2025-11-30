// import React,{useState,useEffect} from 'react'
// import { useDispatch,useSelector } from 'react-redux';
// import { excelDailyFileUpload} from '../../../src/redux/slice/excelSlice'
// import FileUpload from '../../../src/components/Excel-InputTag';
// import UploadedData from '../../reuse/UploadedData';
// import Header from '../../reuse/Header'
// import Nav from '../../reuse/Nav';
// import AdminsList from '../../reuse/AdminsList';

// const DoubleStop = () => {
//   const dispatch = useDispatch()
//   const [activeView, setActiveView] = useState("weekly");
//   const [file,setFile] = useState(null)
//   const [form, setForm] = useState({
//     week: '',
//     date: '',
//     file: null,
//   });

//   const [errors, setErrors] = useState({});

//   // Clear errors when switching views
//   useEffect(() => {
//     setErrors({});
//   }, [activeView]);

//   // Handle input change
//   const handleChange = (e) => {
//     const { name, value, type, files } = e.target;
//     setForm((prev) => ({
//       ...prev,
//       [name]: type === "file" ? files[0] : value,
//     }));
//   };

//   const handleSubmit = async(e) => {
//     e.preventDefault();

//     // Validation
//     let newErrors = {};
//     if (activeView === "weekly" && !form.week) {
//       newErrors.week = "Week is required";
//     }
//     if (activeView === "daily" && !form.date) {
//       newErrors.date = "Date is required";
//     }
//     if (!form.file) newErrors.file = "Excel file is required";
//     if (!file) {
//       alert('please select a valid excel file before submitting')
//         return
//     }
//     setErrors(newErrors);
//     const formData = new FormData()
//     formData.append('file',file)
//     dispatch(excelDailyFileUpload(formData))
//     // try {
//     //     const res = await fetch('',{
//     //       method:'POST',
//     //       body:formData
//     //     })
//     //     const data = await res.json()
//     //     console.log('upload successful',data)
//     //     alert("File uploaded successfully")
//     // } catch (error) {
//     //   console.error('Error uploading file',error)
//     //   alert('Upload failed')
//     // }

//   };

//   return (
//     <div className="min-h-screen bg-gray-100 text-gray-900 font-poppins">
//       <Header />

//       {/* View Toggle Section - Moved to Top */}
//       <div className="flex items-center justify-center pt-6 pb-4">
//         <div className="relative bg-white rounded-full p-1 shadow-md border border-gray-200">
//           <div
//             className={`absolute top-1 bottom-1 bg-purple-600 rounded-full transition-all duration-300 ease-in-out ${
//               activeView === "weekly"
//                 ? "left-1 right-1/2"
//                 : "left-1/2 right-1"
//             }`}
//           />

//           <button
//             onClick={() => setActiveView("weekly")}
//             className={`relative z-10 px-6 py-2 rounded-full font-medium transition-colors duration-300 ${
//               activeView === "weekly"
//                 ? "text-white"
//                 : "text-gray-600 hover:text-gray-800"
//             }`}
//           >
//             Weekly
//           </button>

//           <button
//             onClick={() => setActiveView("daily")}
//             className={`relative z-10 px-6 py-2 rounded-full font-medium transition-colors duration-300 ${
//               activeView === "daily"
//                 ? "text-white"
//                 : "text-gray-600 hover:text-gray-800"
//             }`}
//           >
//             Daily
//           </button>
//         </div>
//       </div>

//       <main className="max-w-[1450px] mx-auto p-4 pb-40">
//         {/* Form Section */}
//         <section className="bg-white border border-gray-200 rounded-xl shadow-sm mb-4 p-6">
//           <h2 className="font-bold text-gray-900 bg-gray-50 border-b border-gray-200 px-4 py-3 -mx-6 -mt-6 rounded-t-xl">
//             Double Stop
//           </h2>

//           <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
//             {/* Weekly Input */}
//             {activeView === "weekly" && (
//               <div>
//                 <label className="block mb-1 font-medium">Week</label>
//                 <input
//                   type="week"
//                   name="week"
//                   value={form.week}
//                   onChange={handleChange}
//                   className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 ${
//                     errors.week ? "border-red-500" : "border-gray-300"
//                   }`}
//                 />
//                 {errors.week && (
//                   <p className="text-red-500 text-sm mt-1">{errors.week}</p>
//                 )}
//               </div>
//             )}

//             {/* Daily Input */}
//             {activeView === "daily" && (
//               <div>
//                 <label className="block mb-1 font-medium">Date</label>
//                 <input
//                   type="date"
//                   name="date"
//                   value={form.date}
//                   onChange={handleChange}
//                   className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 ${
//                     errors.date ? "border-red-500" : "border-gray-300"
//                   }`}
//                 />
//                 {errors.date && (
//                   <p className="text-red-500 text-sm mt-1">{errors.date}</p>
//                 )}
//               </div>
//             )}

//             {/* Excel File */}
//             <FileUpload onFileSelect={setFile} />
//             {/* <div >
//               <label className="block mb-1 font-medium">Excel File</label>
//               <input
//                 type="file"
//                 name="file"
//                 accept='.xls,.xlsx'
//                 onChange={handleChange}
//                 className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 ${
//                   errors.file ? "border-red-500" : "border-gray-300"
//                 }`}
//               />
//               {errors.file && (
//                 <p className="text-red-500 text-sm mt-1">{errors.file}</p>
//               )}
//             </div> */}

//             {/* Upload Button */}
//             <div className="flex justify-end">
//               <button
//                 type="submit"
//                 className="px-6 py-2 bg-purple-700 text-white rounded-lg shadow hover:bg-purple-800"
//               >
//                 Upload Data
//               </button>
//             </div>
//           </form>
//         </section>

//         {/* Uploaded Data Section */}
//         <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto">
//           <h2 className="font-bold text-gray-900 bg-gray-50 border-b border-gray-200 px-4 py-3 rounded-t-xl">
//             {activeView === "weekly" ? "Weekly Data" : "Daily Data"}
//           </h2>

//           <div className="relative overflow-hidden">
//             {/* Weekly View */}
//             <div
//               className={`transition-transform duration-500 ease-in-out ${
//                 activeView === "weekly" ? "translate-x-0" : "-translate-x-full"
//               }`}
//               style={{
//                 display: activeView === "weekly" ? "block" : "none"
//               }}
//             >
//               <div className="p-4">
//                 <h3 className="text-lg font-semibold mb-4 text-purple-700">Weekly Overview</h3>
//                 <UploadedData viewType="weekly" />
//                 {/* You can add weekly-specific content here */}
//               </div>
//             </div>

//             {/* Daily View */}
//             <div
//               className={`transition-transform duration-500 ease-in-out ${
//                 activeView === "daily" ? "translate-x-0" : "translate-x-full"
//               }`}
//               style={{
//                 display: activeView === "daily" ? "block" : "none"
//               }}
//             >
//               <div className="p-4">
//                 <h3 className="text-lg font-semibold mb-4 text-purple-700">Daily Breakdown</h3>
//                 <UploadedData viewType="daily" />
//                 {/* You can add daily-specific content here */}
//               </div>
//             </div>
//           </div>
//         </section>
//       </main>
//       <Nav />
//     </div>
//   );
// };

// export default DoubleStop

import React, { useState,useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  excelDailyFileUpload,
  excelWeeklyFileUpload,
} from "../../redux/slice/admin/excelSlice";
import { fetchDashboardData, fetchWeeklyTempData } from "../../redux/slice/admin/doublestopSlice";
import { fetchDriverPayment,updateWeeklyExcelToDashboard } from "../../redux/slice/admin/dashboardUpdateSlice";
import FileUpload from "../../../src/components/Excel-InputTag";
import UploadedData from "../../reuse/UploadedData";
import Header from "../../reuse/Header";
import Nav from "../../reuse/Nav";
import DriverPaymentSection from "./DriverPaymentUpdate";
import TempUploadedData from "../../reuse/TempUploadedData";
import { toast } from "react-toastify";

const DoubleStop = () => {
  
  const dispatch = useDispatch();
  const [activeView, setActiveView] = useState("weekly");


 const [file,setFile]=useState(null);
  const [weeklyErrors, setWeeklyErrors] = useState({});

  // Daily form state
  const [dailyForm, setDailyForm] = useState({
    date: "",
    file: null,
  });
  const [dailyErrors, setDailyErrors] = useState({});
  const dailyFileRef = useRef(null);

  // Daily input handler
  const handleDailyChange = (e) => {
    const { name, value, type, files } = e.target;
    setDailyForm((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  // Weekly submit
  const handleWeeklySubmit = (e) => {
    e.preventDefault();
    let errors = {};
    if (!file) errors.file = "Excel file is required";

    setWeeklyErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const formData = new FormData();
    formData.append("file", file);
    
    dispatch(excelWeeklyFileUpload(formData)).unwrap()
    .then(()=>{
      toast.success("Weekly Excel upload completed!!");
      setFile(null);
    })
    .catch((err)=>{
      toast.error("Error while processing weekly upload")
    });
  };


  
  // Daily submit
  const handleDailySubmit = (e) => {
    e.preventDefault();
    let errors = {};
    if (!dailyForm.file) errors.file = "Excel file is required";

    setDailyErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const formData = new FormData();
    formData.append("file", dailyForm.file);
    dispatch(excelDailyFileUpload(formData))
      .unwrap()
      .then(() => {
        toast.success("Daily file uploaded successfully");
        // Clear only on success
        if (dailyFileRef.current && typeof dailyFileRef.current.clear === "function") {
          dailyFileRef.current.clear();
        }
        setDailyForm((prev) => ({ ...prev, file: null }));
      })
      .catch((err) => {
        const msg = typeof err === "string" ? err : err?.message || "Upload failed";
        toast.error(msg);
      });
  };
  const loadWeeklyData = useCallback(()=>{
    dispatch(fetchWeeklyTempData())
  },[dispatch])
  const loadDailyData = useCallback(()=>{
    dispatch(fetchDashboardData());
  },[dispatch])

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-poppins">
      <Header />

      {/* Toggle */}
      <div className="flex items-center justify-center pt-6 pb-4">
        <div className="relative bg-white rounded-full p-1 shadow-md border border-gray-200">
          <div
            className={`absolute top-1 bottom-1 bg-purple-600 rounded-full transition-all duration-300 ease-in-out ${
              activeView === "weekly" ? "left-1 right-1/2" : "left-1/2 right-1"
            }`}
          />
          <button
            onClick={() => setActiveView("weekly")}
            className={`relative z-10 px-6 py-2 rounded-full font-medium transition-colors duration-300 ${
              activeView === "weekly"
                ? "text-white"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setActiveView("daily")}
            className={`relative z-10 px-6 py-2 rounded-full font-medium transition-colors duration-300 ${
              activeView === "daily"
                ? "text-white"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Daily
          </button>
        </div>
      </div>

      <main className="max-w-[1450px] mx-auto p-4 pb-40">
        {/* Weekly Form */}
        {activeView === "weekly" && (
          <section className="bg-white border border-gray-200 rounded-xl shadow-sm mb-4 p-6">
            <h2 className="font-bold text-gray-900 bg-gray-50 border-b border-gray-200 px-4 py-3 -mx-6 -mt-6 rounded-t-xl">
              Weekly Upload
            </h2>
            <form
              onSubmit={handleWeeklySubmit}
              className="flex flex-col gap-4 mt-6"
            >
              {/* <div>
                
              </div> */}
              <div>
                 <FileUpload onFileSelect={setFile} />
                {weeklyErrors.file && (
                  <p className="text-red-500 text-sm mt-1">
                    {weeklyErrors.file}
                  </p>
                )}
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-700 text-white rounded-lg shadow hover:bg-purple-800"
                >
                  Upload Weekly Data
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Daily Form */}
        {activeView === "daily" && (
          <section className="bg-white border border-gray-200 rounded-xl shadow-sm mb-4 p-6">
            <h2 className="font-bold text-gray-900 bg-gray-50 border-b border-gray-200 px-4 py-3 -mx-6 -mt-6 rounded-t-xl">
              Daily Upload
            </h2>
            <form
              onSubmit={handleDailySubmit}
              className="flex flex-col gap-4 mt-6"
            >
             
              <div>
                <FileUpload
                  ref={dailyFileRef}
                  onFileSelect={(f) => setDailyForm({ ...dailyForm, file: f })}
                />
                {dailyErrors.file && (
                  <p className="text-red-500 text-sm mt-1">
                    {dailyErrors.file}
                  </p>
                )}
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-700 text-white rounded-lg shadow hover:bg-purple-800"
                >
                  Upload Daily Data
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Uploaded Data */}
        <section className="bg-white border mb-3 border-gray-200 rounded-xl shadow-sm overflow-x-auto">
          <h2 className="font-bold text-gray-900 bg-gray-50 border-b border-gray-200 px-4 py-3 rounded-t-xl">
            {activeView === "weekly" ? "Weekly Data" : "Daily Data"}
          </h2>
          <div className="p-4">
            {activeView === "weekly" ? (
              <TempUploadedData viewType="weekly" loadData={loadWeeklyData}/>
            ) : (
              <UploadedData viewType="daily" loadData={loadDailyData}/>
            )}
          </div>
        </section>
        {/* driver payment calculate button section
        <section className="bg-white border mb-4 p-6 border-gray-200 rounded-xl shadow-sm overflow-x-auto flex justify-center">
          <button className="px-3 py-1 bg-blue-800 text-white rounded hover:bg-blue-600">
            Calculate Driver Payment
          </button>
        </section> */}
        {activeView === "weekly" ? (
        <DriverPaymentSection loadData={()=>dispatch(updateWeeklyExcelToDashboard())}/>
        ):(
          <DriverPaymentSection loadData={()=>dispatch(fetchDriverPayment())}/>
        )}
      </main>

      <Nav />
    </div>
  );
}

export default DoubleStop;
