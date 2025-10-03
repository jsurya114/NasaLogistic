import React,{useState,useEffect} from 'react'
import { useDispatch,useSelector } from 'react-redux';
import { excelDailyFileUpload,excelWeeklyFileUpload} from '../../../src/redux/slice/excelSlice'
import FileUpload from '../../../src/components/Excel-InputTag';
import UploadedData from '../../reuse/UploadedData';
import Header from '../../reuse/Header'
import Nav from '../../reuse/Nav';
import { toast } from 'react-toastify';
import AdminsList from '../../reuse/AdminsList';

const DoubleStop = () => {
  const dispatch = useDispatch()
  const [activeView, setActiveView] = useState("weekly");
  const [file,setFile] = useState(null)
  const [form, setForm] = useState({
    date: '',
    // file: null,
  });

  const [errors, setErrors] = useState({});

  // Clear errors when switching views
  useEffect(() => {
    setErrors({});
  }, [activeView]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    // Validation
    let newErrors = {};
    if (activeView === "daily" && !form.date) {
      newErrors.date = "Date is required";
    }
    if (!file) {
      toast.error("Please select a valid excel file before submitting");
      // alert('please select a valid excel file before submitting')
        return
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const formData = new FormData();
    formData.append('file',file);
    // console.log("Reached the client ");
    if (activeView === "daily") {
      formData.append("date", form.date);
    dispatch(excelDailyFileUpload(formData))
    }else{
      dispatch(excelWeeklyFileUpload(formData));
    }   
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-poppins">
      <Header />
      
      {/* View Toggle Section - Moved to Top */}
      <div className="flex items-center justify-center pt-6 pb-4">
        <div className="relative bg-white rounded-full p-1 shadow-md border border-gray-200">
          <div 
            className={`absolute top-1 bottom-1 bg-purple-600 rounded-full transition-all duration-300 ease-in-out ${
              activeView === "weekly" 
                ? "left-1 right-1/2" 
                : "left-1/2 right-1"
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
        {/* Form Section */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm mb-4 p-6">
          <h2 className="font-bold text-gray-900 bg-gray-50 border-b border-gray-200 px-4 py-3 -mx-6 -mt-6 rounded-t-xl">
            Double Stop
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
            {/* Weekly Input */}
            {activeView === "weekly" && (
              <div>
                {/* <label className="block mb-1 font-medium">Week</label>
                <input
                  type="week"
                  name="week"
                  value={form.week}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 ${
                    errors.week ? "border-red-500" : "border-gray-300"
                  }`}
                /> */}
                {/* {errors.week && (
                  <p className="text-red-500 text-sm mt-1">{errors.week}</p>
                )} */}
              </div>
            )}

            {/* Daily Input */}
            {activeView === "daily" && (
              <div>
                <label className="block mb-1 font-medium">Date</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 ${
                    errors.date ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.date && (
                  <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                )}
              </div>
            )}

            {/* Excel File */}
            <FileUpload onFileSelect={setFile} />
            {/* <div >
              <label className="block mb-1 font-medium">Excel File</label>
              <input
                type="file"
                name="file"
                accept='.xls,.xlsx'
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 ${
                  errors.file ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.file && (
                <p className="text-red-500 text-sm mt-1">{errors.file}</p>
              )}
            </div> */}

            {/* Upload Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-purple-700 text-white rounded-lg shadow hover:bg-purple-800"
              >
                Upload Data
              </button>
            </div>
          </form>
        </section>

        {/* Uploaded Data Section */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto">
          <h2 className="font-bold text-gray-900 bg-gray-50 border-b border-gray-200 px-4 py-3 rounded-t-xl">
            {activeView === "weekly" ? "Weekly Data" : "Daily Data"}
          </h2>
          
          <div className="relative overflow-hidden">
            {/* Weekly View */}
            <div 
              className={`transition-transform duration-500 ease-in-out ${
                activeView === "weekly" ? "translate-x-0" : "-translate-x-full"
              }`}
              style={{
                display: activeView === "weekly" ? "block" : "none"
              }}
            >
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4 text-purple-700">Weekly Overview</h3>
                <UploadedData viewType="weekly" />
                {/* You can add weekly-specific content here */}
              </div>
            </div>

            {/* Daily View */}
            <div 
              className={`transition-transform duration-500 ease-in-out ${
                activeView === "daily" ? "translate-x-0" : "translate-x-full"
              }`}
              style={{
                display: activeView === "daily" ? "block" : "none"
              }}
            >
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4 text-purple-700">Daily Breakdown</h3>
                <UploadedData viewType="daily" />
                {/* You can add daily-specific content here */}
              </div>
            </div>
          </div>
        </section>       
      </main>
      <Nav />
    </div>
  );
};

export default DoubleStop