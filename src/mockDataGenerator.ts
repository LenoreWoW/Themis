const getRandomFutureDate = (fromDate?: string, maxDaysAhead = 180): string => {
  const start = fromDate ? new Date(fromDate) : new Date();
  
  // If maxDaysAhead is very large, it's likely a timestamp difference in milliseconds
  // Convert it to days
  let daysToAdd: number;
  if (maxDaysAhead > 10000) { // Arbitrary threshold to detect timestamp difference
    daysToAdd = 1 + Math.floor(Math.random() * (maxDaysAhead / (1000 * 60 * 60 * 24))); // Convert ms to days
  } else {
    daysToAdd = 1 + Math.floor(Math.random() * maxDaysAhead);
  }
  
  const result = new Date(start);
  result.setDate(result.getDate() + daysToAdd);
  return result.toISOString().split('T')[0];
}; 