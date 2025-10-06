//Helper functions to get weekly excel Process (Don't touch)

import { normalizeName,getLocalDateString } from "./helper.js";

export const createDriverMap = (dashboardData) => {
  return new Map(
    dashboardData.map(d => {
      const normalizedName = normalizeName(d.name);
      const localDate = getLocalDateString(d.journey_date);
      const key = `${normalizedName}|${localDate}`;
      return [key, d];
    })
  );
};

// Create a Map grouping drivers by date
export const createDateBasedIndex = (dashboardData) => {
  const driversByDate = new Map();
  dashboardData.forEach(d => {
    const dateKey = getLocalDateString(d.journey_date);
    if (!driversByDate.has(dateKey)) {
      driversByDate.set(dateKey, []);
    }
    driversByDate.get(dateKey).push(d);
  });
  return driversByDate;
};

export const findExactMatch = (normalizedDrivers, excelName, date) => {
  const normalizedExcelName = normalizeName(excelName);
  const lookupKey = `${normalizedExcelName}|${date}`;
  return normalizedDrivers.get(lookupKey);
};


// Strategy 2a: Partial name match
export const findPartialMatch = (candidates, excelName) => {
  const normalizedExcelName = normalizeName(excelName);
  
  return candidates.find(d => {
    const dbNameNorm = normalizeName(d.name);
    return dbNameNorm.includes(normalizedExcelName) || 
           normalizedExcelName.includes(dbNameNorm);
  });
};


// Strategy 2b: Fuzzy matching with similarity score
export const findFuzzyMatch = (candidates, excelName, threshold = 0.6) => {
  const normalizedExcelName = normalizeName(excelName);
  const candidateNames = candidates.map(d => normalizeName(d.name));
  
  const bestMatch = stringSimilarity.findBestMatch(normalizedExcelName, candidateNames);
  
  if (bestMatch.bestMatch.rating >= threshold) {
    return {
      driver: candidates.find(d => normalizeName(d.name) === bestMatch.bestMatch.target),
      confidence: bestMatch.bestMatch.rating
    };
  }
  
  return null;
};


// Strategy 3: First/Last name match
export const findFirstLastNameMatch = (candidates, excelName) => {
  if (!excelName.includes(' ')) {
    return null;
  }
  
  const parts = excelName.split(/\s+/);
  const firstName = normalizeName(parts[0]);
  const lastName = normalizeName(parts[parts.length - 1]);
  
  return candidates.find(d => {
    const dbNameNorm = normalizeName(d.name);
    return dbNameNorm.includes(firstName) || dbNameNorm.includes(lastName);
  });
};