#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 Clearing cache and temporary files...');

// Clear Vite cache
const viteCachePath = path.join(__dirname, 'node_modules', '.vite');
if (fs.existsSync(viteCachePath)) {
  fs.rmSync(viteCachePath, { recursive: true, force: true });
  console.log('✅ Cleared Vite cache');
}

// Clear dist folder if it exists
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  fs.rmSync(distPath, { recursive: true, force: true });
  console.log('✅ Cleared dist folder');
}

// Create a simple HTML file to clear browser cache
const clearCacheHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Clear Cache</title>
    <script>
        // Clear localStorage
        localStorage.clear();
        sessionStorage.clear();
        
        // Clear any cached data
        if ('caches' in window) {
            caches.keys().then(function(names) {
                for (let name of names) {
                    caches.delete(name);
                }
            });
        }
        
        // Clear IndexedDB
        if ('indexedDB' in window) {
            indexedDB.databases().then(function(databases) {
                databases.forEach(function(database) {
                    indexedDB.deleteDatabase(database.name);
                });
            });
        }
        
        alert('Cache cleared! You can now close this tab and return to your app.');
    </script>
</head>
<body>
    <h1>Clearing Cache...</h1>
    <p>This page will automatically clear your browser cache and localStorage.</p>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'clear-cache.html'), clearCacheHTML);
console.log('✅ Created clear-cache.html - open this file in your browser to clear browser cache');

console.log('🎉 Cache clearing complete!');
console.log('Next steps:');
console.log('1. Open clear-cache.html in your browser to clear browser cache');
console.log('2. Run npm run dev to start the development server'); 