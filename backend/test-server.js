// Test server without MongoDB for development
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data
let users = [];
let tours = [];

// Mock auth routes
app.post('/api/auth/signup', (req, res) => {
  const { name, email, password } = req.body;
  const user = { id: Date.now(), name, email, password };
  users.push(user);
  res.json({ message: 'User created successfully', token: 'mock-token', user: { id: user.id, name: user.name, email: user.email } });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    res.json({ message: 'Login successful', token: 'mock-token', user: { id: user.id, name: user.name, email: user.email } });
  } else {
    res.status(400).json({ message: 'Invalid credentials' });
  }
});

app.get('/api/auth/me', (req, res) => {
  res.json({ user: { id: 1, name: 'Test User', email: 'test@example.com' } });
});

// Mock tour routes
app.get('/api/tours', (req, res) => {
  res.json({ tours: [], total: 0 });
});

app.post('/api/tours', (req, res) => {
  const tour = { id: Date.now(), ...req.body, author: 'test-user' };
  tours.push(tour);
  res.json(tour);
});

app.get('/api/tours/:id', (req, res) => {
  const tour = tours.find(t => t.id == req.params.id);
  if (tour) {
    res.json(tour);
  } else {
    res.status(404).json({ message: 'Tour not found' });
  }
});

app.put('/api/tours/:id', (req, res) => {
  const index = tours.findIndex(t => t.id == req.params.id);
  if (index !== -1) {
    tours[index] = { ...tours[index], ...req.body };
    res.json(tours[index]);
  } else {
    res.status(404).json({ message: 'Tour not found' });
  }
});

app.delete('/api/tours/:id', (req, res) => {
  const index = tours.findIndex(t => t.id == req.params.id);
  if (index !== -1) {
    tours.splice(index, 1);
    res.json({ message: 'Tour deleted successfully' });
  } else {
    res.status(404).json({ message: 'Tour not found' });
  }
});

app.get('/api/tours/public/:shareUrl', (req, res) => {
  res.status(404).json({ message: 'Tour not found' });
});

// Mock user routes
app.get('/api/users/dashboard', (req, res) => {
  res.json({
    recentTours: [],
    stats: { totalTours: 0, publishedTours: 0, totalViews: 0 }
  });
});

app.get('/api/users/profile', (req, res) => {
  res.json({ id: 1, name: 'Test User', email: 'test@example.com' });
});

app.put('/api/users/profile', (req, res) => {
  res.json({ id: 1, name: req.body.name || 'Test User', email: req.body.email || 'test@example.com' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Test server is running' });
});

app.listen(PORT, () => {
  console.log(`Test server is running on port ${PORT}`);
  console.log('This is a mock server without MongoDB for testing');
});

