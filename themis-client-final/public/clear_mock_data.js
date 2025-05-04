/**
 * Run this in your browser console to fix the change request data
 */

// Step 1: Retrieve any existing change requests
const existingData = localStorage.getItem('changeRequests');
console.log('Current data:', existingData);

// Step 2: Completely remove the existing change requests
localStorage.removeItem('changeRequests');
console.log('Old change requests removed');

// Step 3: Create a properly structured empty array for change requests
localStorage.setItem('changeRequests', JSON.stringify([]));
console.log('Change requests initialized with empty array');

// Print confirmation
console.log('🎉 Success! The change requests data has been fixed.');
console.log('Please refresh the page to see the changes.');
console.log('You can now add new change requests through the UI which will be stored correctly.'); 