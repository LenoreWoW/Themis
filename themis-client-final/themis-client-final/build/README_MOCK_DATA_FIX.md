# Mock Data Fix for Themis

## Issue Description
The application was showing invalid or corrupted mock change requests data in the localStorage, causing the Approvals page to display incorrect data.

## Solution
We've created a simple script to fix this issue by:
1. Removing the invalid data from localStorage
2. Initializing the localStorage with a properly structured empty array

## How to Use

### Option 1: Using the Browser Console
1. Open your browser's developer tools (F12 or right-click and choose "Inspect")
2. Navigate to the Console tab
3. Copy and paste the following code:
```javascript
// Retrieve and log current data
const existingData = localStorage.getItem('changeRequests');
console.log('Current data:', existingData);

// Remove the existing change requests
localStorage.removeItem('changeRequests');
console.log('Old change requests removed');

// Initialize with a properly structured empty array
localStorage.setItem('changeRequests', JSON.stringify([]));
console.log('Change requests initialized with empty array');

// Print confirmation
console.log('🎉 Success! The change requests data has been fixed.');
```
4. Press Enter to execute the code
5. Refresh the page to see the changes

### Option 2: Using the Provided Script
1. Navigate to `/public/clear_mock_data.js` in the project
2. Copy the contents of this file
3. Execute it in your browser console as described in Option 1

## After Fixing
Once the localStorage data is fixed, you should:
1. See an empty Approvals table with no corrupted data
2. Be able to create new change requests through the UI which will be stored correctly

## Prevention
To prevent this issue in the future:
- Always initialize localStorage items with proper structure
- Use consistent data validation when reading/writing to localStorage
- Consider implementing a versioning system for localStorage schema 