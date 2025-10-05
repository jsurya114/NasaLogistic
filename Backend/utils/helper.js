 //Helper functions to get weekly excel Process (Don't touch)
 
 export const formatExcelDate = (dateString) => {
  if (typeof dateString === "string") {
    const parts = dateString.split("/");
    if (parts.length === 3) {
      let year = parts[2];
      const month = parts[0].padStart(2, "0");
      const day = parts[1].padStart(2, "0");
      if (year.length === 2) {
        year = "20" + year;
      }      
      return `${year}-${month}-${day}`; 
    }
  } 
  return dateString;
};

export const getLocalDateString = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};


export const normalizeName = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '')           // Remove all spaces
    .replace(/[^a-z0-9]/g, '');    // Remove special characters
};