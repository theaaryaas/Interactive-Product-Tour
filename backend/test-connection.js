// Simple MongoDB connection test
const mongoose = require('mongoose');

const testConnection = async () => {
  try {
    console.log('Testing MongoDB Atlas connection...');
    
    const uri = 'mongodb+srv://producttour-user:07SEP2001aa@cluster0.5jodo8k.mongodb.net/product-tour?retryWrites=true&w=majority&appName=Cluster0';
    
    const conn = await mongoose.connect(uri);
    console.log('✅ SUCCESS: MongoDB Connected!');
    console.log(`Host: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    
    // Test creating a simple document
    const testSchema = new mongoose.Schema({
      name: String,
      createdAt: { type: Date, default: Date.now }
    });
    
    const TestModel = mongoose.model('Test', testSchema);
    
    const testDoc = new TestModel({ name: 'Test Document' });
    await testDoc.save();
    console.log('✅ SUCCESS: Document saved to Atlas!');
    
    // Clean up
    await TestModel.deleteOne({ _id: testDoc._id });
    console.log('✅ SUCCESS: Test document cleaned up!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.log('\n🔍 Troubleshooting:');
    console.log('1. Check your username and password in MongoDB Atlas');
    console.log('2. Make sure Network Access allows 0.0.0.0/0');
    console.log('3. Verify the user has read/write permissions');
    process.exit(1);
  }
};

testConnection();
