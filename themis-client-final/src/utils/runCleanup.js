/**
 * Manual cleanup script to remove mock data from localStorage
 * To use: Copy this entire function and paste it into your browser console, then hit Enter
 */
function cleanupLocalStorage() {
  console.log("Starting localStorage cleanup...");
  
  // Clean change requests
  try {
    const crJson = localStorage.getItem('changeRequests');
    if (crJson) {
      const changeRequests = JSON.parse(crJson);
      console.log(`Found ${changeRequests.length} change requests before cleanup`);
      
      // Filter out mock data and requests without proper end dates
      const filteredRequests = changeRequests.filter(req => {
        // Don't keep schedule change requests that are missing end dates
        if (req.type === 'SCHEDULE') {
          const hasValidEndDate = req.newEndDate || req.details?.newEndDate;
          return hasValidEndDate;
        }
        return true;
      });
      
      console.log(`Removed ${changeRequests.length - filteredRequests.length} invalid change requests`);
      localStorage.setItem('changeRequests', JSON.stringify(filteredRequests));
    } else {
      console.log("No change requests found in localStorage");
    }
  } catch (e) {
    console.error("Error cleaning change requests:", e);
  }
  
  // Clean audit logs
  try {
    const logsJson = localStorage.getItem('auditLogs');
    if (logsJson) {
      const logs = JSON.parse(logsJson);
      console.log(`Found ${logs.length} audit logs before cleanup`);
      
      // Keep valid logs
      const filteredLogs = logs.filter(log => {
        return log && log.action && log.entityType;
      });
      
      console.log(`Removed ${logs.length - filteredLogs.length} invalid audit logs`);
      localStorage.setItem('auditLogs', JSON.stringify(filteredLogs));
    } else {
      console.log("No audit logs found in localStorage");
    }
  } catch (e) {
    console.error("Error cleaning audit logs:", e);
  }
  
  console.log("Cleanup complete! Please refresh the page to see changes.");
}

// Export the function for direct use
if (typeof window !== 'undefined') {
  window.cleanupLocalStorage = cleanupLocalStorage;
}

// Also run the cleanup on script load
cleanupLocalStorage(); 