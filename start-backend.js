// Start backend server from root directory
const { spawn } = require('child_process');
const path = require('path');

console.log('Starting backend server...');

const backendPath = path.join(__dirname, 'backend', 'start.js');
const child = spawn('node', [backendPath], {
  stdio: 'inherit',
  shell: true
});

child.on('error', (error) => {
  console.error('Error starting backend:', error);
});

child.on('close', (code) => {
  console.log(`Backend server exited with code ${code}`);
});
