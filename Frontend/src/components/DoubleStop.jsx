import React,{useState,useEffect} from 'react'
import Header from '../reuse/Header'
import Nav from '../reuse/Nav';
import AdminsList from '../reuse/AdminsList';
import UploadedData from '../reuse/UploadedData';

const DoubleStop = () => {

    const [form, setForm] = useState({
    year: 2025,
    file: null,
  });

  const [errors, setErrors] = useState({});

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    let newErrors = {};
    if (!form.year) newErrors.year = "Year is required";
    if (!form.file) newErrors.file = "Excel file is required";

    setErrors(newErrors);

  //   if (Object.keys(newErrors).length === 0) {     
  //     console.log("Form submitted:", form);
  //   }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-poppins">
      <Header />
      <main className="max-w-[1450px] mx-auto p-4 pb-40">
        {/* Form Section */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm mb-4 p-6">
          <h2 className="font-bold text-gray-900 bg-gray-50 border-b border-gray-200 px-4 py-3 -mx-6 -mt-6 rounded-t-xl">
            Double Stop
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
            {/* Year */}
            <div>
              <label className="block mb-1 font-medium">Year</label>
              <input
                type="number"
                name="year"
                value={form.year}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 ${
                  errors.year ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.year && (
                <p className="text-red-500 text-sm mt-1">{errors.year}</p>
              )}
            </div>

            {/* Excel File */}
            <div>
              <label className="block mb-1 font-medium">Excel File</label>
              <input
                type="file"
                name="file"
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 ${
                  errors.file ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.file && (
                <p className="text-red-500 text-sm mt-1">{errors.file}</p>
              )}
            </div>

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
            Uploaded Data
          </h2>
          {/* <p className="p-4 text-gray-600">(Data will appear here)</p> */}
              <UploadedData/>
        </section>       
      </main>
      <Nav />
    </div>
  );
};
  


export default DoubleStop