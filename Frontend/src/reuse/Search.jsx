import React from 'react';

function SearchBar({ value, onChange, placeholder = "Search..." }) {
  return (
    <div className="mb-4 px-4 pt-4 flex justify-end">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="px-4 py-2 border border-gray-300 rounded-lg w-64 focus:ring-2 focus:ring-purple-600 focus:outline-none"
      />
    </div>
  );
}

export default SearchBar;