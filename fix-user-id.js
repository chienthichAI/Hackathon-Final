// Script to fix user ID in localStorage
console.log('🔧 Fixing user ID in localStorage...');

// Get current user info from localStorage
const userInfo = localStorage.getItem('userInfo');
const token = localStorage.getItem('token');

if (userInfo && userInfo !== 'undefined' && userInfo !== 'null') {
  try {
    const user = JSON.parse(userInfo);
    console.log('Current user info:', user);
    
    // Check if user ID is 8
    if (user.id === 8) {
      console.log('⚠️ Found user ID 8, changing to user ID 7...');
      
      // Update user ID to 7 (user "abubu" exists in database)
      user.id = 7;
      user.name = 'abubu';
      user.email = 'quangchienaz3@gmail.com';
      
      // Save updated user info
      localStorage.setItem('userInfo', JSON.stringify(user));
      console.log('✅ User ID updated to 7');
      console.log('Updated user info:', user);
    } else {
      console.log('✅ User ID is already correct:', user.id);
    }
  } catch (error) {
    console.error('❌ Error parsing user info:', error);
  }
} else {
  console.log('❌ No user info found in localStorage');
}

if (token) {
  console.log('✅ Token exists in localStorage');
} else {
  console.log('❌ No token found in localStorage');
}

console.log('🎉 User ID fix completed!');
console.log('💡 Please refresh the page to apply changes.'); 