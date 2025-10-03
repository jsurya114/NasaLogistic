import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { excelDailyFileUpload,excelWeeklyFileUpload } from "../../redux/slice/admin/excelSlice";
import FileUpload from "../../../src/components/Excel-InputTag";
import UploadedData from "../../reuse/UploadedData";
import Header from "../../reuse/Header";
import Nav from "../../reuse/Nav";
import { fetchDashboardData } from "../../redux/slice/admin/doublestopSlice";


const DoubleStop = () => {
  const dispatch = useDispatch();
  const [activeView, setActiveView] = useState("weekly");

  // Weekly form state
  // const [weeklyForm, setWeeklyForm] = useState({
  //   week: "",
  //   file: null,
  // });
  const [file,setFile]=useState(null);
  const [weeklyErrors, setWeeklyErrors] = useState({});

  // Daily form state
  const [dailyForm, setDailyForm] = useState({
    date: "",
    file: null,
  });
  const [dailyErrors, setDailyErrors] = useState({});

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
    // if (!weeklyForm.week) errors.week = "Week is required";
    if (!file) errors.file = "Excel file is required";

    setWeeklyErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const formData = new FormData();
    // formData.append("week", weeklyForm.week);
    formData.append("file", file);
    dispatch(excelWeeklyFileUpload(formData));
  };

  // Daily submit
  const handleDailySubmit = (e) => {
    e.preventDefault();
    let errors = {};
    if (!dailyForm.date) errors.date = "Date is required";
    if (!dailyForm.file) errors.file = "Excel file is required";

    setDailyErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const formData = new FormData();
    formData.append("date", dailyForm.date);
    formData.append("file", dailyForm.file);
    dispatch(excelDailyFileUpload(formData));
  };

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
            <form onSubmit={handleWeeklySubmit} className="flex flex-col gap-4 mt-6">
              <div>
                {/* {/* <label className="block mb-1 font-medium">Week</label> */}              
              </div>
              <div>
                <FileUpload onFileSelect={setFile} />
                {weeklyErrors.file && (
                  <p className="text-red-500 text-sm mt-1">{weeklyErrors.file}</p>
                )}
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  // onChange={handleWeeklyChange}
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
            <form onSubmit={handleDailySubmit} className="flex flex-col gap-4 mt-6">
              <div>
                <label className="block mb-1 font-medium">Date</label>
                <input
                  type="date"
                  name="date"
                  value={dailyForm.date}
                  onChange={handleDailyChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 ${
                    dailyErrors.date ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {dailyErrors.date && (
                  <p className="text-red-500 text-sm mt-1">{dailyErrors.date}</p>
                )}
              </div>
              <div>
                <FileUpload onFileSelect={(f) => setDailyForm({ ...dailyForm, file: f })} />
                {dailyErrors.file && (
                  <p className="text-red-500 text-sm mt-1">{dailyErrors.file}</p>
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
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto">
          <h2 className="font-bold text-gray-900 bg-gray-50 border-b border-gray-200 px-4 py-3 rounded-t-xl">
            {activeView === "weekly" ? "Weekly Data" : "Daily Data"}
          </h2>
          <div className="p-4">
            {activeView === "weekly" ? (
              <UploadedData viewType="weekly" loadData={null}/>
            ) : (
              <UploadedData viewType="daily" loadData={()=>dispatch(fetchDashboardData())}/>
            )}
          </div>
        </section>
      </main>

      <Nav />
    </div>
  );
}

export default DoubleStop;
