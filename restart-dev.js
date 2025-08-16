#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Restarting development server...');

// Kill any existing processes on port 3000
const killProcess = spawn('npx', ['kill-port', '3000'], { 
  stdio: 'inherit',
  shell: true 
});

killProcess.on('close', (code) => {
  console.log('✅ Killed existing processes on port 3000');
  
  // Clear any cached files
  const nodeModulesPath = path.join(__dirname, 'node_modules', '.vite');
  if (fs.existsSync(nodeModulesPath)) {
    fs.rmSync(nodeModulesPath, { recursive: true, force: true });
    console.log('✅ Cleared Vite cache');
  }
  
  // Start the development server
  const devServer = spawn('npm', ['run', 'dev'], { 
    stdio: 'inherit',
    shell: true 
  });
  
  devServer.on('error', (error) => {
    console.error('❌ Failed to start development server:', error);
  });
  
  devServer.on('close', (code) => {
    console.log(`Development server exited with code ${code}`);
  });
});

killProcess.on('error', (error) => {
  console.error('❌ Failed to kill existing processes:', error);
  // Try to start the server anyway
  const devServer = spawn('npm', ['run', 'dev'], { 
    stdio: 'inherit',
    shell: true 
  });
}); 