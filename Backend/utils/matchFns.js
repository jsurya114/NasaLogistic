//Helper functions to get weekly excel Process (Don't touch)

import { findExactMatch,findPartialMatch,findFuzzyMatch,findFirstLastNameMatch } from "./excelHelperFns.js";

// Main matching function that tries all strategies
export const matchDriver = (excelRow, normalizedDrivers, driversByDate) => {
  const { name, date } = excelRow;
  
  // Strategy 1: Direct exact match
  let dashRecord = findExactMatch(normalizedDrivers, name, date);
  if (dashRecord) {
    return { driver: dashRecord, strategy: 'exact', confidence: 1.0 };
  }
  
  // Get candidates for this date
  const candidatesForDate = driversByDate.get(date) || [];
  if (candidatesForDate.length === 0) {
    return { driver: null, strategy: 'no_candidates', confidence: 0 };
  }
  
  // Strategy 2a: Partial name match
  dashRecord = findPartialMatch(candidatesForDate, name);
  if (dashRecord) {
    return { driver: dashRecord, strategy: 'partial', confidence: 0.9 };
  }
  
  // Strategy 2b: Fuzzy matching
  const fuzzyResult = findFuzzyMatch(candidatesForDate, name);
  if (fuzzyResult && fuzzyResult.driver) {
    return { 
      driver: fuzzyResult.driver, 
      strategy: 'fuzzy', 
      confidence: fuzzyResult.confidence 
    };
  }
  
  // Strategy 3: First/Last name match
  dashRecord = findFirstLastNameMatch(candidatesForDate, name);
  if (dashRecord) {
    return { driver: dashRecord, strategy: 'first_last', confidence: 0.7 };
  }
  
  return { driver: null, strategy: 'no_match', confidence: 0 };
};


// Build insert values and placeholders
export const buildInsertData = (formattedData, normalizedDrivers, driversByDate) => {
  const insertValues = [];
  const insertPlaceholders = [];
//   const matchResults = [];
  
  formattedData.forEach((row, i) => {
    const matchResult = matchDriver(row, normalizedDrivers, driversByDate);
    const dashRecord = matchResult.driver;
    const ambiguous = !dashRecord;
    
    // matchResults.push({
    //   excelName: row.name,
    //   matchedName: dashRecord?.name || null,
    //   date: row.date,
    //   strategy: matchResult.strategy,
    //   confidence: matchResult.confidence,
    //   ambiguous
    // });
    
    insertValues.push(
      row.name,                        // original_name
      dashRecord?.name || null,        // matched_name
      row.date,                        // date
      row.deliveries,
      row.fullStop,
      row.doubleStop,
      dashRecord?.route_name || null,
      dashRecord?.start_seq || null,
      dashRecord?.end_seq || null,
      ambiguous,
      Math.abs(row.deliveries-(dashRecord?.packages||0))
    );
    
    const baseIndex = i * 11;
    insertPlaceholders.push(
      `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5}, $${baseIndex + 6}, $${baseIndex + 7}, $${baseIndex + 8}, $${baseIndex + 9}, $${baseIndex + 10},$${baseIndex + 11})`
    );
  });
  
  return { insertValues, insertPlaceholders,
    //  matchResults 
    };
};


// Print summary of matching results
// export const printMatchSummary = (matchResults) => {
//   console.log("\n=== MATCHING SUMMARY ===");
  
//   const matched = matchResults.filter(r => !r.ambiguous).length;
//   const total = matchResults.length;
  
//   console.log(`Total: ${total}`);
//   console.log(`Matched: ${matched} (${((matched/total)*100).toFixed(1)}%)`);
//   console.log(`Ambiguous: ${total - matched} (${(((total-matched)/total)*100).toFixed(1)}%)`);
  
//   console.log("\n=== STRATEGIES USED ===");
//   const strategies = {};
//   matchResults.forEach(r => {
//     strategies[r.strategy] = (strategies[r.strategy] || 0) + 1;
//   });
//   Object.entries(strategies).forEach(([strategy, count]) => {
//     console.log(`  ${strategy}: ${count}`);
//   });
  
//   console.log("\n=== AMBIGUOUS ENTRIES ===");
//   matchResults.filter(r => r.ambiguous).forEach(r => {
//     console.log(`  ❌ "${r.excelName}" on ${r.date}`);
//   });
// };