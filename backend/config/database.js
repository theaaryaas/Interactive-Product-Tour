const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/product-tour'
    );

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    console.log('Please set up MongoDB:');
    console.log('1. Install MongoDB locally: https://www.mongodb.com/try/download/community');
    console.log('2. Or use MongoDB Atlas: https://www.mongodb.com/atlas');
    console.log('3. Update MONGODB_URI in backend/start.js');
    process.exit(1);
  }
};

module.exports = connectDB;
