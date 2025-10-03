export const formatExcelDate = (dateString) => {
  // Convert string to Date and format as 'YYYY-MM-DD'
  const date = new Date(dateString);
  if (isNaN(date)) return null; // handle invalid dates
  return date.toISOString().slice(0, 10);
};