// Simple environment setup for development
process.env.NODE_ENV = 'development'
process.env.PORT = '5000'
process.env.FRONTEND_URL = 'http://localhost:3000'
process.env.JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production'
// For local MongoDB (comment out when using Atlas):
// process.env.MONGODB_URI = 'mongodb://localhost:27017/product-tour'

// For MongoDB Atlas (cloud) - replace with your actual connection string:
// Get this from: https://www.mongodb.com/atlas
// Format: mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/product-tour?retryWrites=true&w=majority
process.env.MONGODB_URI = 'mongodb+srv://producttour-user:07SEP2001aa%40cluster0.5jodo8k.mongodb.net/product-tour?retryWrites=true&w=majority&appName=Cluster0'
process.env.UPLOAD_DIR = 'uploads'

// Start the server
require('./server.js')
