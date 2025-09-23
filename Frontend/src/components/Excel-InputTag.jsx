import { useState } from "react";
// import { X } from "lucide-react";

export default function FileUpload({ onFileSelect }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  const allowedTypes = [
    "application/vnd.ms-excel", // .xls
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "text/csv", // optional .csv
  ];

  const handleChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!allowedTypes.includes(selectedFile.type)) {
        setError("Please upload a valid Excel file (.xls, .xlsx, .csv)");
        setFile(null);
        onFileSelect(null); // reset in parent too
      } else {
        setError("");
        setFile(selectedFile);
        onFileSelect(selectedFile); // send to parent
      }
    }
  };

  const removeFile = () => {
    setFile(null);
    setError("");
    onFileSelect(null);
  };

  return (
    <div>
      <label className="block mb-1 font-medium">Excel File</label>
      <div className="relative flex items-center">
        <input
          type="file"
          name="file"
          accept=".xls,.xlsx,.csv"
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 ${
            error ? "border-red-500" : "border-gray-300"
          }`}
        />
        {file && (
          <button
            type="button"
            onClick={removeFile}
            className="absolute right-2 bg-gray-200 hover:bg-gray-300 p-1 rounded-full"
          >
            <span size={16} >❌</span>
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      {file && !error && (
        <p className="text-green-600 text-sm mt-1">Selected: {file.name}</p>
      )}
    </div>
  );
}
